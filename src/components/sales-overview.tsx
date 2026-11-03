import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChartNoAxesCombined, Clock3, Package, ReceiptText, ShoppingBag, Wallet, ShieldCheck, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from './auth-provider';
import { SalesTodaySummary } from "./sales-today-summary";
import { DemoSalesOverview } from './demo-sales-overview';
import { useTestData } from '@/lib/test-data-query';
import { salesRange } from '@/lib/sales-period';
import { SalesCustomDates, SalesPeriodSelect, useSalesPeriod } from './sales-period-controls';

type Props = { hidden: boolean; signedIn: boolean; connectionState: "loading" | "error" | "connected" | "disconnected" | "admin" | "demo"; onConnect: () => void; onCatalog: () => void };

export function SalesOverview({ hidden, signedIn, connectionState, onConnect, onCatalog }: Props) {
  const { user } = useAccount();
  const demo = useTestData(user?.id);
  const filters = useSalesPeriod();
  const { period } = filters;
  const { error } = salesRange(period, new Date().toISOString(), filters.from, filters.to, filters.month);
  const [date, setDate] = useState("");
  useEffect(() => { setDate(new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "long", year: "numeric" }).format(new Date())); }, []);
  const unavailable = hidden ? "••••••" : "—";
  const status = connectionState === "admin" ? "Acesso administrativo" : connectionState === "loading" ? "Conferindo conexão" : connectionState === "error" ? "Conexão indisponível" : "Relatório não conectado";
  const metrics = [
    { title: "Vendas", icon: ShoppingBag }, { title: "Unidades vendidas", icon: Package },
    { title: "Comissões pendentes", icon: Clock3 }, { title: "Comissões aprovadas", icon: ShieldCheck },
    { title: "Comissões pagas", icon: Wallet }, { title: "Canceladas", icon: Ban },
  ];
  if (demo.data?.enabled && 'sales' in demo.data && demo.data.sales && user) return <DemoSalesOverview key={user.id} data={demo.data} userId={user.id} hidden={hidden} />;
  return <div className="sales-overview">
    <SalesTodaySummary date={date || "Hoje"} revenue={unavailable} profit={unavailable} status={status} detail="Dados indisponíveis" />
    <div className="sales-source-note"><ReceiptText size={18} /><p>Vendas e comissões aguardam um relatório oficial do Mercado Livre.</p>{!signedIn ? <Button asChild variant="ghost" size="sm"><Link to="/auth">Entrar <ArrowUpRight /></Link></Button> : <Button variant="ghost" size="sm" onClick={onConnect}>Integrações <ArrowUpRight /></Button>}</div>
    <div className="sales-analysis-layout">

      <section className="sales-trends"><div className="sales-panel-heading"><div><h2>Evolução das vendas</h2><p>{period === "Hoje" || period === "Ontem" ? "Comparativo diário" : "Período selecionado"}</p></div><SalesPeriodSelect period={period} onChange={filters.setPeriod} /></div>
        <SalesCustomDates state={filters} error={error} />
        <div className="sales-chart-empty"><ChartNoAxesCombined /><h3>{period === "Mensal" ? "Dados mensais indisponíveis" : "Dados de vendas indisponíveis"}</h3><p>Nenhum relatório oficial conectado para este período.</p></div><div className="sales-chart-footer"><span>VENDAS EM R$</span><span>Última atualização: indisponível</span></div>
      </section>
      <section className="sales-sold-products"><div className="sales-panel-heading"><div><h2>Produtos vendidos</h2><p>Ranking por vendas atribuídas</p></div><ShoppingBag size={18} /></div><div className="sales-products-empty"><Package /><h3>Relatório não conectado</h3><p>Os produtos vendidos aparecerão aqui quando houver registros oficiais.</p><Button variant="outline" size="sm" onClick={onCatalog}>Ver catálogo <ArrowUpRight /></Button></div></section>
    </div>
      <section className="sales-key-metrics sales-metrics-horizontal" aria-label="Métricas-chave"><h2>Métricas-chave</h2><div className="sales-key-grid">{metrics.map(m => <div className="sales-key-item" key={m.title}><m.icon /><span>{m.title}</span><strong>{unavailable}</strong></div>)}</div></section>
  </div>;
}