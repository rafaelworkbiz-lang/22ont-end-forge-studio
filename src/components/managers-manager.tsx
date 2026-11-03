import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { IdCard, Users } from "lucide-react";
import { Avatar, ComoUsar, FichaDialog } from "@/components/influencer-ficha";
import { listInfluencers, type InfluencerRow } from "@/lib/influencers.functions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STATUS_LABEL } from "@/components/influencers-manager";
import { InviteBox } from "@/components/my-team";
import { ReviewButtons } from "@/components/onboarding-review";
import { adminGetTeam, adminManageInvite, adminSaveTeam, listManagers, moveInfluencerTeam, type ManagerRow } from "@/lib/teams.functions";

export function ManagersManager() {
  const list = useServerFn(listManagers);
  const q = useQuery({ queryKey: ["managers"], queryFn: () => list() });
  const [open, setOpen] = useState<ManagerRow | null>(null);
  const li = useServerFn(listInfluencers); const inf = useQuery({ queryKey: ["influencers"], queryFn: () => li() });
  const [ficha, setFicha] = useState<InfluencerRow | null>(null);
  const rowOf = (id: string) => (inf.data ?? []).find((x) => x.id === id) ?? null;
  return <div className="users-manager">
    <section className="page-heading um-heading"><div><h1>Gerentes</h1><p>Influenciadores com cargo de gerente, seus times e convites. Dê o cargo na aba Influenciadores (coroa).</p></div></section>
    <ComoUsar id="gerentes" passos={[["Dê o cargo", "Na aba Influenciadores, menu ⋯ → Tornar gerente."], ["Monte o time", "Abrir time: defina nome, links Mensal/Vitalício e gere o convite."], ["Acompanhe", "Veja quantos membros estão ativos e em cadastro."]]} />
    <section className="um-list">
      {q.isLoading && <p className="um-empty">Carregando…</p>}
      {!q.isLoading && (q.data ?? []).length === 0 && <p className="um-empty">Nenhum gerente ainda.</p>}
      {(q.data ?? []).length > 0 && <div className="um-row um-head team-row" aria-hidden><span>Gerente</span><span>Time</span><span>Membros</span><span>Convite</span></div>}
      {(q.data ?? []).map((g) => <article key={g.id} className="um-row team-row">
        <div className="um-person"><Avatar row={{ nome: g.nome, avatar_url: rowOf(g.id)?.avatar_url ?? null }} /><div><h3>{g.nome}</h3><p>{g.email}</p></div></div>
        <span>{g.time ?? "—"}</span>
        <small>{g.ativos} ativos · {g.emCadastro} em cadastro</small>
        <div className="um-actions"><small>{g.convite ? `${g.convite.usos}/${g.convite.limite_usos} usos` : "Sem convite"}</small><Button size="sm" variant="outline" disabled={!rowOf(g.id)} onClick={() => setFicha(rowOf(g.id))}><IdCard /> Ver ficha</Button><Button size="sm" className="um-primary" onClick={() => setOpen(g)}><Users /> Abrir time</Button></div>
      </article>)}
    </section>
    <FichaDialog row={ficha} gerenteNome={null} onClose={() => setFicha(null)} onEdit={() => { const g = (q.data ?? []).find((x) => x.id === ficha?.id); setFicha(null); if (g) setOpen(g); }} />
    <ManagerDialog row={open} managers={q.data ?? []} onClose={() => setOpen(null)} />
  </div>;
}

function ManagerDialog({ row, managers, onClose }: { row: ManagerRow | null; managers: ManagerRow[]; onClose: () => void }) {
  const qc = useQueryClient();
  const get = useServerFn(adminGetTeam), save = useServerFn(adminSaveTeam), inv = useServerFn(adminManageInvite), move = useServerFn(moveInfluencerTeam);
  const q = useQuery({ queryKey: ["admin-team", row?.id], queryFn: () => get({ data: { id: row!.id } }), enabled: !!row });
  const done = () => Promise.all([qc.invalidateQueries({ queryKey: ["admin-team", row?.id] }), qc.invalidateQueries({ queryKey: ["managers"] }), qc.invalidateQueries({ queryKey: ["influencers"] })]);
  const err = (e: Error) => toast.error(e.message);
  const i = useMutation({ mutationFn: (d: { acao: "criar" | "ativar" | "desativar" | "novo_codigo"; id?: string }) => inv({ data: { ...d, gerente_id: row!.id } }), onSuccess: () => void done(), onError: err });
  const mv = useMutation({ mutationFn: (d: { id: string; gerente_id: string | null }) => move({ data: d }), onSuccess: () => { toast.success("Time atualizado"); void done(); }, onError: err });
  const t = q.data;
  const [f, setF] = useState<{ nome: string; mensagem: string; link: string; linkV: string; pct: string } | null>(null);
  const cur = f ?? (t ? { nome: t.nome ?? "", mensagem: t.mensagem ?? "", link: t.link_afiliacao_mensal ?? "", linkV: t.link_afiliacao_vitalicio ?? "", pct: t.percentual_info == null ? "" : String(t.percentual_info) } : null);
  const s = useMutation({ mutationFn: () => save({ data: { id: row!.id, nome: cur!.nome || null, mensagem: cur!.mensagem || null, link_afiliacao_mensal: cur!.link || null, link_afiliacao_vitalicio: cur!.linkV || null, percentual_info: cur!.pct === "" ? null : Number(cur!.pct) } }), onSuccess: () => { toast.success("Time salvo"); setF(null); void done(); }, onError: err });
  return <Dialog open={!!row} onOpenChange={(o) => { if (!o) { setF(null); onClose(); } }}>
    <DialogContent className="dashboard-dialog"><DialogHeader><DialogTitle>{row?.nome}</DialogTitle><DialogDescription>Time, convite e membros.</DialogDescription></DialogHeader>
      {!t || !cur ? <p className="um-empty">Carregando…</p> : <div className="um-form">
        <form className="um-form" onSubmit={(e) => { e.preventDefault(); s.mutate(); }}>
          <label>Link de afiliação Mensal do gerente (Applyfy)<input type="url" value={cur.link} onChange={(e) => setF({ ...cur, link: e.target.value })} /></label>
          <label>Link de afiliação Vitalício do gerente (Applyfy)<input type="url" value={cur.linkV} onChange={(e) => setF({ ...cur, linkV: e.target.value })} /></label>
          <label>Nome do time<input maxLength={60} value={cur.nome} onChange={(e) => setF({ ...cur, nome: e.target.value })} /></label>
          <label>Mensagem de boas-vindas<textarea className="um-textarea" rows={2} maxLength={500} value={cur.mensagem} onChange={(e) => setF({ ...cur, mensagem: e.target.value })} /></label>
          <label>% do gerente (só anotação)<input type="number" min={0} max={100} value={cur.pct} onChange={(e) => setF({ ...cur, pct: e.target.value })} /><small>O sistema não calcula nem paga esse valor.</small></label>
          <Button type="submit" className="um-primary" disabled={s.isPending}>Salvar time</Button>
        </form>
        <h3>Convite</h3>
        <InviteBox invite={t.convites.find((c) => c.ativo) ?? t.convites[0]} busy={i.isPending} onAction={(d) => i.mutate(d)} />
        <h3>Membros ({t.membros.length})</h3>
        {t.membros.length === 0 && <p className="um-empty">Sem membros.</p>}
        {t.membros.map((m) => <div key={m.id} className="links-row"><b>{m.nome}</b><span className="um-pill">{STATUS_LABEL[m.status] ?? m.status}</span>
          <ReviewButtons id={m.id} status={m.status} onDone={() => Promise.all([q.refetch(), qc.invalidateQueries({ queryKey: ["influencers"] })])} />
          <select aria-label="Mover para o time" value={row!.id} onChange={(e) => mv.mutate({ id: m.id, gerente_id: e.target.value || null })}>
            <option value="">Sem time</option>{managers.filter((g) => g.id !== m.id).map((g) => <option key={g.id} value={g.id}>{g.time ?? g.nome}</option>)}
          </select></div>)}
      </div>}
    </DialogContent>
  </Dialog>;
}
