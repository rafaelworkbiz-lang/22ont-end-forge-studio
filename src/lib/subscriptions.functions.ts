import { createServerFn } from '@tanstack/react-start';
import { requireAdmin } from './admin.functions';
import { z } from 'zod';
import { withApplyfySchema } from './applyfy-schema';

export const getSubscriptions = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(data => z.object({ page: z.number().int().min(0).max(10000).default(0) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const db = withApplyfySchema(supabaseAdmin);
    const [events, members] = await Promise.all([
      db.from('applyfy_events').select('id,customer_email,plan,provider_status,payment_status,processing_status,account_status,access_status,error_code,received_at,processed_at', { count: 'exact' }).order('received_at', { ascending: false }).range(data.page * 50, data.page * 50 + 49),
      db.from('members').select('id,email,name,plan,status,expires_at,created_at', { count: 'exact' }).eq('is_test', false).order('created_at', { ascending: false }).range(data.page * 50, data.page * 50 + 49),
    ]);
    if (members.error) throw new Error('Não foi possível consultar as assinaturas.');
    return { historyAvailable: !events.error, events: events.data ?? [], members: members.data ?? [], totalEvents: events.count ?? 0, totalMembers: members.count ?? 0 };
  });
const adm = async () => (await import('@/integrations/supabase/client.server')).supabaseAdmin as any;

export type BoardRow = { id: string; name: string; email: string; whatsapp: string; plan: string; status: string; created_at: string; expires_at: string | null; ultimo_pagamento_em: string | null; forma_pagamento: string | null };
export const getSubscriptionsBoard = createServerFn({ method: 'POST' }).middleware([requireAdmin]).handler(async () => {
  const db = await adm();
  const { data, error } = await db.from('members').select('id,name,email,whatsapp,plan,status,created_at,expires_at,ultimo_pagamento_em,forma_pagamento').eq('is_test', false).limit(5000);
  if (error) throw new Error('Não foi possível consultar as assinaturas.');
  const { data: inf } = await db.from('influenciadores').select('member_id');
  const skip = new Set((inf ?? []).map((i: { member_id: string }) => i.member_id));
  const { data: cfg } = await db.from('config_admin').select('link_padrao_mensal,link_padrao_vitalicio,modelos_whatsapp').maybeSingle();
  return { rows: (data ?? []).filter((m: BoardRow) => !skip.has(m.id)) as BoardRow[], links: { monthly: cfg?.link_padrao_mensal ?? '', lifetime: cfg?.link_padrao_vitalicio ?? '' }, modelos: (cfg?.modelos_whatsapp ?? {}) as Record<string, string> };
});

export const extendSubscription = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ member_id: z.string().uuid(), dias: z.number().int().min(1).max(365), motivo: z.string().trim().min(3).max(300) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adm();
    const { data: m } = await db.from('members').select('id,email,plan,status,expires_at').eq('id', data.member_id).maybeSingle();
    if (!m) throw new Error('Cliente não encontrado.');
    if (m.plan === 'lifetime') throw new Error('Vitalício não tem vencimento.');
    const base = Math.max(Date.now(), m.expires_at ? Date.parse(m.expires_at) : 0);
    const novo = new Date(base + data.dias * 86400000).toISOString();
    const { error } = await db.from('members').update({ expires_at: novo, status: m.status === 'cancelled' ? 'cancelled' : 'active' }).eq('id', m.id);
    if (error) throw new Error('Não foi possível estender.');
    await db.from('admin_audit_log').insert({ admin_id: (context as any).userId, acao: 'estender_validade', alvo_email: m.email, antes: { expires_at: m.expires_at, status: m.status }, depois: { expires_at: novo, dias: data.dias, motivo: data.motivo } });
    await db.rpc('sincronizar_lojas_assinatura');
    return { expires_at: novo };
  });

export const getPaymentHistory = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const db = await adm();
    const { data: ev } = await db.from('applyfy_events').select('id,plan,payment_status,access_status,received_at').eq('customer_email', data.email.toLowerCase()).order('received_at', { ascending: false }).limit(50);
    return (ev ?? []) as { id: string; plan: string | null; payment_status: string; access_status: string; received_at: string }[];
  });
