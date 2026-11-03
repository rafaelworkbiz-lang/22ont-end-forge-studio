import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addManualSales, listManualSales, removeManualSales } from "@/lib/manual-sales.functions";
import { saoDay } from "@/lib/demo-engine";

export function ManualSalesDialog({ person, onClose }: { person: { name: string; email: string } | null; onClose: () => void }) {
  const add = useServerFn(addManualSales), list = useServerFn(listManualSales), remove = useServerFn(removeManualSales), qc = useQueryClient();
  const today = saoDay(new Date()), min = "2019-01-01";
  const [valor, setValor] = useState(500), [inicio, setInicio] = useState(today), [fim, setFim] = useState(today), [busy, setBusy] = useState(false);
  const q = useQuery({ queryKey: ["manual-sales", person?.email], queryFn: () => list({ data: { email: person!.email } }), enabled: !!person });
  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return <Dialog open={!!person} onOpenChange={o => !o && onClose()}>
    <DialogContent className="dashboard-dialog"><DialogHeader><DialogTitle>Adicionar vendas</DialogTitle><DialogDescription>{person?.name} · aparecem só no painel dessa pessoa.</DialogDescription></DialogHeader>
      <form className="um-form" onSubmit={async e => {
        e.preventDefault(); if (!person) return; setBusy(true);
        try { const r = await add({ data: { email: person.email, valor, inicio, fim, lote: crypto.randomUUID() } }); toast.success(`${brl(r.valor)} adicionados em ${r.quantidade} vendas`); void q.refetch(); void qc.invalidateQueries({ queryKey: ["influencer-demo"] }); }
        catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
      }}>
        <label>Valor total (R$)<input type="number" min={1} max={10000000} step={0.01} required value={valor} onChange={e => setValor(Number(e.target.value))} /><small>As vendas são sorteadas até somar exatamente esse valor.</small></label>
        <label>Dia de início<input type="date" min={min} max={today} required value={inicio} onChange={e => { setInicio(e.target.value); if (e.target.value > fim) setFim(e.target.value); }} /></label>
        <label>Dia de fim<input type="date" min={inicio} max={today} required value={fim} onChange={e => setFim(e.target.value)} /><small>O valor é espalhado em várias vendas nesse período, nunca depois da hora atual. Comissão fixa de 30%.</small></label>
        <Button type="submit" className="um-primary" disabled={busy}>{busy ? "Adicionando…" : "Adicionar vendas"}</Button>
      </form>
      <div className="sub-history" style={{ marginTop: 12 }}>
        {(q.data ?? []).length === 0 ? <p className="um-hint">Nenhum lote lançado ainda.</p> : q.data!.map((b: { key: string; dia: string; quantidade: number; total: number }) => <li key={b.key} style={{ listStyle: "none" }}>
          <span>{b.dia.split("-").reverse().join("/")}</span><strong>{b.quantidade} vendas · {brl(b.total)}</strong>
          <Button variant="ghost" size="icon" title="Remover lote" onClick={async () => { if (!person || !confirm("Remover este lote de vendas?")) return; await remove({ data: { email: person.email, key: b.key } }); toast.success("Lote removido"); void q.refetch(); }}><Trash2 size={15} /></Button>
        </li>)}
      </div>
    </DialogContent>
  </Dialog>;
}
