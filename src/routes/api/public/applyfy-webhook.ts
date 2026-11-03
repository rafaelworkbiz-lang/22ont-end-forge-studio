import { createFileRoute } from '@tanstack/react-router';
import { timingSafeEqual } from 'node:crypto';
import { applyfyKey, parseApplyfy } from '@/lib/applyfy-event';
import { withApplyfySchema } from '@/lib/applyfy-schema';

export const Route = createFileRoute('/api/public/applyfy-webhook')({
  server: { handlers: { POST: async ({ request }) => {
    const secret = process.env['APPLYFY_WEBHOOK_TOKEN'];
    const token = new URL(request.url).searchParams.get('token') ?? '';
    if (!secret || token.length !== secret.length || !timingSafeEqual(new TextEncoder().encode(token), new TextEncoder().encode(secret))) return new Response('unauthorized', { status: 401 });
    const raw = await request.text();
    if (raw.length > 200_000) return new Response('too large', { status: 413 });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return new Response('invalid json', { status: 400 }); }
    const event = parseApplyfy(body);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const db = withApplyfySchema(supabaseAdmin);
    const key = await applyfyKey(body, event);
    const claim = await db.rpc('claim_applyfy_event', { p_key: key, p_email: event.email ?? '', p_plan: event.plan ?? '', p_status: event.status, p_payment: event.payment });
    if (claim.error) {
      if (['PGRST202', '42883'].includes(claim.error.code)) {
        const { processApplyfyWithoutHistory } = await import('@/lib/applyfy-fallback.server');
        return processApplyfyWithoutHistory(event);
      }
      return new Response('processing unavailable', { status: 503 });
    }
    const receipt = claim.data as { id?: string; owned?: boolean; status?: string } | null;
    if (!receipt?.id) return new Response('processing unavailable', { status: 503 });
    if (!receipt.owned) return receipt.status === 'processing' ? new Response('processing', { status: 503 }) : Response.json({ ok: true, duplicate: true });
    let account = 'not_attempted';
    let password: string | null = null;
    if (event.action === 'grant' && event.email) {
      try {
        const { accessPassword } = await import('@/lib/purchase-access.server');
        password = accessPassword();
        const result = await db.auth.admin.createUser({ email: event.email, password, email_confirm: true });
        if (result.error && !/already|registered|exists/i.test(result.error.message)) throw new Error('account_creation_failed');
        account = result.error ? 'existing' : 'created';
        if (result.error) password = null;
      } catch {
        const logged = await db.rpc('finish_applyfy_event', { p_id: receipt.id, p_action: event.action, p_account: 'error', p_error: 'account_creation_failed' });
        return new Response(logged.error ? 'processing unavailable' : 'account creation failed', { status: 500 });
      }
    }
    const finished = await db.rpc('finish_applyfy_event', { p_id: receipt.id, p_action: event.action, p_account: account });
    if (finished.error) {
      await db.rpc('finish_applyfy_event', { p_id: receipt.id, p_action: event.action, p_account: account, p_error: 'access_update_failed' });
      return new Response('access update failed', { status: 500 });
    }
    await (db.rpc as unknown as (f: string) => Promise<unknown>)('sincronizar_lojas_assinatura').then(() => null, () => null);
    const rpc = db.rpc as unknown as (f: string, a: Record<string, unknown>) => Promise<unknown>;
    if (event.action === 'grant') await rpc('pagamento_aprovado', { p_email: event.email ?? '', p_telefone: event.phone ?? '', p_forma: event.method }).then(() => null, () => null);
    else if (event.recovery && (event.email || event.phone)) await rpc('registrar_recuperacao', { p_origem: 'checkout', p_motivo: event.recovery, p_nome: event.name ?? '', p_email: event.email ?? '', p_telefone: event.phone ?? '', p_plano: event.plan, p_valor: event.amount, p_forma: event.method, p_member: null }).then(() => null, () => null);
    if (event.action === 'grant' && event.email && event.plan) {
      const { sendAccessEmail } = await import('@/lib/purchase-access.server');
      await sendAccessEmail(event.email, event.plan, password, key);
    }
    return Response.json({ ok: true, ignored: event.action === 'ignore' });
  } } },
});
