import { ViewSkeleton } from "@/components/view-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Crown, Settings } from "lucide-react";
import { TabHeader } from "@/components/tab-header";
import { Button } from "@/components/ui/button";
import { useAccessStatus } from "@/routes/painel";
import { panelHead } from "@/lib/panel-head";
const MyLinksCard = lazy(() => import("@/components/my-links-card").then(m => ({ default: m.MyLinksCard })));
const ProfileSettings = lazy(() => import("@/components/profile-settings").then(m => ({ default: m.ProfileSettings })));

const LIFETIME_URL = "https://checkout.applyfy.com.br/checkout/cmvv7iqfj04ga01n60jjth2ss?offer=ggo7ayu";

export const Route = createFileRoute("/painel/perfil")({
  head: panelHead("Configurações", "Perfil, senha, notificações e plano da sua conta."),
  component: PerfilPage,
});

function PlanCard() {
  const access = useAccessStatus();
  const a = access.data;
  const lifetime = a?.plan === "lifetime";
  const label = a?.reason === "admin" ? "Administrador" : a?.reason === "influencer" ? "Influenciador" : lifetime ? "Vitalício" : "Mensal";
  const limit = lifetime || a?.reason === "admin" || a?.reason === "influencer" ? 10 : 3;
  const until = a?.plan === "monthly" && a.expires_at ? new Date(a.expires_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : null;
  return <section className="v2-card v2-plan" aria-labelledby="plano-title">
    <span className="v2-tabhead-icon" aria-hidden="true"><Crown /></span>
    <div><h2 id="plano-title">Plano</h2><p><strong>{label}</strong>{until ? ` · renova até ${until}` : lifetime ? " · sem vencimento" : ""}</p><p className="tabular-nums">Lojas usadas: 0 de {limit}</p></div>
    {a?.plan === "monthly" && <Button asChild><a href={LIFETIME_URL} target="_blank" rel="noopener noreferrer">Fazer upgrade para Vitalício</a></Button>}
  </section>;
}

function PerfilPage() {
  return <div className="v2-page">
    <TabHeader icon={Settings} badge="Configurações" word="CONTA" title="Sua conta e seu plano" description="Foto, senha, notificações e plano." />
    <PlanCard />
    <Suspense fallback={null}><MyLinksCard /></Suspense>
    <Suspense fallback={<ViewSkeleton />}><ProfileSettings /></Suspense>
  </div>;
}
