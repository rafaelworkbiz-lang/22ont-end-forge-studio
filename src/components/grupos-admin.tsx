import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminImportGroups, adminListGroups, adminListTemplates, adminSaveGroup, adminSaveTemplate, adminSetGroup } from "@/lib/grupos-admin.functions";

type Row = Awaited<ReturnType<typeof adminListGroups>>["rows"][number];
const MOTIVO: Record<string, string> = { link_quebrado: "Link quebrado", grupo_fechado: "Grupo fechado", spam: "Spam" };
const list = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean);

export function GruposAdmin() {
  const [q, setQ] = useState(""); const [dq, setDq] = useState(""); const [page, setPage] = useState(1);
  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const listFn = useServerFn(adminListGroups), setFn = useServerFn(adminSetGroup), importFn = useServerFn(adminImportGroups);
  const qc = useQueryClient();
  const res = useQuery({ queryKey: ["adm-grupos", dq, page], queryFn: () => listFn({ data: { q: dq, page } }) });
  const refresh = () => void qc.invalidateQueries({ queryKey: ["adm-grupos"] });
  const [edit, setEdit] = useState<Row | "new" | null>(null);
  const set = async (id: string, patch: { ativo?: boolean; verificado?: boolean }) => { const r = await setFn({ data: { id, ...patch } }); r.ok ? refresh() : toast.error("Não foi possível salvar."); };
  const onCsv = async (f: File | undefined) => {
    if (!f) return; const r = await importFn({ data: { csv: await f.text() } });
    toast.success(`${r.inserted} grupos importados${r.errors.length ? ` · linhas ignoradas: ${r.errors.slice(0, 10).join(", ")}` : ""}`); refresh();
  };
  const pages = Math.max(1, Math.ceil((res.data?.total ?? 0) / 30));
  return <div className="adm-grupos">
    <section className="saas-card"><h2>Grupos de divulgação</h2>
      <div className="adm-g-bar"><input className="saas-input" placeholder="Buscar por nome ou link" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar grupos" />
        <Button onClick={() => setEdit("new")}>Novo grupo</Button>
        <label className="adm-g-csv"><span>Importar CSV</span><input type="file" accept=".csv,text/csv" onChange={e => { void onCsv(e.target.files?.[0]); e.target.value = ""; }} /></label></div>
      <p className="saas-sub">CSV: rede,nome,link,nichos (separados por ;),membros,regras,frequência em horas</p>
      <div className="adm-g-table" role="table">
        {(res.data?.rows ?? []).map(g => <div key={g.id} role="row" className={`adm-g-row ${g.ativo ? "" : "off"}`}>
          <span>{g.rede === "facebook" ? "Facebook" : "WhatsApp"}</span>
          <a href={g.link} target="_blank" rel="noopener noreferrer">{g.nome}</a>
          <span>{g.nichos.join(", ")}</span>
          <span>{g.verificado_em ? `Verificado ${new Date(g.verificado_em).toLocaleDateString("pt-BR")}` : "Não verificado"}</span>
          <div><Button size="sm" variant="outline" onClick={() => setEdit(g)}>Editar</Button>
            <Button size="sm" variant="outline" onClick={() => void set(g.id, { verificado: !g.verificado_em })}>{g.verificado_em ? "Desmarcar" : "Verificar"}</Button>
            <Button size="sm" variant="outline" onClick={() => void set(g.id, { ativo: !g.ativo })}>{g.ativo ? "Desativar" : "Ativar"}</Button></div>
        </div>)}
      </div>
      {pages > 1 && <div className="adm-g-bar"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button><span>{page} / {pages} · {res.data?.total} grupos</span><Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Próxima</Button></div>}
    </section>
    <section className="saas-card"><h2>Denúncias</h2>
      {!res.data?.denuncias.length ? <p className="saas-sub">Nenhuma denúncia.</p> : <div className="adm-g-table">{res.data.denuncias.map(d => <div key={d.id} className="adm-g-row">
        <span>{MOTIVO[d.motivo] ?? d.motivo}</span><a href={d.grupos?.link} target="_blank" rel="noopener noreferrer">{d.grupos?.nome}</a><span>{new Date(d.criado_em).toLocaleString("pt-BR")}</span><span>{d.grupos?.ativo ? "Ativo" : "Desativado"}</span>
        <div>{d.grupos?.ativo && <Button size="sm" variant="outline" onClick={() => void set(d.grupo_id, { ativo: false })}>Desativar grupo</Button>}</div></div>)}</div>}
    </section>
    <TemplatesAdmin />
    {edit && <GroupDialog row={edit === "new" ? null : edit} onClose={() => setEdit(null)} onSaved={refresh} />}
  </div>;
}

function GroupDialog({ row, onClose, onSaved }: { row: Row | null; onClose: () => void; onSaved: () => void }) {
  const saveFn = useServerFn(adminSaveGroup);
  const [f, setF] = useState({ rede: (row?.rede ?? "whatsapp") as "whatsapp" | "facebook", nome: row?.nome ?? "", link: row?.link ?? "", nichos: row?.nichos.join(", ") ?? "", kw: row?.palavras_chave.join(", ") ?? "",
    membros: row?.membros_aprox?.toString() ?? "", regras: row?.regras ?? "", freq: String(row?.frequencia_min_horas ?? 6), foto: row?.exige_foto ?? false });
  const save = async () => {
    try {
      const r = await saveFn({ data: { id: row?.id ?? null, group: { rede: f.rede, nome: f.nome, link: f.link, nichos: list(f.nichos), palavras_chave: list(f.kw), membros_aprox: f.membros ? Number(f.membros) : null, regras: f.regras || null, frequencia_min_horas: Number(f.freq) || 0, exige_foto: f.foto } } });
      if (r.ok) { toast.success("Grupo salvo."); onSaved(); onClose(); } else toast.error(r.error ?? "Não foi possível salvar.");
    } catch { toast.error("Confira os campos (link precisa começar com https://)."); }
  };
  const inp = (k: keyof typeof f, label: string) => <label className="adm-g-field">{label}<input className="saas-input" value={String(f[k])} onChange={e => setF({ ...f, [k]: e.target.value })} /></label>;
  return <Dialog open onOpenChange={o => !o && onClose()}><DialogContent>
    <DialogHeader><DialogTitle>{row ? "Editar grupo" : "Novo grupo"}</DialogTitle><DialogDescription>Apenas grupos públicos e verificados.</DialogDescription></DialogHeader>
    <label className="adm-g-field">Rede<select className="saas-input" value={f.rede} onChange={e => setF({ ...f, rede: e.target.value as "whatsapp" | "facebook" })}><option value="whatsapp">WhatsApp</option><option value="facebook">Facebook</option></select></label>
    {inp("nome", "Nome")}{inp("link", "Link")}{inp("nichos", "Nichos (separados por vírgula)")}{inp("kw", "Palavras-chave (separadas por vírgula)")}{inp("membros", "Membros aproximados")}{inp("regras", "Regras (texto curto)")}{inp("freq", "Intervalo mínimo entre postagens (horas)")}
    <label className="adm-g-check"><input type="checkbox" checked={f.foto} onChange={e => setF({ ...f, foto: e.target.checked })} />Exige foto</label>
    <Button onClick={() => void save()}>Salvar</Button>
  </DialogContent></Dialog>;
}

function TemplatesAdmin() {
  const listFn = useServerFn(adminListTemplates), saveFn = useServerFn(adminSaveTemplate);
  const q = useQuery({ queryKey: ["adm-modelos"], queryFn: () => listFn() });
  const qc = useQueryClient();
  const [edit, setEdit] = useState<{ id: string | null; nome: string; texto: string; ativo: boolean } | null>(null);
  const save = async () => { if (!edit) return; const r = await saveFn({ data: edit }).catch(() => ({ ok: false })); if (r.ok) { setEdit(null); void qc.invalidateQueries({ queryKey: ["adm-modelos"] }); toast.success("Modelo salvo."); } else toast.error("Confira nome e texto."); };
  return <section className="saas-card"><h2>Modelos de mensagem</h2><p className="saas-sub">Variáveis: {"{loja}"} {"{link}"} {"{produto}"} {"{preco}"}</p>
    <div className="adm-g-table">{(q.data ?? []).map(t => <div key={t.id} className={`adm-g-row ${t.ativo ? "" : "off"}`}><strong>{t.nome}</strong><span className="adm-g-tpl">{t.texto.slice(0, 90)}…</span><div><Button size="sm" variant="outline" onClick={() => setEdit(t)}>Editar</Button></div></div>)}</div>
    <Button variant="outline" onClick={() => setEdit({ id: null, nome: "", texto: "", ativo: true })}>Novo modelo</Button>
    {edit && <Dialog open onOpenChange={o => !o && setEdit(null)}><DialogContent><DialogHeader><DialogTitle>Modelo de mensagem</DialogTitle><DialogDescription>Use as variáveis entre chaves.</DialogDescription></DialogHeader>
      <label className="adm-g-field">Nome<input className="saas-input" value={edit.nome} onChange={e => setEdit({ ...edit, nome: e.target.value })} /></label>
      <label className="adm-g-field">Texto<textarea className="saas-input" rows={8} value={edit.texto} onChange={e => setEdit({ ...edit, texto: e.target.value })} /></label>
      <label className="adm-g-check"><input type="checkbox" checked={edit.ativo} onChange={e => setEdit({ ...edit, ativo: e.target.checked })} />Ativo</label>
      <Button onClick={() => void save()}>Salvar</Button></DialogContent></Dialog>}
  </section>;
}
