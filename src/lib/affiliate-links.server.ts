import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** Gera o link de afiliado do próprio usuário. ML: tag confirmada. Shopee: link curto oficial. */
export async function buildAffiliateLink(db: SupabaseClient<Database>, userId: string, fornecedor: "ml" | "shopee", origin: string): Promise<{ url: string | null; error: string | null }> {
  if (fornecedor === "ml") {
    const { resolveMeliAccess } = await import("./meli-access.server");
    const { isValidTag, safeAffiliateLink } = await import("./product-share");
    const access = await resolveMeliAccess(db, userId);
    const { data: prof } = await db.from("meli_affiliate_profile").select("tag_confirmed_at").eq("user_id", userId).maybeSingle();
    const ok = access.connected && isValidTag(access.tag) && !!prof?.tag_confirmed_at;
    if (!ok) return { url: null, error: "Conecte o Mercado Livre e confirme sua tag em Fornecedores." };
    return { url: safeAffiliateLink(origin, access.tag, true), error: null };
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row } = await supabaseAdmin.from("fornecedor_conexoes").select("app_id, secret_cifrado, status").eq("user_id", userId).eq("fornecedor", "shopee").maybeSingle();
  if (!row || row.status !== "conectado") return { url: null, error: "Conecte a Shopee em Fornecedores." };
  const { cryptoKey, shopeeGraphql, SHORTLINK_MUTATION } = await import("./shopee.server");
  const { decryptSecret } = await import("./shopee-core");
  const r = await shopeeGraphql<{ generateShortLink: { shortLink: string } }>(row.app_id, await decryptSecret(row.secret_cifrado, cryptoKey()), SHORTLINK_MUTATION, { originUrl: origin });
  return r.ok ? { url: r.data.generateShortLink.shortLink, error: null } : { url: null, error: r.error };
}
