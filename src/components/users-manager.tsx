import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Plus, Search, Star, Trash2, RefreshCw, Pencil, Lock, LockOpen, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listAudit, listMembers, createMember, updateMember, memberAction, type Member } from "@/lib/members.functions";

type Form = { id?: string; name: string; email: string; whatsapp: string; plan: "monthly" | "lifetime"; influencer: boolean; is_test?: boolean; expires_at?: string | null };
const empty: Form = { name: "", email: "", whatsapp: "", plan: "monthly", influencer: false };
type Action = "renew" | "cancel" | "reactivate" | "toggleInfluencer" | "delete" | "block" | "unblock" | "resendInvite";

const dias = (m: Member) => m.expires_at ? Math.ceil((Date.parse(m.expires_at) - Date.now()) / 864e5) : null;
export const statusOf = (m: Member) => m.status === "cancelled" ? "cancelled" : m.plan === "monthly" && m.expires_at && new Date(m.expires_at) < new Date() ? "expired" : "active";
const statusText = (m: Member) => { const s = statusOf(m); if (s === "cancelled") return "Cancelada"; if (s === "expired") return "Vencida"; const d = dias(m); return m.plan === "monthly" && d !== null && d <= 7 ? `Vence em ${d} dia${d === 1 ? "" : "s"}` : "Ativa"; };
export const fmtPhone = (d: string) => { const n = d.replace(/^55(?=\d{10,11}$)/, ""); return n.length >= 10 ? `+55 (${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}` : d; };
const WaIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.4-.3Z"/></svg>;
export const waLink = (d: string, text?: string) => `https://wa.me/${d.length <= 11 ? "55" + d : d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
const dt = (v: string | null) => v ? new Date(v).toLocaleDateString("pt-BR") : "—";
const PAGE = 25;

export function UsersManager() {
  const qc = useQueryClient();
  const list = useServerFn(listMembers), create = useServerFn(createMember), update = useServerFn(updateMember), act = useServerFn(memberAction);
  const q = useQuery({ queryKey: ["members"], queryFn: () => list() });
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [extra, setExtra] = useState({ vence7: false, semLoja: false, teste: false });
  const [page, setPage] = useState(0);
  const [form, setForm] = useState<Form | null>(null);
  const done = async () => { await Promise.all(["members", "influencers"].map(key => qc.invalidateQueries({ queryKey: [key] }))); };
  const save = useMutation({
    mutationFn: (f: Form) => f.id ? update({ data: { ...f, id: f.id, is_test: !!f.is_test } }) : create({ data: { ...f, is_test: !!f.is_test } }),
    onSuccess: (_, f) => { toast.success(f.id ? "Usuário atualizado" : "Usuário criado"); setForm(null); done(); },
    onError: (e: Error) => toast.error(e.message.includes("[") ? "Confira os dados: e-mail válido e WhatsApp com DDD." : e.message),
  });
  const action = useMutation({ mutationFn: (v: { id: string; action: Action }) => act({ data: v }), onSuccess: (_, v) => { done(); if (v.action === "resendInvite") toast.success("Convite de senha reenviado"); if (v.action === "toggleInfluencer") toast.success("Movido para Influenciadores"); }, onError: (e: Error) => toast.error(e.message) });

  const clientes = (q.data ?? []).filter((m) => !m.influencer);
  const filtered = useMemo(() => clientes.filter((m) => {
    const t = search.toLowerCase().trim(); const digits = t.replace(/\D/g, "");
    if (t && !(m.name.toLowerCase().includes(t) || m.email.includes(t) || (digits && m.whatsapp.includes(digits)))) return false;
    if (plan !== "all" && m.plan !== plan) return false;
    if (status !== "all" && statusOf(m) !== status) return false;
    if (extra.vence7) { const d = dias(m); if (m.plan !== "monthly" || d === null || d < 0 || d > 7) return false; }
    if (extra.semLoja && m.lojas > 0) return false;
    if (extra.teste && !m.is_test) return false;
    return true;
  }), [clientes, search, plan, status, extra]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);

  return <div className="users-manager">
    <section className="page-heading um-heading"><div><h1>Usuários</h1><p>Clientes comuns e suas assinaturas. Influenciadores ficam na aba própria.</p></div>
      <div><Button className="um-primary" onClick={() => setForm(empty)}><Plus /> Criar usuário</Button></div></section>
    <section className="um-filters">
      <label className="um-search"><Search size={15} /><input placeholder="Buscar nome, e-mail ou telefone" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} /></label>
      <select value={plan} onChange={(e) => { setPlan(e.target.value); setPage(0); }} aria-label="Plano"><option value="all">Todos os planos</option><option value="monthly">Mensal</option><option value="lifetime">Vitalício</option></select>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="Status"><option value="all">Todos os status</option><option value="active">Ativa</option><option value="expired">Vencida</option><option value="cancelled">Cancelada</option></select>
      {([["vence7", "Vence em 7 dias"], ["semLoja", "Sem loja"], ["teste", "Conta de teste"]] as const).map(([k, l]) => <label key={k} className="um-check"><input type="checkbox" checked={extra[k]} onChange={(e) => { setExtra({ ...extra, [k]: e.target.checked }); setPage(0); }} /> {l}</label>)}
    </section>
    <section className="um-list">
      {q.isLoading && <p className="um-empty">Carregando usuários…</p>}
      {q.isError && <p className="um-empty">Não foi possível carregar os usuários.</p>}
      {!q.isLoading && filtered.length === 0 && !q.isError && <p className="um-empty">Nenhum cliente com esses filtros.</p>}
      {rows.length > 0 && <div className="um-row um-head" aria-hidden><span>Cliente</span><span>WhatsApp</span><span>Plano</span><span>Ações</span></div>}
      {rows.map((m) => { const s = statusOf(m); return <article key={m.id} className="um-row">
        <div className="um-person">{/^0*$/.test(m.whatsapp.replace(/\D/g, "").replace(/^55/, "")) ? <span className="um-avatar um-avatar-wa off" title="Sem WhatsApp"><WaIcon /></span> : <a className="um-avatar um-avatar-wa" href={waLink(m.whatsapp)} target="_blank" rel="noreferrer" title="Abrir WhatsApp"><WaIcon /></a>}<div><h3>{m.name}{m.is_test && <span className="um-inf">Teste</span>}{m.blocked && <span className="um-inf">Bloqueado</span>}</h3><p>{m.email}</p><small>Criado {dt(m.created_at)} · Último acesso {dt(m.last_sign_in_at)} · Lojas {m.lojas}/{m.plan === "lifetime" ? 10 : 3}</small></div></div>
        {/^0*$/.test(m.whatsapp.replace(/\D/g, "").replace(/^55/, "")) ? <span className="um-nowa">Sem WhatsApp</span> : <a className="um-wa" href={waLink(m.whatsapp)} target="_blank" rel="noreferrer" title="Abrir WhatsApp"><MessageCircle size={16} />{fmtPhone(m.whatsapp)}</a>}
        <div className="um-plan"><span className={`um-pill ${m.plan}`}>{m.plan === "monthly" ? "Mensal" : "Vitalício"}</span><span className={`um-pill ${s}`}>{statusText(m)}</span>
          <small>{m.plan === "monthly" ? m.expires_at ? `Vence ${dt(m.expires_at)}` : "" : "Sem vencimento"}</small></div>
        <div className="um-actions">
          <Button variant="ghost" size="icon" title="Editar" onClick={() => setForm({ id: m.id, name: m.name, email: m.email, whatsapp: m.whatsapp, plan: m.plan, influencer: false, is_test: !!m.is_test, expires_at: m.expires_at })}><Pencil /></Button>
          {m.plan === "monthly" && s !== "cancelled" && <Button variant="ghost" size="icon" title="Renovar +30 dias" onClick={() => action.mutate({ id: m.id, action: "renew" }, { onSuccess: () => toast.success("Renovado por mais 30 dias") })}><RefreshCw /></Button>}
          <Button variant="ghost" size="icon" title="Tornar influenciador" onClick={() => confirm(`Tornar ${m.name} influenciador?`) && action.mutate({ id: m.id, action: "toggleInfluencer" })}><Star /></Button>
          <Button variant="ghost" size="icon" title={m.blocked ? "Desbloquear" : "Bloquear"} onClick={() => (m.blocked || confirm(`Bloquear o login de ${m.name}?`)) && action.mutate({ id: m.id, action: m.blocked ? "unblock" : "block" })}>{m.blocked ? <LockOpen /> : <Lock />}</Button>
          <Button variant="ghost" size="icon" title="Reenviar convite de senha" onClick={() => action.mutate({ id: m.id, action: "resendInvite" })}><Mail /></Button>
          <Button variant="ghost" size="icon" title="Remover" onClick={() => confirm(`Remover ${m.name}?`) && action.mutate({ id: m.id, action: "delete" })}><Trash2 /></Button>
        </div>
      </article>; })}
    </section>
    {pages > 1 && <Pager page={page} pages={pages} onPage={setPage} />}
    <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
      <DialogContent className="dashboard-dialog"><DialogHeader><DialogTitle>{form?.id ? "Editar usuário" : "Criar usuário"}</DialogTitle><DialogDescription>{form?.id ? "Trocar o e-mail também troca o login da pessoa." : "Plano mensal vence em 30 dias."}</DialogDescription></DialogHeader>
        {form && <form className="um-form" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
          <label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label>E-mail<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Telefone (WhatsApp)<input required inputMode="tel" placeholder="+55 (11) 99999-9999" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></label>
          {!form.id && <p className="um-hint">A pessoa recebe um convite por e-mail para criar a própria senha.</p>}
          <div className="um-plan-pick">{(["monthly", "lifetime"] as const).map((p) => <button type="button" key={p} className={form.plan === p ? "on" : ""} onClick={() => setForm({ ...form, plan: p })}>{p === "monthly" ? "Mensal" : "Vitalício"}</button>)}</div>
          {form.id && form.plan === "monthly" && <label>Validade<input type="date" value={form.expires_at ? form.expires_at.slice(0, 10) : ""} onChange={(e) => setForm({ ...form, expires_at: e.target.value ? new Date(`${e.target.value}T23:59:00-03:00`).toISOString() : null })} /></label>}
          <label className="um-check"><input type="checkbox" checked={!!form.is_test} onChange={(e) => setForm({ ...form, is_test: e.target.checked })} /> Conta de teste (fora das métricas)</label>
          <Button type="submit" className="um-primary" disabled={save.isPending}>{save.isPending ? "Salvando…" : form.id ? "Salvar" : "Criar usuário"}</Button>
        </form>}
      </DialogContent>
    </Dialog>
  </div>;
}

export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  return <nav className="um-pager" aria-label="Páginas"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>Anterior</Button><span>Página {page + 1} de {pages}</span><Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => onPage(page + 1)}>Próxima</Button></nav>;
}

export function AuditLog() {
  const fetchAudit = useServerFn(listAudit);
  const { data = [] } = useQuery({ queryKey: ["admin-audit"], queryFn: () => fetchAudit() });
  return <section className="um-audit"><h3>Histórico de ações</h3>{data.length === 0 ? <p>Nenhuma ação registrada ainda.</p> : <ul>{data.map((a) => <li key={a.id}><b>{a.acao.replace(/_/g, " ")}</b> · {a.alvo_email ?? "—"} · {new Date(a.criado_em).toLocaleString("pt-BR")}</li>)}</ul>}</section>;
}
