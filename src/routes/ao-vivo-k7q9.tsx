import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { User, Users, ShoppingCart, Percent, Tag, DollarSign, ChevronDown, Bell } from 'lucide-react';
import { useAccount } from '@/components/auth-provider';
import { useTestData } from '@/lib/test-data-query';
import { saoDay, type DemoSale } from '@/lib/demo-engine';
import logo from '@/assets/mercado-livre-logo.png.asset.json';

const money = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100);

function LivePage() {
  const { user, ready } = useAccount();
  const navigate = useNavigate();
  const demo = useTestData(user?.id);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (ready && !user) void navigate({ to: '/auth', replace: true }); }, [ready, user, navigate]);

  const sales: DemoSale[] = demo.data && 'sales' in demo.data && demo.data.sales ? demo.data.sales : [];
  const calc = useMemo(() => {
    const ref = now ?? new Date();
    const today = saoDay(ref);
    const y = new Date(ref.getTime() - 86400000); const yesterday = saoDay(y);
    const hour = (s: DemoSale) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', hourCycle: 'h23' }).format(new Date(s.at)));
    const t = sales.filter(s => Date.parse(s.at) <= ref.getTime() && saoDay(new Date(s.at)) === today);
    const yd = sales.filter(s => saoDay(new Date(s.at)) === yesterday);
    const hT = Array(24).fill(0), hY = Array(24).fill(0);
    t.forEach(s => { hT[hour(s)] += s.cents; }); yd.forEach(s => { hY[hour(s)] += s.cents; });
    const curH = hour({ at: ref.toISOString() } as DemoSale);
    const total = t.reduce((n, s) => n + s.cents, 0);
    const map = new Map<string, { p: DemoSale['product']; c: number; n: number }>();
    t.forEach(s => { const e = map.get(s.product.id) ?? { p: s.product, c: 0, n: 0 }; e.c += s.cents; e.n++; map.set(s.product.id, e); });
    const top = [...map.values()].sort((a, b) => b.c - a.c).slice(0, 10);
    const buyers = t.length; const visits = Math.round(buyers * 22.7 + (buyers ? 7 : 0));
    return { t, total, hT, hY, curH, top, buyers, visits };
  }, [sales, now]);

  if (!ready || !user) return <div className="mlv-page" />;
  const max = Math.max(1, ...calc.hT, ...calc.hY);
  const X = (i: number) => 50 + i * (520 / 23), Y = (c: number) => 250 - (c / max) * 220;
  const path = (arr: number[]) => arr.map((c, i) => `${i ? 'L' : 'M'}${X(i)},${Y(c)}`).join(' ');
  const todayArr = calc.hT.slice(0, calc.curH + 1);
  const dateTxt = now ? `${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long' }).format(now)}, ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now)}` : '';
  const units = calc.t.length;
  const metrics = [
    { i: User, l: 'Visitas únicas', v: String(calc.visits) },
    { i: Users, l: 'Total de compradores', v: String(calc.buyers) },
    { i: ShoppingCart, l: 'Quantidade de vendas', v: String(units) },
    { i: Percent, l: 'Conversão', v: calc.visits ? `${((calc.buyers / calc.visits) * 100).toFixed(2)}%` : '0%' },
    { i: Tag, l: 'Unidades vendidas', v: `${units} u.` },
    { i: DollarSign, l: 'Preço médio', v: money(units ? calc.total / units : 0) },
  ];
  const name = (user.user_metadata?.['name'] as string | undefined) ?? 'Minha loja';

  return <div className="mlv-page">
    <header className="mlv-top">
      <div className="mlv-bar"><div className="mlv-brand"><img src={logo.url} alt="Mercado Livre" style={{ height: 34, width: 'auto' }} /></div><nav><span className="mlv-store"><span className="mlv-av">{name.slice(0, 2).toUpperCase()}</span><span className="mlv-hide">{name}</span><ChevronDown size={14} className="mlv-hide" /></span><span className="mlv-hide">Vender</span><span className="mlv-hide">Contato</span><Bell size={20} strokeWidth={1.6} /><span className="mlv-assist"><i><span /><span /><span /></i>ASSISTENTE</span></nav></div>
      <h1>Vendas de hoje ao vivo</h1>
    </header>
    <section className="mlv-total"><span className="mlv-date"><i />{dateTxt}</span><strong>{money(calc.total)}</strong></section>
    <div className="mlv-grid">
      <section className="mlv-card"><h2>Métricas-chave</h2><div className="mlv-metrics">{metrics.map(m => <div key={m.l}><m.i size={18} /><span>{m.l}</span><strong>{m.v}</strong></div>)}</div></section>
      <section className="mlv-card"><h2>Tendências em vendas brutas</h2>
        <div className="mlv-legend"><span><i className="t" />Hoje</span><span><i className="y" />Ontem</span></div>
        <svg viewBox="0 0 590 290" className="mlv-chart">
          {[0, .25, .5, .75, 1].map(f => <g key={f}><line x1="50" x2="570" y1={250 - f * 220} y2={250 - f * 220} /><text x="44" y={254 - f * 220} textAnchor="end">{Math.round(max * f / 100)}</text></g>)}
          <path d={path(calc.hY)} className="y" />
          <path d={path(todayArr)} className="t" />
          {todayArr.map((c, i) => <circle key={i} cx={X(i)} cy={Y(c)} r="3.5" />)}
          {Array.from({ length: 12 }, (_, k) => <text key={k} x={X(k * 2)} y="274" textAnchor="middle">{String(k * 2).padStart(2, '0')}</text>)}
        </svg><p className="mlv-axis">HORAS</p>
      </section>
      <section className="mlv-card"><h2>Produtos mais vendidos</h2><ol className="mlv-top-list">{calc.top.length ? calc.top.map((e, i) => <li key={e.p.id} className={i === 0 ? 'first' : ''}><b>{i + 1}</b><img src={e.p.thumbnail} alt="" loading="lazy" /><div><strong>{e.p.title}</strong><small>Vendas do dia: <b>{money(e.c)}</b> ({e.n} un.)</small></div></li>) : <li className="empty">Nenhuma venda hoje ainda.</li>}</ol></section>
    </div>
  </div>;
}

export const Route = createFileRoute('/ao-vivo-k7q9')({
  head: () => ({ meta: [
    { title: 'Vendas ao vivo | AfiliaPlace' },
    { name: 'description', content: 'Acompanhamento privado das vendas de hoje.' },
    { name: 'robots', content: 'noindex, nofollow' },
    { property: 'og:title', content: 'Vendas ao vivo | AfiliaPlace' },
    { property: 'og:description', content: 'Acompanhamento privado das vendas de hoje.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: LivePage,
});
