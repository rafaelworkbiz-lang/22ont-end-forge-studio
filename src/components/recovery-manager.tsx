import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { RefreshCw, Search, MessageCircle, Ban } from 'lucide-react';
import { listRecovery, markContacted, setRecoveryStatus, doNotContact, type RecoveryRow } from '@/lib/recovery.functions';
import { fillTemplate, waLink } from '@/lib/subscription-rules';
import { Button } from './ui/button';

const origemLabel: Record<string, string> = { checkout: 'Checkout', cadastro: 'Cadastro', vencida: 'Assinatura vencida' };
const statusLabel: Record<string, string> = { novo: 'Novo', contatado: 'Contatado', recuperado: 'Recuperado', perdido: 'Perdido' };
const when = (v: string) => new Date(v).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export function RecoveryManager() {
  const list = useServerFn(listRecovery), contact = useServerFn(markContacted), setStatus = useServerFn(setRecoveryStatus), block = useServerFn(doNotContact), qc = useQueryClient();
  const q = useQuery({ queryKey: ['admin-recovery'], queryFn: () => list(), staleTime: 15000 });
  const [origem, setOrigem] = useState(''), [status, setSt] = useState(''), [period, setPeriod] = useState(''), [search, setSearch] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-recovery'] });
  const rows = useMemo(() => {
    const t = search.trim().toLowerCase(), from = period ? Date.now() - Number(period) * 86400000 : 0;
    return (q.data?.rows ?? []).filter(r => (!origem || r.origem === origem) && (!status || r.status === status) && Date.parse(r.atualizado_em) >= from && (!t || `${r.nome} ${r.email} ${r.telefone}`.toLowerCase().includes(t)));
  }, [q.data, origem, status, period, search]);
  const message = (r: RecoveryRow) => {
    const tpl = q.data?.modelos[`recuperacao_${r.origem}`] ?? 'Oi {nome}! Posso te ajudar a concluir na AfiliaPlace? {link}';
    return fillTemplate(tpl, { nome: r.nome, plano: r.plano, valor: r.valor, link: r.plano === 'lifetime' ? q.data?.links.lifetime : q.data?.links.monthly });
  };
  const openWa = async (r: RecoveryRow) => {
    if (!r.telefone) return;
    window.open(waLink(r.telefone, message(r)), '_blank', 'noopener');
    await contact({ data: { id: r.id } }).catch(() => toast.error('Não foi possível marcar como contatado.'));
    void refresh();
  };
  const abertos = (q.data?.rows ?? []).filter(r => r.status === 'novo' || r.status === 'contatado').length;

  return <section className="catalog subscriptions-manager">
    <div className="page-heading"><div><h1>Recuperação</h1><p>{abertos} em aberto · contato manual pelo seu WhatsApp</p></div><Button variant="outline" onClick={() => void q.refetch()} disabled={q.isFetching}><RefreshCw size={16} />Atualizar</Button></div>
    <div className="catalog-toolbar flex-wrap rec-toolbar">
      <div className="catalog-search"><Search size={16} /><input aria-label="Pesquisar" placeholder="Nome, e-mail ou telefone" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <select aria-label="Origem" value={origem} onChange={e => setOrigem(e.target.value)}><option value="">Todas as origens</option>{Object.entries(origemLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <select aria-label="Status" value={status} onChange={e => setSt(e.target.value)}><option value="">Todos os status</option>{Object.entries(statusLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <select aria-label="Período" value={period} onChange={e => setPeriod(e.target.value)}><option value="">Todo o período</option><option value="1">Hoje</option><option value="7">7 dias</option><option value="30">30 dias</option></select>
    </div>
    <p className="text-sm text-muted-foreground">Só entra quem deixou os dados no checkout da Applyfy ou no cadastro. Itens sem ação há 30 dias viram “perdido”.</p>
    {q.isPending ? <p role="status" className="um-empty">Carregando…</p> : q.isError ? <p role="alert" className="um-empty">Não foi possível carregar.</p> : rows.length === 0 ? <p className="um-empty">Ninguém para recuperar neste filtro.</p> :
      <div className="subscription-table"><table><thead><tr><th>Nome</th><th>Telefone</th><th>Origem</th><th>Motivo</th><th>Plano / valor</th><th>Quando</th><th>Status</th><th>Contato</th><th>Ações</th></tr></thead><tbody>
        {rows.map(r => <tr key={r.id}>
          <td><strong>{r.nome ?? '—'}</strong><small className="block text-muted-foreground">{r.email ?? ''}</small>{r.tentativas.length > 1 && <small className="block text-muted-foreground">{r.tentativas.length} registros</small>}</td>
          <td>{r.telefone ?? 'Sem telefone'}</td>
          <td>{origemLabel[r.origem] ?? r.origem}</td>
          <td>{r.motivo}</td>
          <td>{r.plano === 'lifetime' ? 'Vitalício' : r.plano === 'monthly' ? 'Mensal' : '—'}{r.valor != null && <small className="block">{r.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</small>}</td>
          <td>{when(r.atualizado_em)}</td>
          <td><select aria-label="Status do item" className={`sub-status rec-${r.status}`} value={r.status} onChange={async e => { await setStatus({ data: { id: r.id, status: e.target.value as 'novo' | 'contatado' | 'recuperado' | 'perdido' } }); void refresh(); }}>{Object.entries(statusLabel).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></td>
          <td>{r.contatado_em ? when(r.contatado_em) : '—'}</td>
          <td><div className="sub-actions">
            <Button size="icon" variant="outline" title={r.telefone ? 'Abrir WhatsApp' : 'Sem telefone'} disabled={!r.telefone} onClick={() => void openWa(r)}><MessageCircle size={15} /></Button>
            <Button size="icon" variant="outline" title="Não contatar mais" onClick={async () => { if (!confirm('Esta pessoa nunca mais vai aparecer na lista. Continuar?')) return; await block({ data: { id: r.id } }); toast.success('Removido da lista'); void refresh(); }}><Ban size={15} /></Button>
          </div></td>
        </tr>)}
      </tbody></table></div>}
  </section>;
}

