import { describe, it, expect } from 'vitest';
import { dailyAutoSales, manualSalesValue, INFLUENCER_RATE } from '@/lib/demo-engine';
const products = [{ id: 'a', title: 'A', price: 89.9, thumbnail: '' }, { id: 'b', title: 'B', price: 349, thumbnail: '' }];
const ratio = (s: { cents: number; commissionCents: number }[]) => s.reduce((n, x) => n + x.commissionCents, 0) / s.reduce((n, x) => n + x.cents, 0);
describe('comissão do painel', () => {
  it('é 30% do bruto', () => expect(INFLUENCER_RATE).toBe(30));
  it('vendas automáticas saem com 30% do bruto', () => expect(ratio(dailyAutoSales('x', Date.parse('2026-10-20T03:00:00Z'), products))).toBeCloseTo(0.3, 2));
  it('vendas manuais saem com 30% do bruto', () => expect(ratio(manualSalesValue('y', 800000, Date.parse('2026-10-01'), Date.parse('2026-10-10'), products, INFLUENCER_RATE, Date.parse('2026-10-20')))).toBeCloseTo(0.3, 2));
});
