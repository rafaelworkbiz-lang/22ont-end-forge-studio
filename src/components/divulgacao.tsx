import { useUrlFilter } from "@/components/use-url-filter";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Bookmark, Check, Copy, Download, ExternalLink, Facebook, FolderHeart, ImageIcon, Megaphone, MessageCircle, MoreHorizontal, Search, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TabHeader } from "@/components/tab-header";
import { groupNiches, listTemplates, logShare, markPosted, myGroupState, reportGroup, searchGroups, setSaved, type Grupo } from "@/lib/divulgacao.functions";
import { listStores } from "@/lib/stores.functions";
import { listMyProducts, myProductLinks } from "@/lib/my-products.functions";
import { fillTemplate, intervalStatus, KEYWORDS, lastPostLabel, PAGE_SIZE, productLink, storeLink, type Canal } from "@/lib/divulgacao-core";
import { nicheHeadline } from "@/lib/store-rules";
import { renderArt } from "@/lib/share-art";

export type Aba = "buscar" | "meus" | "mensagem";
const TABS: { id: Aba; label: string; icon: typeof Search; hint: string }[] = [
  { id: "buscar", label: "Buscar grupos", icon: Search, hint: "Encontre grupos públicos por tema" },
  { id: "meus", label: "Meus grupos", icon: FolderHeart, hint: "Seus salvos e quando postar" },
  { id: "mensagem", label: "Mensagem e arte", icon: ImageIcon, hint: "Texto, link e imagem prontos" },
];
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtMembers = (n: number | null) => n == null ? "membros não informados" : `${n.toLocaleString("pt-BR")} membros`;

function NetBadge({ rede }: { rede: Canal }) {
  return <span className={`dv-net ${rede}`}>{rede === "facebook" ? <Facebook aria-hidden="true" /> : <MessageCircle aria-hidden="true" />}{rede === "facebook" ? "Facebook" : "WhatsApp"}</span>;
}

type GroupState = Awaited<ReturnType<typeof myGroupState>>;
function useGroupActions() {
  const qc = useQueryClient();
  const saveFn = useServerFn(setSaved), postFn = useServerFn(markPosted), reportFn = useServerFn(reportGroup);
  const refresh = () => void qc.invalidateQueries({ queryKey: ["dv-state"] });
  const [warn, setWarn] = useState<{ g: Grupo; hours: number; freq: number } | null>(null);
  const post = async (g: Grupo, force = false) => {
    const r = await postFn({ data: { grupoId: g.id, force } });
    if (r.ok) { toast.success("Marcado como postado."); refresh(); }
    else if ("warn" in r && r.warn) setWarn({ g, ...r.warn });
    else toast.error(r.error ?? "Não foi possível salvar.");
  };
  const save = async (g: Grupo, on: boolean, salvoEm?: string) => {
    qc.setQueryData<GroupState>(["dv-state"], s => s && ({ ...s, saved: on ? [{ ...g, salvoEm: salvoEm ?? new Date().toISOString() }, ...s.saved.filter(x => x.id !== g.id)] : s.saved.filter(x => x.id !== g.id) }));
    const r = await saveFn({ data: { grupoId: g.id, saved: on, salvoEm } });
    if (!r.ok) toast.error("Não foi possível salvar.");
    refresh(); return r.ok;
  };
  const report = async (g: Grupo, motivo: "link_quebrado" | "grupo_fechado" | "spam") => {
    const r = await reportFn({ data: { grupoId: g.id, motivo } });
    r.ok ? toast.success("Obrigado! O admin vai revisar este grupo.") : toast.error("Não foi possível enviar.");
  };
  const dialog = <AlertDialog open={!!warn} onOpenChange={o => !o && setWarn(null)}>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>Postar de novo neste grupo?</AlertDialogTitle>
        <AlertDialogDescription>Você postou aqui há {warn?.hours}h. Este grupo pede {warn?.freq}h entre postagens. Marcar mesmo assim?</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Esperar</AlertDialogCancel>
        <AlertDialogAction onClick={() => { const w = warn; setWarn(null); if (w) void post(w.g, true); }}>Marcar mesmo assim</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
  return { post, save, report, dialog };
}

export function Divulgacao({ aba, lojaId, onAba }: { aba: Aba; lojaId?: string | undefined; onAba: (a: Aba) => void }) {
  const stateFn = useServerFn(myGroupState);
  const state = useQuery({ queryKey: ["dv-state"], queryFn: () => stateFn() });
  const actions = useGroupActions();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!d) return;
    e.preventDefault(); const n = (i + d + TABS.length) % TABS.length; const t = TABS[n]; if (!t) return; onAba(t.id); tabRefs.current[n]?.focus();
  };
  const today = state.data?.today ?? 0;
  return <div className="v2-page">
    <TabHeader icon={Megaphone} badge="Divulgação" word="DIVULGAR" title="Leve suas lojas para os grupos" description="Encontre grupos, prepare a mensagem e a arte, e poste você mesmo — nada é enviado automaticamente."
      summary={{ value: <span aria-live="polite">{today}</span>, label: today === 1 ? "postagem hoje" : "postagens hoje" }} />
    <div className="dv-tabs" role="tablist" aria-label="Divulgação">
      {TABS.map((t, i) => <button key={t.id} ref={el => { tabRefs.current[i] = el; }} type="button" role="tab" id={`dv-tab-${t.id}`} aria-controls={`dv-panel-${t.id}`}
        aria-selected={aba === t.id} tabIndex={aba === t.id ? 0 : -1} className={`dv-tab ${aba === t.id ? "is-active" : ""}`} onClick={() => onAba(t.id)} onKeyDown={e => onKey(e, i)}>
        <t.icon aria-hidden="true" /><span><strong>{t.label}</strong><small>{t.hint}</small></span></button>)}
    </div>
    <section role="tabpanel" id={`dv-panel-${aba}`} aria-labelledby={`dv-tab-${aba}`} className="dv-panel">
      {aba === "buscar" && <SearchTab state={state.data} actions={actions} />}
      {aba === "meus" && <MyGroupsTab state={state.data} loading={state.isLoading} actions={actions} onSearch={() => onAba("buscar")} />}
      {aba === "mensagem" && <MessageTab lojaId={lojaId} saved={state.data?.saved ?? []} />}
    </section>
    {actions.dialog}
  </div>;
}

type Actions = ReturnType<typeof useGroupActions>;

function useDebounced<T>(v: T, ms = 300) { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; }

function SearchTab({ state, actions }: { state: GroupState | undefined; actions: Actions }) {
  const [text, setText] = useState(""); const [page, setPage] = useState(1);
  const [kwU, setKwU] = useUrlFilter<string>("palavra", ""); const [nichoU, setNichoU] = useUrlFilter<string>("nicho", "");
  const [redeU, setRedeU] = useUrlFilter<string>("plataforma", "");
  const kw = kwU || null, nicho = nichoU || null;
  const rede = redeU === "facebook" || redeU === "whatsapp" ? redeU : null;
  const setKw = (v: string | null | ((p: string | null) => string | null)) => setKwU((typeof v === "function" ? v(kw) : v) ?? "");
  const setNicho = (v: string | null | ((p: string | null) => string | null)) => setNichoU((typeof v === "function" ? v(nicho) : v) ?? "");
  const q = useDebounced(text);
  useEffect(() => setPage(1), [q, kw, nicho, rede]);
  const searchFn = useServerFn(searchGroups), nichesFn = useServerFn(groupNiches);
  const niches = useQuery({ queryKey: ["dv-niches"], queryFn: () => nichesFn(), staleTime: 600_000 });
  const res = useQuery({ queryKey: ["dv-search", q, kw, nicho, rede, page], queryFn: () => searchFn({ data: { q, kw, nicho, rede, page } }), placeholderData: keepPreviousData });
  const savedIds = new Set(state?.saved.map(s => s.id));
  const pages = Math.max(1, Math.ceil((res.data?.total ?? 0) / PAGE_SIZE));
  return <>
    <div className="dv-searchbox">
      <span className="v2-badge">Busca inteligente de grupos</span>
      <h2>Encontre os grupos certos para divulgar sua loja</h2>
      <form className="dv-search" role="search" onSubmit={e => { e.preventDefault(); setText(t => t.trim()); }}>
        <Search aria-hidden="true" /><input value={text} onChange={e => setText(e.target.value)} placeholder="Ex.: achadinhos, cozinha, brique…" aria-label="Buscar grupos" maxLength={80} />
        <Button type="submit">Buscar</Button>
      </form>
      <div className="dv-kws" aria-label="Palavras-chave">{KEYWORDS.map(k => <button key={k} type="button" className={`dv-kw ${kw === k ? "is-active" : ""}`} aria-pressed={kw === k} onClick={() => setKw(kw === k ? null : k)}>{k}</button>)}</div>
      <div className="dv-filters"><label className="dv-niche">Nicho
        <select value={nicho ?? ""} onChange={e => setNicho(e.target.value || null)}><option value="">Todos os nichos</option>{(niches.data ?? []).map(n => <option key={n} value={n}>{n}</option>)}</select></label>
      <label className="dv-niche">Plataforma
        <select value={rede ?? ""} onChange={e => setRedeU(e.target.value)}><option value="">Todas as plataformas</option><option value="facebook">Facebook</option><option value="whatsapp">WhatsApp</option></select></label></div>
    </div>
    <div className="dv-steps">
      {[["01", "Busque", "Use palavras-chave ou nicho para achar grupos do seu tema."], ["02", "Salve", "Guarde os melhores em Meus grupos para voltar depois."], ["03", "Organize", "Marque quando postar e respeite o intervalo de cada grupo."]].map(([n, t, d]) =>
        <div key={n} className="v2-card dv-step"><span>{n}</span><strong>{t}</strong><p>{d}</p></div>)}
    </div>
    <div className="v2-card dv-results" aria-busy={res.isFetching}>
      <div className="dv-results-head"><h3>{res.data ? `${res.data.total.toLocaleString("pt-BR")} grupos` : "Grupos"}</h3></div>
      {res.isLoading ? <ul className="dv-list">{Array.from({ length: 6 }, (_, i) => <li key={i} className="dv-skel" aria-hidden="true" />)}</ul>
        : res.data?.error ? <p className="dv-empty">{res.data.error}</p>
        : !res.data?.items.length ? <p className="dv-empty">{q ? `Nenhum grupo encontrado para "${q}". Tente outra palavra-chave.` : "Nenhum grupo encontrado. Tente outra palavra-chave."}</p>
        : <ul className="dv-list">{res.data.items.map(g => <GroupRow key={g.id} g={g} saved={savedIds.has(g.id)} last={state?.last[g.id] ?? null} actions={actions} />)}</ul>}
      {pages > 1 && <nav className="dv-pager" aria-label="Páginas"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</Button><span>Página {page} de {pages}</span><Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Próxima</Button></nav>}
    </div>
  </>;
}

function GroupMenu({ g, actions }: { g: Grupo; actions: Actions }) {
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label={`Mais opções de ${g.nome}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem asChild><a href={g.link} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir grupo ↗</a></DropdownMenuItem>
      <DropdownMenuSeparator /><DropdownMenuLabel>Denunciar link</DropdownMenuLabel>
      <DropdownMenuItem onSelect={() => void actions.report(g, "link_quebrado")}><ShieldAlert />Link quebrado</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void actions.report(g, "grupo_fechado")}><ShieldAlert />Grupo fechado</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => void actions.report(g, "spam")}><ShieldAlert />Spam</DropdownMenuItem>
    </DropdownMenuContent></DropdownMenu>;
}

function GroupRow({ g, saved, last, actions }: { g: Grupo; saved: boolean; last: string | null; actions: Actions }) {
  const postedToday = !!last && lastPostLabel(last).startsWith("hoje");
  return <li className="dv-row">
    <NetBadge rede={g.rede} />
    <div className="dv-row-main"><strong>{g.nome}</strong><span>{fmtMembers(g.membros)} · {g.regras ?? "Confira as regras do grupo"}{g.exigeFoto ? " · pede foto" : ""}</span></div>
    <div className="dv-row-actions">
      <Button variant="outline" size="sm" aria-pressed={saved} onClick={() => { const on = !saved; void actions.save(g, on).then(ok => ok && toast(on ? "Grupo salvo." : "Grupo removido dos salvos.", { duration: 5000, action: { label: "Desfazer", onClick: () => void actions.save(g, !on) } })); }}>{saved ? <><Check />Salvo</> : <><Bookmark />Salvar</>}</Button>
      <Button variant={postedToday ? "outline" : "default"} size="sm" onClick={() => void actions.post(g)}>{postedToday ? <><Check />Postado hoje</> : "Marcar postado"}</Button>
      <GroupMenu g={g} actions={actions} />
    </div>
  </li>;
}

function MyGroupsTab({ state, loading, actions, onSearch }: { state: GroupState | undefined; loading: boolean; actions: Actions; onSearch: () => void }) {
  const remove = async (g: GroupState["saved"][number]) => {
    if (!(await actions.save(g, false))) return;
    toast("Grupo removido.", { action: { label: "Desfazer", onClick: () => void actions.save(g, true, g.salvoEm) } });
  };
  if (loading) return <div className="v2-card"><ul className="dv-list">{Array.from({ length: 3 }, (_, i) => <li key={i} className="dv-skel" aria-hidden="true" />)}</ul></div>;
  if (!state?.saved.length) return <section className="v2-card v2-empty"><span className="v2-empty-icon" aria-hidden="true"><FolderHeart /></span><p>Você ainda não salvou nenhum grupo.</p><Button onClick={onSearch}><Search />Buscar grupos</Button></section>;
  return <div className="v2-card"><ul className="dv-list">{state.saved.map(g => {
    const last = state.last[g.id] ?? null; const st = intervalStatus(last, g.freq);
    return <li key={g.id} className="dv-row">
      <NetBadge rede={g.rede} />
      <div className="dv-row-main"><strong>{g.nome}</strong><span>Sua última postagem: {lastPostLabel(last)} · <em className={st.canPost ? "dv-ok" : "dv-wait"}>{st.canPost ? "pode postar" : `aguarde ${st.waitHours}h`}</em></span></div>
      <div className="dv-row-actions">
        <Button variant="outline" size="sm" asChild><a href={g.link} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir grupo</a></Button>
        <Button size="sm" onClick={() => void actions.post(g)}>Marcar postado</Button>
        <Button variant="outline" size="sm" onClick={() => void remove(g)}><Trash2 />Remover</Button>
      </div>
    </li>; })}</ul></div>;
}

type Target = { tipo: "loja" } | { tipo: "categoria"; categoria: string } | { tipo: "produto"; meuProdutoId: string };

function MessageTab({ lojaId, saved }: { lojaId?: string | undefined; saved: Grupo[] }) {
  const storesFn = useServerFn(listStores), prodFn = useServerFn(listMyProducts), tplFn = useServerFn(listTemplates), linksFn = useServerFn(myProductLinks), logFn = useServerFn(logShare);
  const qc = useQueryClient();
  const stores = useQuery({ queryKey: ["stores"], queryFn: () => storesFn() });
  const prods = useQuery({ queryKey: ["my-products"], queryFn: () => prodFn() });
  const tpls = useQuery({ queryKey: ["dv-templates"], queryFn: () => tplFn(), staleTime: 600_000 });
  const published = useMemo(() => (stores.data?.stores ?? []).filter(s => s.status === "publicada" && s.slug), [stores.data]);
  const [storeId, setStoreId] = useState<string | null>(lojaId ?? null);
  const store = published.find(s => s.id === storeId) ?? published[0] ?? null;
  const [target, setTarget] = useState<Target>({ tipo: "loja" });
  const [canal, setCanal] = useState<Canal>("whatsapp");
  const [tplId, setTplId] = useState<string | null>(null);
  const [text, setText] = useState(""); const [edited, setEdited] = useState(false);
  const [fbGroupId, setFbGroupId] = useState("");
  const [copied, setCopied] = useState(false);
  const categories = useMemo(() => [...new Set((store?.produtos ?? []).map(p => p.categoria).filter(Boolean))], [store]);
  const products = (prods.data?.items ?? []).filter(p => p.produto);
  const product = target.tipo === "produto" ? products.find(p => p.id === target.meuProdutoId) ?? null : null;
  const productStore = product ? published.find(s => product.lojas.some(l => l.id === s.id)) ?? null : null;
  const direct = useQuery({ queryKey: ["dv-direct", product?.id], enabled: !!product && !productStore, queryFn: () => linksFn({ data: { ids: [product!.id] } }) });

  const link = target.tipo === "produto" ? (product ? productStore ? productLink(productStore.id, product.id, canal) : direct.data?.links[0]?.url ?? null : null)
    : store ? storeLink(store.slug!, canal, target.tipo === "categoria" ? target.categoria : null) : null;
  const tpl = tpls.data?.find(t => t.id === tplId) ?? tpls.data?.find(t => target.tipo === "produto" ? t.texto.includes("{produto}") : !t.texto.includes("{produto}")) ?? tpls.data?.[0];
  const generated = tpl ? fillTemplate(tpl.texto, { loja: (target.tipo === "produto" ? productStore?.nome : store?.nome) ?? "minha loja", link: link ?? "", produto: product?.produto?.titulo ?? (target.tipo === "categoria" ? target.categoria : store?.nome ?? ""), preco: product?.produto ? brl(product.produto.preco) : "" }) : "";
  useEffect(() => { if (!edited) setText(generated); }, [generated, edited]);
  const message = text || generated;
  const alvoId = target.tipo === "produto" ? target.meuProdutoId : store?.id ?? null;
  const record = (c: Canal, grupoId: string | null = null) => void logFn({ data: { canal: c, grupoId, alvoTipo: target.tipo, alvoId } }).then(() => qc.invalidateQueries({ queryKey: ["dv-state"] }));
  const copy = async () => { try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 2000); record(canal); } catch { toast.error("Não foi possível copiar."); } };
  const openWa = () => { window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener"); record("whatsapp"); };
  const fbGroups = saved.filter(g => g.rede === "facebook");
  const openFb = async () => { const g = fbGroups.find(x => x.id === fbGroupId); if (!g) return; try { await navigator.clipboard.writeText(message); } catch { /* segue */ } window.open(g.link, "_blank", "noopener"); toast.success("Mensagem copiada. Cole no grupo."); record("facebook", g.id); };

  if (stores.isLoading) return <div className="v2-card"><div className="dv-skel" /></div>;
  return <div className="dv-msg">
    <div className="dv-msg-col">
      <section className="v2-card"><h3>O que divulgar</h3>
        {!published.length && <div className="dv-warn"><p>Você ainda não tem loja publicada. Dá para divulgar um produto com o seu link de afiliado direto.</p><Button variant="outline" asChild><Link to="/painel/lojas">Colocar uma loja no ar</Link></Button></div>}
        <div className="dv-targets" role="radiogroup" aria-label="O que divulgar">
          {published.map(s => <button key={s.id} type="button" role="radio" aria-checked={target.tipo === "loja" && store?.id === s.id} className={`dv-target ${target.tipo === "loja" && store?.id === s.id ? "is-active" : ""}`} onClick={() => { setStoreId(s.id); setTarget({ tipo: "loja" }); setEdited(false); }}><strong>{s.nome}</strong><small>Loja · /loja/{s.slug}</small></button>)}
          {published.length > 0 && <div className={`dv-target ${target.tipo === "categoria" ? "is-active" : ""}`} role="radio" aria-checked={target.tipo === "categoria"}><strong>Uma categoria da loja</strong>
            <select aria-label="Categoria" value={target.tipo === "categoria" ? target.categoria : ""} onChange={e => { setEdited(false); setTarget(e.target.value ? { tipo: "categoria", categoria: e.target.value } : { tipo: "loja" }); }}><option value="">Escolha…</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>}
          <div className={`dv-target ${target.tipo === "produto" ? "is-active" : ""}`} role="radio" aria-checked={target.tipo === "produto"}><strong>Um produto</strong>
            <select aria-label="Produto" value={target.tipo === "produto" ? target.meuProdutoId : ""} onChange={e => { setEdited(false); setTarget(e.target.value ? { tipo: "produto", meuProdutoId: e.target.value } : { tipo: "loja" }); }}><option value="">{products.length ? "Escolha de Meus produtos…" : "Nenhum produto salvo"}</option>{products.map(p => <option key={p.id} value={p.id}>{p.produto!.titulo.slice(0, 60)}</option>)}</select></div>
        </div>
      </section>
      <section className="v2-card"><h3>Mensagem</h3>
        <div className="v2-pills" aria-label="Modelos">{(tpls.data ?? []).map(t => <button key={t.id} type="button" className={`v2-pill ${tpl?.id === t.id ? "is-active" : ""}`} aria-pressed={tpl?.id === t.id} onClick={() => { setTplId(t.id); setEdited(false); }}>{t.nome}</button>)}</div>
        <textarea className="dv-text" value={message} onChange={e => { setText(e.target.value); setEdited(true); }} rows={8} aria-label="Texto da mensagem" />
        <p className="dv-link">{link ? <><span>Link:</span> <code>{link}</code></> : target.tipo === "produto" && product && !productStore && direct.isFetching ? "Gerando seu link…" : target.tipo === "produto" && product ? direct.data?.links[0]?.error ?? "Link indisponível — confirme sua tag em Fornecedores." : "Escolha o que divulgar para gerar o link."}</p>
      </section>
    </div>
    <div className="dv-msg-col">
      <section className="v2-card"><h3>Prévia</h3>
        <div className="v2-pills" role="radiogroup" aria-label="Canal">{(["whatsapp", "facebook"] as Canal[]).map(c => <button key={c} type="button" role="radio" aria-checked={canal === c} className={`v2-pill ${canal === c ? "is-active" : ""}`} onClick={() => setCanal(c)}>{c === "whatsapp" ? <><MessageCircle />WhatsApp</> : <><Facebook />Facebook</>}</button>)}</div>
        {canal === "whatsapp" ? <div className="dv-wa"><div className="dv-wa-bubble">{message}<span>agora ✓✓</span></div></div>
          : <div className="dv-fb"><div className="dv-fb-head"><span className="dv-fb-avatar" aria-hidden="true" /><div><strong>Você</strong><small>Agora · Grupo</small></div></div><p>{message}</p></div>}
        <div className="dv-actions">
          <Button onClick={() => void copy()} disabled={!link}>{copied ? <><Check />Copiada</> : <><Copy />Copiar mensagem</>}</Button>
          <Button variant="outline" onClick={openWa} disabled={!link}><MessageCircle />Abrir no WhatsApp</Button>
        </div>
        <div className="dv-fbpick"><select aria-label="Grupo do Facebook" value={fbGroupId} onChange={e => setFbGroupId(e.target.value)}><option value="">{fbGroups.length ? "Escolha um grupo do Facebook salvo…" : "Salve grupos do Facebook para usar aqui"}</option>{fbGroups.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}</select>
          <Button variant="outline" disabled={!link || !fbGroupId} onClick={() => void openFb()}><Facebook />Copiar e abrir grupo do Facebook</Button></div>
      </section>
      {(store || productStore) && <ArtCard store={(productStore ?? store)!} />}
      <p className="dv-tips"><ShieldAlert aria-hidden="true" />Poste com calma: respeite as regras e o intervalo de cada grupo, não repita a mesma mensagem em sequência e nunca use robôs — isso derruba contas no WhatsApp e no Facebook.</p>
    </div>
  </div>;
}

function ArtCard({ store }: { store: { nome: string; nicho: string | null; cor: string; bannerUrl: string | null; logoUrl: string | null; slug: string | null } }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const input = useMemo(() => ({ nome: store.nome, frase: nicheHeadline(store.nicho), cor: store.cor, bannerUrl: store.bannerUrl, logoUrl: store.logoUrl }), [store]);
  useEffect(() => { let on = true; void renderArt(input, 540, 540).then(u => on && setThumb(u)); return () => { on = false; }; }, [input]);
  const download = async (w: number, h: number, label: string) => {
    setBusy(label); const url = await renderArt(input, w, h); setBusy(null);
    const a = document.createElement("a"); a.href = url; a.download = `${store.slug ?? "loja"}-${label}.png`; a.click();
  };
  return <section className="v2-card"><h3>Arte</h3>
    <div className="dv-art">{thumb ? <img src={thumb} alt={`Prévia da arte de ${store.nome}`} width={180} height={180} /> : <div className="dv-skel dv-art-skel" />}
      <div className="dv-actions"><Button variant="outline" disabled={!!busy} onClick={() => void download(1080, 1080, "1x1")}><Download />{busy === "1x1" ? "Gerando…" : "Baixar 1:1"}</Button>
        <Button variant="outline" disabled={!!busy} onClick={() => void download(1080, 1920, "9x16")}><Download />{busy === "9x16" ? "Gerando…" : "Baixar 9:16"}</Button></div></div>
  </section>;
}
