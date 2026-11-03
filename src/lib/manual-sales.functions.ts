import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireAdmin } from './admin.functions';
import { compactSales, manualSalesValue, expandSales, INFLUENCER_RATE, type DemoProduct, type DemoSale } from './demo-engine';

const adm = async () => (await import('@/integrations/supabase/client.server')).supabaseAdmin as any;

async function userIdForEmail(db: any, email: string): Promise<string> {
  for (let page = 1; page <= 20; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const u = (data?.users ?? []).find((x: { email?: string }) => x.email?.toLowerCase() === email.toLowerCase());
    if (u) return u.id;
    if ((data?.users ?? []).length < 200) break;
  }
  throw new Error('Essa pessoa ainda não tem login criado.');
}

export const addManualSales = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ email: z.string().email(), valor: z.number().min(1).max(10_000_000), inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), lote: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const start = Date.parse(`${data.inicio}T00:00:00-03:00`), endDay = Date.parse(`${data.fim}T00:00:00-03:00`), now = Date.now();
    if (!Number.isFinite(start) || !Number.isFinite(endDay) || endDay < start || endDay > now || start < Date.parse("2019-01-01T00:00:00-03:00")) throw new Error('Escolha um período entre 01/01/2019 e hoje, com o fim depois do início.');
    const end = endDay + 86400000;
    const db = await adm();
    const userId = await userIdForEmail(db, data.email);
    const { data: prods } = await db.from('produtos_cache').select('item_id,titulo,preco,imagens').eq('validado', true).eq('status', 'ativo').limit(400);
    let products: DemoProduct[] = (prods ?? []).filter((p: any) => Number(p.preco) > 0 && p.imagens?.[0]).map((p: any) => ({ id: p.item_id, title: p.titulo, price: Number(p.preco), thumbnail: p.imagens[0] }));
    if (!products.length) { const { data: any2 } = await db.from('produtos_cache').select('item_id,titulo,preco,imagens').gt('preco', 0).limit(400); products = (any2 ?? []).filter((p: any) => p.imagens?.[0]).map((p: any) => ({ id: p.item_id, title: p.titulo, price: Number(p.preco), thumbnail: p.imagens[0] })); }
    if (!products.length) throw new Error('Nenhum produto na biblioteca para sortear.');
    const rate = INFLUENCER_RATE;
    const key = `manual:${data.lote}`;
    const totalCents = Math.round(data.valor * 100);
    const sales = manualSalesValue(key, totalCents, start, end, products, rate, now);
    if (!sales.length) throw new Error('Não foi possível gerar as vendas.');
    const { error } = await db.from('test_balance_entries').upsert({ user_id: userId, batch_key: key, amount_cents: sales.reduce((n, s) => n + s.cents, 0), period_start: new Date(start).toISOString(), period_end: new Date(end).toISOString(), events: JSON.parse(JSON.stringify(compactSales(sales))), ficticio: true }, { onConflict: 'user_id,batch_key', ignoreDuplicates: true });
    if (error) throw new Error('Não foi possível salvar as vendas.');
    await db.from('admin_audit_log').insert({ admin_id: (context as any).userId, acao: 'adicionar_vendas', alvo_email: data.email, antes: null, depois: { lote: key, valor: totalCents / 100, quantidade: sales.length, inicio: data.inicio, fim: data.fim } });
    return { valor: totalCents / 100, quantidade: sales.length };
  });

export const listManualSales = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const db = await adm();
    let userId: string;
    try { userId = await userIdForEmail(db, data.email); } catch { return [] as { key: string; dia: string; quantidade: number; total: number; criado_em: string }[]; }
    const { data: rows } = await db.from('test_balance_entries').select('batch_key,amount_cents,period_start,created_at,events').eq('user_id', userId).like('batch_key', 'manual:%').order('created_at', { ascending: false });
    return (rows ?? []).map((r: any): { key: string; dia: string; quantidade: number; total: number; criado_em: string } => ({ key: r.batch_key as string, dia: String(r.period_start).slice(0, 10), quantidade: expandSales(r.events).length, total: Number(r.amount_cents) / 100, criado_em: r.created_at as string }));
  });

export const removeManualSales = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ email: z.string().email(), key: z.string().regex(/^manual:[0-9a-f-]{36}$/) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adm();
    const userId = await userIdForEmail(db, data.email);
    await db.from('test_balance_entries').delete().eq('user_id', userId).eq('batch_key', data.key);
    await db.from('admin_audit_log').insert({ admin_id: (context as any).userId, acao: 'remover_vendas', alvo_email: data.email, antes: { lote: data.key }, depois: null });
    return { ok: true };
  });

export const getAutoSales = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data }) => {
    const db = await adm();
    let userId: string;
    try { userId = await userIdForEmail(db, data.email); } catch { return { enabled: false, since: null as string | null, dias: 0, total: 0 }; }
    const [{ data: st }, { data: rows }] = await Promise.all([
      db.from('test_balance_settings').select('auto_daily_enabled,auto_started_at').eq('user_id', userId).maybeSingle(),
      db.from('test_balance_entries').select('events').eq('user_id', userId).like('batch_key', 'auto:%'),
    ]);
    const now = Date.now();
    const total = (rows ?? []).flatMap((r: any) => expandSales(r.events)).filter((s: DemoSale) => Date.parse(s.at) <= now).reduce((n: number, s: DemoSale) => n + s.cents, 0) / 100;
    return { enabled: !!st?.auto_daily_enabled, since: st?.auto_daily_enabled ? (st.auto_started_at as string) : null, dias: (rows ?? []).length, total };
  });

export const setAutoSales = createServerFn({ method: 'POST' }).middleware([requireAdmin])
  .inputValidator(d => z.object({ email: z.string().email(), enabled: z.boolean(), apagar: z.boolean().default(false) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await adm();
    const userId = await userIdForEmail(db, data.email);
    const patch: Record<string, unknown> = { user_id: userId, auto_daily_enabled: data.enabled, updated_at: new Date().toISOString() };
    if (data.enabled) patch['auto_started_at'] = new Date().toISOString();
    const { error } = await db.from('test_balance_settings').upsert(patch, { onConflict: 'user_id' });
    if (error) throw new Error('Não foi possível salvar.');
    if (!data.enabled && data.apagar) await db.from('test_balance_entries').delete().eq('user_id', userId).like('batch_key', 'auto:%');
    await db.from('admin_audit_log').insert({ admin_id: (context as any).userId, acao: data.enabled ? 'ligar_vendas_automaticas' : 'desligar_vendas_automaticas', alvo_email: data.email, antes: null, depois: { apagou: data.apagar } });
    return { ok: true };
  });
