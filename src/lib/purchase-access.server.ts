/** Unique, readable per-customer password (never shared, never logged). */
export function accessPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const s = Array.from(bytes, b => chars[b % chars.length]).join('');
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}

/** Sends the access email; failures never undo granted access. */
export async function sendAccessEmail(email: string, plan: string, password: string | null, key: string) {
  try {
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    await sendTemplateEmail('purchase-access', email, {
      templateData: { email, plan: plan === 'lifetime' ? 'Vitalício' : 'Mensal', ...(password ? { password } : {}) },
      idempotencyKey: `purchase-access-${key}`,
    });
    return true;
  } catch { console.error('purchase access email failed'); return false; }
}
