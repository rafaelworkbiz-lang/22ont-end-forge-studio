import { ViewSkeleton } from "@/components/view-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { panelHead } from "@/lib/panel-head";
import type { Aba } from "@/components/divulgacao";
const Divulgacao = lazy(() => import("@/components/divulgacao").then(m => ({ default: m.Divulgacao })));

const ABAS = ["buscar", "meus", "mensagem"];
export const Route = createFileRoute("/painel/divulgacao")({
  validateSearch: (s: Record<string, unknown>): { aba?: Aba | undefined; loja?: string | undefined } => ({
    aba: typeof s["aba"] === "string" && ABAS.includes(s["aba"]) ? s["aba"] as Aba : undefined,
    loja: typeof s["loja"] === "string" && /^[0-9a-f-]{36}$/.test(s["loja"]) ? s["loja"] : undefined,
  }),
  head: panelHead("Divulgação", "Grupos, mensagens e artes prontas para divulgar sua loja."),
  component: DivulgacaoPage,
});

function DivulgacaoPage() {
  const { aba = "buscar", loja } = Route.useSearch();
  const navigate = Route.useNavigate();
  return <Suspense fallback={<ViewSkeleton />}>
    <Divulgacao aba={aba} lojaId={loja} onAba={a => void navigate({ search: prev => ({ ...prev, aba: a }), replace: true })} />
  </Suspense>;
}
