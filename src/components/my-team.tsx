import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, MessageCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/qr-code";
import { STATUS_LABEL } from "@/components/influencers-manager";
import { reviewMyMember, getMyTeam, manageMyInvite, saveMyTeam, type Invite, type TeamData } from "@/lib/teams.functions";

const copy = (t: string) => { void navigator.clipboard.writeText(t); toast.success("Copiado"); };
export const inviteUrl = (c: string) => `https://afiliaplace.site/convite/${c}`;

export function TeamSetupForm({ team, onSave, busy }: { team: TeamData | null; onSave: (d: { nome: string | null; mensagem: string | null; link_afiliacao_mensal: string; link_afiliacao_vitalicio: string }) => void; busy: boolean }) {
  const [f, setF] = useState({ nome: team?.nome ?? "", mensagem: team?.mensagem ?? "", m: team?.link_afiliacao_mensal ?? "", v: team?.link_afiliacao_vitalicio ?? "" });
  return <form className="um-form" onSubmit={(e) => { e.preventDefault(); onSave({ nome: f.nome || null, mensagem: f.mensagem || null, link_afiliacao_mensal: f.m, link_afiliacao_vitalicio: f.v }); }}>
    <label>Link de afiliação Mensal na Applyfy (obrigatório)<input required type="url" value={f.m} placeholder="https://app.applyfy.com.br/…" onChange={(e) => setF({ ...f, m: e.target.value })} /></label>
    <label>Link de afiliação Vitalício na Applyfy (obrigatório)<input required type="url" value={f.v} placeholder="https://app.applyfy.com.br/…" onChange={(e) => setF({ ...f, v: e.target.value })} /><small>São os links que seus convidados vão usar para se afiliar debaixo de você.</small></label>
    <label>Nome do time (opcional)<input maxLength={60} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></label>
    <label>Mensagem de boas-vindas (opcional)<textarea className="um-textarea" maxLength={500} rows={3} value={f.mensagem} onChange={(e) => setF({ ...f, mensagem: e.target.value })} /></label>
    <Button type="submit" className="um-primary" disabled={busy}>{busy ? "Salvando…" : "Salvar time"}</Button>
  </form>;
}

export function InviteBox({ invite, onAction, busy }: { invite: Invite | undefined; onAction: (a: { acao: "criar" | "ativar" | "desativar" | "novo_codigo"; id?: string }) => void; busy: boolean }) {
  if (!invite) return <div className="links-row"><p>Nenhum convite criado.</p><Button className="um-primary" disabled={busy} onClick={() => onAction({ acao: "criar" })}>Criar link de convite</Button></div>;
  const url = inviteUrl(invite.codigo);
  return <div className="links-card">
    <div className="um-form">
      <div className="links-row"><code>{url}</code></div>
      <small>{invite.ativo ? "Ativo" : "Desativado"} · {invite.usos} de {invite.limite_usos} usos · vale até {new Date(invite.expira_em).toLocaleDateString("pt-BR")}</small>
      <div className="links-row">
        <Button size="sm" variant="outline" onClick={() => copy(url)}><Copy /> Copiar</Button>
        <Button size="sm" variant="outline" asChild><a href={`https://wa.me/?text=${encodeURIComponent(`Entre para o meu time no AfiliaPlace: ${url}`)}`} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a></Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction({ acao: invite.ativo ? "desativar" : "ativar", id: invite.id })}>{invite.ativo ? "Desativar" : "Ativar"}</Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => confirm("Gerar novo código? O link atual para de funcionar.") && onAction({ acao: "novo_codigo", id: invite.id })}><RefreshCw /> Novo código</Button>
      </div>
    </div>
    <QrCode value={url} />
  </div>;
}

export function MyTeam() {
  const qc = useQueryClient();
  const get = useServerFn(getMyTeam), save = useServerFn(saveMyTeam), inv = useServerFn(manageMyInvite), appr = useServerFn(reviewMyMember);
  const q = useQuery({ queryKey: ["my-team"], queryFn: () => get() });
  const done = () => qc.invalidateQueries({ queryKey: ["my-team"] });
  const err = (e: Error) => toast.error(e.message);
  const s = useMutation({ mutationFn: (d: { nome: string | null; mensagem: string | null; link_afiliacao_mensal: string; link_afiliacao_vitalicio: string }) => save({ data: d }), onSuccess: () => { toast.success("Time salvo"); void done(); }, onError: err });
  const i = useMutation({ mutationFn: (d: { acao: "criar" | "ativar" | "desativar" | "novo_codigo"; id?: string }) => inv({ data: d }), onSuccess: () => void done(), onError: err });
  const a = useMutation({ mutationFn: (d: { id: string; acao: "aprovar_afiliacao" | "aprovar_links" | "recusar"; motivo?: string }) => appr({ data: d }), onSuccess: (_r, d) => { toast.success(d.acao === "recusar" ? "Recusado" : d.acao === "aprovar_links" ? "Links aprovados, conta ativa" : "Afiliação aprovada"); void done(); }, onError: err });
  const recusar = (id: string) => { const motivo = window.prompt("Motivo da recusa (a pessoa vai ver):")?.trim(); if (motivo) a.mutate({ id, acao: "recusar", motivo }); };
  const [editing, setEditing] = useState(false);
  if (q.isLoading) return <p className="um-empty">Carregando…</p>;
  if (q.isError) return <p className="um-empty">{(q.error as Error).message}</p>;
  const t = q.data!;
  const pronto = !!t.link_afiliacao_mensal && !!t.link_afiliacao_vitalicio;
  if (!pronto || editing) return <section className="v2-card"><h2 className="onb-card-title">{pronto ? "Editar time" : "Configure seu time"}</h2>
    <TeamSetupForm team={t} busy={s.isPending} onSave={(d) => s.mutate(d, { onSuccess: () => setEditing(false) })} /></section>;
  return <div className="users-manager">
    <section className="v2-card um-form"><div className="um-heading"><h2>{t.nome || "Meu time"}</h2><Button variant="outline" size="sm" onClick={() => setEditing(true)}>Editar time</Button></div>
      <small>Afiliação Mensal: <code>{t.link_afiliacao_mensal}</code></small>
      <small>Afiliação Vitalício: <code>{t.link_afiliacao_vitalicio}</code></small>
      <h3>Link de convite</h3>
      <InviteBox invite={t.convites.find((c) => c.ativo) ?? t.convites[0]} busy={i.isPending} onAction={(d) => i.mutate(d)} />
    </section>
    <section className="um-list">
      <h3>Membros ({t.membros.length})</h3>
      {(() => { const n = t.membros.filter((m) => ["conta_applyfy", "afiliacao_pedida", "links_enviados"].includes(m.status)).length; return n > 0 && <p className="um-empty"><strong>{n} {n === 1 ? "pessoa aguardando" : "pessoas aguardando"} sua aprovação</strong></p>; })()}
      {t.membros.length === 0 && <p className="um-empty">Ninguém entrou pelo seu convite ainda.</p>}
      {t.membros.map((m) => <article key={m.id} className="um-row team-row">
        <div className="um-person"><span className="um-avatar">{m.nome[0]?.toUpperCase()}</span><div><h3>{m.nome}</h3><small>{m.codigo ? `afiliaplace.site/${m.codigo}` : "Sem código"} · entrou {new Date(m.criado_em).toLocaleDateString("pt-BR")}</small></div></div>
        <span className={`um-pill ${m.status === "ativo" ? "active" : "expired"}`}>{STATUS_LABEL[m.status] ?? m.status}</span>
        <small className="team-links">{m.link_mensal ? <>Mensal: <code>{m.link_mensal}</code><br />Vitalício: <code>{m.link_vitalicio}</code></> : "Sem links"}</small>
        <div className="um-actions">
          {["conta_applyfy", "afiliacao_pedida"].includes(m.status) && <Button size="sm" disabled={a.isPending} onClick={() => a.mutate({ id: m.id, acao: "aprovar_afiliacao" })}>Aprovar afiliação</Button>}
          {m.status === "links_enviados" && <Button size="sm" disabled={a.isPending} onClick={() => a.mutate({ id: m.id, acao: "aprovar_links" })}>Aprovar links</Button>}
          {["conta_applyfy", "afiliacao_pedida", "afiliacao_aprovada", "links_enviados"].includes(m.status) && <Button size="sm" variant="outline" disabled={a.isPending} onClick={() => recusar(m.id)}>Recusar</Button>}
        </div>
      </article>)}
    </section>
  </div>;
}
