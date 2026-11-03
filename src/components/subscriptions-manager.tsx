import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { RefreshCw, Search, MessageCircle, Copy, CalendarPlus, ReceiptText } from 'lucide-react';
import { getSubscriptionsBoard, extendSubscription, getPaymentHistory, type BoardRow } from '@/lib/subscriptions.functions';
import { daysToExpiry, subTone, inCounter, fillTemplate, waLink, type Counter } from '@/lib/subscription-rules';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

const d = (v: string | null) => v ? new Date(v).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : '—';
const toneLabel = { ativa: 'Ativa', vencendo: 'Vence logo', vencida: 'Vencida', cancelada: 'Cancelada', vitalicio: 'Ativa' } as const;
const payLabel: Record<string, string> = { approved: 'Aprovado', refunded: 'Reembolsado', chargeback: 'Chargeback', failed: 'Recusado', cancelled: 'Cancelado', unknown: 'Não informado' };
const COUNTERS: [Counter, string][] = [['vence7', 'Vencem em 7 dias'], ['hoje', 'Vencem hoje'], ['vencidas30', 'Vencidas (30 dias)'], ['vitalicios', 'Vitalícios ativos']];

export function SubscriptionsManager() {
  const fetchBoard = useServerFn(getSubscriptionsBoard);
  const q = useQuery({ queryKey: ['admin-subs-board'], queryFn: () => fetchBoard(), staleTime: 15000 });
  const [filter, setFilter] = useState<Counter | null>(null), [search, setSearch] = useState(''), [plan, setPlan] = useState('');
  const [extend, setExtend] = useState<BoardRow | null>(null), [history, setHistory] = useState<BoardRow | null>(null);
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (q.data?.rows ?? []).filter(r => (!filter || inCounter(r, filter)) && (!plan || r.plan === plan) && (!term || `${r.name} ${r.email}`.toLowerCase().includes(term)))
      .sort((a, b) => (a.plan === 'lifetime' ? Infinity : a.expires_at ? Date.parse(a.expires_at) : 0) - (b.plan === 'lifetime' ? Infinity : b.expires_at ? Date.parse(b.expires_at) : 0));
  }, [q.data, filter, search, plan]);
  const counts = useMemo(() => Object.fromEntries(COUNTERS.map(([k]) => [k, (q.data?.rows ?? []).filter(r => inCounter(r, k)).length])), [q.data]);
  const linkFor = (r: BoardRow) => (r.plan === 'lifetime' ? q.data?.links.lifetime : q.data?.links.monthly) ?? '';
  const renewMsg = (r: BoardRow) => fillTemplate(q.data?.modelos['renovacao'] ?? 'Oi {nome}! Renove seu plano {plano}: {link}', { nome: r.name, plano: r.plan, link: linkFor(r) });
  const hasPhone = (r: BoardRow) => r.whatsapp && !/^0+$/.test(r.whatsapp.replace(/\D/g, ''));

  return <section className="catalog subscriptions-manager">
    <div className="page-heading"><div><h1>Assinaturas</h1><p>Vencimentos e renovações dos clientes</p></div><Button variant="outline" onClick={() => void q.refetch()} disabled={q.isFetching}><RefreshCw size={16} />Atualizar</Button></div>
    <div className="sub-counters">{COUNTERS.map(([k, l]) => <button key={k} type="button" className={`sub-counter sub-counter-${k}`} aria-pressed={filter === k} onClick={() => setFilter(filter === k ? null : k)}><span>{l}</span><strong>{q.data ? counts[k] : '—'}</strong></button>)}</div>
    <div className="catalog-toolbar flex-wrap"><div className="catalog-search"><Search size={16} /><input aria-label="Pesquisar" placeholder="Nome ou e-mail" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <select aria-label="Plano" value={plan} onChange={e => setPlan(e.target.value)}><option value="">Todos os planos</option><option value="monthly">Mensal</option><option value="lifetime">Vitalício</option></select>
      {filter && <Button variant="outline" onClick={() => setFilter(null)}>Limpar filtro</Button>}</div>
    {q.isPending ? <p role="status" className="um-empty">Carregando…</p> : q.isError ? <p role="alert" className="um-empty">Não foi possível carregar. Tente atualizar.</p> : rows.length === 0 ? <p className="um-empty">Nenhuma assinatura neste filtro.</p> :
      <div className="subscription-table"><table><thead><tr><th>Cliente</th><th>Plano</th><th>Status</th><th>Início</th><th>Vencimento</th><th>Dias</th><th>Último pagamento</th><th>Forma</th><th>Ações</th></tr></thead><tbody>
        {rows.map(r => { const tone = subTone(r), days = daysToExpiry(r); return <tr key={r.id}>
          <td><strong>{r.name}</strong><small className="block text-muted-foreground">{r.email}</small></td>
          <td>{r.plan === 'lifetime' ? 'Vitalício' : 'Mensal'}</td>
          <td><span className={`sub-status sub-${tone}`}>{toneLabel[tone]}</span></td>
          <td>{d(r.created_at)}</td>
          <td>{r.plan === 'lifetime' ? 'Sem vencimento' : d(r.expires_at)}</td>
          <td>{days == null ? '—' : days < 0 ? `vencida há ${-days}` : days}</td>
          <td>{d(r.ultimo_pagamento_em)}</td>
          <td>{r.forma_pagamento ?? 'Não informado'}</td>
          <td><div className="sub-actions">
            <Button size="icon" variant="outline" title={hasPhone(r) ? 'WhatsApp de renovação' : 'Sem WhatsApp cadastrado'} disabled={!hasPhone(r)} onClick={() => window.open(waLink(r.whatsapp, renewMsg(r)), '_blank', 'noopener')}><MessageCircle size={15} /></Button>
            <Button size="icon" variant="outline" title="Copiar link de renovação" onClick={() => void navigator.clipboard.writeText(linkFor(r)).then(() => toast.success('Link copiado'))}><Copy size={15} /></Button>
            {r.plan !== 'lifetime' && <Button size="icon" variant="outline" title="Estender validade" onClick={() => setExtend(r)}><CalendarPlus size={15} /></Button>}
            <Button size="icon" variant="outline" title="Histórico de pagamentos" onClick={() => setHistory(r)}><ReceiptText size={15} /></Button>
          </div></td>
        </tr>; })}
      </tbody></table></div>}
    <ExtendDialog row={extend} onClose={() => setExtend(null)} />
    <HistoryDialog row={history} onClose={() => setHistory(null)} />
  </section>;
}

function ExtendDialog({ row, onClose }: { row: BoardRow | null; onClose: () => void }) {
  const save = useServerFn(extendSubscription), qc = useQueryClient();
  const [dias, setDias] = useState(30), [motivo, setMotivo] = useState(''), [busy, setBusy] = useState(false);
  return <Dialog open={!!row} onOpenChange={o => !o && onClose()}><DialogContent>
    <DialogHeader><DialogTitle>Estender validade</DialogTitle><DialogDescription>{row?.name} · vence em {d(row?.expires_at ?? null)}</DialogDescription></DialogHeader>
    <form className="um-form" onSubmit={async e => { e.preventDefault(); if (!row) return; setBusy(true); try { await save({ data: { member_id: row.id, dias, motivo } }); toast.success('Validade estendida'); await qc.invalidateQueries({ queryKey: ['admin-subs-board'] }); setMotivo(''); onClose(); } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); } }}>
      <label>Dias a mais<input type="number" min={1} max={365} value={dias} onChange={e => setDias(Number(e.target.value))} /></label>
      <label>Motivo (vai para o Histórico)<textarea rows={2} required minLength={3} value={motivo} onChange={e => setMotivo(e.target.value)} /></label>
      <Button type="submit" className="um-primary" disabled={busy}>{busy ? 'Salvando…' : 'Estender'}</Button>
    </form>
  </DialogContent></Dialog>;
}

function HistoryDialog({ row, onClose }: { row: BoardRow | null; onClose: () => void }) {
  const get = useServerFn(getPaymentHistory);
  const q = useQuery({ queryKey: ['pay-history', row?.email], queryFn: () => get({ data: { email: row!.email } }), enabled: !!row });
  return <Dialog open={!!row} onOpenChange={o => !o && onClose()}><DialogContent>
    <DialogHeader><DialogTitle>Histórico de pagamentos</DialogTitle><DialogDescription>{row?.email} · avisos recebidos da Applyfy</DialogDescription></DialogHeader>
    {q.isPending ? <p className="um-empty">Carregando…</p> : (q.data ?? []).length === 0 ? <p className="um-empty">Nenhum aviso de pagamento registrado para este cliente.</p> :
      <ul className="sub-history">{q.data!.map(e => <li key={e.id}><span>{new Date(e.received_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span><strong>{payLabel[e.payment_status] ?? e.payment_status}</strong><small>{e.plan === 'lifetime' ? 'Vitalício' : e.plan === 'monthly' ? 'Mensal' : '—'}</small></li>)}</ul>}
  </DialogContent></Dialog>;
}
