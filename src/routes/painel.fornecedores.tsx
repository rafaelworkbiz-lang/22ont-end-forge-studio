import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { TabHeader } from "@/components/tab-header";
import { useMeliConnection } from "@/components/integrations";
import { MeliSupplierCard, ShopeeSupplierCard, SuggestSupplierCard, useShopeeStatus } from "@/components/suppliers";
import { SupplierGuide } from "@/components/suppliers-onboarding";
import { panelHead } from "@/lib/panel-head";

export const Route = createFileRoute("/painel/fornecedores")({
  head: panelHead("Fornecedores", "Conecte suas contas de afiliado dos marketplaces."),
  component: FornecedoresPage,
});

function FornecedoresPage() {
  const meli = useMeliConnection();
  const shopee = useShopeeStatus();
  const connected = (meli.data?.connected ? 1 : 0) + (shopee.data?.connected ? 1 : 0);
  return <div className="v2-page">
    <TabHeader icon={Truck} badge="Fornecedores" word="CONTAS" title="Suas contas de afiliado" description="Escolha um fornecedor e conecte sua conta de afiliado para gerar links com a sua identificação." summary={{ value: `${connected}/2`, label: "conectados" }} />
    <div className="v2-sgrid sob-in">
      <div className="v2-slayer is-ml"><MeliSupplierCard /></div>
      <div className="v2-slayer is-shopee"><ShopeeSupplierCard /></div>
    </div>
    <SuggestSupplierCard />
    <SupplierGuide />
  </div>;
}
