import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DemoSalesOverview } from '@/components/demo-sales-overview';

it('shows a new activity within an identified demonstration and allows dismissing it without replay', () => {
  localStorage.clear();
  const initial = { rate: 10, now: '2026-10-12T20:00:00Z', historyCents: 50000000, months: [], sales: [{ id: 'first', at: '2026-10-12T19:59:00Z', cents: 10000, commissionCents: 1000, product: { id: 'MLB1', title: 'Produto teste', price: 100, thumbnail: 'https://example.com/test.jpg' } }] };
  const view = render(<DemoSalesOverview data={initial} hidden={false} userId="test-account" />);
  expect(screen.getByText('Atualizado')).toBeTruthy();
  expect(screen.queryByRole('status')).toBeNull();
  const first = initial.sales[0];
  if (!first) throw new Error('Missing fixture');
  view.rerender(<DemoSalesOverview data={{ ...initial, now: '2026-10-12T20:00:30Z', sales: [...initial.sales, { ...first, id: 'second', at: '2026-10-12T20:00:15Z' }] }} hidden={false} userId="test-account" />);
  expect(screen.getByRole('status').textContent).toContain('Registro de atividade');
  expect(screen.getByRole('status').querySelector('img')?.getAttribute('src')).toBe('https://example.com/test.jpg');
  fireEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }));
  expect(screen.queryByRole('status')).toBeNull();
  view.unmount();
});