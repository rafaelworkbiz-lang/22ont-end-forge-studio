import { SHOPEE_ENDPOINT, SHOPEE_ERROR_TEXT, classifyShopeeError, shopeeAuthHeader, type ShopeeErrorKind } from "./shopee-core";

export type ShopeeResult<T> = { ok: true; data: T } | { ok: false; kind: ShopeeErrorKind; error: string };

/** POST GraphQL to Shopee. 10s timeout, one retry only on network error. Never logs the secret. */
export async function shopeeGraphql<T>(appId: string, secret: string, query: string, variables: Record<string, unknown> = {}): Promise<ShopeeResult<T>> {
  const payload = JSON.stringify({ query, variables });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(SHOPEE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: await shopeeAuthHeader(appId, secret, payload) },
        body: payload,
        signal: AbortSignal.timeout(10_000),
      });
      const body = await res.json().catch(() => null) as { data?: T; errors?: unknown[] } | null;
      if (!res.ok || !body || body.errors?.length || !body.data) {
        const kind = classifyShopeeError(res.status, body);
        console.warn("[shopee] request failed", { status: res.status, kind, appId: appId.slice(0, 4) });
        return { ok: false, kind, error: SHOPEE_ERROR_TEXT[kind] };
      }
      return { ok: true, data: body.data };
    } catch (e) {
      const timeout = e instanceof DOMException && e.name === "TimeoutError";
      console.warn("[shopee] network error", { attempt, timeout });
      if (timeout || attempt === 1) return { ok: false, kind: "indisponivel", error: SHOPEE_ERROR_TEXT.indisponivel };
    }
  }
  return { ok: false, kind: "indisponivel", error: SHOPEE_ERROR_TEXT.indisponivel };
}

export const PRODUCT_OFFER_QUERY = `query($keyword:String,$page:Int,$limit:Int,$sortType:Int){productOfferV2(keyword:$keyword,page:$page,limit:$limit,sortType:$sortType){nodes{itemId productName priceMin priceMax commissionRate imageUrl productLink offerLink shopName sales}pageInfo{page limit hasNextPage}}}`;
export const SHORTLINK_MUTATION = `mutation($originUrl:String!){generateShortLink(input:{originUrl:$originUrl}){shortLink}}`;

export function cryptoKey() {
  const k = process.env["FORNECEDOR_CRYPTO_KEY"];
  if (!k) throw new Error("FORNECEDOR_CRYPTO_KEY missing");
  return k;
}
