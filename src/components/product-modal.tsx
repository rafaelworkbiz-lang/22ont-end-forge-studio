import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getProductDetail } from "@/lib/meli.functions";


export function useProductDetail(id: string | null) {
  const fetchDetail = useServerFn(getProductDetail);
  return useQuery({ queryKey: ["meli-detail", id], queryFn: () => fetchDetail({ data: { id: id! } }), enabled: !!id, staleTime: 10 * 60_000 });
}
export function usePrefetchDetail() {
  const qc = useQueryClient();
  const fetchDetail = useServerFn(getProductDetail);
  return (id: string) => void qc.prefetchQuery({ queryKey: ["meli-detail", id], queryFn: () => fetchDetail({ data: { id } }), staleTime: 10 * 60_000 });
}

export function useCopy() {
  const [done, setDone] = useState<string | null>(null);
  const copy = async (key: string, value: string, msg = "Link copiado") => {
    try { await navigator.clipboard.writeText(value); } catch { /* sem acesso ao clipboard */ }
    toast.success(msg); setDone(key); window.setTimeout(() => setDone(d => (d === key ? null : d)), 2000);
  };
  return { done, copy };
}

export function WithTip({ tip, children }: { tip: string | null; children: React.ReactNode }) {
  if (!tip) return <>{children}</>;
  return <TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><span tabIndex={0} className="pm-tipwrap" aria-label={tip}>{children}</span></TooltipTrigger><TooltipContent>{tip}</TooltipContent></Tooltip></TooltipProvider>;
}

export function useFocusReturn(id: string | null) {
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (id) { last.current = id; return; }
    if (last.current) { const el = document.querySelector<HTMLElement>(`[data-product-id="${last.current}"]`); last.current = null; window.setTimeout(() => el?.focus(), 30); }
  }, [id]);
}
