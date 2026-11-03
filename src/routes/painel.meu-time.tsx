import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Users } from "lucide-react";
import { TabHeader } from "@/components/tab-header";
import { ViewSkeleton } from "@/components/view-skeleton";
import { panelHead } from "@/lib/panel-head";
const MyTeam = lazy(() => import("@/components/my-team").then((m) => ({ default: m.MyTeam })));

export const Route = createFileRoute("/painel/meu-time")({
  head: panelHead("Meu time", "Convites e membros do seu time de influenciadores."),
  component: () => <div className="v2-page">
    <TabHeader icon={Users} badge="Gerente" word="TIME" title="Meu time" description="Convide influenciadores e acompanhe o cadastro de cada um." />
    <Suspense fallback={<ViewSkeleton />}><MyTeam /></Suspense>
  </div>,
});
