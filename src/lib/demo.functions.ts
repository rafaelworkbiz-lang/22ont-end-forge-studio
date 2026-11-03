import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { compactSales, dailyAutoSales, expandSales, saoDay, type DemoSale } from './demo-engine';

// Sales batches added by the administrator (Usuários › Adicionar vendas). Shown only in the owner's own panel.
export const getDemoOverview = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  const [{ data: settings }, { data: entries, error }] = await Promise.all([
    db.from('test_balance_settings').select('*').eq('user_id', context.userId).maybeSingle(),
    db.from('test_balance_entries').select('batch_key, events').eq('user_id', context.userId).or('batch_key.like.manual:%,batch_key.like.auto:%'),
  ]);
  if (error) throw new Error('Não foi possível carregar os dados.');
  const batches = new Map<string, DemoSale[]>((entries ?? []).map(e => [e.batch_key, expandSales(e.events, e.batch_key)]));
  const now = new Date(), today = saoDay(now);
  if (settings?.auto_daily_enabled) {
    const since = new Date(`${today}T00:00:00-03:00`); since.setUTCDate(since.getUTCDate() - 29);
    const startDay = saoDay(new Date(Math.max(since.getTime(), Date.parse(settings.auto_started_at))));
    const missing: string[] = [];
    for (let d = new Date(`${startDay}T12:00:00-03:00`); saoDay(d) <= today; d.setUTCDate(d.getUTCDate() + 1)) { const k = `auto:${saoDay(d)}`; if (!batches.has(k)) missing.push(k); }
    if (missing.length) {
      const products = await (await import('./demo-catalog.server')).demoCatalog().catch(() => []);
      for (const key of products.length ? missing : []) {
        const day = key.slice(5), start = Date.parse(`${day}T00:00:00-03:00`);
        const events = dailyAutoSales(`${context.userId}:${key}`, start, products, Number(settings.rate));
        await db.from('test_balance_entries').upsert({ user_id: context.userId, batch_key: key, amount_cents: events.reduce((n, e) => n + e.cents, 0), period_start: new Date(start).toISOString(), period_end: new Date(start + 86400000).toISOString(), events: JSON.parse(JSON.stringify(compactSales(events))) }, { onConflict: 'user_id,batch_key', ignoreDuplicates: true });
        const { data: w } = await db.from('test_balance_entries').select('events').eq('user_id', context.userId).eq('batch_key', key).single();
        batches.set(key, expandSales(w?.events, key));
      }
    }
  }
  if (!batches.size) return { enabled: false as const };
  const all = [...batches.values()].flat().filter(s => Date.parse(s.at) <= now.getTime()).sort((a, b) => a.at.localeCompare(b.at));
  const monthMap = new Map<string, number>();
  for (const s of all) { const m = saoDay(new Date(s.at)).slice(0, 7); monthMap.set(m, (monthMap.get(m) ?? 0) + s.cents); }
  return { enabled: true as const, unavailable: null, rate: Number(settings?.rate ?? 10), now: now.toISOString(), historyCents: 0, months: [...monthMap].map(([month, cents]) => ({ month, cents })), ...compactSales(all) };
});
