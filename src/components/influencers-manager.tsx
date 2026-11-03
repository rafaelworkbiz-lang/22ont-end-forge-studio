import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { IdCard, MoreHorizontal, MessageCircle, Pencil, Search, Copy, UserX, Crown, Link2, ShoppingBag, Zap, Trash2 } from "lucide-react";
import { ManualSalesDialog } from "./manual-sales-dialog";
import { AutoSalesDialog } from "./auto-sales-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteInfluencerAccount, listInfluencers, removeInfluencerTag, setInfluencerManager, updateInfluencer, type InfluencerRow } from "@/lib/influencers.functions";
import { fmtPhone, Pager, waLink } from "./users-manager";
import { moveInfluencerTeam, resolveLinkChange, adminGetPlatformInvite, adminManagePlatformInvite } from "@/lib/teams.functions";
import { InviteBox } from "./my-team";
import { ReviewButtons, PENDENTES } from "./onboarding-review";
import { Avatar, ComoUsar, FichaDialog, statusTone } from "./influencer-ficha";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const STATUS_LABEL: Record<string, string> = { convidado: "Convidado", conta_applyfy: "Conta Applyfy", afiliacao_pedida: "Afiliação pedida", afiliacao_aprovada: "Afiliação aprovada", links_enviados: "Links enviados", ativo: "Ativo", recusado: "Recusado" };
const PAGE = 25;

export function InfluencersManager({ team = false }: { team?: boolean }) {
  const sp = useSearch({ strict: false }) as { gerente?: string }; const nav = useNavigate();
  const gerente = sp.gerente ?? "all";
  const qc = useQueryClient();
  const list = useServerFn(listInfluencers), save = useServerFn(updateInfluencer), remove = useServerFn(removeInfluencerTag), mgr = useServerFn(setInfluencerManager);
  const toggleMgr = useMutation({ mutationFn: (v: { id: string; gerente: boolean }) => mgr({ data: v }), onSuccess: (_r, v) => { toast.success(v.gerente ? "Agora é gerente" : "Cargo de gerente removido"); setOpen((o) => o && o.id === v.id ? { ...o, is_gerente: v.gerente } : o); done(); }, onError: (e: Error) => toast.error(e.message) });
  const q = useQuery({ queryKey: ["influencers"], queryFn: () => list() });
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("all"); const [page, setPage] = useState(0);
  const [open, setOpen] = useState<InfluencerRow | null>(null);
  const [ficha, setFicha] = useState<InfluencerRow | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [salesFor, setSalesFor] = useState<{ name: string; email: string } | null>(null);
  const [autoFor, setAutoFor] = useState<{ name: string; email: string } | null>(null);
  const done = () => Promise.all(["influencers", "members"].map((k) => qc.invalidateQueries({ queryKey: [k] })));
  const rm = useMutation({ mutationFn: (id: string) => remove({ data: { id } }), onSuccess: () => { toast.success("Tag de influenciador removida"); done(); }, onError: (e: Error) => toast.error(e.message) });
  const del = useServerFn(deleteInfluencerAccount);
  const [delFor, setDelFor] = useState<InfluencerRow | null>(null); const [delTxt, setDelTxt] = useState("");
  const delM = useMutation({ mutationFn: (id: string) => del({ data: { id } }), onSuccess: () => { toast.success("Conta excluída"); setDelFor(null); done(); }, onError: (e: Error) => toast.error(e.message) });
  const gerentes = useMemo(() => (q.data ?? []).filter((g) => g.is_gerente), [q.data]);
  const nomeGerente = (id: string | null) => (q.data ?? []).find((g) => g.id === id)?.nome ?? "—";
  const filtered = useMemo(() => (q.data ?? []).filter((i) => {
    if (team ? !i.gerente_id || (gerente !== "all" && i.gerente_id !== gerente) : !!i.gerente_id) return false;
    const t = search.toLowerCase().trim();
    if (t && !(i.nome.toLowerCase().includes(t) || i.email.includes(t) || (i.codigo ?? "").includes(t))) return false;
    return status === "all" || (status === "pendentes" ? PENDENTES.includes(i.status_cadastro) : i.status_cadastro === status);
  }), [q.data, search, status, team, gerente]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  return <div className="users-manager">
    {team ? <section className="page-heading"><div><h1>Membros de time</h1><p>Escolha um gerente para ver as pessoas do time dele e o status de cada cadastro.</p></div></section> : <section className="page-heading"><div><h1>Influenciadores</h1><p>Gerentes e influenciadores sem time. Membros de time ficam na aba Membros de time.</p></div><Button className="um-primary" onClick={() => setInviteOpen(true)}><Link2 /> Gerar link de convite</Button></section>}
    <PlatformInviteDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    <section className="um-filters">
      {team && <select value={gerente} onChange={(e) => { void nav({ to: ".", search: (x: Record<string, unknown>) => ({ ...x, gerente: e.target.value === "all" ? undefined : e.target.value }), replace: true }); setPage(0); }} aria-label="Gerente"><option value="all">Todos os gerentes</option>{gerentes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}</select>}
      <label className="um-search"><Search size={15} /><input placeholder="Buscar nome, e-mail ou código" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} /></label>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} aria-label="Status do cadastro"><option value="all">Todos os status</option><option value="pendentes">Aguardando aprovação</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
    </section>
    <ComoUsar id={team ? "times" : "influ"} passos={team ? [["Escolha o gerente", "Use a lista acima para ver só as pessoas do time dele."], ["Aprove os cadastros", "Quem enviou links aparece com Aprovar/Recusar."], ["Abra a ficha", "Ver ficha mostra todos os dados e links da pessoa."]] : [["Convide", "Gere um link de convite e envie para a pessoa se cadastrar."], ["Aprove", "Quando ela enviar os links, clique em Aprovar links."], ["Acompanhe", "Use Ver ficha e o menu ⋯ para editar, lançar vendas ou dar cargo de gerente."]]} />
    <section className="um-list if-list">
      {q.isLoading && <p className="um-empty">Carregando…</p>}
      {!q.isLoading && filtered.length === 0 && <p className="um-empty">{team ? "Nenhum membro neste time." : 'Nenhum influenciador. Use "Tornar influenciador" na aba Usuários.'}</p>}
      {filtered.slice(page * PAGE, page * PAGE + PAGE).map((i) => <article key={i.id} className="if-card">
        <div className="if-who"><Avatar row={i} /><div>
          <h3>{i.nome}<span className={`if-tag ${i.is_gerente ? "mgr" : i.gerente_id ? "team" : ""}`}>{i.is_gerente ? "Gerente" : i.gerente_id ? `Time de ${nomeGerente(i.gerente_id)}` : "Sem time"}</span></h3>
          <p>{i.email}</p><small>{i.codigo ? `afiliaplace.site/${i.codigo}` : "Sem código de página"}</small>
        </div></div>
        <span className={`if-status ${statusTone(i.status_cadastro)}`}>{STATUS_LABEL[i.status_cadastro]}</span>
        <div className="if-actions">
          <ReviewButtons id={i.id} status={i.status_cadastro} onDone={done} />
          <Button size="sm" className="um-primary" onClick={() => setFicha(i)}><IdCard /> Ver ficha</Button>
          {!/^0*$/.test(i.whatsapp.replace(/\D/g, "").replace(/^55/, "")) && <a className="um-wa" href={waLink(i.whatsapp)} target="_blank" rel="noreferrer" title={`WhatsApp ${fmtPhone(i.whatsapp)}`}><MessageCircle size={16} /></a>}
          <DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="outline" title="Mais ações"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="if-menu">
              <DropdownMenuItem onSelect={() => setOpen(i)}><Pencil /><div><b>Editar</b><small>Código, links, status e comissão</small></div></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSalesFor({ name: i.nome, email: i.email })}><ShoppingBag /><div><b>Adicionar vendas</b><small>Lança um valor demonstrativo no painel</small></div></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setAutoFor({ name: i.nome, email: i.email })}><Zap /><div><b>Vendas automáticas</b><small>Liga ou desliga as vendas do dia</small></div></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => toggleMgr.mutate({ id: i.id, gerente: !i.is_gerente })}><Crown /><div><b>{i.is_gerente ? "Remover gerente" : "Tornar gerente"}</b><small>{i.is_gerente ? "Deixa de ter time e convites" : "Pode montar time e convidar"}</small></div></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="if-danger" onSelect={() => confirm(`Remover a tag de influenciador de ${i.nome}? Ele volta para Usuários.`) && rm.mutate(i.id)}><UserX /><div><b>Remover tag</b><small>Volta a ser usuário comum</small></div></DropdownMenuItem>
              <DropdownMenuItem className="if-danger" onSelect={() => { setDelTxt(""); setDelFor(i); }}><Trash2 /><div><b>Excluir conta</b><small>Apaga o login e todos os dados dele</small></div></DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
        </div>
      </article>)}
    </section>
    {pages > 1 && <Pager page={page} pages={pages} onPage={setPage} />}
    <Dialog open={!!delFor} onOpenChange={(o) => !o && !delM.isPending && setDelFor(null)}>
      <DialogContent><DialogHeader><DialogTitle>Excluir conta de {delFor?.nome}?</DialogTitle>
        <DialogDescription>{delFor?.email} — o login, as lojas, os produtos e as vendas demonstrativas serão apagados. Isso não pode ser desfeito.{delFor?.is_gerente ? " Os membros do time dele ficam sem time." : ""}</DialogDescription></DialogHeader>
        <label style={{ display: "grid", gap: 6 }}><small>Digite <b>EXCLUIR</b> para confirmar</small><input className="um-input" value={delTxt} onChange={(e) => setDelTxt(e.target.value)} autoFocus /></label>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" onClick={() => setDelFor(null)} disabled={delM.isPending}>Cancelar</Button>
          <Button variant="destructive" disabled={delTxt.trim().toUpperCase() !== "EXCLUIR" || delM.isPending} onClick={() => delFor && delM.mutate(delFor.id)}><Trash2 /> {delM.isPending ? "Excluindo…" : "Excluir conta"}</Button>
        </div></DialogContent></Dialog>
    <ManualSalesDialog person={salesFor} onClose={() => setSalesFor(null)} />
    <AutoSalesDialog person={autoFor} onClose={() => setAutoFor(null)} />
    <FichaDialog row={ficha} gerenteNome={ficha ? nomeGerente(ficha.gerente_id) : null} onClose={() => setFicha(null)} onEdit={() => { setOpen(ficha); setFicha(null); }} />
    <InfluencerDialog all={q.data ?? []} onRefresh={done} onManager={(g) => open && toggleMgr.mutate({ id: open.id, gerente: g })} row={open} onClose={() => setOpen(null)} onSave={async (d) => { await save({ data: d }); toast.success("Influenciador salvo"); await done(); setOpen(null); }} />
  </div>;
}

type Edit = { id: string; codigo: string | null; status_cadastro: "convidado" | "conta_applyfy" | "afiliacao_pedida" | "afiliacao_aprovada" | "links_enviados" | "ativo" | "recusado"; applyfy_email: string | null; applyfy_afiliado_id: string | null; link_mensal: string | null; link_vitalicio: string | null; motivo_recusa: string | null; comissao_percentual: number };

function InfluencerDialog({ row, onClose, onSave, onManager, all, onRefresh }: { all: InfluencerRow[]; onRefresh: () => Promise<unknown>; onManager: (g: boolean) => void; row: InfluencerRow | null; onClose: () => void; onSave: (d: Edit) => Promise<void> }) {
  const [tab, setTab] = useState<"dados" | "cadastro">("dados");
  const [f, setF] = useState<Edit | null>(null);
  const [busy, setBusy] = useState(false);
  const move = useServerFn(moveInfluencerTeam), resolve = useServerFn(resolveLinkChange);
  const act = async (p: Promise<unknown>, msg: string) => { try { await p; toast.success(msg); await onRefresh(); onClose(); } catch (e) { toast.error((e as Error).message); } };
  const cur: Edit | null = f ?? (row ? { id: row.id, codigo: row.codigo, status_cadastro: row.status_cadastro as Edit["status_cadastro"], applyfy_email: row.applyfy_email, applyfy_afiliado_id: row.applyfy_afiliado_id, link_mensal: row.link_mensal, link_vitalicio: row.link_vitalicio, motivo_recusa: row.motivo_recusa, comissao_percentual: row.comissao_percentual } : null);
  const set = (p: Partial<Edit>) => cur && setF({ ...cur, ...p });
  const n = (s: string) => s.trim() ? s.trim() : null;
  return <Dialog open={!!row} onOpenChange={(o) => { if (!o) { setF(null); setTab("dados"); onClose(); } }}>
    <DialogContent className="dashboard-dialog"><DialogHeader><DialogTitle>{row?.nome}</DialogTitle><DialogDescription>{row?.email}</DialogDescription></DialogHeader>
      <div className="catalog-chips">{(["dados", "cadastro"] as const).map((t) => <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>{t === "dados" ? "Dados" : "Cadastro"}</Button>)}</div>
      {cur && <form className="um-form" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await onSave(cur); setF(null); } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); } }}>
        {tab === "dados" ? <>
          <label className="um-check"><input type="checkbox" checked={!!row?.is_gerente} onChange={(e) => onManager(e.target.checked)} /> Gerente (pode ter time de influenciadores)</label>
          <label>Time (gerente)<select value={row?.gerente_id ?? ""} onChange={(e) => row && void act(move({ data: { id: row.id, gerente_id: e.target.value || null } }), "Time atualizado")}><option value="">Sem time</option>{all.filter((g) => g.is_gerente && g.id !== row?.id).map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}</select></label>
          <label>Código da página (afiliaplace.site/…)<input value={cur.codigo ?? ""} placeholder="ex.: rafa" onChange={(e) => set({ codigo: n(e.target.value.toLowerCase()) })} /><small>3 a 20 caracteres: letras minúsculas, números e hífen. Trocar o código mantém o antigo funcionando por 90 dias.</small></label>
        </> : <>
          {row?.pedido_troca_links && <div className="onb-alert" style={{ borderColor: "var(--border)", color: "inherit" }}><b>Pedido de troca de links</b><br />Mensal: {row.pedido_troca_links.mensal}<br />Vitalício: {row.pedido_troca_links.vitalicio}
            <div className="links-row" style={{ marginTop: 8 }}><Button type="button" size="sm" className="um-primary" onClick={() => void act(resolve({ data: { id: row.id, aprovar: true } }), "Troca aprovada")}>Aprovar</Button><Button type="button" size="sm" variant="outline" onClick={() => void act(resolve({ data: { id: row.id, aprovar: false } }), "Troca recusada")}>Recusar</Button></div></div>}
          <label>Status do cadastro<select value={cur.status_cadastro} onChange={(e) => set({ status_cadastro: e.target.value as Edit["status_cadastro"] })}>{Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          {cur.status_cadastro === "recusado" && <label>Motivo da recusa<input required value={cur.motivo_recusa ?? ""} onChange={(e) => set({ motivo_recusa: n(e.target.value) })} /></label>}
          <label>Link de checkout Mensal<input value={cur.link_mensal ?? ""} placeholder="https://checkout.applyfy.com.br/…" onChange={(e) => set({ link_mensal: n(e.target.value) })} /></label>
          <label>Link de checkout Vitalício<input value={cur.link_vitalicio ?? ""} placeholder="https://checkout.applyfy.com.br/…" onChange={(e) => set({ link_vitalicio: n(e.target.value) })} /></label>
          {row?.codigo && row.status_cadastro === "ativo" && <Button type="button" variant="outline" onClick={() => { void navigator.clipboard.writeText(`https://afiliaplace.site/${row.codigo}`); toast.success("Link copiado"); }}><Copy /> Copiar afiliaplace.site/{row.codigo}</Button>}
        </>}
        <Button type="submit" className="um-primary" disabled={busy}>{busy ? "Salvando…" : "Salvar"}</Button>
      </form>}
    </DialogContent>
  </Dialog>;
}

function PlatformInviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const get = useServerFn(adminGetPlatformInvite), act = useServerFn(adminManagePlatformInvite);
  const q = useQuery({ queryKey: ["platform-invite"], queryFn: () => get(), enabled: open });
  const [limite, setLimite] = useState("50"); const [dias, setDias] = useState("90");
  const m = useMutation({ mutationFn: (d: { acao: "criar" | "ativar" | "desativar" | "novo_codigo"; id?: string }) => act({ data: { ...d, ...(d.acao === "criar" || d.acao === "novo_codigo" ? { limite: Math.max(1, Number(limite) || 50), dias: Math.max(1, Number(dias) || 90) } : {}) } }),
    onSuccess: () => { toast.success("Convite atualizado"); void qc.invalidateQueries({ queryKey: ["platform-invite"] }); }, onError: (e: Error) => toast.error(e.message) });
  return <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
    <DialogContent className="dashboard-dialog"><DialogHeader><DialogTitle>Link de convite de influenciador</DialogTitle>
      <DialogDescription>Quem abrir o link cria uma conta de influenciador sem time e faz o passo a passo de cadastro.</DialogDescription></DialogHeader>
      <div className="um-form">
        <div className="links-row"><label>Limite de usos<input type="number" min={1} max={1000} value={limite} onChange={(e) => setLimite(e.target.value)} /></label>
          <label>Vale por (dias)<input type="number" min={1} max={365} value={dias} onChange={(e) => setDias(e.target.value)} /></label></div>
        <small>Esses valores valem ao criar o link ou gerar um novo código.</small>
        {q.isLoading ? <p className="um-empty">Carregando…</p> : <InviteBox invite={q.data ?? undefined} busy={m.isPending} onAction={(d) => m.mutate(d)} />}
      </div>
    </DialogContent>
  </Dialog>;
}
