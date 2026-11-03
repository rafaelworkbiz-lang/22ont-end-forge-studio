import { parseApplyfy } from './applyfy-event';
/** Compatibility path only while the additive receipt schema is unavailable. */
export async function processApplyfyWithoutHistory(event: ReturnType<typeof parseApplyfy>) {
 const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
 if (event.action === 'ignore' || !event.email || !event.plan) return Response.json({ ok: true, ignored: true });
 let newPassword: string | null = null;
 if (event.action === 'grant') {
  const { accessPassword } = await import('./purchase-access.server');
  const password = accessPassword();
  const created = await db.auth.admin.createUser({ email: event.email, password, email_confirm: true });
  if (created.error && !/already|registered|exists/i.test(created.error.message)) return new Response('account creation failed', { status: 500 });
  // Without receipts, only email when this notification actually created the account (prevents repeat emails).
  if (!created.error) newPassword = password;
 }
 const member = await db.from('members').select('id,plan,expires_at').eq('email', event.email).maybeSingle();
 if (member.error) return new Response('access unavailable', { status: 500 });
 if (event.action === 'revoke') {
  if (!member.data) return Response.json({ ok: true });
  const result = await db.from('members').update({ status: 'cancelled' }).eq('id', member.data.id);
  return result.error ? new Response('access update failed', { status: 500 }) : Response.json({ ok: true });
 }
 const plan = member.data?.plan === 'lifetime' ? 'lifetime' : event.plan;
 // Do not repeatedly append a month for retried notifications without a durable event receipt.
 const expiry = plan === 'lifetime' ? null : new Date(Math.max(Date.now() + 30 * 86400000, Date.parse(member.data?.expires_at ?? '') || 0)).toISOString();
 const values = { plan, status: 'active', expires_at: expiry };
 const result = member.data ? await db.from('members').update(values).eq('id', member.data.id) : await db.from('members').insert({ ...values, email: event.email, name: event.email.split('@')[0] ?? 'Cliente', whatsapp: '0000000000' });
 if (result.error) return new Response('access update failed', { status: 500 });
 if (newPassword) { const { sendAccessEmail } = await import('./purchase-access.server'); await sendAccessEmail(event.email, plan, newPassword, `new-${event.email}`); }
 return Response.json({ ok: true });
}
