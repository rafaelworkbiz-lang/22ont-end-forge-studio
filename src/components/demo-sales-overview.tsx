import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { ShoppingBag, CircleDollarSign, ArrowLeft, ArrowUpRight, X, Package, Clock3, ReceiptText, Wallet } from 'lucide-react';
import { SalesTodaySummary } from './sales-today-summary';
import { Button } from '@/components/ui/button';
import { saoDay, type DemoSale } from '@/lib/demo-engine';
import { dayMs, dayStart, monthLabel, monthlySales, occurredSales, salesRange } from '@/lib/sales-period';
import { SalesCustomDates, SalesPeriodSelect, useSalesPeriod } from './sales-period-controls';

type Data = { rate: number; now: string; historyCents: number; months: { month: string; cents: number }[]; sales: DemoSale[] };
const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export function DemoSalesOverview({ data, hidden, userId }: { data: Data; hidden: boolean; userId: string }) {
  const filters = useSalesPeriod(saoDay(new Date(data.now)));
  const { period, month, setMonth } = filters;
  const changePeriod = (p: typeof period) => { setHover(null); startTransition(() => { filters.setPeriod(p); setMonth(''); }); };
  const monthlyList = period === 'Mensal' && !month;
  const [notification, setNotification] = useState<DemoSale | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => setHover(null), [filters.from, filters.to, month]);
  const initialized = useRef(false);
  const last = useRef('');
  useEffect(() => {
    const latest = data.sales.filter(s => saoDay(new Date(s.at)) === saoDay(new Date(data.now))).at(-1);
    if (!latest) return;
    const key = `demo-seen:${userId}`;
    if (!initialized.current) { last.current = localStorage.getItem(key) ?? latest.id; initialized.current = true; }
    if (last.current !== latest.id && Date.parse(data.now) - Date.parse(latest.at) < 60000) setNotification(latest);
    last.current = latest.id; localStorage.setItem(key, latest.id);
  }, [data, userId]);
  useEffect(() => { if (!notification) return; const t = setTimeout(() => setNotification(null), 7000); return () => clearTimeout(t); }, [notification]);
  const today = saoDay(new Date(data.now));
  const { start, end, days, error } = salesRange(period, data.now, filters.from, filters.to, month);
  const allSales = useMemo(() => occurredSales(data.sales, data.now), [data.sales, data.now]);
  const selected = useMemo(() => error ? [] : allSales.filter(s => Date.parse(s.at) >= start && Date.parse(s.at) < end), [error, allSales, start, end]);
  const months = useMemo(() => monthlySales(data.sales, data.now), [data.sales, data.now]);
  const analysisSales = monthlyList ? allSales : selected;
  const periodLabel = period === 'Mensal' && month ? monthLabel(month) : period === 'Personalizado' ? `${filters.from.split('-').reverse().join('/')} – ${filters.to.split('-').reverse().join('/')}` : period;
  const { daily, dailyRevenue, dailyCommission, revenue, commissions } = useMemo(() => {
    const daily = allSales.filter(s => saoDay(new Date(s.at)) === today);
    return { daily, dailyRevenue: daily.reduce((n, s) => n + s.cents, 0), dailyCommission: daily.reduce((n, s) => n + s.commissionCents, 0), revenue: analysisSales.reduce((n, s) => n + s.cents, 0), commissions: analysisSales.reduce((n, s) => n + s.commissionCents, 0) };
  }, [allSales, today, analysisSales]);
  const value = (c: number) => hidden ? '••••••' : money(c);
  const { bins, previousBins, max, previousPoints, points, area, cur } = useMemo(() => {
    const bins = Array.from({ length: days === 1 ? 24 : days }, (_, i) => ({ label: days === 1 ? `${i}h` : new Date(start + i * 86400000).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' }), cents: 0 }));
    for (const s of selected) { const i = Math.floor((Date.parse(s.at) - start) / (days === 1 ? 3600000 : 86400000)); const bin = bins[i]; if (bin) bin.cents += s.cents; }
    const previousBins = bins.map(b => ({ ...b, cents: 0 }));
    let previousStart = start - days * dayMs;
    if (period === 'Mensal' && month) {
      const previousMonth = new Date(start + 12 * 3600000);
      previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);
      previousStart = dayStart(`${saoDay(previousMonth).slice(0, 7)}-01`);
    }
    for (const sale of allSales) { const i = Math.floor((Date.parse(sale.at) - previousStart) / (days === 1 ? 3600000 : 86400000)); const bin = previousBins[i]; if (bin && Date.parse(sale.at) < start) bin.cents += sale.cents; }
    const cur = Math.min(bins.length - 1, Math.floor((Date.parse(data.now) - start) / (days === 1 ? 3600000 : 86400000)));
    const max = Math.max(1, ...bins.map(b => b.cents), ...previousBins.slice(0, cur + 1).map(b => b.cents));
    const x = (i: number) => 40 + i * 520 / Math.max(1, bins.length - 1);
    const y = (c: number) => 210 - c / max * 160;
    const upto = bins.slice(0, Math.max(0, cur + 1));
    const previousPoints = previousBins.slice(0, Math.max(0, cur + 1)).map((b, i) => `${x(i)},${y(b.cents)}`).join(' ');
    const points = upto.map((b, i) => `${x(i)},${y(b.cents)}`).join(' ');
    const area = upto.length ? `${x(0)},210 ${points} ${x(upto.length - 1)},210` : '';
    return { bins, previousBins, max, previousPoints, points, area, cur };
  }, [selected, allSales, start, days, period, month, data.now]);
  const x = (i: number) => 40 + i * 520 / Math.max(1, bins.length - 1);
  const y = (c: number) => 210 - c / max * 160;
  const topProducts = useMemo(() => {
    const map = new Map<string, { sale: DemoSale; count: number; cents: number; commission: number }>();
    for (const s of analysisSales) { const item = map.get(s.product.id) ?? { sale: s, count: 0, cents: 0, commission: 0 }; item.count++; item.cents += s.cents; item.commission += s.commissionCents; map.set(s.product.id, item); }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 15);
  }, [analysisSales]);
  const binCommissions = useMemo(() => {
    const out = new Array<number>(bins.length).fill(0), size = days === 1 ? 3600000 : 86400000;
    for (const s of selected) { const i = Math.floor((Date.parse(s.at) - start) / size); if (i >= 0 && i < out.length) out[i]! += s.commissionCents; }
    return out;
  }, [selected, start, days, bins.length]);
  const metrics = [
    { label: 'Unidades', value: hidden ? '•••' : String(analysisSales.length), icon: ShoppingBag },
    { label: 'Preço médio', value: value(analysisSales.length ? Math.round(revenue / analysisSales.length) : 0), icon: ReceiptText },
    { label: 'Taxa de comissão', value: 'N/A', icon: CircleDollarSign },
    { label: 'Comissões', value: value(commissions), icon: Wallet },
    { label: 'Pedidos', value: hidden ? '•••' : String(new Set(analysisSales.map(s => s.product.id)).size) + ' produtos', icon: Clock3 },
    { label: 'Acumulado', value: value(allSales.reduce((n, s) => n + s.cents, 0)), icon: CircleDollarSign },
  ];
  const binCommission = (i: number) => binCommissions[i] ?? 0;
  const hb = hover !== null ? bins[hover] : undefined;
  return <div className="sales-overview demo-overview">
    {period === 'Hoje' || error
      ? <SalesTodaySummary date={new Date(data.now).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long' })} revenue={value(dailyRevenue)} profit={value(dailyCommission)} status="Atualizado" demo detail={`${daily.length} unidades hoje`} />
      : <SalesTodaySummary title={period === 'Ontem' ? 'Vendas de ontem' : monthlyList ? 'Vendas de todos os meses' : period === 'Mensal' ? `Vendas de ${periodLabel}` : period === 'Personalizado' ? 'Vendas do período' : `Vendas dos últimos ${period}`} date={monthlyList ? 'Todos os meses' : periodLabel} revenue={value(revenue)} profit={value(commissions)} status="Atualizado" demo detail={`${analysisSales.length} unidades`} />}
    <div className="sales-analysis-layout">
      <section className="sales-trends"><div className="sales-panel-heading"><div><h2>Evolução das vendas</h2><p>{monthlyList ? 'Faturamento e comissões por mês' : `Faturamento por ${days === 1 ? 'hora' : 'dia'}`}</p></div><SalesPeriodSelect period={period} onChange={changePeriod} /></div>
      <SalesCustomDates state={filters} error={error} />
      {monthlyList ? <div className="sales-month-list"><table><thead><tr><th>Mês</th><th>Faturamento</th><th>Comissões</th><th><span className="sr-only">Detalhes</span></th></tr></thead><tbody>{months.map(m => <tr key={m.month}><th scope="row"><Button variant="ghost" onClick={() => { setMonth(m.month); setHover(null); }}>{monthLabel(m.month)}</Button></th><td>{value(m.cents)}</td><td className="monthly-commission">{value(m.commissionCents)}</td><td><Button variant="ghost" size="icon" aria-label={`Ver ${monthLabel(m.month)}`} onClick={() => { setMonth(m.month); setHover(null); }}><ArrowUpRight size={15} /></Button></td></tr>)}</tbody></table>{!months.length && <p className="um-empty">Nenhum registro mensal.</p>}</div> : error ? <div className="sales-chart-empty"><p>Período inválido</p></div> : <>
      {period === 'Mensal' && month && <Button className="sales-month-back" variant="ghost" size="sm" onClick={() => { setMonth(''); setHover(null); }}><ArrowLeft size={14} />Todos os meses</Button>}
      <div className="sales-chart-legend"><span><i className="comparison-today" />{periodLabel}</span><span><i className="comparison-yesterday" />{period === 'Hoje' ? 'Ontem' : 'Período anterior'}</span></div>
      <div className="demo-chart-wrap" onMouseLeave={() => setHover(null)}>
      <svg className="demo-chart" viewBox="0 0 600 250" role="img" aria-label="Gráfico de faturamento"
        onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width * 600; setHover(Math.max(0, Math.min(bins.length - 1, Math.round((px - 40) / 520 * Math.max(1, bins.length - 1))))); }}>
        <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" className="chart-fill-top" /><stop offset="100%" className="chart-fill-bottom" /></linearGradient></defs>
        {[210, 130, 50].map((yy, i) => <g key={yy}><line x1="40" y1={yy} x2="560" y2={yy} /><text x="34" y={yy + 4} textAnchor="end">{hidden ? '•••' : new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(max / 100 * i / 2)}</text></g>)}
        <polygon className="chart-area" points={area} fill="url(#chartFill)" />
        <polyline className="chart-previous" points={previousPoints} /><polyline className="chart-line" points={points} />
        {hover !== null && <line className="chart-cursor" x1={x(hover)} x2={x(hover)} y1="40" y2="210" />}
        {bins.map((b, i) => <g key={i}>{i <= cur && (b.cents > 0 || hover === i) && <circle cx={x(i)} cy={y(b.cents)} r={hover === i ? 6 : 3} className={hover === i ? 'active' : ''} />}{i % Math.ceil(bins.length / 6) === 0 && <text x={x(i)} y="235" textAnchor="middle">{b.label}</text>}</g>)}
      </svg>
      {hb && hover !== null && <div className="chart-tooltip" style={{ left: `${Math.min(82, Math.max(18, x(hover) / 6))}%`, top: `${y(hb.cents) / 2.5}%` }}><span>{hb.label}{days === 1 ? '' : ''}</span>{hover > cur ? <small>Ainda não chegou</small> : <><strong>{value(hb.cents)}</strong></>}<small>Comissão {value(binCommission(hover))}</small><small className="muted">{period === 'Hoje' ? 'Ontem' : 'Anterior'}: {value(previousBins[hover]?.cents ?? 0)}</small></div>}
      </div>
      <div className="sales-chart-footer"><span>FATURAMENTO EM R$ · {days === 1 ? 'HORAS' : 'DIAS'}</span><span>Atualizado {new Date(data.now).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}</span></div>
      </>}
      </section>
      <section className="sales-sold-products"><div className="sales-panel-heading"><div><h2>Produtos mais vendidos</h2><p>{monthlyList ? "Todos os meses" : periodLabel} · unidades e comissão</p></div><Package size={18} /></div><div className="demo-products">{topProducts.map(({ sale, count, cents, commission }, index) => <article key={sale.product.id}><span className="sales-product-rank">{index + 1}</span><img src={sale.product.thumbnail} alt={sale.product.title} loading="lazy" decoding="async" /><div><h3>{sale.product.title}</h3><p>{count} {count === 1 ? 'unidade' : 'unidades'} · {value(cents)}</p><strong className="product-margin">+ {value(commission)} <small>comissão{cents ? ` · ${(commission / cents * 100).toFixed(1).replace('.', ',')}%` : ''}</small></strong></div></article>)}{!analysisSales.length && <p className="um-empty">Nenhum registro neste período.</p>}</div></section></div>
    <section className="sales-key-metrics sales-metrics-horizontal"><h2>Métricas-chave</h2><div className="sales-key-grid">{metrics.map(m => <div key={m.label} className="sales-key-item"><m.icon /><span>{m.label}</span><strong>{m.value}</strong></div>)}</div></section>
    {notification && <aside className="demo-notification" role="status"><img src={notification.product.thumbnail} alt="" /><div><b>Registro de atividade</b><p>{notification.product.title}</p><strong>{value(notification.cents)}</strong><small>Comissão {value(notification.commissionCents)} · {new Date(notification.at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}</small></div><Button size="icon" variant="ghost" aria-label="Fechar notificação" onClick={() => setNotification(null)}><X size={15} /></Button></aside>}
  </div>;
}