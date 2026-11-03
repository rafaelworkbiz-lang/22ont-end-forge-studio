export type DemoProduct = { id: string; title: string; price: number; thumbnail: string };
export type DemoSale = { id: string; at: string; product: DemoProduct; cents: number; commissionCents: number };
export function randomFor(seed: string) {
  let n = 2166136261;
  for (const c of seed) n = Math.imul(n ^ c.charCodeAt(0), 16777619);
  return () => { n += 0x6D2B79F5; let t = Math.imul(n ^ n >>> 15, 1 | n); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const saoDay = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export function dailySales(seed: string, day: string, products: DemoProduct[], rate: number): DemoSale[] {
  if (!products.length) return [];
  const rng = randomFor(`${seed}:${day}`), count = Math.floor(rng() * 101);
  const midnight = new Date(`${day}T00:00:00-03:00`).getTime();
  return Array.from({ length: count }, (_, i) => {
    const product = products[Math.floor(rng() * products.length)] ?? products[0];
    if (!product) throw new Error('Catálogo indisponível');
    const cents = Math.round(product.price * 100);
    return { id: `${day}:${i}`, at: new Date(midnight + Math.floor(rng() * 86400000)).toISOString(), product, cents, commissionCents: Math.round(cents * rate / 100) };
  }).sort((a, b) => a.at.localeCompare(b.at));
}
export function historicSales(seed: string, activatedAt: string, products: DemoProduct[], rate: number): DemoSale[] {
  if (!products.length) return [];
  const start = Date.parse('2025-01-01T00:00:00-03:00');
  const end = Math.min(Date.parse(`${saoDay(new Date(activatedAt))}T00:00:00-03:00`), Date.parse('2026-11-01T00:00:00-03:00'));
  if (end <= start) return [];
  const rng = randomFor(`${seed}:history`);
  const sales = Array.from({ length: 2500 }, (_, i) => {
    const product = products[Math.floor(rng() * products.length)] ?? products[0];
    if (!product) throw new Error('Catálogo indisponível');
    return { id: `history:${i}`, at: new Date(start + Math.floor(rng() * (end - start))).toISOString(), product, cents: 1 + Math.floor(rng() * 100000), commissionCents: 0 };
  });
  const total = sales.reduce((sum, s) => sum + s.cents, 0);
  let remaining = 50000000;
  sales.forEach((s, i) => { s.cents = i === sales.length - 1 ? remaining : Math.floor(s.cents / total * 50000000); remaining -= s.cents; s.commissionCents = Math.round(s.cents * rate / 100); });
  return sales.sort((a, b) => a.at.localeCompare(b.at));
}
export const MAX_TEST_SALES = 10000;
export function splitSales(seed: string, totalCents: number, startMs: number, endMs: number, products: DemoProduct[], rate: number, requestedCount?: number): DemoSale[] {
  if (!products.length || totalCents <= 0 || endMs <= startMs) return [];
  const rng = randomFor(seed);
  const avg = products.reduce((n, p) => n + p.price * 100, 0) / products.length || 10000;
  const auto = Math.max(1, Math.round(totalCents / avg));
  const count = Math.max(1, Math.min(MAX_TEST_SALES, totalCents, Math.floor(requestedCount ?? Math.min(auto, MAX_TEST_SALES))));
  const weighted = Array.from({ length: count }, (_, i) => {
    const product = products[Math.floor(rng() * products.length)] ?? products[0]!;
    return { product, at: new Date(startMs + Math.floor(rng() * (endMs - startMs))).toISOString(), w: product.price * (0.6 + rng() * 0.8) || 1, i };
  });
  const sum = weighted.reduce((n, s) => n + s.w, 0), spread = totalCents - count;
  let remaining = totalCents;
  const sales: DemoSale[] = weighted.map((s, i) => {
    const cents = i === count - 1 ? remaining : 1 + Math.floor(s.w / sum * spread);
    remaining -= cents;
    return { id: `${seed}:${i}`, at: s.at, product: s.product, cents, commissionCents: Math.round(cents * rate / 100) };
  });
  return sales.sort((a, b) => a.at.localeCompare(b.at));
}
export type CompactEvents = { v: 2; products: DemoProduct[]; sales: [string, number, number, number][] };
export function compactSales(sales: DemoSale[]): CompactEvents {
  const index = new Map<string, number>(), products: DemoProduct[] = [];
  const rows = sales.map(s => {
    let i = index.get(s.product.id);
    if (i === undefined) { i = products.length; index.set(s.product.id, i); products.push(s.product); }
    return [s.at, i, s.cents, s.commissionCents] as [string, number, number, number];
  });
  return { v: 2, products, sales: rows };
}
export function expandSales(raw: unknown, prefix = 's'): DemoSale[] {
  if (Array.isArray(raw)) return raw as DemoSale[];
  const c = raw as Partial<CompactEvents> | null;
  if (!c || c.v !== 2 || !c.products || !c.sales) return [];
  const products = c.products;
  return c.sales.flatMap(([at, p, cents, commissionCents], i) => { const product = products[p]; return product ? [{ id: `${prefix}:${i}`, at, product, cents, commissionCents }] : []; });
}
export const MAX_AUTO_DAILY = 400;
/** Fixed commission shown in influencer panels: 30% of the gross sale value. */
export const INFLUENCER_RATE = 30;
/**
 * Automatic daily sales in organic waves. The influencer's daily net (30% of gross)
 * lands between R$300 and R$2.000, usually R$400–R$900.
 */
export function dailyAutoSales(seed: string, dayStartMs: number, products: DemoProduct[], _rate?: number): DemoSale[] {
  if (!products.length) return [];
  const rng = randomFor(seed);
  const mood = rng();
  const netCents = Math.round(mood < 0.05 ? 30000 + rng() * 10000 : mood < 0.65 ? 40000 + rng() * 50000 : mood < 0.92 ? 90000 + rng() * 60000 : 150000 + rng() * 50000);
  const grossCents = Math.round(netCents * 100 / INFLUENCER_RATE);
  const stopHour = 17 + rng() * 7;
  const bursts = Array.from({ length: 1 + Math.floor(rng() * 4) }, () => ({ hour: 9 + rng() * (stopHour - 9), weight: 0.5 + rng() }));
  const hourAt = () => {
    if (rng() < 0.3) return 7 + rng() * (stopHour - 7);
    let pick = rng() * bursts.reduce((n, b) => n + b.weight, 0);
    const b = bursts.find(x => (pick -= x.weight) <= 0) ?? bursts[0]!;
    return Math.min(stopHour, Math.max(0, b.hour + (rng() - 0.5) * 1.2));
  };
  const raw: { product: DemoProduct; cents: number; at: string }[] = [];
  let sum = 0;
  while (sum < grossCents && raw.length < MAX_AUTO_DAILY) {
    const product = products[Math.floor(rng() * products.length)] ?? products[0]!;
    const units = rng() < 0.75 ? 1 : 2 + Math.floor(rng() * 2);
    const cents = Math.max(100, Math.round(product.price * 100) * units);
    raw.push({ product, cents, at: new Date(dayStartMs + Math.floor(hourAt() * 3600000)).toISOString() });
    sum += cents;
  }
  const f = grossCents / sum;
  let gLeft = grossCents, nLeft = netCents;
  const sales: DemoSale[] = raw.map((s, i) => {
    const last = i === raw.length - 1;
    const cents = last ? Math.max(1, gLeft) : Math.max(1, Math.round(s.cents * f));
    const commissionCents = last ? Math.max(1, nLeft) : Math.round(cents * INFLUENCER_RATE / 100);
    gLeft -= cents; nLeft -= commissionCents;
    return { id: `${seed}:${i}`, at: s.at, product: s.product, cents, commissionCents };
  });
  return sales.sort((a, b) => a.at.localeCompare(b.at)).map((s, i) => ({ ...s, id: `${seed}:${i}` }));
}

/** Admin-added batch: exactly `count` sales between startMs and endMs (never in the future). */
export function manualSales(seed: string, count: number, startMs: number, endMs: number, products: DemoProduct[], rate: number, nowMs = Date.now()): DemoSale[] {
  const end = Math.min(endMs, nowMs);
  if (!products.length || end <= startMs || count < 1) return [];
  const rnd = randomFor(seed);
  const out: DemoSale[] = [];
  for (let i = 0; i < count; i++) {
    const product = products[Math.floor(rnd() * products.length)]!;
    const at = startMs + Math.floor(rnd() * (end - startMs));
    const cents = Math.max(100, Math.round(product.price * 100));
    out.push({ id: `${seed}:${i}`, at: new Date(at).toISOString(), product, cents, commissionCents: Math.round(cents * rate / 100) });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

/** Admin-added batch by total value: sales between startMs and min(endMs, nowMs) summing exactly `totalCents`. */
export function manualSalesValue(seed: string, totalCents: number, startMs: number, endMs: number, products: DemoProduct[], rate: number, nowMs = Date.now()): DemoSale[] {
  const end = Math.min(endMs, nowMs);
  if (!products.length || end <= startMs || totalCents < 1) return [];
  return splitSales(seed, totalCents, startMs, end, products, rate);
}
