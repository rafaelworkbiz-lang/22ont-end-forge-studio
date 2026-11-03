import { saoDay, type DemoSale } from './demo-engine';

export const salesPeriods = ['Hoje', 'Ontem', '7 dias', '30 dias', 'Mensal', 'Personalizado'] as const;
export type SalesPeriod = typeof salesPeriods[number];
export const dayMs = 86400000;
export const dayStart = (day: string) => Date.parse(`${day}T00:00:00-03:00`);
export const monthLabel = (month: string) => new Date(`${month}-15T12:00:00-03:00`).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', month: 'long', year: 'numeric' });
const validDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(dayStart(day)) && saoDay(new Date(dayStart(day))) === day;

export function salesRange(period: SalesPeriod, now: string, from: string, to: string, month: string) {
  const today = saoDay(new Date(now));
  let start = dayStart(today), end = start + dayMs;
  if (period === 'Ontem') { start -= dayMs; end -= dayMs; }
  if (period === '7 dias' || period === '30 dias') start -= ((period === '7 dias' ? 7 : 30) - 1) * dayMs;
  if (period === 'Personalizado') {
    if (!validDay(from) || !validDay(to)) return { error: 'Selecione as duas datas.', start, end, days: 1 };
    if (to < from) return { error: 'A data final deve ser igual ou posterior à inicial.', start, end, days: 1 };
    start = dayStart(from); end = dayStart(to) + dayMs;
  }
  if (period === 'Mensal') {
    const active = /^\d{4}-\d{2}$/.test(month) && validDay(`${month}-01`) ? month : today.slice(0, 7);
    start = dayStart(`${active}-01`);
    const next = new Date(`${active}-01T12:00:00-03:00`);
    next.setUTCMonth(next.getUTCMonth() + 1);
    end = dayStart(`${saoDay(next).slice(0, 7)}-01`);
  }
  return { error: '', start, end, days: Math.round((end - start) / dayMs) };
}

export function occurredSales(sales: DemoSale[], now: string) {
  return sales.filter(s => Number.isFinite(Date.parse(s.at)) && Date.parse(s.at) <= Date.parse(now));
}
export function monthlySales(sales: DemoSale[], now: string) {
  const months = new Map<string, { month: string; cents: number; commissionCents: number }>();
  for (const sale of occurredSales(sales, now)) {
    const month = saoDay(new Date(sale.at)).slice(0, 7);
    const row = months.get(month) ?? { month, cents: 0, commissionCents: 0 };
    row.cents += sale.cents; row.commissionCents += sale.commissionCents;
    months.set(month, row);
  }
  return [...months.values()].sort((a, b) => b.month.localeCompare(a.month));
}