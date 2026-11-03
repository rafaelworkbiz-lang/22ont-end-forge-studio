import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { dayMs, monthlySales, occurredSales, salesRange } from '@/lib/sales-period';
import { DemoSalesOverview } from '@/components/demo-sales-overview';

afterEach(cleanup);
const sale = (at: string, cents = 10000, commissionCents = 1000) => ({ id: at, at, cents, commissionCents, product: { id: 'MLB1', title: 'Carregador', price: 100, thumbnail: '/favicon.png' } });
const now = '2026-10-12T20:00:00Z';

it('includes both custom dates at São Paulo midnight and validates ranges', () => {
  const range = salesRange('Personalizado', now, '2026-01-31', '2026-02-01', '');
  expect(range.end - range.start).toBe(2 * dayMs);
  expect(new Date(range.start).toISOString()).toBe('2026-01-31T03:00:00.000Z');
  expect(new Date(range.end).toISOString()).toBe('2026-02-02T03:00:00.000Z');
  expect(salesRange('Personalizado', now, '2026-02-01', '2026-01-31', '').error).toBeTruthy();
  expect(salesRange('Personalizado', now, '2026-02-30', '', '').error).toBeTruthy();
});
it('uses full calendar months including leap February', () => {
  expect(salesRange('Mensal', now, '', '', '2024-02').days).toBe(29);
  expect(salesRange('Mensal', now, '', '', '2026-12').end).toBe(Date.parse('2027-01-01T03:00:00Z'));
});
it('separates monthly revenue and commissions, sorts years and excludes future sales', () => {
  const sales = [sale('2026-02-01T02:59:59Z'), sale('2026-02-01T03:00:00Z', 20000, 3200), sale('2025-12-01T12:00:00Z'), sale('2026-10-13T12:00:00Z')];
  expect(occurredSales(sales, now)).toHaveLength(3);
  expect(monthlySales(sales, now)).toEqual([
    { month: '2026-02', cents: 20000, commissionCents: 3200 },
    { month: '2026-01', cents: 10000, commissionCents: 1000 },
    { month: '2025-12', cents: 10000, commissionCents: 1000 },
  ]);
});
it('opens monthly details, keeps today unchanged and replaces history with horizontal metrics', () => {
  render(<DemoSalesOverview userId="period-tests" hidden={false} data={{ rate: 10, now, historyCents: 0, months: [], sales: [sale('2026-06-01T12:00:00Z'), sale('2026-10-12T12:00:00Z', 25000, 2500)] }} />);
  const today = document.querySelector('.sales-today-value')?.textContent;
  fireEvent.change(screen.getByLabelText('Período das vendas'), { target: { value: 'Mensal' } });
  expect(screen.getByRole('columnheader', { name: 'Comissões' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Ver junho de 2026' }));
  expect(screen.getByRole('img', { name: 'Gráfico de faturamento' })).toBeTruthy();
  expect(document.querySelector('.sales-today-value')?.textContent).not.toBe(today);
  expect(document.querySelector('.sales-metrics-horizontal')).toBeTruthy();
  expect(screen.queryByText('Histórico')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Todos os meses' }));
  expect(screen.getByRole('table')).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Período das vendas'), { target: { value: 'Personalizado' } });
  fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-13' } });
  expect(screen.getByRole('alert').textContent).toContain('data final');
});