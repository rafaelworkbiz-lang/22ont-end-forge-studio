import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { myProductStatus, type MyStatus } from "./library-rules";
import { toItem, type LibraryItem } from "./library.functions";

export type MyProduct = { id: string; fornecedor: "ml" | "shopee"; itemId: string; precoAoAdicionar: number; link: string | null; adicionadoEm: string; produto: LibraryItem | null; status: MyStatus; lojas: { id: string; nome: string }[] };
const itemRef = z.object({ fornecedor: z.enum(["ml", "shopee"]), itemId: z.string().regex(/^[A-Za-z0-9_-]{2,40}$/) });

export const listMyProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: mine } = await context.supabase.from("meus_produtos").select("*").eq("user_id", context.userId).order("adicionado_em", { ascending: false }).limit(500);
    const rows = mine ?? [];
    const ids = [...new Set(rows.map(r => r.item_id))];
    const { data: cache } = ids.length ? await context.supabase.from("produtos_cache").select("*").in("item_id", ids) : { data: [] };
    const byKey = new Map((cache ?? []).map(c => [`${c.fornecedor}:${c.item_id}`, toItem(c)]));
    const { data: lp } = rows.length ? await context.supabase.from("loja_produtos").select("meu_produto_id, lojas(id, nome)").in("meu_produto_id", rows.map(r => r.id)) : { data: [] };
    const lojasOf = new Map<string, { id: string; nome: string }[]>();
    for (const x of lp ?? []) if (x.lojas) lojasOf.set(x.meu_produto_id, [...(lojasOf.get(x.meu_produto_id) ?? []), { id: x.lojas.id, nome: x.lojas.nome }]);
    const list: MyProduct[] = rows.map(r => {
      const p = byKey.get(`${r.fornecedor}:${r.item_id}`) ?? null;
      return { id: r.id, fornecedor: r.fornecedor as "ml" | "shopee", itemId: r.item_id, precoAoAdicionar: Number(r.preco_ao_adicionar), link: r.link_afiliado, adicionadoEm: r.adicionado_em, produto: p, status: myProductStatus(Number(r.preco_ao_adicionar), p ? { preco: p.preco, status: p.status } : null), lojas: lojasOf.get(r.id) ?? [] };
    });
    return { items: list, consultadoEm: new Date().toISOString() };
  });

export const addMyProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => itemRef.extend({ lojaId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: p } = await context.supabase.from("produtos_cache").select("preco").eq("fornecedor", data.fornecedor).eq("item_id", data.itemId).maybeSingle();
    if (!p) return { ok: false };
    const { error } = await context.supabase.from("meus_produtos").upsert({ user_id: context.userId, fornecedor: data.fornecedor, item_id: data.itemId, preco_ao_adicionar: p.preco }, { onConflict: "user_id,fornecedor,item_id", ignoreDuplicates: true });
    if (error) return { ok: false };
    const { data: row } = await context.supabase.from("meus_produtos").select("id").eq("user_id", context.userId).eq("fornecedor", data.fornecedor).eq("item_id", data.itemId).maybeSingle();
    if (row && data.lojaId) {
      const { data: last } = await context.supabase.from("loja_produtos").select("ordem").eq("loja_id", data.lojaId).order("ordem", { ascending: false }).limit(1).maybeSingle();
      const { error: e2 } = await context.supabase.from("loja_produtos").upsert({ loja_id: data.lojaId, meu_produto_id: row.id, ordem: (last?.ordem ?? -1) + 1 }, { onConflict: "loja_id,meu_produto_id", ignoreDuplicates: true });
      if (e2) return { ok: false };
    }
    return { ok: true, id: row?.id ?? null };
  });

export const removeMyProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ items: z.array(itemRef).min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: removed } = await context.supabase.from("meus_produtos").select("fornecedor,item_id,preco_ao_adicionar,link_afiliado,link_gerado_em,adicionado_em").eq("user_id", context.userId).in("item_id", data.items.map(i => i.itemId));
    const keep = (removed ?? []).filter(r => data.items.some(i => i.fornecedor === r.fornecedor && i.itemId === r.item_id));
    for (const i of data.items) await context.supabase.from("meus_produtos").delete().eq("user_id", context.userId).eq("fornecedor", i.fornecedor).eq("item_id", i.itemId);
    return { ok: true, removed: keep.map(r => ({ fornecedor: r.fornecedor as "ml" | "shopee", itemId: r.item_id, preco: Number(r.preco_ao_adicionar), link: r.link_afiliado, linkEm: r.link_gerado_em, em: r.adicionado_em })) };
  });

/** Desfazer: restaura as linhas exatamente como estavam (preço ao adicionar, link e data). */
export const restoreMyProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ rows: z.array(z.object({ fornecedor: z.enum(["ml", "shopee"]), itemId: z.string().regex(/^[A-Za-z0-9_-]{2,40}$/), preco: z.number().nonnegative(), link: z.string().url().max(600).nullable(), linkEm: z.string().nullable(), em: z.string() })).min(1).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("meus_produtos").upsert(data.rows.map(r => ({ user_id: context.userId, fornecedor: r.fornecedor, item_id: r.itemId, preco_ao_adicionar: r.preco, link_afiliado: r.link, link_gerado_em: r.linkEm, adicionado_em: r.em })), { onConflict: "user_id,fornecedor,item_id", ignoreDuplicates: true });
    return { ok: !error };
  });

/** Copiar link(s): gera no servidor quando ainda não existe e salva. */
export const myProductLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ ids: z.array(z.string().uuid()).min(1).max(50) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase.from("meus_produtos").select("id,fornecedor,item_id,link_afiliado").eq("user_id", context.userId).in("id", data.ids);
    const { buildAffiliateLink } = await import("./affiliate-links.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const out: { id: string; url: string | null; error: string | null }[] = [];
    for (const r of rows ?? []) {
      if (r.link_afiliado) { out.push({ id: r.id, url: r.link_afiliado, error: null }); continue; }
      const { data: c } = await context.supabase.from("produtos_cache").select("link_origem,status").eq("fornecedor", r.fornecedor).eq("item_id", r.item_id).maybeSingle();
      if (!c || c.status !== "ativo") { out.push({ id: r.id, url: null, error: "Produto fora do ar." }); continue; }
      const link = await buildAffiliateLink(context.supabase, context.userId, r.fornecedor as "ml" | "shopee", c.link_origem);
      if (link.url) await supabaseAdmin.from("meus_produtos").update({ link_afiliado: link.url, link_gerado_em: new Date().toISOString() }).eq("id", r.id).eq("user_id", context.userId);
      out.push({ id: r.id, ...link });
    }
    return { links: out };
  });
