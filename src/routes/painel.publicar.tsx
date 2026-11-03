import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TabHeader, EmptyState } from "@/components/tab-header";
import { StorePublish } from "@/components/store-publish";
import { panelHead } from "@/lib/panel-head";
import { listStores } from "@/lib/stores.functions";


export const Route = createFileRoute("/painel/publicar")({
  head: panelHead("Colocar no ar", "Publique sua loja com um endereço público."),
  component: Publish,
});
function Publish() {
  const loja = Route.useSearch().loja;
  return <div className="v2-page">
    <TabHeader icon={Rocket} badge="Colocar no ar" word="NO AR" title="Seu link, seu nome" description="Escolha o endereço da sua loja, confira a análise e publique." />
    {loja ? <StorePublish lojaId={loja} /> : <Picker />}
  </div>;
}
function Picker() {
  const fetchList = useServerFn(listStores);
  const q = useQuery({ queryKey: ["stores"], queryFn: () => fetchList() });
  if (q.isLoading) return <Skeleton className="st-card-skel" />;
  const stores = q.data?.stores ?? [];
  if (!stores.length) return <EmptyState icon={Rocket} text="Crie uma loja antes de colocá-la no ar." action={<Button asChild><Link to="/painel/lojas">Minhas lojas</Link></Button>} />;
  return <div className="v2-card pub-sec"><h2>Qual loja você quer colocar no ar?</h2>
    <ul className="pub-pick">{stores.map(s => <li key={s.id}><span><strong>{s.nome}</strong><small>{s.status === "publicada" ? `No ar · /loja/${s.slug}` : s.status === "pausada" ? "Pausada" : "Rascunho"}</small></span>
      <Button size="sm" asChild><Link to="/painel/publicar" search={{ janela: "publicar", loja: s.id }} state={{ __janela: true } as never}>Abrir</Link></Button></li>)}</ul></div>;
}
