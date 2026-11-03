import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto de carregamento de aba: cabeçalho + grade de cartões. */
export function ViewSkeleton() {
  return (
    <div className="view-skel" role="status" aria-label="Carregando">
      <Skeleton className="view-skel-head" />
      <div className="view-skel-grid">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="view-skel-card" />)}</div>
    </div>
  );
}
