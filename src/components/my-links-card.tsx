import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Link2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/qr-code";
import { useMyOnboarding } from "@/hooks/use-onboarding";
import { requestLinkChange } from "@/lib/influencer-onboarding.functions";

const copy = (t: string) => { void navigator.clipboard.writeText(t); toast.success("Copiado"); };

/** Configurações › Links e convites — visível só para influenciadores ativos. */
export function MyLinksCard() {
  const q = useMyOnboarding();
  const qc = useQueryClient();
  const req = useServerFn(requestLinkChange);
  const ob = q.data;
  const [edit, setEdit] = useState<{ mensal: string; vitalicio: string } | null>(null);
  const m = useMutation({ mutationFn: (d: { mensal: string; vitalicio: string }) => req({ data: d }), onSuccess: () => { toast.success("Pedido enviado para a administração"); setEdit(null); void qc.invalidateQueries({ queryKey: ["onboarding"] }); }, onError: (e: Error) => toast.error(e.message) });
  if (!ob?.isInfluencer || ob.status !== "ativo" || !ob.codigo) return null;
  const url = `https://afiliaplace.site/${ob.codigo}`;
  return <section className="v2-card links-card" aria-labelledby="links-title">
    <div className="um-form">
      <h2 id="links-title" className="links-row"><Link2 size={18} /> Links e convites</h2>
      <div className="links-row"><code>{url}</code><Button size="sm" variant="outline" onClick={() => copy(url)}><Copy /> Copiar</Button></div>
      <small>Código: <b>{ob.codigo}</b></small>
      <p>Este é o link da sua página de vendas. Os botões de compra dela já usam os seus links de checkout Mensal e Vitalício, então quem comprar por ela gera comissão para você. Compartilhe sempre este link.</p>
      {ob.pedido_troca_links ? <small>Troca de links aguardando aprovação da administração.</small>
        : edit ? <form className="um-form" onSubmit={(e) => { e.preventDefault(); m.mutate(edit); }}>
          <label>Novo link Mensal<input required type="url" value={edit.mensal} onChange={(e) => setEdit({ ...edit, mensal: e.target.value })} /></label>
          <label>Novo link Vitalício<input required type="url" value={edit.vitalicio} onChange={(e) => setEdit({ ...edit, vitalicio: e.target.value })} /></label>
          <div className="links-row"><Button type="submit" className="um-primary" disabled={m.isPending}>Pedir troca</Button><Button type="button" variant="ghost" onClick={() => setEdit(null)}>Cancelar</Button></div>
        </form>
        : <div className="links-row"><Button size="sm" variant="outline" onClick={() => setEdit({ mensal: "", vitalicio: "" })}>Pedir troca de links</Button>
          {ob.is_gerente && <Button size="sm" asChild className="um-primary"><Link to="/painel/meu-time"><Users /> Meu time</Link></Button>}</div>}
    </div>
    <QrCode value={url} />
  </section>;
}
