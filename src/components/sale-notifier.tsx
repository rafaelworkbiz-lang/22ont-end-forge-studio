import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTestData } from "@/lib/test-data-query";

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Mostra um aviso no canto quando uma venda nova chega enquanto o painel está aberto.
export function SaleNotifier({ userId }: { userId: string | undefined }) {
  const q = useTestData(userId);
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    const d = q.data as { enabled: boolean; sales?: { id: string; cents: number; commissionCents: number; product: { title: string; thumbnail: string } }[] } | undefined;
    if (!d?.enabled || !d.sales) return;
    if (!seen.current) { seen.current = new Set(d.sales.map(s => s.id)); return; }
    const fresh = d.sales.filter(s => !seen.current!.has(s.id));
    fresh.forEach(s => seen.current!.add(s.id));
    fresh.slice(-3).forEach(s => toast.success("Nova venda!", {
      description: `${s.product.title.slice(0, 60)} · comissão ${brl(s.commissionCents)}`,
      icon: <img src={s.product.thumbnail} alt="" width={28} height={28} style={{ borderRadius: 6, objectFit: "cover" }} />,
      duration: 6000,
    }));
  }, [q.data]);
  return null;
}
