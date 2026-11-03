import type { DemoProduct } from './demo-engine';
// Called only after checking the user's connection and influencer eligibility.
// Reads the internal validated library (fast, no external API fan-out).
export async function demoCatalog(): Promise<DemoProduct[]> {
  const db = (await import('@/integrations/supabase/client.server')).supabaseAdmin as any;
  const { data } = await db.from('produtos_cache').select('item_id,titulo,preco,imagens').eq('validado', true).eq('status', 'ativo').gt('preco', 0).limit(400);
  return (data ?? []).filter((p: any) => p.imagens?.[0]).map((p: any) => ({ id: p.item_id, title: p.titulo, price: Number(p.preco), thumbnail: p.imagens[0] }));
}
