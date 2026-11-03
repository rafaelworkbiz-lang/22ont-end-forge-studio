// Regras puras da biblioteca de produtos validados (testáveis, sem rede).
import { ELIGIBLE_REPUTATION } from "./product-share";

export type Supplier = "ml" | "shopee";
export const SUPPLIER_NAME: Record<Supplier, string> = { ml: "Mercado Livre", shopee: "Shopee" };

export function mlValidated(p: { status: string | null | undefined; condition: string | null | undefined; reputation: string | null | undefined; ranked: boolean }) {
  return p.status === "active" && p.condition === "new" && !!p.reputation && (ELIGIBLE_REPUTATION as readonly string[]).includes(p.reputation) && p.ranked;
}

export function shopeeValidated(p: { rating: number | null | undefined; ranked: boolean }) {
  return typeof p.rating === "number" && p.rating >= 4.5 && p.ranked;
}

export type MyStatus = "ativo" | "preco_caiu" | "fora_do_ar";
export function myProductStatus(saved: number, current: { preco: number; status: string } | null | undefined): MyStatus {
  if (!current || current.status !== "ativo") return "fora_do_ar";
  if (current.preco < saved) return "preco_caiu";
  return "ativo";
}

export const productKey = (f: Supplier, id: string) => `${f}:${id}`;
export function parseProductKey(v: unknown): { fornecedor: Supplier; itemId: string } | null {
  if (typeof v !== "string") return null;
  const m = /^(ml|shopee):([A-Za-z0-9_-]{2,40})$/.exec(v);
  return m ? { fornecedor: m[1] as Supplier, itemId: m[2]! } : null;
}

/** Comissão estimada em R$ a partir da taxa oficial (Shopee devolve fração 0–1). */
export function commissionValue(price: number, rate: number | null | undefined) {
  if (typeof rate !== "number" || rate <= 0) return null;
  const r = rate > 1 ? rate / 100 : rate;
  return Math.round(price * r * 100) / 100;
}
