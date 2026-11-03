import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ShopeeStatus = { connected: boolean; status: "conectado" | "erro" | null; appIdMasked: string | null; lastTestAt: string | null; lastError: string | null };

async function admin() { return (await import("@/integrations/supabase/client.server")).supabaseAdmin; }
async function rateOk(userId: string) {
  const { data, error } = await (await admin()).rpc("fornecedor_rate_hit", { _user: userId, _limit: 30 });
  return !error && data === true;
}
const LIMIT_MSG = "Muitas consultas em pouco tempo. Aguarde um minuto e tente de novo.";

export const getShopeeStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ShopeeStatus> => {
    const { data } = await context.supabase.rpc("minhas_conexoes_fornecedor");
    const row = (data ?? []).find(r => r.fornecedor === "shopee");
    if (!row) return { connected: false, status: null, appIdMasked: null, lastTestAt: null, lastError: null };
    return { connected: row.status === "conectado", status: row.status as "conectado" | "erro", appIdMasked: row.app_id_mascarado, lastTestAt: row.ultimo_teste_em, lastError: row.ultimo_erro };
  });

const creds = z.object({ appId: z.string().trim().regex(/^\d{4,20}$/, "App ID tem só números"), secret: z.string().trim().min(8).max(200) });

/** Test credentials; saves (encrypted) only on success. Without input, re-tests saved credentials. */
export const testShopee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ appId: z.string().optional(), secret: z.string().optional() }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    if (!(await rateOk(context.userId))) return { ok: false as const, error: LIMIT_MSG };
    const { shopeeGraphql, PRODUCT_OFFER_QUERY, cryptoKey } = await import("./shopee.server");
    const { encryptSecret, decryptSecret } = await import("./shopee-core");
    const db = await admin();
    let appId: string, secret: string;
    if (data.appId || data.secret) {
      const p = creds.safeParse(data);
      if (!p.success) return { ok: false as const, error: "Confira o App ID (só números) e o Secret." };
      ({ appId, secret } = p.data);
    } else {
      const { data: row } = await db.from("fornecedor_conexoes").select("app_id, secret_cifrado").eq("user_id", context.userId).eq("fornecedor", "shopee").maybeSingle();
      if (!row) return { ok: false as const, error: "Nenhuma conexão salva." };
      appId = row.app_id; secret = await decryptSecret(row.secret_cifrado, cryptoKey());
    }
    const r = await shopeeGraphql(appId, secret, PRODUCT_OFFER_QUERY, { keyword: "fone", page: 1, limit: 1, sortType: 1 });
    const now = new Date().toISOString();
    if (!r.ok) {
      if (!data.appId) await db.from("fornecedor_conexoes").update({ status: "erro", ultimo_erro: r.error, ultimo_teste_em: now, atualizado_em: now }).eq("user_id", context.userId).eq("fornecedor", "shopee");
      return { ok: false as const, error: r.error };
    }
    const { error } = await db.from("fornecedor_conexoes").upsert({
      user_id: context.userId, fornecedor: "shopee", status: "conectado", app_id: appId,
      secret_cifrado: await encryptSecret(secret, cryptoKey()), ultimo_teste_em: now, ultimo_erro: null, atualizado_em: now,
    }, { onConflict: "user_id,fornecedor" });
    return error ? { ok: false as const, error: "Não foi possível salvar a conexão." } : { ok: true as const };
  });

async function savedCreds(userId: string) {
  const { cryptoKey } = await import("./shopee.server");
  const { decryptSecret } = await import("./shopee-core");
  const { data: row } = await (await admin()).from("fornecedor_conexoes").select("app_id, secret_cifrado, status").eq("user_id", userId).eq("fornecedor", "shopee").maybeSingle();
  if (!row || row.status !== "conectado") return null;
  return { appId: row.app_id, secret: await decryptSecret(row.secret_cifrado, cryptoKey()) };
}

/** Phase 3 prep: search offers with the caller's saved credentials. */
export const searchShopee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ keyword: z.string().trim().min(1).max(80), page: z.number().int().min(1).max(100).default(1), limit: z.number().int().min(1).max(50).default(20), sort: z.number().int().min(1).max(5).default(1) }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await rateOk(context.userId))) return { ok: false as const, error: LIMIT_MSG };
    const c = await savedCreds(context.userId);
    if (!c) return { ok: false as const, error: "Conecte a Shopee em Fornecedores." };
    const { shopeeGraphql, PRODUCT_OFFER_QUERY } = await import("./shopee.server");
    const r = await shopeeGraphql<{ productOfferV2: unknown }>(c.appId, c.secret, PRODUCT_OFFER_QUERY, { keyword: data.keyword, page: data.page, limit: data.limit, sortType: data.sort });
    return r.ok ? { ok: true as const, resultJson: JSON.stringify(r.data.productOfferV2) } : { ok: false as const, error: r.error };
  });

/** Phase 3 prep: official affiliate short link. */
export const shortlinkShopee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ originUrl: z.string().url().max(500).refine(u => /^https:\/\/([a-z0-9-]+\.)*shopee\.com\.br\//i.test(u), "URL da Shopee") }).parse(d))
  .handler(async ({ data, context }) => {
    if (!(await rateOk(context.userId))) return { ok: false as const, error: LIMIT_MSG };
    const c = await savedCreds(context.userId);
    if (!c) return { ok: false as const, error: "Conecte a Shopee em Fornecedores." };
    const { shopeeGraphql, SHORTLINK_MUTATION } = await import("./shopee.server");
    const r = await shopeeGraphql<{ generateShortLink: { shortLink: string } }>(c.appId, c.secret, SHORTLINK_MUTATION, { originUrl: data.originUrl });
    return r.ok ? { ok: true as const, shortLink: r.data.generateShortLink.shortLink } : { ok: false as const, error: r.error };
  });

export const disconnectShopee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await (await admin()).from("fornecedor_conexoes").delete().eq("user_id", context.userId).eq("fornecedor", "shopee");
    return { ok: !error };
  });

export const suggestSupplier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ nome: z.string().trim().min(2).max(80), site: z.string().trim().max(200).optional(), observacao: z.string().trim().max(500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("sugestoes_fornecedor").insert({ user_id: context.userId, nome: data.nome, site: data.site || null, observacao: data.observacao || null });
    return { ok: !error };
  });
