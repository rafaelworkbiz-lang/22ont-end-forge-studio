import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAutoSales, setAutoSales } from "@/lib/manual-sales.functions";

export function AutoSalesDialog({ person, onClose }: { person: { name: string; email: string } | null; onClose: () => void }) {
  const get = useServerFn(getAutoSales), set = useServerFn(setAutoSales), qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ["auto-sales", person?.email], queryFn: () => get({ data: { email: person!.email } }), enabled: !!person });
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const run = async (enabled: boolean, apagar = false) => {
    if (!person) return; setBusy(true);
    try { await set({ data: { email: person.email, enabled, apagar } }); toast.success(enabled ? "Vendas automáticas ligadas" : "Vendas automáticas desligadas"); void q.refetch(); void qc.invalidateQueries({ queryKey: ["influencer-demo"] }); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  const d = q.data;
  return <Dialog open={!!person} onOpenChange={o => !o && onClose()}>
    <DialogContent className="dashboard-dialog"><DialogHeader><DialogTitle>Vendas automáticas</DialogTitle><DialogDescription>{person?.name} · aparecem só no painel dessa pessoa.</DialogDescription></DialogHeader>
      <ul className="um-hint" style={{ paddingLeft: 18, display: "grid", gap: 4 }}>
        <li>Todo dia caem vendas sozinhas, com produtos sorteados de Produtos validados.</li>
        <li>Quantidade varia por dia bastante.</li>
        <li>30% sobre cada venda · R$ 300 a R$ 2.000 por dia de ganho (normalmente R$ 400 a R$ 900).</li>
        <li>Chegam em ondas ao longo do dia; horários que ainda não passaram ficam "Ainda não chegou".</li>
        <li>Começa a contar a partir de hoje, sem criar dias passados.</li>
      </ul>
      {q.isLoading ? <p className="um-hint">Carregando…</p> : d?.enabled ? <>
        <p><strong>Ligado</strong> desde {new Date(d.since!).toLocaleDateString("pt-BR")} · {brl(d.total)} gerados até agora.</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button className="um-primary" disabled={busy} onClick={() => run(false)}>Desligar e manter vendas</Button>
          <Button variant="outline" disabled={busy} onClick={() => confirm("Desligar e apagar todas as vendas automáticas já geradas?") && run(false, true)}>Desligar e apagar</Button>
        </div>
      </> : <>
        <p><strong>Desligado</strong>{d && d.total > 0 ? ` · ${brl(d.total)} de vendas antigas mantidas` : ""}</p>
        <Button className="um-primary" disabled={busy} onClick={() => run(true)}>{busy ? "Ligando…" : "Ligar vendas automáticas"}</Button>
      </>}
    </DialogContent>
  </Dialog>;
}
