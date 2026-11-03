import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminCreateCoupon, adminListCoupons, adminSetCouponActive } from "@/lib/coupons.functions";

export function CouponsManager() {
  const list = useServerFn(adminListCoupons);
  const create = useServerFn(adminCreateCoupon);
  const setActive = useServerFn(adminSetCouponActive);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-coupons"], queryFn: () => list() });
  const [codigo, setCodigo] = useState("");
  const [validade, setValidade] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-coupons"] });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const r = await create({ data: { codigo, validade: validade || null } }).catch(() => ({ ok: false as const, error: "Código inválido." }));
    setBusy(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Cupom criado."); setCodigo(""); setValidade(""); void refresh();
  };
  return <section className="coupons-admin">
    <h2>Cupons de influenciadores</h2>
    <p className="saas-sub">R$ 30 por cupom, limitado a 50% da compra. Só influenciadores veem os cupons ativos.</p>
    <form onSubmit={submit} className="coupons-admin-form">
      <label>Código<input value={codigo} onChange={e => setCodigo(e.target.value)} required minLength={3} maxLength={40} pattern="[A-Za-z0-9_\-]+" /></label>
      <label>Validade (opcional)<input type="date" value={validade} onChange={e => setValidade(e.target.value)} /></label>
      <Button type="submit" disabled={busy}>Criar cupom</Button>
    </form>
    {q.isPending ? <p role="status">Carregando...</p> : q.isError ? <p>Não foi possível carregar os cupons.</p> : !q.data.length ? <p>Nenhum cupom criado.</p> :
      <table className="coupons-admin-table"><thead><tr><th>Código</th><th>Validade</th><th>Status</th><th><span className="sr-only">Ação</span></th></tr></thead><tbody>
        {q.data.map(c => <tr key={c.id}><td>{c.codigo}</td><td>{c.validade ? new Date(c.validade).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Sem validade"}</td><td>{c.ativo ? "✓ Ativo" : "Desativado"}</td>
          <td><Button variant="outline" size="sm" onClick={async () => { await setActive({ data: { id: c.id, ativo: !c.ativo } }); void refresh(); }}>{c.ativo ? "Desativar" : "Reativar"}</Button></td></tr>)}
      </tbody></table>}
  </section>;
}
