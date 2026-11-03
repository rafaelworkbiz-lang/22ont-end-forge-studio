import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin.functions";

export type LibraryItem = {
  fornecedor: "ml" | "shopee"; itemId: string; titulo: string; imagens: string[]; preco: number; precoOriginal: number | null;
  freteGratis: boolean; categoria: string; vendidos: number | null; comissao: number | null; avaliacao: number | null;
  reputacao: string | null; posicao: number | null; link: string; status: "ativo" | "fora_do_ar"; validado: boolean; atualizadoEm: string;
};
type CacheRow = { fornecedor: string; item_id: string; titulo: string; imagens: string[]; preco: number; preco_original: number | null; frete_gratis: boolean; categoria: string; vendidos_estimado: number | null; comissao_percentual: number | null; avaliacao: number | null; reputacao: string | null; posicao_ranking: number | null; link_origem: string; status: string; validado: boolean; atualizado_em: string };
const COLS = "fornecedor,item_id,titulo,imagens,preco,preco_original,frete_gratis,categoria,vendidos_estimado,comissao_percentual,avaliacao,reputacao,posicao_ranking,link_origem,status,validado,atualizado_em";
export function toItem(r: CacheRow): LibraryItem {
  return { fornecedor: r.fornecedor as "ml" | "shopee", itemId: r.item_id, titulo: r.titulo, imagens: r.imagens ?? [], preco: Number(r.preco), precoOriginal: r.preco_original != null ? Number(r.preco_original) : null, freteGratis: r.frete_gratis, categoria: r.categoria, vendidos: r.vendidos_estimado, comissao: r.comissao_percentual != null ? Number(r.comissao_percentual) : null, avaliacao: r.avaliacao != null ? Number(r.avaliacao) : null, reputacao: r.reputacao, posicao: r.posicao_ranking, link: r.link_origem, status: r.status as "ativo" | "fora_do_ar", validado: r.validado, atualizadoEm: r.atualizado_em };
}

const PAGE = 24;
export const listLibrary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    q: z.string().trim().max(80).default(""), fornecedor: z.enum(["", "ml", "shopee"]).default(""), categoria: z.string().max(20).default(""),
    sort: z.enum(["vendidos", "comissao", "preco", "recentes"]).default("vendidos"), page: z.number().int().min(0).max(200).default(0),
  }).parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("produtos_cache").select(COLS).eq("validado", true).eq("status", "ativo");
    if (data.fornecedor) q = q.eq("fornecedor", data.fornecedor);
    if (data.categoria) q = q.eq("categoria", data.categoria);
    if (data.q) q = q.ilike("titulo", `%${data.q.replace(/[%_,()]/g, " ")}%`);
    if (data.sort === "vendidos") q = q.order("vendidos_estimado", { ascending: false, nullsFirst: false }).order("posicao_ranking", { ascending: true, nullsFirst: false });
    if (data.sort === "comissao") q = q.order("comissao_percentual", { ascending: false, nullsFirst: false });
    if (data.sort === "preco") q = q.order("preco", { ascending: true });
    if (data.sort === "recentes") q = q.order("criado_em", { ascending: false });
    const from = data.page * PAGE;
    const { data: rows, error } = await q.order("item_id").range(from, from + PAGE);
    if (error) return { items: [] as LibraryItem[], hasMore: false, error: "Não foi possível carregar a biblioteca." as string | null };
    const list = (rows ?? []) as CacheRow[];
    return { items: list.slice(0, PAGE).map(toItem), hasMore: list.length > PAGE, error: null as string | null };
  });

export const libraryStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const [total, novos, cats, run] = await Promise.all([
      db.from("produtos_cache").select("item_id", { count: "exact", head: true }).eq("validado", true).eq("status", "ativo"),
      db.from("produtos_cache").select("item_id", { count: "exact", head: true }).eq("validado", true).eq("status", "ativo").gte("criado_em", since),
      db.from("produtos_cache").select("categoria").eq("validado", true).eq("status", "ativo").limit(2000),
      db.from("produtos_atualizacoes").select("concluido_em, iniciado_em").not("concluido_em", "is", null).order("concluido_em", { ascending: false }).limit(1).maybeSingle(),
    ]);
    return { total: total.count ?? 0, novos: novos.count ?? 0, categorias: new Set((cats.data ?? []).map(c => c.categoria)).size, atualizadoEm: run.data?.concluido_em ?? null };
  });

export const getLibraryItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ fornecedor: z.enum(["ml", "shopee"]), itemId: z.string().regex(/^[A-Za-z0-9_-]{2,40}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("produtos_cache").select(COLS).eq("fornecedor", data.fornecedor).eq("item_id", data.itemId).maybeSingle();
    return { item: row ? toItem(row as CacheRow) : null };
  });

/** Link para "Abrir no fornecedor": usa a identificação de afiliado do próprio usuário quando existir. */
export const supplierLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ fornecedor: z.enum(["ml", "shopee"]), itemId: z.string().regex(/^[A-Za-z0-9_-]{2,40}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("produtos_cache").select("link_origem").eq("fornecedor", data.fornecedor).eq("item_id", data.itemId).maybeSingle();
    if (!row) return { url: null as string | null, affiliate: false };
    const { buildAffiliateLink } = await import("./affiliate-links.server");
    const r = await buildAffiliateLink(context.supabase, context.userId, data.fornecedor, row.link_origem);
    return { url: r.url ?? row.link_origem, affiliate: !!r.url };
  });

export const adminLibraryStatus = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { LIBRARY_CATEGORIES } = await import("./library-refresh.server");
    const { data: run } = await db.from("produtos_atualizacoes").select("*").order("iniciado_em", { ascending: false }).limit(1).maybeSingle();
    const { count } = await db.from("produtos_cache").select("item_id", { count: "exact", head: true }).eq("validado", true).eq("status", "ativo");
    return { run: run ? { iniciadoEm: run.iniciado_em, concluidoEm: run.concluido_em, feitas: run.categorias_feitas.length, total: LIBRARY_CATEGORIES.length, ml: run.ml_total, shopee: run.shopee_total, foraDoAr: run.fora_do_ar, avisos: run.avisos } : null, validados: count ?? 0, shopeeConfigured: !!process.env["SHOPEE_PLATFORM_APP_ID"] && !!process.env["SHOPEE_PLATFORM_SECRET"] };
  });

export const adminRefreshStep = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { refreshNextCategory } = await import("./library-refresh.server");
    try { const r = await refreshNextCategory("manual"); return { ok: true as const, done: r.done, remaining: r.remaining, category: r.category ?? null }; }
    catch (e) { console.error("[library] manual refresh", e instanceof Error ? e.message : e); return { ok: false as const, done: true, remaining: 0, category: null }; }
  });
