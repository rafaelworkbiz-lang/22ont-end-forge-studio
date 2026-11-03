import { ViewSkeleton } from "@/components/view-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ShieldUser } from "lucide-react";
import { TabHeader } from "@/components/tab-header";
import { useAccount } from "@/components/auth-provider";
import { panelHead } from "@/lib/panel-head";
const AdminHub = lazy(() => import("@/components/admin-hub").then(m => ({ default: m.AdminHub })));

export const Route = createFileRoute("/painel/usuarios")({
  validateSearch: (s: Record<string, unknown>) => ({ aba: typeof s["aba"] === "string" ? s["aba"] : undefined, gerente: typeof s["gerente"] === "string" ? s["gerente"] : undefined }),
  head: panelHead("Administração", "Gestão de membros e influenciadores."),
  component: () => {
    const { isAdmin } = useAccount();
    return <div className="v2-page">
      <TabHeader icon={ShieldUser} badge="Administração" word="ADMIN" title="Administração" description="Clientes, influenciadores, assinaturas e configurações." />
      {isAdmin ? <Suspense fallback={<ViewSkeleton />}><AdminHub /></Suspense> : <p className="v2-card">Área exclusiva do administrador.</p>}
    </div>;
  },
});
