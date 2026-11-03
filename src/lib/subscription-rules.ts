/** Pure rules for subscriptions and recovery (shared by server and UI). */
const DAY = 86_400_000;

export type SubRow = { plan: string; status: string; expires_at: string | null };
export type SubTone = 'ativa' | 'vencendo' | 'vencida' | 'cancelada' | 'vitalicio';

/** Whole days until expiry (negative = expired X days ago); null for lifetime. */
export function daysToExpiry(row: SubRow, now = Date.now()): number | null {
  if (row.plan === 'lifetime') return null;
  if (!row.expires_at) return 0;
  return Math.ceil((Date.parse(row.expires_at) - now) / DAY);
}

export function subTone(row: SubRow, now = Date.now()): SubTone {
  if (row.status === 'cancelled') return 'cancelada';
  if (row.plan === 'lifetime') return 'vitalicio';
  if (row.status === 'expired' || !row.expires_at || Date.parse(row.expires_at) <= now) return 'vencida';
  const d = daysToExpiry(row, now) ?? 0;
  return d <= 7 ? 'vencendo' : 'ativa';
}

export type Counter = 'vence7' | 'hoje' | 'vencidas30' | 'vitalicios';
export function inCounter(row: SubRow, c: Counter, now = Date.now()): boolean {
  if (c === 'vitalicios') return row.plan === 'lifetime' && row.status === 'active';
  if (row.plan === 'lifetime' || row.status === 'cancelled' || !row.expires_at) return false;
  const exp = Date.parse(row.expires_at);
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
  const endToday = startToday.getTime() + DAY;
  if (c === 'hoje') return exp >= startToday.getTime() && exp < endToday;
  if (c === 'vence7') return exp >= now && exp < now + 7 * DAY;
  return exp < now && exp >= now - 30 * DAY;
}

/** Fill {nome} {plano} {valor} {link}; unknown values become empty. */
export function fillTemplate(tpl: string, v: { nome?: string | null; plano?: string | null; valor?: number | null; link?: string | null }) {
  const plano = v.plano === 'lifetime' ? 'Vitalício' : v.plano === 'monthly' ? 'Mensal' : v.plano ?? '';
  const valor = v.valor != null ? v.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '';
  return tpl.replace(/\{nome\}/g, (v.nome ?? '').split(' ')[0] ?? '').replace(/\{plano\}/g, plano).replace(/\{valor\}/g, valor).replace(/\{link\}/g, v.link ?? '').replace(/\s+\(\)/g, '').trim();
}

export function waLink(telefone: string, text: string) {
  let d = telefone.replace(/\D/g, '');
  if (d.length >= 10 && d.length <= 11) d = `55${d}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

/** Applyfy statuses that mean "started but did not pay". */
export function recoveryReason(status: string): string | null {
  const s = status.toLowerCase();
  if (/abandon/.test(s)) return 'carrinho abandonado';
  if (/refused|recusad|declin|failed/.test(s)) return 'pagamento recusado';
  if (/waiting|pending|pendente|aguardando|generated|gerad|billet|boleto|pix/.test(s) && !/approv|aprovad|paid|pago/.test(s)) return /boleto|billet/.test(s) ? 'boleto não pago' : /pix/.test(s) ? 'Pix não pago' : 'pagamento pendente';
  return null;
}

/** Reminder slot for a monthly expiry: d-3, d0, d+1 (in São Paulo calendar days). */
export function reminderSlot(expiresAt: string, now = Date.now()): 'd-3' | 'd0' | 'd+1' | null {
  const day = (t: number) => Math.floor((t - 3 * 3600_000) / DAY);
  const diff = day(Date.parse(expiresAt)) - day(now);
  return diff === 3 ? 'd-3' : diff === 0 ? 'd0' : diff === -1 ? 'd+1' : null;
}
