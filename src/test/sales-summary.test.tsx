import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DemoSalesOverview } from '@/components/demo-sales-overview';

it('top total follows the selected period and returns to today', () => {
  const product = { id: 'MLB1', title: 'Produto', price: 100, thumbnail: 'https://example.com/test.jpg' };
  const data = { rate: 10, now: '2026-10-12T20:00:00Z', historyCents: 50000000, months: [], sales: [
    { id: 'today', at: '2026-10-12T19:00:00Z', cents: 10000, commissionCents: 1000, product },
    { id: 'yesterday', at: '2026-10-11T19:00:00Z', cents: 5000, commissionCents: 500, product },
  ] };
  const view = render(<DemoSalesOverview data={data} hidden={false} userId="summary-test" />);
  expect(screen.getAllByText('Atualizado')).toHaveLength(1);
  expect(screen.getByText('Faturamento')).toBeTruthy();
  expect(view.container.textContent).not.toMatch(/simulad|ilustrativa|confirmadas/i);
  const total = screen.getByTestId('today-revenue').textContent;
  expect(total).toContain('100,00');
  fireEvent.change(screen.getByLabelText('Período das vendas'), { target: { value: 'Ontem' } });
  expect(screen.getByTestId('today-revenue').textContent).toContain('50,00');
  expect(screen.getByRole('heading', { name: 'Vendas de ontem' })).toBeTruthy();
  fireEvent.change(screen.getByLabelText('Período das vendas'), { target: { value: 'Hoje' } });
  expect(screen.getByTestId('today-revenue').textContent).toBe(total);
  view.rerender(<DemoSalesOverview data={data} hidden userId="summary-test" />);
  expect(screen.getByTestId('today-revenue').textContent).toBe('••••••');
  view.unmount();
});