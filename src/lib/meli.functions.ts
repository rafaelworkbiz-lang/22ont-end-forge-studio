import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { meliCategories } from "./meli-categories";
import { hotCategoryBatch, rankedHighlights, type Highlight } from "./meli-highlights";

export type MeliProduct = { id: string; title: string; price: number; thumbnail: string; permalink: string; freeShipping: boolean; sold: number; categoryId: string; bestseller?: { position: number; categoryId: string } };

const API = "https://api.mercadolibre.com";

let tokenCache: { token: string; expires: number } | null = null;

async function getToken(): Promise<string | null> {
  if (tokenCache && tokenCache.expires > Date.now()) return tokenCache.token;
  const id = process.env["MELI_APP_ID"];
  const secret = process.env["MELI_CLIENT_SECRET"];
  if (!id || !secret) return null;
  const res = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  if (!res.ok) { console.error("MELI token error", res.status); return null; }
  const j = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: j.access_token, expires: Date.now() + (j.expires_in - 120) * 1000 };
  return j.access_token;
}

type RawProduct = { id: string; name?: string; pictures?: Array<{ url?: string }> };

async function get<T>(path: string, token: string): Promise<T | null> {
  const r = await fetch(`${API}${path}`, { headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(12000) });
  if (!r.ok) return null;
  return (await r.json()) as T;
}

async function enrich(p: RawProduct, token: string, fallbackCat: string): Promise<MeliProduct | null> {
  const detail = p.name && p.pictures ? p : await get<RawProduct>(`/products/${p.id}`, token);
  if (!detail?.name) return null;
  const offers = await get<{ results?: Array<{ price?: number; category_id?: string; shipping?: { free_shipping?: boolean } }> }>(`/products/${p.id}/items`, token);
  const list = (offers?.results ?? []).filter((o) => typeof o.price === "number");
  if (!list.length) return null;
  const best = list.reduce((a, b) => ((a.price ?? 0) <= (b.price ?? 0) ? a : b));
  return {
    id: p.id,
    title: detail.name,
    price: best.price ?? 0,
    thumbnail: (detail.pictures?.[0]?.url || "").replace("http://", "https://"),
    permalink: `https://www.mercadolivre.com.br/p/${p.id}`,
    freeShipping: list.some((o) => o.shipping?.free_shipping),
    sold: 0,
    categoryId: fallbackCat || best.category_id || "",
  };
}

const LIMIT = 50;
const MAX_PAGES = 80;
const CATS = meliCategories.filter((c) => c.id);

const highlightsCache = new Map<string, { expires: number; items: MeliProduct[] }>();

type RawItem = { id?: string; title?: string; price?: number; thumbnail?: string; permalink?: string; status?: string; category_id?: string; shipping?: { free_shipping?: boolean } };

async function rankedProduct(entry: Highlight, token: string, categoryId: string): Promise<MeliProduct | null> {
  let product: MeliProduct | null = null;
  if (entry.type === "PRODUCT") product = await enrich({ id: entry.id }, token, categoryId);
  else {
    let itemId = entry.id;
    if (entry.type === "USER_PRODUCT") {
      // User products are not item IDs: resolve their actual listings first.
      const linked = await get<{ items?: string[] }>(`/user-products/${entry.id}/items`, token);
      itemId = linked?.items?.find(id => /^MLB\d+$/.test(id)) ?? "";
    }
    if (!itemId) return null;
    const item = await get<RawItem>(`/items/${itemId}`, token);
    if (!item?.id || !item.title || typeof item.price !== "number" || item.price <= 0 || !item.permalink || (item.status && item.status !== "active")) return null;
    const url = new URL(item.permalink);
    if (url.protocol !== "https:" || !(url.hostname === "mercadolivre.com.br" || url.hostname.endsWith(".mercadolivre.com.br"))) return null;
    product = { id: item.id, title: item.title, price: item.price, thumbnail: (item.thumbnail ?? "").replace("http://", "https://"), permalink: item.permalink, freeShipping: !!item.shipping?.free_shipping, sold: 0, categoryId };
  }
  return product ? { ...product, bestseller: { position: entry.position, categoryId } } : null;
}

async function categoryHighlights(categoryId: string, token: string): Promise<MeliProduct[] | null> {
  const cached = highlightsCache.get(categoryId);
  if (cached && cached.expires > Date.now()) return cached.items;
  const raw = await get<unknown>(`/highlights/MLB/category/${categoryId}`, token);
  const entries = rankedHighlights(raw);
  if (!entries) return null;
  const items: MeliProduct[] = [];
  for (let i = 0; i < entries.length; i += 5) {
    const batch = await Promise.all(entries.slice(i, i + 5).map(entry => rankedProduct(entry, token, categoryId).catch(() => null)));
    items.push(...batch.filter((item): item is MeliProduct => item !== null));
  }
  if (entries.length && !items.length) return null;
  highlightsCache.set(categoryId, { expires: Date.now() + 5 * 60_000, items });
  return items;
}

function plan(q: string, category: string, page: number, allowed: string[] = []): { q: string; offset: number; cat: string } | null {
  if (q) return page < 3 ? { q, offset: page * LIMIT, cat: category } : null;
  if (category) {
    const c = CATS.find((x) => x.id === category);
    const kw = c?.keywords[Math.floor(page / 3)];
    return kw ? { q: kw, offset: (page % 3) * LIMIT, cat: category } : null;
  }
  const list = allowed.length ? CATS.filter((x) => allowed.includes(x.id)) : CATS;
  if (!list.length || page >= (allowed.length ? Math.min(120, list.length * 24) : MAX_PAGES)) return null;
  const c = list[page % list.length];
  if (!c || !c.keywords.length) return null;
  const r = Math.floor(page / list.length);
  return { q: c.keywords[r % c.keywords.length] ?? c.keywords[0] ?? "", offset: Math.floor(r / c.keywords.length) * LIMIT, cat: c.id };
}

export const searchMeliProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ q: z.string().max(120).default(""), category: z.string().max(20).default(""), mode: z.enum(["all", "hot"]).default("all"), sort: z.enum(["relevance", "price_asc", "price_desc"]).default("relevance"), page: z.number().int().min(0).max(120).default(0), categories: z.array(z.string().max(20)).max(20).default([]) }).parse(d))
  .handler(async ({ data, context }) => {
    const fail = (error: string) => ({ items: [] as MeliProduct[], total: 0, hasMore: false, error: error as string | null });
    try {
      const { resolveMeliAccess } = await import('./meli-access.server');
      const access = await resolveMeliAccess(context.supabase, context.userId);
      if (!access.catalogAllowed) return fail("Conecte sua conta do Mercado Livre para liberar o catálogo.");
      
      const token = await getToken();
      if (!token) return fail("O catálogo está sendo preparado. Volte em instantes.");
      if (data.mode === "hot") {
        const ids = CATS.filter(c => !data.categories.length || data.categories.includes(c.id)).map(c => c.id);
        const batch = hotCategoryBatch(ids, data.category, data.page);
        if (!batch.length) return { items: [] as MeliProduct[], total: 0, hasMore: false, error: null as string | null };
        const results = await Promise.all(batch.map(id => categoryHighlights(id, token).catch(() => null)));
        const hasMore = hotCategoryBatch(ids, data.category, data.page + 1).length > 0;
        const items = results.flatMap(result => result ?? []);
        const unavailable = results.some(result => result === null);
        return { items, total: 0, hasMore, error: null as string | null, warning: unavailable ? "O ranking de algumas categorias está indisponível no Mercado Livre." : null };
      }
      const step = plan(data.q, data.category, data.page, data.categories);
      const hasMore = !!plan(data.q, data.category, data.page + 1, data.categories);
      if (!step) return { items: [] as MeliProduct[], total: 0, hasMore: false, error: null as string | null };
      const res = await get<{ results?: RawProduct[] }>(`/products/search?status=active&site_id=MLB&q=${encodeURIComponent(step.q)}&limit=${LIMIT}&offset=${step.offset}`, token);
      const raws = res?.results ?? [];
      const items = (await Promise.all(raws.map((p) => enrich(p, token, step.cat).catch(() => null)))).filter((x): x is MeliProduct => !!x);
      return { items, total: 0, hasMore, error: null as string | null };
    } catch (e) {
      console.error("MELI search failure", e);
      return fail("O catálogo está temporariamente indisponível. Tente novamente em instantes.");
    }
  });

export type MeliProductDetail = {
  id: string; title: string; price: number; originalPrice: number | null; pictures: string[]; permalink: string;
  freeShipping: boolean; sold: number; condition: string | null; status: string | null;
  reputation: string | null; sellerNickname: string | null; eligibility: "elegivel" | "nao_elegivel" | "nao_verificado"; eligible: boolean; ineligibleReason: string | null; note: string | null;
};
type RawFullItem = RawItem & { original_price?: number | null; condition?: string; sold_quantity?: number; seller_id?: number; pictures?: Array<{ secure_url?: string; url?: string }> };

const sellerCache = new Map<number, { expires: number; level: string | null; nickname: string | null }>();
async function sellerInfo(id: number, token: string) {
  const hit = sellerCache.get(id);
  if (hit && hit.expires > Date.now()) return hit;
  const r = await get<{ nickname?: string; seller_reputation?: { level_id?: string | null } }>(`/users/${id}`, token).catch(() => null);
  // Sucesso fica 24h; falha é guardada por 10 min para não insistir na API.
  const v = { level: r?.seller_reputation?.level_id ?? null, nickname: r?.nickname ?? null, expires: Date.now() + (r ? 24 * 3600_000 : 10 * 60_000) };
  sellerCache.set(id, v);
  return v;
}

export const getProductDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().regex(/^MLB\d{4,16}$/) }).parse(d))
  .handler(async ({ data, context }): Promise<{ detail: MeliProductDetail | null; error: string | null }> => {
    try {
      const { resolveMeliAccess } = await import("./meli-access.server");
      const access = await resolveMeliAccess(context.supabase, context.userId);
      if (!access.catalogAllowed) return { detail: null, error: "Conecte sua conta do Mercado Livre para liberar o catálogo." };
      const token = await getToken();
      if (!token) return { detail: null, error: "Produto indisponível no momento." };
      let item = await get<RawFullItem>(`/items/${data.id}`, token);
      let catalog: RawProduct | null = null;
      if (!item?.id) {
        catalog = await get<RawProduct>(`/products/${data.id}`, token);
        const offers = await get<{ results?: Array<{ item_id?: string; price?: number; original_price?: number | null; condition?: string; seller_id?: number; shipping?: { free_shipping?: boolean } }> }>(`/products/${data.id}/items`, token);
        const best = (offers?.results ?? []).filter(o => typeof o.price === "number").sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];
        if (best?.item_id) item = await get<RawFullItem>(`/items/${best.item_id}`, token);
        // Itens podem ser restritos ao token do app: usa os dados da oferta do catálogo.
        if (!item?.id && best && catalog?.name) item = { id: best.item_id ?? data.id, title: catalog.name, price: best.price ?? 0, status: "active", ...(best.condition ? { condition: best.condition } : {}), ...(best.seller_id ? { seller_id: best.seller_id } : {}), original_price: best.original_price ?? null, ...(best.shipping ? { shipping: best.shipping } : {}) };
      }
      if (!item?.id || typeof item.price !== "number") return { detail: null, error: "Produto não encontrado no Mercado Livre." };
      const seller = item.seller_id ? await sellerInfo(item.seller_id, token) : null;
      const reputation = seller?.level ?? null;
      const { profileEligibility } = await import("./product-share");
      const el = profileEligibility({ condition: item.condition, status: item.status, reputation });
      const pics = (item.pictures ?? []).map(p => (p.secure_url || p.url || "").replace("http://", "https://")).filter(Boolean);
      const fallbackPics = (catalog?.pictures ?? []).map(p => (p.url ?? "").replace("http://", "https://")).filter(Boolean);
      return { error: null, detail: {
        id: data.id, title: catalog?.name || item.title || "", price: item.price, originalPrice: item.original_price ?? null,
        pictures: (pics.length ? pics : fallbackPics).slice(0, 10),
        permalink: catalog ? `https://www.mercadolivre.com.br/p/${data.id}` : item.permalink ?? `https://www.mercadolivre.com.br/p/${data.id}`,
        freeShipping: !!item.shipping?.free_shipping, sold: item.sold_quantity ?? 0, condition: item.condition ?? null, status: item.status ?? null,
        reputation, sellerNickname: seller?.nickname ?? null, eligibility: el.state, eligible: el.eligible, ineligibleReason: el.state === "nao_elegivel" ? el.reason : null, note: el.state === "nao_verificado" ? el.reason : null,
      } };
    } catch (e) {
      console.error("MELI detail failure", e);
      return { detail: null, error: "Produto indisponível no momento." };
    }
  });
