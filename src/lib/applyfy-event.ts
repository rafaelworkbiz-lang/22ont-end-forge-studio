import { recoveryReason } from './subscription-rules';
const offers = { lifetime: ['cmvv7iqfj04ga01n60jjth2ss', 'ggo7ayu', 'cmvv7iqfg04g901n62syrnq46', 'cmv670zs13ndi01ps8gm04bsh', 'B0QAGV6', 'cmvazv33u1ewp01pwrhc3oh7c', 'pjlaags'], monthly: ['cmvv7ihvg0ciu01q6pofcauy2', '9uw4neg', 'cmvv7ihvc0cit01q6n4ijsh7e', 'cmv5qan5c116601pyslk4840p', 'OBULDYP', 'cmvazulju1l5a01op1gq1613t', 'yddhviy'] };
export function findField(value: unknown, pattern: RegExp, depth = 0): string | null {
  if (depth > 8 || !value || typeof value !== 'object') return null;
  for (const [key, val] of Object.entries(value)) if (pattern.test(key) && (typeof val === 'string' || typeof val === 'number')) return String(val).slice(0, 200);
  for (const val of Object.values(value)) { const found = findField(val, pattern, depth + 1); if (found) return found; }
  return null;
}
export function parseApplyfy(body: unknown) {
  const raw = JSON.stringify(body);
  const emailValue = findField(body, /^(e-?mail)$/i)?.trim().toLowerCase();
  const email = emailValue && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailValue) ? emailValue : null;
  const plan = offers.lifetime.some(id => raw.includes(id)) ? 'lifetime' : offers.monthly.some(id => raw.includes(id)) ? 'monthly' : null;
  const status = `${findField(body, /^(event|type)$/i) ?? ''} ${findField(body, /^status$/i) ?? ''}`.toLowerCase();
  const revoke = /refund|reembols|chargeback|estorn|cancel|expired|expirad|overdue|atras|failed|recusad/.test(status);
  const grant = !revoke && /approv|aprovad|paid|pago|complete|renew|renovad|active|ativ/.test(status);
  const payment = /failed|recusad/.test(status) ? 'failed' : /refund|reembols|estorn/.test(status) ? 'refunded' : /chargeback/.test(status) ? 'chargeback' : revoke ? 'cancelled' : grant ? 'approved' : 'unknown';
  const transaction = findField(body, /^(transaction_?id|sale_?id|order_?id|payment_?id|transactionId|saleId|orderId|paymentId)$/i);
  const phone = findField(body, /^(phone|telefone|celular|whatsapp|mobile|phone_?number|phoneNumber)$/i)?.replace(/\D/g, '') || null;
  const name = findField(body, /^(name|nome|full_?name|fullName|customer_?name)$/i);
  const amountRaw = findField(body, /^(amount|valor|price|total|value|total_?price)$/i);
  const amountNum = amountRaw != null ? Number(String(amountRaw).replace(',', '.')) : NaN;
  const amount = Number.isFinite(amountNum) ? (amountNum > 5000 ? amountNum / 100 : amountNum) : null;
  const method = findField(body, /^(payment_?method|paymentMethod|forma_?pagamento|method|payment_?type)$/i)?.toLowerCase() ?? null;
  const recovery = grant ? null : recoveryReason(`${status} ${method ?? ''}`);
  return { email, plan, status, payment, transaction, phone, name, amount, method, recovery, action: email && plan ? grant ? 'grant' : revoke ? 'revoke' : 'ignore' : 'ignore' };
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}
export async function applyfyKey(body: unknown, event: ReturnType<typeof parseApplyfy>) {
  // Exact canonical payload fallback until the provider's transaction field is confirmed.
  const eventId = findField(body, /^(event_?id|eventId|notification_?id)$/i);
  const input = eventId ? `${eventId}:${event.payment}` : event.transaction ? `${event.transaction}:${event.payment}:${event.plan}:${event.email}` : canonical(body);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}