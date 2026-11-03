import { useUrlFilter } from "@/components/use-url-filter";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, Check, CheckSquare, Circle, Copy, ExternalLink, Heart, MoreHorizontal, Plus, Search, Store, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useJanela } from "@/components/janela";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TabHeader, EmptyState } from "@/components/tab-header";
import { SupplierBadge, WorkspaceHost, brl, commissionText, useMyProductActions, useMyProducts, useOpenAtSupplier } from "@/components/library-shared";
import { myProductLinks, type MyProduct } from "@/lib/my-products.functions";
import { addToStore } from "@/lib/stores.functions";
import { useStores } from "@/components/stores-query";
import { useCreateStore } from "@/components/stores-list";
import type { MyStatus } from "@/lib/library-rules";

type Filter = "todos" | "sem_loja" | "preco_caiu" | "fora_do_ar";
const STATUS: Record<MyStatus, { label: string; icon: typeof Circle }> = { ativo: { label: "Ativo", icon: Circle }, preco_caiu: { label: "Preço caiu", icon: ArrowDown }, fora_do_ar: { label: "Saiu do ar", icon: XCircle } };

export function MyProducts() {
  const mine = useMyProducts();
  const { removeMany } = useMyProductActions();
  const getLinks = useServerFn(myProductLinks);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { divulgar?: string; etapa?: string };
  const [text, setText] = useUrlFilter<string>("busca", ""); const [filter, setFilter] = useUrlFilter<Filter>("filtro", "todos", ["todos", "sem_loja", "preco_caiu", "fora_do_ar"]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const all = mine.data?.items ?? [];
  const counts = { caiu: all.filter(m => m.status === "preco_caiu").length, fora: all.filter(m => m.status === "fora_do_ar").length };
  const list = useMemo(() => all.filter(m => {
    if (filter === "preco_caiu" && m.status !== "preco_caiu") return false;
    if (filter === "fora_do_ar" && m.status !== "fora_do_ar") return false;
    if (filter === "sem_loja" && m.lojas.length) return false;
    if (filter !== "fora_do_ar" && filter !== "todos" && m.status === "fora_do_ar") return false;
    const t = text.trim().toLocaleLowerCase("pt-BR");
    return !t || (m.produto?.titulo ?? "").toLocaleLowerCase("pt-BR").includes(t);
  }), [all, filter, text]);
  const visible = filter === "todos" ? list.filter(m => m.status !== "fora_do_ar").concat(list.filter(m => m.status === "fora_do_ar")) : list;
  const toggle = (id: string) => setSel(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const selected = all.filter(m => sel.has(m.id));
  const consulted = mine.data?.consultadoEm ? new Date(mine.data.consultadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";

  async function copyLinks(items: MyProduct[]) {
    const r = await getLinks({ data: { ids: items.map(i => i.id) } }).catch(() => null);
    void qc.invalidateQueries({ queryKey: ["my-products"] });
    const ok = (r?.links ?? []).filter(l => l.url);
    if (!ok.length) { toast.error(r?.links[0]?.error ?? "Não foi possível gerar o link."); return false; }
    await navigator.clipboard.writeText(ok.map(l => l.url).join("\n")).catch(() => {});
    toast.success(ok.length > 1 ? `${ok.length} links copiados.` : "Link copiado.");
    const fail = (r?.links ?? []).find(l => !l.url); if (fail) toast(fail.error ?? "Alguns links não foram gerados.");
    return true;
  }
  const removeSel = () => { void removeMany(selected.map(m => ({ fornecedor: m.fornecedor, itemId: m.itemId }))); setSel(new Set()); };
  const wsItem = all.find(m => m.fornecedor === "ml" && m.itemId === search.divulgar)?.produto ?? null;
  const setParam = (patch: Record<string, unknown>, replace = false) => void navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }), replace } as never);

  return <div className="v2-page">
    <TabHeader icon={Heart} badge="Meus produtos" word="MEUS" title="Sua seleção pronta para vender" description="Os produtos que você escolheu para divulgar, com link pronto e preço acompanhado."
      summary={{ value: all.length, label: "produtos salvos" }}
      actions={<><Button variant="outline" asChild><Link to="/painel/produtos"><Plus />Adicionar produtos</Link></Button>
        <Button variant="outline" disabled={!visible.length} onClick={() => setSel(new Set(visible.filter(m => m.status !== "fora_do_ar").map(m => m.id)))}><CheckSquare />Selecionar todos</Button></>}>
      <p className="lib-consulted">Preços consultados hoje às {consulted}</p>
    </TabHeader>
    <div className="lib-stats">
      <div className="v2-card"><span>Em alguma loja</span><strong className="tabular-nums">{all.filter(m => m.lojas.length).length}</strong></div>
      <div className="v2-card"><span>Sem loja</span><strong className="tabular-nums">{all.filter(m => !m.lojas.length).length}</strong></div>
      <div className="v2-card"><span>Preço caiu</span><strong className="tabular-nums">{counts.caiu}</strong></div>
      <div className="v2-card lib-stat-red"><span>Saiu do ar</span><strong className="tabular-nums">{counts.fora}</strong></div>
    </div>
    {mine.isLoading ? <div className="lib-grid">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="lib-card-skel-block" />)}</div>
    : !all.length ? <EmptyState icon={Heart} text="Você ainda não salvou nenhum produto." action={<Button asChild><Link to="/painel/produtos">Ver produtos validados</Link></Button>} />
    : <>
      <section className="v2-card lib-filters"><div className="lib-filter-row">
        <label className="lib-search"><Search aria-hidden="true" /><span className="sr-only">Buscar em Meus produtos</span><input value={text} onChange={e => setText(e.target.value)} placeholder="Buscar em Meus produtos…" /></label>
        <div className="lib-pills" role="group" aria-label="Filtrar">{([["todos", "Todos"], ["sem_loja", "Sem loja"], ["preco_caiu", "Preço caiu"], ["fora_do_ar", "Saiu do ar"]] as const).map(([id, l]) => <button key={id} type="button" className="lib-pill" aria-pressed={filter === id} onClick={() => setFilter(id)}>{l}</button>)}</div>
      </div></section>
      <div className="lib-grid">{visible.map(m => <MyCard key={m.id} m={m} checked={sel.has(m.id)} onToggle={() => toggle(m.id)} onCopy={() => copyLinks([m])} onRemove={() => void removeMany([{ fornecedor: m.fornecedor, itemId: m.itemId }])} onWorkspace={() => setParam({ divulgar: m.itemId })} />)}</div>
      {!visible.length && <div className="v2-card v2-empty"><p>Nada neste filtro.</p></div>}
    </>}
    {selected.length > 0 && <div className="lib-bulk" role="region" aria-label="Seleção">
      <strong className="tabular-nums">{selected.length} selecionados</strong>
      <Button variant="outline" onClick={() => setSel(new Set())}><X />Limpar</Button>
      <Button variant="outline" onClick={() => void copyLinks(selected.filter(m => m.status !== "fora_do_ar"))}><Copy />Copiar links</Button>
      <Button onClick={removeSel}>Remover</Button>
    </div>}
    {search.divulgar && /^MLB\d+$/.test(search.divulgar) && <WorkspaceHost id={search.divulgar} step={search.etapa} product={wsItem} onStep={st => setParam({ etapa: st === "visao" ? undefined : st }, true)} onClose={() => setParam({ divulgar: undefined, etapa: undefined })} />}
  </div>;
}

function MyCard({ m, checked, onToggle, onCopy, onRemove, onWorkspace }: { m: MyProduct; checked: boolean; onToggle: () => void; onCopy: () => Promise<boolean>; onRemove: () => void; onWorkspace: () => void }) {
  const p = m.produto; const off = m.status === "fora_do_ar";
  const [copied, setCopied] = useState(false);
  const openAt = useOpenAtSupplier();
  const St = STATUS[m.status];
  return <article className={`lib-card${off ? " is-off" : ""}`}>
    <div className="lib-card-photo">{p?.imagens[0] && <img src={p.imagens[0]} alt="" loading="lazy" decoding="async" />}
      <label className="lib-check"><input type="checkbox" checked={checked} disabled={off} onChange={onToggle} /><span className="sr-only">Selecionar {p?.titulo ?? "produto"}</span></label>
      <SupplierBadge f={m.fornecedor} /></div>
    <div className="lib-card-body">
      <div className="lib-card-title"><h3 title={p?.titulo}>{p?.titulo ?? "Produto indisponível"}</h3>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Mais ações"><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end"><DropdownMenuItem onSelect={onRemove}>Remover</DropdownMenuItem>
            <DropdownMenuItem disabled={off || m.fornecedor !== "ml"} onSelect={onWorkspace}>Abrir área de divulgação</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
      <strong className="lib-price tabular-nums">{p ? brl(p.preco) : "—"}</strong>
      {p && commissionText(p) && <span className={p.comissao ? "lib-comm" : "lib-comm lib-comm-muted"}>{commissionText(p)}</span>}
      <div className="lib-my-meta"><span className={`lib-status lib-status-${m.status}`}><St.icon aria-hidden="true" />{St.label}</span>{m.lojas.length ? m.lojas.map(l => <span key={l.id} className="lib-noshop is-in"><Store aria-hidden="true" />{l.nome}</span>) : <span className="lib-noshop"><Store aria-hidden="true" />Em nenhuma loja</span>}</div>
      <div className="lib-card-row">
        <AddToStore m={m} off={off} />
        <Button variant="outline" size="icon" disabled={off} aria-label={copied ? "Link copiado" : "Copiar link"} onClick={async () => { if (await onCopy()) { setCopied(true); window.setTimeout(() => setCopied(false), 2000); } }}>{copied ? <Check /> : <Copy />}</Button>
        <Button variant="outline" size="icon" disabled={off || !p} aria-label={`Abrir no ${m.fornecedor === "ml" ? "Mercado Livre" : "Shopee"}`} onClick={() => p && void openAt(p)}><ExternalLink /></Button>
      </div>
    </div>
  </article>;
}

function AddToStore({ m, off }: { m: MyProduct; off: boolean }) {
  const { abrir } = useJanela();
  return <Button className="lib-grow" disabled={off} onClick={() => abrir("escolher-loja", { id: m.id })}>Adicionar à loja</Button>;
}

export function ChooseStoreContent({ meuProdutoId, fechar }: { meuProdutoId: string; fechar: () => void }) {
  const stores = useStores(); const mine = useMyProducts(); const create = useCreateStore(); const add = useServerFn(addToStore); const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const m = mine.data?.items.find(x => x.id === meuProdutoId);
  if (!m) return <p>{mine.isLoading ? "Carregando…" : "Produto não encontrado."}</p>;
  const list = stores.data?.stores ?? [];
  return <div className="lib-add-body">
    <p className="lib-add-title">{m.produto?.titulo ?? "Produto"}</p>
    <ul className="lib-radios">{list.map(s => { const inIt = m.lojas.some(l => l.id === s.id); return <li key={s.id}>
      <Button variant="outline" className="lib-grow" disabled={inIt || !!busy} onClick={async () => {
        setBusy(s.id); const r = await add({ data: { lojaId: s.id, meuProdutoId: m.id } }).catch(() => null); setBusy(null);
        if (r?.ok) { toast.success(`Adicionado à loja “${s.nome}”.`); void qc.invalidateQueries({ queryKey: ["my-products"] }); void qc.invalidateQueries({ queryKey: ["stores"] }); fechar(); } else toast.error("Não foi possível adicionar.");
      }}>{inIt ? <Check /> : <Store />}{s.nome}{inIt ? " · já está" : busy === s.id ? " · adicionando…" : ""}</Button></li>; })}
      {stores.data && !list.length && <li>Você ainda não tem lojas.</li>}</ul>
    <div className="lib-add-actions"><Button variant="outline" onClick={fechar}>Fechar</Button><Button onClick={() => void create()}><Plus />Nova loja</Button></div>
  </div>;
}
