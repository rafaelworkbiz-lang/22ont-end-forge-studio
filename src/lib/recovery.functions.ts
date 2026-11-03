import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireAdmin } from './admin.functions';

const adm = async () => (await import('@/integrations/supabase/client.server')).supabaseAdmin as any;
export type RecoveryRow = { id: string; origem: string; motivo: string; nome: string | null; email: string | null; telefone: string | null; plano: string | null; valor: number | null; forma: string | null; status: string; responsavel: string | null; contatado_em: string | null; tentativas: { em: string; origem: string; motivo: string; tipo?: string }[]; recuperado_em: string | null; criado_em: string; atualizado_em: string };

export const listRecovery = createServerFn({ method: 'POST' }).middleware([requireAdmin]).handler(async () => {
  const db = await adm();
  const { data, error } = await db.from('recuperacao').select('*').order('atualizado_em', { ascending: false }).limit(1000);
  if (error) throw new Error('Não foi possível carregar a recuperação.');
  const { data: cfg } = await db.from('config_admin').select('link_padrao_mensal,link_padrao_vitalicio,modelos_whatsapp').maybeSingle();
  return { rows: (data ?? []).map((r: any) => ({ ...r, valor: r.valor == null ? null : Number(r.valor) })) as RecoveryRow[], links: { monthly: cfg?.link_padrao_mensal ?? '', lifetime: cfg?.link_padrao_vitalicio ?? '' }, modelos: (cfg?.modelos_whatsapp ?? {}) as Record<string, string> };
});

export const markContacted = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adm();
    const { data: r } = await db.from('recuperacao').select('status,tentativas').eq('id', data.id).maybeSingle();
    if (!r) throw new Error('Item não encontrado.');
    const now = new Date().toISOString();
    await db.from('recuperacao').update({ status: ['recuperado', 'perdido'].includes(r.status) ? r.status : 'contatado', contatado_em: now, responsavel: (context as any).userId, atualizado_em: now, tentativas: [...(r.tentativas ?? []), { em: now, origem: 'whatsapp', motivo: 'contato pelo WhatsApp', tipo: 'contato' }] }).eq('id', data.id);
    return { ok: true };
  });

export const setRecoveryStatus = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ id: z.string().uuid(), status: z.enum(['novo', 'contatado', 'recuperado', 'perdido']) }).parse(d))
  .handler(async ({ data }) => {
    const db = await adm();
    await db.from('recuperacao').update({ status: data.status, atualizado_em: new Date().toISOString(), ...(data.status === 'recuperado' ? { recuperado_em: new Date().toISOString() } : {}) }).eq('id', data.id);
    return { ok: true };
  });

export const doNotContact = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adm();
    const { data: r } = await db.from('recuperacao').select('email,telefone').eq('id', data.id).maybeSingle();
    if (!r) throw new Error('Item não encontrado.');
    await db.from('nao_contatar').insert({ email: r.email, telefone: r.telefone });
    let q = db.from('recuperacao').delete();
    q = r.email && r.telefone ? q.or(`email.eq.${r.email},telefone.eq.${r.telefone}`) : r.email ? q.eq('email', r.email) : q.eq('telefone', r.telefone);
    await q;
    await db.from('admin_audit_log').insert({ admin_id: (context as any).userId, acao: 'nao_contatar', alvo_email: r.email, antes: null, depois: null });
    return { ok: true };
  });
