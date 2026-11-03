import { describe, expect, it } from 'vitest';
import { compactSales, dailyAutoSales, dailySales, expandSales, historicSales, saoDay, splitSales } from '@/lib/demo-engine';
const products = [{ id: 'MLB1', title: 'Produto de teste', price: 199.99, thumbnail: 'https://example.com/photo.jpg' }];
describe('Demonstração separada de vendas reais', () => {
  it('distribui exatamente R$ 500 mil sem vendas futuras ou anteriores a 2025', () => {
    const sales = historicSales('seed', '2026-10-12T21:00:00Z', products, 10);
    expect(sales.reduce((n, s) => n + s.cents, 0)).toBe(50000000);
    expect(sales.every(s => s.at >= '2025-01-01T03:00:00.000Z' && s.at < '2026-10-12T03:00:00.000Z')).toBe(true);
    expect(new Set(sales.map(s => s.at.slice(0, 7))).size).toBe(22);
  });
  it('é determinístico, aleatório por dia e nunca ultrapassa 100 unidades', () => {
    const a = dailySales('seed', '2026-10-12', products, 10);
    expect(a).toEqual(dailySales('seed', '2026-10-12', products, 10));
    for (let i = 1; i <= 28; i++) { const day = `2026-10-${String(i).padStart(2, '0')}`; const s = dailySales('seed', day, products, 10); expect(s.length).toBeLessThanOrEqual(100); expect(s.every(v => saoDay(new Date(v.at)) === day)).toBe(true); expect(s.every(v => v.commissionCents === Math.round(v.cents * .1))).toBe(true); }
    expect(a).not.toEqual(dailySales('seed', '2026-10-13', products, 10));
  });
  it('não fabrica produtos quando o catálogo está indisponível', () => {
    expect(dailySales('seed', '2026-10-12', [], 10)).toEqual([]);
    expect(historicSales('seed', '2026-10-12T21:00:00Z', [], 10)).toEqual([]);
  });
  it('divide o saldo em até 10 mil vendas dentro do período, com soma exata', () => {
    const start = Date.parse('2026-09-01T00:00:00Z'), end = Date.parse('2026-10-01T00:00:00Z');
    const sales = splitSales('k', 50000000, start, end, products, 10, 10000);
    expect(sales).toHaveLength(10000);
    expect(sales.reduce((n, s) => n + s.cents, 0)).toBe(50000000);
    expect(sales.every(s => s.cents >= 1 && Date.parse(s.at) >= start && Date.parse(s.at) < end)).toBe(true);
    expect(splitSales('k', 50000000, start, end, products, 10, 99999)).toHaveLength(10000);
    const back = expandSales(JSON.parse(JSON.stringify(compactSales(sales))));
    expect(back.map(s => [s.at, s.cents, s.product.id])).toEqual(sales.map(s => [s.at, s.cents, s.product.id]));
  });
});

import { manualSales as ms, manualSalesValue as msv } from '@/lib/demo-engine';
describe('adicionar vendas (admin)', () => {
  const prods = [{ id: 'a', title: 'A', price: 50, thumbnail: 'x' }, { id: 'b', title: 'B', price: 120, thumbnail: 'y' }];
  it('gera exatamente N vendas', () => {
    const start = Date.parse('2026-10-20T00:00:00-03:00');
    expect(ms('manual:x', 37, start, start + 86400000, prods, 10, start + 2 * 86400000)).toHaveLength(37);
  });
  it('hoje: nenhuma venda depois da hora atual', () => {
    const start = Date.parse('2026-10-31T00:00:00-03:00'), now = start + 5 * 3600000;
    const s = ms('manual:y', 50, start, start + 86400000, prods, 10, now);
    expect(s.every(v => Date.parse(v.at) <= now)).toBe(true);
  });
  it('lote por valor soma exatamente o valor cheio informado, sem venda futura', () => {
    const start = Date.parse('2026-10-31T00:00:00-03:00'), now = start + 5 * 3600000;
    const s = msv('manual:v', 50000, start, start + 86400000, prods, 10, now);
    expect(s.length).toBeGreaterThan(0);
    expect(s.reduce((n, x) => n + x.cents, 0)).toBe(50000);
    expect(s.every(v => Date.parse(v.at) <= now)).toBe(true);
    expect(msv('manual:v', 50000, start, start + 86400000, [], 10, now)).toEqual([]);
  });
});

describe('vendas automáticas diárias', () => {
  const prods = Array.from({ length: 30 }, (_, i) => ({ id: `p${i}`, title: `P${i}`, price: 20 + i * 7, thumbnail: 'x' }));
  it('ganho do dia fica entre R$ 300 e R$ 2.000 e é 30% do bruto', () => {
    for (let d = 0; d < 80; d++) {
      const s = dailyAutoSales(`u:auto:${d}`, Date.parse('2026-10-01T03:00:00Z') + d * 864e5, prods);
      const net = s.reduce((n, x) => n + x.commissionCents, 0), gross = s.reduce((n, x) => n + x.cents, 0);
      expect(net).toBeGreaterThanOrEqual(30000); expect(net).toBeLessThanOrEqual(200000);
      expect(Math.abs(net / gross - 0.3)).toBeLessThan(0.005);
    }
  });
  it('vendas por período ficam entre início e fim, sem futuro', () => {
    const start = Date.parse('2026-10-01T03:00:00Z'), end = start + 5 * 864e5, now = start + 3 * 864e5;
    const s = msv('lote', 100000, start, end, prods, 30, now);
    expect(s.reduce((n, x) => n + x.cents, 0)).toBe(100000);
    for (const x of s) { const t = Date.parse(x.at); expect(t).toBeGreaterThanOrEqual(start); expect(t).toBeLessThanOrEqual(now); }
  });
  it('valor acima de R$ 500 mil fecha exato com mais de 600 vendas', () => {
    const start = Date.parse('2026-10-01T03:00:00Z');
    const s = msv('grande', 60000000, start, start + 864e5, prods, 30, start + 864e5);
    expect(s.reduce((n, x) => n + x.cents, 0)).toBe(60000000);
    expect(s.length).toBeGreaterThan(600);
  });
});

import { proximaEtapa } from "@/lib/influencer-rules";
describe("aprovação do cadastro", () => {
  it("links enviados viram ativo", () => expect(proximaEtapa("links_enviados", "aprovar_links")).toEqual({ status: "ativo" }));
  it("afiliação pedida vira aprovada", () => expect(proximaEtapa("afiliacao_pedida", "aprovar_afiliacao")).toEqual({ status: "afiliacao_aprovada" }));
  it("não aprova links de quem ainda não enviou", () => expect("erro" in proximaEtapa("afiliacao_pedida", "aprovar_links")).toBe(true));
  it("não recusa conta já ativa", () => expect("erro" in proximaEtapa("ativo", "recusar")).toBe(true));
});
