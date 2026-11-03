import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { parseAparencia, type Aparencia } from "./store-theme";
import { hiddenReason, LIMIT_MESSAGE, storeLimit, type Preset } from "./store-rules";

type Db = SupabaseClient<Database>;
export type StoreProduct = { meuProdutoId: string; fornecedor: "ml" | "shopee"; titulo: string; imagem: string | null; preco: number; categoria: string; status: string; oculto: string | null; ordem: number };
export type Store = {
  id: string; nome: string; nicho: string | null; slug: string | null; logoPath: string | null; logoUrl: string | null; logoEstilo: string;
  bannerPath: string | null; bannerUrl: string | null; bannerEstilo: string; cor: string; preset: Preset; status: "rascunho" | "publicada" | "pausada";
  atualizadoEm: string; produtos: StoreProduct[]; aparencia: Aparencia; bannersUrls: string[]; passoAtual: number; versao: number;
};

const id = z.string().uuid();
const hex = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const editable = z.object({
  nome: z.string().trim().min(1).max(32).optional(), nicho: z.string().max(20).nullable().optional(),
  logoPath: z.string().max(200).nullable().optional(), logoEstilo: z.enum(["quadrado", "circulo", "folha", "sublinhado"]).optional(),
  bannerPath: z.string().max(200).nullable().optional(), bannerEstilo: z.enum(["cor", "escuro", "neutro"]).optional(),
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(), preset: z.enum(["vitrine", "compacta", "destaque", "lista", "oferta", "carrossel", "mosaico", "revista", "galeria", "minimal", "catalogo", "boutique", "imersivo"]).optional(),
  tema: z.object({ cor_destaque: hex, cor_fundo: hex, cor_botao: hex, cantos: z.enum(["retos", "suaves", "arredondados", "pilula"]), fonte: z.enum(["moderna", "elegante", "divertida", "classica", "geometrica", "minimal", "editorial"]), paleta: z.string().max(40).nullable().optional(),
    cartao: z.enum(["sombra", "borda", "plano", "elevado"]).optional(), botaoEstilo: z.enum(["preenchido", "contorno", "pilula"]).optional(), espaco: z.enum(["compacto", "normal", "arejado"]).optional(), topo: z.enum(["claro", "cor", "escuro"]).optional(),
    foto: z.enum(["quadrada", "retrato", "paisagem"]).optional(), filtro: z.enum(["pilulas", "abas", "oculto"]).optional(), rodape: z.enum(["simples", "completo"]).optional(), mostrar: z.object({ selo: z.boolean(), preco: z.boolean(), botao: z.boolean(), desconto: z.boolean().optional(), seloTexto: z.string().max(20).optional() }).optional() }).optional(),
  bannerPosicao: z.enum(["topo", "dividido", "faixa", "carrossel", "entre", "lateral", "flutuante", "nenhum"]).optional(), bannerAltura: z.enum(["P", "M", "G"]).optional(),
  bannerAlinhamento: z.enum(["esquerda", "centro"]).optional(), bannerFrase: z.string().max(90).nullable().optional(), bannerBotao: z.string().max(24).nullable().optional(),
  banners: z.array(z.string().max(200)).max(3).optional(), passoAtual: z.number().int().min(0).max(4).optional(),
});

async function connections(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [ml, sh] = await Promise.all([
    supabaseAdmin.from("meli_connections").select("user_id").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("fornecedor_conexoes").select("status").eq("user_id", userId).eq("fornecedor", "shopee").maybeSingle(),
  ]);
  return { ml: !!ml.data, shopee: sh.data?.status === "conectado" };
}

async function sign(db: Db, paths: (string | null)[]) {
  const list = paths.filter((p): p is string => !!p);
  if (!list.length) return new Map<string, string>();
  const { data } = await db.storage.from("lojas").createSignedUrls(list, 3600);
  return new Map((data ?? []).filter(d => d.signedUrl && d.path).map(d => [d.path as string, d.signedUrl]));
}

async function loadStores(db: Db, userId: string, ids?: string[]): Promise<Store[]> {
  let q = db.from("lojas").select("*").eq("user_id", userId).order("criado_em");
  if (ids) q = q.in("id", ids);
  const { data: lojas } = await q;
  if (!lojas?.length) return [];
  const { data: links } = await db.from("loja_produtos").select("loja_id, meu_produto_id, ordem, meus_produtos(fornecedor, item_id)").in("loja_id", lojas.map(l => l.id)).order("ordem");
  const itemIds = [...new Set((links ?? []).map(l => l.meus_produtos?.item_id).filter(Boolean) as string[])];
  const { data: cache } = itemIds.length ? await db.from("produtos_cache").select("fornecedor,item_id,titulo,imagens,preco,categoria,status").in("item_id", itemIds) : { data: [] };
  const byKey = new Map((cache ?? []).map(c => [`${c.fornecedor}:${c.item_id}`, c]));
  const conn = await connections(userId);
  const aps = new Map(lojas.map(l => [l.id, parseAparencia({ tema: l.tema, posicao: l.banner_posicao, altura: l.banner_altura, alinhamento: l.banner_alinhamento, frase: l.banner_frase, botao: l.banner_botao, banners: l.banners }, l.cor_destaque)]));
  const urls = await sign(db, lojas.flatMap(l => [l.logo_url, l.banner_url, ...aps.get(l.id)!.banners]));
  return lojas.map(l => ({
    id: l.id, nome: l.nome, nicho: l.nicho, slug: l.slug, logoPath: l.logo_url, logoUrl: l.logo_url ? urls.get(l.logo_url) ?? null : null, logoEstilo: l.logo_estilo,
    bannerPath: l.banner_url, bannerUrl: l.banner_url ? urls.get(l.banner_url) ?? null : null, bannerEstilo: l.banner_estilo, cor: l.cor_destaque,
    preset: l.preset as Preset, status: l.status as Store["status"], atualizadoEm: l.atualizado_em,
    aparencia: aps.get(l.id)!, bannersUrls: aps.get(l.id)!.banners.map(p => urls.get(p) ?? "").filter(Boolean), passoAtual: l.passo_atual, versao: l.versao,
    produtos: (links ?? []).filter(x => x.loja_id === l.id && x.meus_produtos).map(x => {
      const f = x.meus_produtos!.fornecedor as "ml" | "shopee"; const c = byKey.get(`${f}:${x.meus_produtos!.item_id}`);
      const status = c?.status ?? "fora_do_ar";
      return { meuProdutoId: x.meu_produto_id, fornecedor: f, titulo: c?.titulo ?? "Produto indisponível", imagem: c?.imagens?.[0] ?? null, preco: Number(c?.preco ?? 0), categoria: c?.categoria ?? "", status, oculto: hiddenReason({ status, fornecedor: f }, conn), ordem: x.ordem };
    }),
  }));
}

async function limitFor(db: Db, userId: string) {
  const { computeAccess } = await import("./access-core.server");
  const a = await computeAccess(db, userId);
  return { limite: storeLimit(a), plano: a.plan === "lifetime" || a.reason === "admin" || a.reason === "influencer" ? "Vitalício" : "Mensal" };
}

export const listStores = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const [stores, lim] = await Promise.all([loadStores(context.supabase, context.userId), limitFor(context.supabase, context.userId)]);
  return { stores, ...lim };
});

export const getStore = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ id }).parse(d)).handler(async ({ data, context }) => {
  const [s] = await loadStores(context.supabase, context.userId, [data.id]);
  return { store: s ?? null, consultadoEm: new Date().toISOString() };
});

export const createStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ nome: z.string().trim().min(1).max(32).optional() }).parse(d ?? {})).handler(async ({ data, context }) => {
  const { limite } = await limitFor(context.supabase, context.userId);
  const { count } = await context.supabase.from("lojas").select("id", { count: "exact", head: true }).eq("user_id", context.userId);
  if ((count ?? 0) >= limite) return { ok: false as const, error: LIMIT_MESSAGE, limit: true };
  const { data: row, error } = await context.supabase.from("lojas").insert({ user_id: context.userId, nome: data.nome ?? "Minha loja" }).select("id").single();
  if (error) return { ok: false as const, error: error.message.includes("LIMITE_LOJAS") ? LIMIT_MESSAGE : "Não foi possível criar a loja.", limit: error.message.includes("LIMITE_LOJAS") };
  return { ok: true as const, id: row.id };
});

export const saveStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ id, versao: z.number().int().min(0), patch: editable, produtos: z.array(id).max(200).optional() }).parse(d)).handler(async ({ data, context }) => {
  const p = data.patch; const db = context.supabase;
  const own = (path: string | null | undefined) => path == null || path.startsWith(`${context.userId}/${data.id}/`);
  if (!own(p.logoPath) || !own(p.bannerPath) || (p.banners ?? []).some(b => !own(b))) return { ok: false as const };
  const upd: Database["public"]["Tables"]["lojas"]["Update"] = {};
  if (p.nome !== undefined) upd.nome = p.nome; if (p.nicho !== undefined) upd.nicho = p.nicho;
  if (p.logoPath !== undefined) upd.logo_url = p.logoPath; if (p.logoEstilo) upd.logo_estilo = p.logoEstilo;
  if (p.bannerPath !== undefined) upd.banner_url = p.bannerPath; if (p.bannerEstilo) upd.banner_estilo = p.bannerEstilo;
  if (p.cor) upd.cor_destaque = p.cor; if (p.preset) upd.preset = p.preset;
  if (p.tema) { upd.tema = p.tema; upd.cor_destaque = p.tema.cor_destaque; }
  if (p.bannerPosicao) upd.banner_posicao = p.bannerPosicao; if (p.bannerAltura) upd.banner_altura = p.bannerAltura;
  if (p.bannerAlinhamento) upd.banner_alinhamento = p.bannerAlinhamento; if (p.bannerFrase !== undefined) upd.banner_frase = p.bannerFrase;
  if (p.bannerBotao !== undefined) upd.banner_botao = p.bannerBotao; if (p.banners) upd.banners = p.banners;
  if (p.passoAtual !== undefined) upd.passo_atual = p.passoAtual;
  upd.versao = data.versao + 1;
  // Controle otimista: só grava se ninguém salvou uma versão mais nova (outra aba).
  const { data: row, error } = await db.from("lojas").update(upd).eq("id", data.id).eq("user_id", context.userId).eq("versao", data.versao).select("atualizado_em, versao").maybeSingle();
  if (error) return { ok: false as const };
  if (!row) {
    const { data: cur } = await db.from("lojas").select("versao").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
    return cur ? { ok: false as const, conflito: true, versao: cur.versao } : { ok: false as const };
  }
  if (data.produtos) {
    await db.from("loja_produtos").delete().eq("loja_id", data.id);
    if (data.produtos.length) {
      const { error: e2 } = await db.from("loja_produtos").insert(data.produtos.map((m, i) => ({ loja_id: data.id, meu_produto_id: m, ordem: i })));
      if (e2) return { ok: false as const };
    }
  }
  return { ok: true as const, salvoEm: row.atualizado_em, versao: row.versao };
});

export const addToStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ lojaId: id, meuProdutoId: id }).parse(d)).handler(async ({ data, context }) => {
  const { data: last } = await context.supabase.from("loja_produtos").select("ordem").eq("loja_id", data.lojaId).order("ordem", { ascending: false }).limit(1).maybeSingle();
  const { error } = await context.supabase.from("loja_produtos").upsert({ loja_id: data.lojaId, meu_produto_id: data.meuProdutoId, ordem: (last?.ordem ?? -1) + 1 }, { onConflict: "loja_id,meu_produto_id", ignoreDuplicates: true });
  return { ok: !error };
});

export const duplicateStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ id }).parse(d)).handler(async ({ data, context }) => {
  const db = context.supabase;
  const { data: l } = await db.from("lojas").select("*").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
  if (!l) return { ok: false, error: "Loja não encontrada." };
  const { limite } = await limitFor(db, context.userId);
  const { count } = await db.from("lojas").select("id", { count: "exact", head: true }).eq("user_id", context.userId);
  if ((count ?? 0) >= limite) return { ok: false, error: LIMIT_MESSAGE, limit: true };
  const { data: n, error } = await db.from("lojas").insert({ user_id: context.userId, nome: `${l.nome}`.slice(0, 26) + " cópia", nicho: l.nicho, logo_estilo: l.logo_estilo, banner_estilo: l.banner_estilo, cor_destaque: l.cor_destaque, preset: l.preset }).select("id").single();
  if (error) return { ok: false, error: error.message.includes("LIMITE_LOJAS") ? LIMIT_MESSAGE : "Não foi possível duplicar.", limit: error.message.includes("LIMITE_LOJAS") };
  const { data: lp } = await db.from("loja_produtos").select("meu_produto_id, ordem, secao").eq("loja_id", l.id);
  if (lp?.length) await db.from("loja_produtos").insert(lp.map(x => ({ ...x, loja_id: n.id })));
  return { ok: true, id: n.id };
});

export const setStoreStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ id, status: z.enum(["pausada", "publicada"]) }).parse(d)).handler(async ({ data, context }) => {
  const { data: l } = await context.supabase.from("lojas").select("status, publicada_em").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
  if (!l || (data.status === "pausada" && l.status !== "publicada") || (data.status === "publicada" && (l.status !== "pausada" || !l.publicada_em))) return { ok: false };
  const { error } = await context.supabase.from("lojas").update({ status: data.status }).eq("id", data.id);
  return { ok: !error };
});

export const deleteStore = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(d => z.object({ id, confirmName: z.string() }).parse(d)).handler(async ({ data, context }) => {
  const db = context.supabase;
  const { data: l } = await db.from("lojas").select("nome").eq("id", data.id).eq("user_id", context.userId).maybeSingle();
  if (!l || l.nome.trim() !== data.confirmName.trim()) return { ok: false, error: "O nome digitado não confere." };
  const folder = `${context.userId}/${data.id}`;
  const { data: files } = await db.storage.from("lojas").list(folder);
  if (files?.length) await db.storage.from("lojas").remove(files.map(f => `${folder}/${f.name}`));
  const { error } = await db.from("lojas").delete().eq("id", data.id).eq("user_id", context.userId);
  return { ok: !error, error: error ? "Não foi possível excluir." : null };
});
