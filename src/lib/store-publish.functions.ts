import { parseAparencia, type Aparencia } from "./store-theme";
import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin.functions";
import { buildChecklist, canPublish, slugFormatProblem, slugSuggestions, SLUG_MSG, type CheckItem, type SlugProblem } from "./store-rules";

const id = z.string().uuid();
const slugIn = z.string().trim().max(60);

async function admin() { return (await import("@/integrations/supabase/client.server")).supabaseAdmin; }
async function reserved() { const { data } = await (await admin()).from("slugs_reservados").select("termo"); return (data ?? []).map(r => r.termo); }

/** Verifica no servidor: formato, reservado e em uso (sem diferenciar maiúsculas). */
async function slugStatus(slug: string, lojaId: string, base: string) {
  const db = await admin();
  const res = await reserved();
  let problem: SlugProblem | null = slugFormatProblem(slug, res);
  if (!problem) {
    const { data } = await db.from("lojas").select("id").ilike("slug", slug.replace(/[%_\\]/g, "")).neq("id", lojaId).limit(1);
    if (data?.length) problem = "em_uso";
  }
  let sugestoes: string[] = [];
  if (problem) {
    const seed = slugSuggestions(base || slug, s => res.includes(s), 12);
    const { data } = seed.length ? await db.from("lojas").select("slug").in("slug", seed) : { data: [] };
    const taken = new Set((data ?? []).map(r => r.slug?.toLowerCase()));
    sugestoes = seed.filter(s => !taken.has(s)).slice(0, 3);
  }
  return { ok: !problem, problem, mensagem: problem ? SLUG_MSG[problem] : null, sugestoes };
}

export const checkSlug = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ lojaId: id, slug: slugIn }).parse(d)).handler(async ({ data, context }) => {
  const { data: l } = await context.supabase.from("lojas").select("nome").eq("id", data.lojaId).eq("user_id", context.userId).maybeSingle();
  if (!l) return { ok: false, problem: null, mensagem: "Loja não encontrada.", sugestoes: [] as string[] };
  return slugStatus(data.slug, data.lojaId, l.nome);
});

type Analysis = { items: CheckItem[]; podePublicar: boolean; afetados: string[]; loja: { nome: string; slug: string | null; slugTravado: boolean; status: string; publicadaEm: string | null } };

/** Análise antes de publicar. Tenta gerar os links que faltam antes de reprovar. */
async function analyze(userDb: Parameters<typeof import("./access-core.server").computeAccess>[0], userId: string, lojaId: string): Promise<Analysis | null> {
  const db = await admin();
  const { data: l } = await db.from("lojas").select("nome, slug, slug_travado, status, publicada_em, logo_url, banner_url").eq("id", lojaId).eq("user_id", userId).maybeSingle();
  if (!l) return null;
  const { computeAccess } = await import("./access-core.server");
  const access = await computeAccess(userDb, userId);
  const { data: rows } = await db.from("loja_produtos").select("meu_produto_id, meus_produtos!inner(id, fornecedor, item_id, link_afiliado)").eq("loja_id", lojaId);
  const mps = (rows ?? []).map(r => r.meus_produtos).filter(Boolean) as { id: string; fornecedor: "ml" | "shopee"; item_id: string; link_afiliado: string | null }[];
  const { data: cache } = mps.length ? await db.from("produtos_cache").select("fornecedor, item_id, status, link_origem").in("item_id", mps.map(m => m.item_id)) : { data: [] };
  const byKey = new Map((cache ?? []).map(c => [`${c.fornecedor}:${c.item_id}`, c]));
  const [ml, sh] = await Promise.all([
    db.from("meli_connections").select("user_id").eq("user_id", userId).maybeSingle(),
    db.from("fornecedor_conexoes").select("status").eq("user_id", userId).eq("fornecedor", "shopee").maybeSingle(),
  ]);
  const conn = { ml: !!ml.data, shopee: sh.data?.status === "conectado" };
  const ativos = mps.filter(m => byKey.get(`${m.fornecedor}:${m.item_id}`)?.status === "ativo");
  const afetados = ativos.filter(m => !conn[m.fornecedor]).map(m => m.id);
  let semLink = 0;
  const { buildAffiliateLink } = await import("./affiliate-links.server");
  for (const m of ativos) {
    if (!conn[m.fornecedor] || m.link_afiliado) continue;
    const origin = byKey.get(`${m.fornecedor}:${m.item_id}`)?.link_origem;
    const r = origin ? await buildAffiliateLink(userDb as never, userId, m.fornecedor, origin).catch(() => ({ url: null })) : { url: null };
    if (r.url) await db.from("meus_produtos").update({ link_afiliado: r.url, link_gerado_em: new Date().toISOString() }).eq("id", m.id);
    else semLink++;
  }
  const items = buildChecklist({ planoAtivo: access.allowed, produtosAtivos: ativos.length - afetados.length, semFornecedor: afetados.length, semLink, temLogo: !!l.logo_url, temBanner: !!l.banner_url });
  return { items, podePublicar: canPublish(items), afetados, loja: { nome: l.nome, slug: l.slug, slugTravado: l.slug_travado, status: l.status, publicadaEm: l.publicada_em } };
}

export const storeChecklist = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ lojaId: id }).parse(d)).handler(async ({ data, context }) => {
  return analyze(context.supabase, context.userId, data.lojaId);
});

export const removeAffectedProducts = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ lojaId: id, ids: z.array(id).max(200) }).parse(d)).handler(async ({ data, context }) => {
  const a = await analyze(context.supabase, context.userId, data.lojaId);
  if (!a) return { ok: false };
  const ids = data.ids.filter(x => a.afetados.includes(x));
  if (ids.length) await context.supabase.from("loja_produtos").delete().eq("loja_id", data.lojaId).in("meu_produto_id", ids);
  return { ok: true, removidos: ids.length };
});

export const publishStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ lojaId: id, slug: slugIn }).parse(d)).handler(async ({ data, context }) => {
  const a = await analyze(context.supabase, context.userId, data.lojaId);
  if (!a) return { ok: false as const, error: "Loja não encontrada." };
  if (!a.podePublicar) return { ok: false as const, error: "Resolva os itens bloqueantes antes de publicar." };
  const slug = a.loja.slugTravado && a.loja.slug ? a.loja.slug : data.slug.toLowerCase();
  if (!a.loja.slugTravado) {
    const s = await slugStatus(slug, data.lojaId, a.loja.nome);
    if (!s.ok) return { ok: false as const, error: s.mensagem ?? "Endereço indisponível.", sugestoes: s.sugestoes };
  }
  const db = await admin();
  const { error } = await db.from("lojas").update({ status: "publicada", slug, slug_travado: true, pausada_por_sistema: false, publicada_em: a.loja.publicadaEm ?? new Date().toISOString() }).eq("id", data.lojaId).eq("user_id", context.userId);
  if (error) return { ok: false as const, error: error.code === "23505" ? SLUG_MSG.em_uso : "Não foi possível publicar." };
  return { ok: true as const, slug };
});

export type PublicStore = {
  slug: string; nome: string; nicho: string | null; status: "publicada" | "pausada"; id: string;
  logoUrl: string | null; logoEstilo: string; bannerUrl: string | null; bannerEstilo: string; cor: string; preset: string; aparencia: Aparencia;
  produtos: { id: string; fornecedor: "ml" | "shopee"; titulo: string; imagem: string | null; preco: number; categoria: string }[];
  consultadoEm: string;
};

/** Leitura pública de loja publicada/pausada. Imagens assinadas só depois de confirmar que a loja está no ar. */
export const getPublicStore = createServerFn({ method: "GET" }).inputValidator(d => z.object({ slug: z.string().max(60) }).parse(d)).handler(async ({ data }): Promise<PublicStore> => {
  const slug = data.slug.toLowerCase();
  if (slugFormatProblem(slug)) throw notFound();
  const db = await admin();
  const { data: r } = await db.rpc("loja_publica", { _slug: slug });
  const j = r as null | { id: string; nome: string; nicho: string | null; slug: string; status: "publicada" | "pausada"; logo: string | null; logo_estilo: string; banner: string | null; banner_estilo: string; cor: string; preset: string; aparencia?: Parameters<typeof parseAparencia>[0]; produtos: PublicStore["produtos"] };
  if (!j) throw notFound();
  const ap = parseAparencia(j.aparencia, j.cor);
  const paths = j.status === "publicada" ? [j.logo, j.banner, ...ap.banners].filter((p): p is string => !!p) : [];
  const { data: signed } = paths.length ? await db.storage.from("lojas").createSignedUrls(paths, 60 * 60 * 24 * 7) : { data: [] };
  const url = (p: string | null) => (p && signed?.find(s => s.path === p)?.signedUrl) || null;
  return { id: j.id, slug: j.slug, nome: j.nome, nicho: j.nicho, status: j.status, logoUrl: url(j.logo), logoEstilo: j.logo_estilo, bannerUrl: url(j.banner), bannerEstilo: j.banner_estilo, cor: j.cor, preset: j.preset, aparencia: { ...ap, banners: ap.banners.map(url).filter((u): u is string => !!u) },
    produtos: (j.produtos ?? []).map(p => ({ ...p, preco: Number(p.preco) })), consultadoEm: new Date().toISOString() };
});

export const listReserved = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async () => ({ termos: (await reserved()).sort() }));
export const addReserved = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator(d => z.object({ termo: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{1,40}$/) }).parse(d)).handler(async ({ data }) => {
  const { error } = await (await admin()).from("slugs_reservados").upsert({ termo: data.termo }, { ignoreDuplicates: true }); return { ok: !error };
});
export const removeReserved = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator(d => z.object({ termo: z.string().max(40) }).parse(d)).handler(async ({ data }) => {
  const { error } = await (await admin()).from("slugs_reservados").delete().eq("termo", data.termo); return { ok: !error };
});
