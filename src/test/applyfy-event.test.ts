import { describe, expect, it } from 'vitest';
import { parseApplyfy, applyfyKey } from '@/lib/applyfy-event';
describe('Applyfy event parsing', () => {
 it('reconhece planos e nunca libera pagamento recusado', () => {
  expect(parseApplyfy({ event: 'approved', offer: 'B0QAGV6', email: 'a@x.com' }).plan).toBe('lifetime');
  expect(parseApplyfy({ event: 'payment_failed', offer: 'OBULDYP', email: 'a@x.com' }).action).toBe('revoke');
  expect(parseApplyfy({ event: 'approved', email: 'a@x.com', offer: 'unknown' }).action).toBe('ignore');
 });
 it('reenvios iguais são idênticos e notificações distintas não colidem', async () => {
  const a={event:'approved',offer:'OBULDYP',email:'a@x.com',event_id:'one',transaction_id:'sale'};
  expect(await applyfyKey(a,parseApplyfy(a))).toBe(await applyfyKey({...a},parseApplyfy(a)));
  const b={...a,event_id:'two'};expect(await applyfyKey(a,parseApplyfy(a))).not.toBe(await applyfyKey(b,parseApplyfy(b)));
 });
});
