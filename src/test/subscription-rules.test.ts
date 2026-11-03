import { describe, it, expect } from 'vitest';
import { daysToExpiry, subTone, inCounter, fillTemplate, recoveryReason, waLink, reminderSlot } from '@/lib/subscription-rules';

const NOW = Date.parse('2026-10-31T12:00:00Z');
const DAY = 86400000;

describe('assinaturas', () => {
  it('Vitalício nunca vence nem entra em vencidas', () => {
    const r = { plan: 'lifetime', status: 'active', expires_at: null };
    expect(daysToExpiry(r, NOW)).toBeNull();
    expect(subTone(r, NOW)).toBe('vitalicio');
    expect(inCounter(r, 'vencidas30', NOW)).toBe(false);
    expect(inCounter(r, 'vitalicios', NOW)).toBe(true);
  });
  it('Mensal vencido ontem fica vencida com dias negativos', () => {
    const r = { plan: 'monthly', status: 'active', expires_at: new Date(NOW - DAY).toISOString() };
    expect(subTone(r, NOW)).toBe('vencida');
    expect(daysToExpiry(r, NOW)).toBe(-1);
    expect(inCounter(r, 'vencidas30', NOW)).toBe(true);
  });
  it('vence em até 7 dias fica âmbar', () => {
    const r = { plan: 'monthly', status: 'active', expires_at: new Date(NOW + 5 * DAY).toISOString() };
    expect(subTone(r, NOW)).toBe('vencendo');
    expect(inCounter(r, 'vence7', NOW)).toBe(true);
    expect(subTone({ ...r, expires_at: new Date(NOW + 20 * DAY).toISOString() }, NOW)).toBe('ativa');
  });
  it('avisos por e-mail 3 dias antes, no dia e 1 dia depois', () => {
    expect(reminderSlot(new Date(NOW + 3 * DAY).toISOString(), NOW)).toBe('d-3');
    expect(reminderSlot(new Date(NOW + 3600000).toISOString(), NOW)).toBe('d0');
    expect(reminderSlot(new Date(NOW - DAY).toISOString(), NOW)).toBe('d+1');
    expect(reminderSlot(new Date(NOW + 2 * DAY).toISOString(), NOW)).toBeNull();
  });
});

describe('recuperação', () => {
  it('Pix gerado e não pago entra na recuperação; aprovado não', () => {
    expect(recoveryReason('waiting_payment pix')).toBe('Pix não pago');
    expect(recoveryReason('refused')).toBe('pagamento recusado');
    expect(recoveryReason('cart_abandoned')).toBe('carrinho abandonado');
    expect(recoveryReason('approved')).toBeNull();
  });
  it('mensagem preenche variáveis e o link do WhatsApp usa +55', () => {
    const msg = fillTemplate('Oi {nome}! {plano} {valor} {link}', { nome: 'Ana Souza', plano: 'monthly', valor: 172, link: 'https://x' });
    expect(msg).toBe('Oi Ana! Mensal R$\u00a0172,00 https://x');
    expect(waLink('(11) 98888-7777', 'oi')).toBe('https://wa.me/5511988887777?text=oi');
  });
});
