import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { CircleDollarSign, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
const UsersManager = lazy(() => import("@/components/users-manager").then(m => ({ default: m.UsersManager })));
const LibraryAdmin = lazy(() => import("@/components/library-admin").then(m => ({ default: m.LibraryAdmin })));
const ReservedSlugsAdmin = lazy(() => import("@/components/reserved-slugs-admin").then(m => ({ default: m.ReservedSlugsAdmin })));
const GruposAdmin = lazy(() => import("@/components/grupos-admin").then(m => ({ default: m.GruposAdmin })));
const IaAdmin = lazy(() => import("@/components/ia-admin").then(m => ({ default: m.IaAdmin })));
const CouponsManager = lazy(() => import("@/components/coupons-manager").then(m => ({ default: m.CouponsManager })));
const SubscriptionsManager = lazy(() => import("@/components/subscriptions-manager").then(m => ({ default: m.SubscriptionsManager })));
import { useAccount } from "@/components/auth-provider";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Painel Admin | AfiliaPlace" },
    { name: "description", content: "Métricas gerais da plataforma e gestão de influenciadores AfiliaPlace." },
    { property: "og:title", content: "Painel Admin | AfiliaPlace" },
    { property: "og:description", content: "Acompanhe a plataforma e gerencie influenciadores." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const [tab, setTab] = useState("users");
  const { isAdmin, ready } = useAccount();
  if (!ready) return <div className="saas-theme saas-main"><p>Conferindo acesso...</p></div>;
  if (!isAdmin) return <div className="saas-theme saas-main"><h1>Acesso restrito</h1><p className="saas-sub">Esta área é exclusiva do administrador.</p><Button asChild><Link to="/auth">Entrar</Link></Button></div>;
  return <div className="saas-theme"><header className="saas-top"><div className="saas-logo">Afilia<span>Place</span> <em>Admin</em></div><nav><Link to="/painel">Painel afiliado</Link><Link to="/docs"><BookOpen size={14} /> Documentação</Link></nav></header><main className="saas-main"><div className="catalog-chips"><Button variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")}>Usuários</Button><Button variant={tab === "subscriptions" ? "default" : "outline"} onClick={() => setTab("subscriptions")}>Assinaturas</Button><Button variant={tab === "coupons" ? "default" : "outline"} onClick={() => setTab("coupons")}>Cupons</Button><Button variant={tab === "library" ? "default" : "outline"} onClick={() => setTab("library")}>Produtos</Button><Button variant={tab === "slugs" ? "default" : "outline"} onClick={() => setTab("slugs")}>Endereços</Button><Button variant={tab === "ia" ? "default" : "outline"} onClick={() => setTab("ia")}>IA</Button><Button variant={tab === "grupos" ? "default" : "outline"} onClick={() => setTab("grupos")}>Grupos</Button></div><Suspense fallback={<p role="status">Carregando...</p>}>{tab === "users" ? <UsersManager /> : tab === "library" ? <LibraryAdmin /> : tab === "slugs" ? <ReservedSlugsAdmin /> : tab === "ia" ? <IaAdmin /> : tab === "grupos" ? <GruposAdmin /> : tab === "coupons" ? <CouponsManager /> : <SubscriptionsManager />}</Suspense><div className="sales-admin-note"><CircleDollarSign size={18} /><p>Vendas e comissões de afiliados: dados indisponíveis até conectar uma fonte oficial.</p></div></main></div>;
}
