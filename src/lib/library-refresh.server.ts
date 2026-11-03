// Atualiza a biblioteca compartilhada (produtos_cache), uma categoria por chamada
// para caber no limite de requisições do servidor.
import { meliCategories } from "./meli-categories";
import { rankedHighlights } from "./meli-highlights";
import { mlValidated, shopeeValidated } from "./library-rules";

const API = "https://api.mercadolibre.com";
const PER_CATEGORY = 20;
// Subcategorias populares: buscam o ranking oficial delas, mas os produtos ficam guardados na categoria-mãe.
const SUBCATEGORIES: [string, string, string][] = [
  ["MLB3813", "MLB1051", "Acessórios para Celulares"], ["MLB417704", "MLB1051", "Smartwatches"],
  ["MLB430687", "MLB1648", "Portáteis"], ["MLB454379", "MLB1648", "Periféricos para PC"],
  ["MLB3835", "MLB1000", "Áudio"],
  ["MLB438284", "MLB5726", "Pequenos Eletrodomésticos"], ["MLB252358", "MLB5726", "Ar e Ventilação"],
  ["MLB1631", "MLB1574", "Decoração"], ["MLB1618", "MLB1574", "Cozinha"], ["MLB436246", "MLB1574", "Cama, Mesa e Banho"],
  ["MLB23262", "MLB1430", "Calçados"], ["MLB31447", "MLB1430", "Camisetas"], ["MLB1451", "MLB1430", "Acessórios de Moda"],
  ["MLB199407", "MLB1246", "Cuidados com a Pele"], ["MLB1263", "MLB1246", "Cabelo"], ["MLB1248", "MLB1246", "Maquiagem"],
  ["MLB2527", "MLB263532", "Ferramentas Manuais"], ["MLB2528", "MLB263532", "Acessórios para Ferramentas"],
  ["MLB438578", "MLB1144", "Acessórios para Consoles"], ["MLB186456", "MLB1144", "Video Games"],
  ["MLB1338", "MLB1276", "Fitness e Musculação"], ["MLB1292", "MLB1276", "Ciclismo"], ["MLB1362", "MLB1276", "Camping e Pesca"],
  ["MLB1396", "MLB1384", "Roupas de Bebê"], ["MLB1392", "MLB1384", "Brinquedos para Bebês"],
  ["MLB114676", "MLB1747", "Interior do Carro"], ["MLB114675", "MLB1747", "Exterior do Carro"],
  ["MLB1072", "MLB1071", "Cães"], ["MLB1081", "MLB1071", "Gatos"],
];
export const LIBRARY_CATEGORIES: { id: string; parent: string; name: string; keywords: string[]; sub: boolean }[] = [
  ...meliCategories.filter(c => c.id).map(c => ({ id: c.id, parent: c.id, name: c.name, keywords: c.keywords, sub: false })),
  ...SUBCATEGORIES.map(([id, parent, name]) => ({ id, parent, name, keywords: [], sub: true })),
];

async function mlToken(): Promise<string | null> {
  const id = process.env["MELI_APP_ID"], secret = process.env["MELI_CLIENT_SECRET"];
  if (!id || !secret) return null;
  const res = await fetch(`${API}/oauth/token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }) });
  if (!res.ok) return null;
  return ((await res.json()) as { access_token: string }).access_token;
}
async function get<T>(path: string, token: string): Promise<T | null> {
  const r = await fetch(`${API}${path}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }).catch(() => null);
  return r?.ok ? (await r.json()) as T : null;
}
const https = (u?: string) => (u ?? "").replace("http://", "https://");

type Row = { fornecedor: "ml" | "shopee"; item_id: string; shop_id?: string | null; titulo: string; imagens: string[]; preco: number; preco_original: number | null; frete_gratis: boolean; categoria: string; vendidos_estimado: number | null; comissao_percentual: number | null; avaliacao: number | null; reputacao: string | null; posicao_ranking: number | null; link_origem: string; status: "ativo"; validado: boolean; atualizado_em: string };

async function mlCategory(source: string, cat: string, token: string, now: string): Promise<Row[]> {
  const entries = rankedHighlights(await get<unknown>(`/highlights/MLB/category/${source}`, token))?.slice(0, PER_CATEGORY) ?? [];
  const sellers = new Map<number, string | null>();
  const rep = async (id?: number) => {
    if (!id) return null;
    if (!sellers.has(id)) sellers.set(id, (await get<{ seller_reputation?: { level_id?: string | null } }>(`/users/${id}`, token))?.seller_reputation?.level_id ?? null);
    return sellers.get(id) ?? null;
  };
  const rows = await Promise.all(entries.map(async (e): Promise<Row | null> => {
    try {
      if (e.type === "PRODUCT") {
        const [prod, offers] = await Promise.all([
          get<{ name?: string; pictures?: { url?: string }[] }>(`/products/${e.id}`, token),
          get<{ results?: { price?: number; original_price?: number | null; condition?: string; seller_id?: number; shipping?: { free_shipping?: boolean } }[] }>(`/products/${e.id}/items`, token),
        ]);
        const best = (offers?.results ?? []).filter(o => typeof o.price === "number").sort((a, b) => a.price! - b.price!)[0];
        if (!prod?.name || !best) return null;
        const reputation = await rep(best.seller_id);
        return { fornecedor: "ml", item_id: e.id, titulo: prod.name, imagens: (prod.pictures ?? []).map(p => https(p.url)).filter(Boolean).slice(0, 5), preco: best.price!, preco_original: best.original_price ?? null, frete_gratis: !!best.shipping?.free_shipping, categoria: cat, vendidos_estimado: null, comissao_percentual: null, avaliacao: null, reputacao: reputation, posicao_ranking: e.position, link_origem: `https://www.mercadolivre.com.br/p/${e.id}`, status: "ativo", validado: mlValidated({ status: "active", condition: best.condition, reputation, ranked: true }), atualizado_em: now };
      }
      let itemId = e.id;
      if (e.type === "USER_PRODUCT") itemId = (await get<{ items?: string[] }>(`/user-products/${e.id}/items`, token))?.items?.find(i => /^MLB\d+$/.test(i)) ?? "";
      if (!itemId) return null;
      const it = await get<{ id?: string; title?: string; price?: number; original_price?: number | null; status?: string; condition?: string; seller_id?: number; permalink?: string; thumbnail?: string; pictures?: { secure_url?: string; url?: string }[]; shipping?: { free_shipping?: boolean }; sold_quantity?: number }>(`/items/${itemId}`, token);
      if (!it?.id || !it.title || typeof it.price !== "number" || !it.permalink) return null;
      const reputation = await rep(it.seller_id);
      const pics = (it.pictures ?? []).map(p => https(p.secure_url || p.url)).filter(Boolean);
      return { fornecedor: "ml", item_id: it.id, titulo: it.title, imagens: (pics.length ? pics : [https(it.thumbnail)]).filter(Boolean).slice(0, 5), preco: it.price, preco_original: it.original_price ?? null, frete_gratis: !!it.shipping?.free_shipping, categoria: cat, vendidos_estimado: it.sold_quantity || null, comissao_percentual: null, avaliacao: null, reputacao: reputation, posicao_ranking: e.position, link_origem: it.permalink, status: "ativo", validado: mlValidated({ status: it.status, condition: it.condition, reputation, ranked: true }), atualizado_em: now };
    } catch { return null; }
  }));
  return rows.filter((r): r is Row => !!r);
}

type ShopeeNode = { itemId?: number | string; shopId?: number | string; productName?: string; imageUrl?: string; priceMin?: string | number; priceMax?: string | number; sales?: number; commissionRate?: string | number; ratingStar?: string | number; productLink?: string };
const SHOPEE_QUERY = `query($keyword:String,$page:Int,$limit:Int,$sortType:Int){productOfferV2(keyword:$keyword,page:$page,limit:$limit,sortType:$sortType){nodes{itemId shopId productName imageUrl priceMin priceMax sales commissionRate ratingStar productLink}}}`;

async function shopeeCategory(cat: string, keyword: string, now: string): Promise<{ rows: Row[]; warning: string | null }> {
  const appId = process.env["SHOPEE_PLATFORM_APP_ID"], secret = process.env["SHOPEE_PLATFORM_SECRET"];
  if (!appId || !secret) return { rows: [], warning: "Shopee pulada: credenciais da plataforma (SHOPEE_PLATFORM_APP_ID / SHOPEE_PLATFORM_SECRET) não configuradas." };
  const { shopeeGraphql } = await import("./shopee.server");
  const r = await shopeeGraphql<{ productOfferV2: { nodes?: ShopeeNode[] } }>(appId, secret, SHOPEE_QUERY, { keyword, page: 1, limit: 50, sortType: 2 });
  if (!r.ok) return { rows: [], warning: `Shopee: ${r.error}` };
  const rows = (r.data.productOfferV2.nodes ?? []).map((n, i): Row | null => {
    const preco = Number(n.priceMin); if (!n.itemId || !n.productName || !n.productLink || !(preco > 0)) return null;
    const rating = n.ratingStar != null ? Number(n.ratingStar) : null;
    return { fornecedor: "shopee", item_id: String(n.itemId), shop_id: n.shopId != null ? String(n.shopId) : null, titulo: n.productName, imagens: n.imageUrl ? [n.imageUrl] : [], preco, preco_original: Number(n.priceMax) > preco ? Number(n.priceMax) : null, frete_gratis: false, categoria: cat, vendidos_estimado: n.sales ?? null, comissao_percentual: n.commissionRate != null ? Number(n.commissionRate) : null, avaliacao: rating, reputacao: null, posicao_ranking: i + 1, link_origem: n.productLink, status: "ativo", validado: shopeeValidated({ rating, ranked: true }), atualizado_em: now };
  }).filter((x): x is Row => !!x);
  return { rows, warning: null };
}

/** Processa a próxima categoria pendente do ciclo do dia. Cria o ciclo se preciso. */
export async function refreshNextCategory(origem: "agendada" | "manual") {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data: last } = await db.from("produtos_atualizacoes").select("*").order("iniciado_em", { ascending: false }).limit(1).maybeSingle();
  let run = last;
  const stale = !run || (run.concluido_em && Date.now() - new Date(run.concluido_em).getTime() > 12 * 3600_000) || (origem === "manual" && run.concluido_em);
  if (stale) {
    const { data, error } = await db.from("produtos_atualizacoes").insert({ origem }).select("*").single();
    if (error || !data) throw new Error("não foi possível iniciar a atualização");
    run = data;
  }
  if (!run || run.concluido_em) return { done: true, remaining: 0, runId: run?.id ?? null };
  const next = LIBRARY_CATEGORIES.find(c => !run!.categorias_feitas.includes(c.id));
  const now = new Date().toISOString();
  const avisos = new Set(run.avisos);
  let ml = 0, sh = 0;
  if (next) {
    const token = await mlToken();
    const mlRows = token ? (await mlCategory(next.id, next.parent, token, now)).map(r => next.sub ? { ...r, posicao_ranking: (r.posicao_ranking ?? 0) + 100 } : r) : [];
    if (!token) avisos.add("Mercado Livre: credenciais do app indisponíveis.");
    const shopee = next.sub ? { rows: [] as Row[], warning: null as string | null } : await shopeeCategory(next.id, next.keywords[0] ?? next.name, now);
    if (shopee.warning) avisos.add(shopee.warning);
    const seen = new Set<string>();
    const rows = [...mlRows, ...shopee.rows].filter(r => { const k = r.fornecedor + r.item_id; if (seen.has(k)) return false; seen.add(k); return true; });
    if (rows.length) await db.from("produtos_cache").upsert(rows, { onConflict: "fornecedor,item_id", ignoreDuplicates: next.sub });
    ml = mlRows.length; sh = shopee.rows.length;
  }
  const feitas = next ? [...run.categorias_feitas, next.id] : run.categorias_feitas;
  const finished = feitas.length >= LIBRARY_CATEGORIES.length;
  let foraDoAr = 0;
  if (finished) {
    // Só marca fora do ar fornecedores que foram realmente consultados neste ciclo.
    const suppliers = ["ml", ...(process.env["SHOPEE_PLATFORM_APP_ID"] ? ["shopee"] : [])];
    const { count } = await db.from("produtos_cache").update({ status: "fora_do_ar", validado: false }, { count: "exact" }).lt("atualizado_em", run.iniciado_em).eq("status", "ativo").in("fornecedor", suppliers);
    foraDoAr = count ?? 0;
  }
  await db.from("produtos_atualizacoes").update({ categorias_feitas: feitas, avisos: [...avisos], ml_total: run.ml_total + ml, shopee_total: run.shopee_total + sh, ...(finished ? { concluido_em: new Date().toISOString(), fora_do_ar: foraDoAr } : {}) }).eq("id", run.id);
  return { done: finished, remaining: LIBRARY_CATEGORIES.length - feitas.length, runId: run.id, category: next?.name ?? null };
}
