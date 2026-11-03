import { ViewSkeleton } from "@/components/view-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { panelHead } from "@/lib/panel-head";
const MyProducts = lazy(() => import("@/components/my-products").then(m => ({ default: m.MyProducts })));

export const Route = createFileRoute("/painel/meus-produtos")({
  head: panelHead("Meus produtos", "Sua seleção pessoal de produtos."),
  component: () => <Suspense fallback={<ViewSkeleton />}><MyProducts /></Suspense>,
});
