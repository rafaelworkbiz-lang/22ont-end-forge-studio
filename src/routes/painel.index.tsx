import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { SalesOverview } from "@/components/sales-overview";
import { useMeliConnection } from "@/components/integrations";
import { useAccount } from "@/components/auth-provider";
import { usePanel } from "@/components/panel-shell";
import { TabHeader } from "@/components/tab-header";
import { panelHead } from "@/lib/panel-head";

export const Route = createFileRoute("/painel/")({
  beforeLoad: ({ search }) => {
    if (search.produto) throw redirect({ to: "/painel/produtos", search: { produto: search.produto, etapa: search.etapa }, replace: true });
  },
  head: panelHead("Início", "Resumo de vendas e comissões da sua conta AfiliaPlace."),
  component: InicioPage,
});

function InicioPage() {
  const { user } = useAccount();
  const { hidden } = usePanel();
  const meli = useMeliConnection();
  const navigate = useNavigate();
  const meta = (user?.user_metadata ?? {}) as { name?: string; full_name?: string };
  const name = (meta.name || meta.full_name || user?.email?.split("@")[0] || "").split(" ")[0];
  const state = meli.isLoading ? "loading" : meli.isError ? "error" : meli.data?.mode === "admin" ? "admin" : meli.data?.mode === "demo" ? "demo" : meli.data?.connected ? "connected" : "disconnected";
  return <div className="v2-page">
    <TabHeader icon={Home} badge="Início" word="OLÁ" title={`Bom te ver, ${name}`} description="Acompanhe faturamento e comissões. Use os filtros de período logo abaixo." />
    <SalesOverview hidden={hidden} signedIn={!!user} connectionState={state} onConnect={() => void navigate({ to: "/painel/fornecedores" })} onCatalog={() => void navigate({ to: "/painel/produtos" })} />
  </div>;
}
