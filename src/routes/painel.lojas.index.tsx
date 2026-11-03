import { ViewSkeleton } from "@/components/view-skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { panelHead } from "@/lib/panel-head";
const StoresList = lazy(() => import("@/components/stores-list").then(m => ({ default: m.StoresList })));

export const Route = createFileRoute("/painel/lojas/")({
  head: panelHead("Minhas lojas", "Suas lojas online na AfiliaPlace."),
  component: () => <Suspense fallback={<ViewSkeleton />}><StoresList /></Suspense>,
});
