import { useEffect, useRef, useState } from 'react';
import { ChartNoAxesCombined, ShoppingBag } from 'lucide-react';
import { presentationProducts, presentationTotals, previewMoney } from '@/lib/landing-preview';

export function LandingSalesPreview() {
  const element = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const node = element.current;
    if (!node) return;
    let frame = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setProgress(1); return; }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const time = Math.min((now - start) / 1600, 1);
        setProgress(1 - Math.pow(1 - time, 3));
        if (time < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.2 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  return <section id="painel" ref={element} className="lp-preview" aria-label="Prévia ilustrativa de vendas" data-reveal>
    <div className="lp-window">
      <aside><b>AfiliaPlace</b>{['Painel', 'Produtos', 'Facebook', 'WhatsApp', 'Integrações'].map((name, i) => <span key={name} className={i === 0 ? 'on' : ''}>{i === 0 ? <ChartNoAxesCombined size={15} /> : <ShoppingBag size={15} />}{name}</span>)}</aside>
      <div className="lp-window-body">
        <div className="lp-wb-head"><div><span className="lp-mini-label">SEUS RESULTADOS</span><h2>Vendas de hoje</h2></div><small>Valores ilustrativos</small></div>
        <div className="lp-stats" aria-live="off">
          <div><span>Pedidos</span><strong data-testid="preview-orders">{Math.round(presentationTotals.orders * progress)}</strong></div>
          <div><span>Faturamento</span><strong data-testid="preview-revenue">{previewMoney(presentationTotals.revenue * progress)}</strong></div>
          <div className="hl"><span>Comissão</span><strong data-testid="preview-commission">{previewMoney(presentationTotals.commission * progress)}</strong></div>
        </div>
        <div className="lp-chart-caption"><span>Evolução das vendas</span><small>Faturamento ilustrativo · hoje</small></div>
        <svg viewBox="0 0 600 140" className="lp-chart" preserveAspectRatio="none" role="img" aria-label="Gráfico ilustrativo da evolução das vendas">
          <defs><linearGradient id="lp-sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".24" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
          <path d="M0 110 C60 100 90 70 150 80 S250 40 310 55 S420 20 480 35 S560 15 600 10 L600 140 L0 140Z" fill="url(#lp-sales-fill)" />
          <path d="M0 110 C60 100 90 70 150 80 S250 40 310 55 S420 20 480 35 S560 15 600 10" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
        <div className="lp-product-sales">
          <div className="lp-sales-columns"><span>Produtos vendidos</span><span>Faturamento</span><span>Comissão</span></div>
          {presentationProducts.map(product => <div className="lp-sale-row" key={product.name}>
            <div className="lp-sale-product"><img src={product.image} alt="" width={44} height={44} loading="lazy" /><div><b>{product.name}</b><small>{product.orders} pedidos</small></div></div>
            <span>{previewMoney(product.revenue)}</span><em>{previewMoney(product.commission)}</em>
          </div>)}
        </div>
      </div>
    </div>
  </section>;
}