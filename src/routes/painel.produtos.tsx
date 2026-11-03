import { ViewSkeleton } from "@/components/view-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { panelHead } from "@/lib/panel-head";
const ProductLibrary = lazy(() => import("@/components/library").then(m => ({ default: m.ProductLibrary })));

export const Route = createFileRoute("/painel/produtos")({
  head: panelHead("Produtos validados", "Biblioteca de produtos quentes do Mercado Livre e da Shopee."),
  component: () => <Suspense fallback={<ViewSkeleton />}><ProductLibrary /></Suspense>,
});
