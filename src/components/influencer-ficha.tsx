import { useEffect, useState } from "react";
import { Copy, Pencil, MessageCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { InfluencerRow } from "@/lib/influencers.functions";

const STATUS: Record<string, string> = { convidado: "Convidado", conta_applyfy: "Conta Applyfy", afiliacao_pedida: "Afiliação pedida", afiliacao_aprovada: "Afiliação aprovada", links_enviados: "Links enviados", ativo: "Ativo", recusado: "Recusado" };
const dt = (s: string | null) => s ? new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
const fone = (d: string) => { const x = d.replace(/\D/g, "").replace(/^55/, ""); return x.length >= 10 ? `(${x.slice(0, 2)}) ${x.slice(2, -4)}-${x.slice(-4)}` : "—"; };
const temWa = (d: string) => !/^0*$/.test(d.replace(/\D/g, "").replace(/^55/, ""));

export function Avatar({ row, size = 44 }: { row: Pick<InfluencerRow, "nome" | "avatar_url">; size?: number }) {
  return <span className="if-avatar" style={{ width: size, height: size }}>{row.avatar_url ? <img src={row.avatar_url} alt="" /> : row.nome[0]?.toUpperCase()}</span>;
}

export function statusTone(s: string) { return s === "ativo" ? "ok" : s === "recusado" ? "bad" : "wait"; }

function Linha({ k, v, copy }: { k: string; v: string | null | undefined; copy?: boolean }) {
  return <div className="if-line"><span>{k}</span><b>{v || "—"}</b>{copy && v && <Button size="icon" variant="ghost" title="Copiar" onClick={() => { void navigator.clipboard.writeText(v); toast.success("Copiado"); }}><Copy /></Button>}</div>;
}

export function FichaDialog({ row, gerenteNome, onClose, onEdit }: { row: InfluencerRow | null; gerenteNome: string | null; onClose: () => void; onEdit: () => void }) {
  const [r, setR] = useState(row); useEffect(() => { if (row) setR(row); }, [row]);
  if (!r) return null;
  return <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="if-ficha">
      <DialogHeader>
        <div className="if-ficha-top"><Avatar row={r} size={72} /><div>
          <DialogTitle>{r.nome}</DialogTitle>
          <DialogDescription>{r.is_gerente ? "Gerente" : r.gerente_id ? `Membro do time de ${gerenteNome ?? "—"}` : "Influenciador sem time"} · <span className={`if-status ${statusTone(r.status_cadastro)}`}>{STATUS[r.status_cadastro] ?? r.status_cadastro}</span></DialogDescription>
        </div></div>
      </DialogHeader>
      <section className="if-sec"><h4>Contato</h4>
        <Linha k="Gmail" v={r.email} copy />
        <div className="if-line"><span>WhatsApp</span><b>{temWa(r.whatsapp) ? fone(r.whatsapp) : "Sem WhatsApp"}</b>{temWa(r.whatsapp) && <a className="um-wa" href={`https://wa.me/${r.whatsapp.length <= 11 ? "55" + r.whatsapp : r.whatsapp}`} target="_blank" rel="noreferrer" title="Abrir WhatsApp"><MessageCircle size={16} /></a>}</div>
      </section>
      <section className="if-sec"><h4>Conta</h4>
        <Linha k="Cadastro" v={dt(r.created_at)} />
        <Linha k="Último acesso" v={dt(r.last_sign_in_at)} />
        <Linha k="Plano" v={r.plan === "lifetime" ? "Vitalício" : r.plan === "monthly" ? "Mensal" : null} />
        <Linha k="Lojas" v={`${r.lojas}/${r.plan === "lifetime" ? 10 : 3}`} />
      </section>
      <section className="if-sec"><h4>Divulgação</h4>
        <Linha k="Página" v={r.codigo ? `afiliaplace.site/${r.codigo}` : null} copy />
        <Linha k="Link Mensal" v={r.link_mensal} copy />
        <Linha k="Link Vitalício" v={r.link_vitalicio} copy />
        <Linha k="Comissão combinada" v={`${r.comissao_percentual}% (referência)`} />
        {r.status_cadastro === "recusado" && <Linha k="Motivo da recusa" v={r.motivo_recusa} />}
      </section>
      <div className="if-ficha-actions"><Button variant="outline" onClick={onClose}><X /> Fechar</Button><Button className="um-primary" onClick={onEdit}><Pencil /> Editar</Button></div>
    </DialogContent>
  </Dialog>;
}

export function ComoUsar({ id, passos }: { id: string; passos: [string, string][] }) {
  const key = `como-usar-${id}`; const [show, setShow] = useState(false);
  useEffect(() => { setShow(localStorage.getItem(key) !== "0"); }, [key]);
  if (!show) return <button className="if-howto-open" onClick={() => { localStorage.removeItem(key); setShow(true); }}>Como usar esta aba?</button>;
  return <section className="if-howto">
    <button className="if-howto-x" aria-label="Fechar" onClick={() => { localStorage.setItem(key, "0"); setShow(false); }}><X size={16} /></button>
    <h4>Como usar</h4>
    <ol>{passos.map(([t, d], i) => <li key={i}><span>{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>)}</ol>
  </section>;
}
