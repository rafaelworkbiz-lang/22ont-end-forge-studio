import { useUrlFilter } from "@/components/use-url-filter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { BarChart3, Check, ChevronLeft, ChevronRight, CircleDot, Copy, Flame, Heart, Plus, Search, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TabHeader } from "@/components/tab-header";
import { getLibraryItem, libraryStats, listLibrary, type LibraryItem } from "@/lib/library.functions";
import { SUPPLIER_NAME, parseProductKey, productKey, type Supplier } from "@/lib/library-rules";
import { meliCategories } from "@/lib/meli-categories";
import { whatsappShareUrl } from "@/lib/product-share";
import { useJanela } from "@/components/janela";
import { AddContent, SupplierBadge, WorkspaceHost, brl, catName, commissionText, fmtStamp, soldText, useMyProducts, useOpenAtSupplier, useSupplierConnections } from "@/components/library-shared";

type Sort = "vendidos" | "comissao" | "preco" | "recentes";
const SORTS: { id: Sort; label: string }[] = [{ id: "vendidos", label: "Mais vendidos" }, { id: "comissao", label: "Maior comissão" }, { id: "preco", label: "Menor preço" }, { id: "recentes", label: "Mais recentes" }];
const CATS = meliCategories.filter(c => c.id);
type SearchParams = { produto?: string | undefined; divulgar?: string | undefined; etapa?: string | undefined };

export function ProductLibrary() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as SearchParams;
  const list = useServerFn(listLibrary), stats = useServerFn(libraryStats), getItem = useServerFn(getLibraryItem);
  const mine = useMyProducts();
  const conns = useSupplierConnections();
  const [q, setQ] = useUrlFilter<string>("busca", "");
  const [input, setInput] = useState(q);
  const [fornecedor, setFornecedor] = useUrlFilter<"" | Supplier>("fornecedor", "", ["", "ml", "shopee"]);
  const [categoria, setCategoria] = useUrlFilter<string>("categoria", "");
  const [sort, setSort] = useUrlFilter<Sort>("ordem", "vendidos", ["vendidos", "comissao", "preco", "recentes"]);
  const { abrir } = useJanela();
  const openAdd = (p: LibraryItem) => abrir("adicionar-produto", { f: p.fornecedor, id: p.itemId });
  useEffect(() => { const t = window.setTimeout(() => { if (input.trim() !== q) setQ(input.trim()); }, 300); return () => window.clearTimeout(t); }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

  const s = useQuery({ queryKey: ["library-stats"], queryFn: () => stats(), staleTime: 5 * 60_000 });
  const lib = useInfiniteQuery({
    queryKey: ["library", q, fornecedor, categoria, sort],
    queryFn: ({ pageParam }) => list({ data: { q, fornecedor, categoria, sort, page: pageParam } }),
    initialPageParam: 0, getNextPageParam: (last, pages) => (last.hasMore ? pages.length : undefined), staleTime: 5 * 60_000,
  });
  const items = useMemo(() => lib.data?.pages.flatMap(p => p.items) ?? [], [lib.data]);
  const saved = useMemo(() => new Set((mine.data?.items ?? []).map(m => productKey(m.fornecedor, m.itemId))), [mine.data]);
  const addedNow = (mine.data?.items ?? []).filter(m => Date.now() - new Date(m.adicionadoEm).getTime() < 24 * 3600_000).length;

  // Pop-up "Ver produto" na URL: ?produto=ml:MLB123
  const open = parseProductKey(search.produto);
  const openItem = items.find(i => open && i.fornecedor === open.fornecedor && i.itemId === open.itemId);
  const detail = useQuery({ queryKey: ["library-item", search.produto], queryFn: () => getItem({ data: open! }), enabled: !!open && !openItem, staleTime: 5 * 60_000 });
  const viewing = openItem ?? detail.data?.item ?? null;
  const setParam = useCallback((patch: Partial<SearchParams>, replace = false) => void navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }), replace } as never), [navigate]);
  const lastCard = useRef<string | null>(null);
  const closeView = () => { setParam({ produto: undefined }); const k = lastCard.current; window.setTimeout(() => k && document.querySelector<HTMLElement>(`[data-card="${CSS.escape(k)}"] .lib-card-view`)?.focus(), 40); };
  const openView = (p: LibraryItem) => { lastCard.current = productKey(p.fornecedor, p.itemId); setParam({ produto: lastCard.current }); };
  const wsId = search.divulgar ?? (search.produto && /^MLB\d+$/.test(search.produto) ? search.produto : undefined);
  const wsItem = wsId ? items.find(i => i.fornecedor === "ml" && i.itemId === wsId) ?? null : null;

  const scroller = useRef<HTMLDivElement>(null);
  const scrollCats = (d: number) => scroller.current?.scrollBy({ left: d * 240, behavior: "smooth" });

  return <div className="v2-page">
    <TabHeader icon={Flame} badge="Produtos validados" word="QUENTES" title="O que está vendendo agora" description="Produtos campeões de venda, conferidos todos os dias. Adicione aos seus produtos e divulgue com o seu link."
      actions={<Button variant="outline" asChild><Link to="/painel/meus-produtos"><Heart />Meus produtos · {mine.data?.items.length ?? 0}</Link></Button>}>
      <div className="lib-head-chips"><span className="v2-badge tabular-nums">{s.data?.total ?? "…"} disponíveis na sua conta</span><span className="v2-badge">Cópias em Meus produtos ficam editáveis</span></div>
    </TabHeader>

    <div className="lib-stats">
      <div className="v2-card"><span>Produtos disponíveis</span><strong className="tabular-nums">{s.data?.total ?? "—"}</strong></div>
      <div className="v2-card"><span>Categorias</span><strong className="tabular-nums">{s.data?.categorias ?? "—"}</strong></div>
      <div className="v2-card"><span>Última atualização</span><strong className="tabular-nums">{fmtStamp(s.data?.atualizadoEm)}</strong></div>
      <div className="v2-card lib-stat-yellow"><span>Adicionados agora</span><strong className="tabular-nums">{addedNow}</strong></div>
    </div>

    <section className="v2-card lib-filters" aria-label="Filtros">
      <div className="lib-filter-row">
        <label className="lib-search"><Search aria-hidden="true" /><span className="sr-only">Buscar produtos</span><input value={input} onChange={e => setInput(e.target.value)} placeholder="Buscar na biblioteca…" /></label>
        <div className="lib-pills" role="group" aria-label="Fornecedor">
          {(["", "ml", "shopee"] as const).map(f => <button key={f || "all"} type="button" className="lib-pill" aria-pressed={fornecedor === f} onClick={() => setFornecedor(f)}>{f ? SUPPLIER_NAME[f] : "Todos"}</button>)}
        </div>
        <label className="lib-select"><span className="sr-only">Categoria</span><select value={categoria} onChange={e => setCategoria(e.target.value)}><option value="">Todas as categorias</option>{CATS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="lib-select"><span className="sr-only">Ordenar</span><select value={sort} onChange={e => setSort(e.target.value as Sort)}>{SORTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
      </div>
      <div className="lib-carousel">
        <button type="button" className="lib-arrow" aria-label="Categorias anteriores" onClick={() => scrollCats(-1)}><ChevronLeft /></button>
        <div className="lib-cats" ref={scroller}>
          <button type="button" className="lib-pill" aria-pressed={!categoria} onClick={() => setCategoria("")}>Todas</button>
          {CATS.map(c => <button key={c.id} type="button" className="lib-pill" aria-pressed={categoria === c.id} onClick={() => setCategoria(c.id)}>{c.name}</button>)}
        </div>
        <button type="button" className="lib-arrow" aria-label="Próximas categorias" onClick={() => scrollCats(1)}><ChevronRight /></button>
      </div>
      <p className="lib-note"><ShieldCheck aria-hidden="true" />Somente produtos ativos, novos, de vendedores bem avaliados e disponíveis para a sua conta. <button type="button" className="lib-link" onClick={() => abrir("como-validamos")}>Como validamos</button></p>
    </section>

    {lib.data?.pages[0]?.error ? <div className="v2-card v2-empty"><p>{lib.data.pages[0].error}</p><Button onClick={() => lib.refetch()}>Tentar de novo</Button></div> : <>
      <div className="lib-grid" aria-busy={lib.isLoading}>
        {items.map(p => <LibraryCard key={productKey(p.fornecedor, p.itemId)} p={p} saved={saved.has(productKey(p.fornecedor, p.itemId))} connected={conns.loading || conns[p.fornecedor]} onView={() => openView(p)} onAdd={() => { lastCard.current = productKey(p.fornecedor, p.itemId); openAdd(p); }} />)}
        {(lib.isLoading || lib.isFetchingNextPage) && Array.from({ length: 8 }, (_, i) => <CardSkeleton key={`s${i}`} />)}
      </div>
      {!lib.isLoading && items.length === 0 && <div className="v2-card v2-empty"><p>{q || fornecedor || categoria ? "Nenhum produto com esses filtros." : "A biblioteca está sendo preparada. Volte em alguns minutos."}</p></div>}
      {lib.hasNextPage && <div className="lib-more"><Button variant="outline" onClick={() => void lib.fetchNextPage()} disabled={lib.isFetchingNextPage}>{lib.isFetchingNextPage ? "Carregando…" : "Carregar mais"}</Button></div>}
    </>}

    <ViewDialog p={open ? viewing : null} loading={!!open && !viewing && detail.isLoading} open={!!open} saved={viewing ? saved.has(productKey(viewing.fornecedor, viewing.itemId)) : false}
      onClose={closeView} onAdd={() => viewing && openAdd(viewing)} onWorkspace={() => viewing && setParam({ produto: undefined, divulgar: viewing.itemId })} />
    {wsId && <WorkspaceHost id={wsId} step={search.etapa} product={wsItem} onStep={st => setParam({ etapa: st === "visao" ? undefined : st }, true)} onClose={() => setParam({ divulgar: undefined, produto: undefined, etapa: undefined })} />}
  </div>;
}

function CardSkeleton() {
  return <div className="lib-card lib-card-skel" aria-hidden="true"><Skeleton className="lib-card-photo" /><div className="lib-card-body"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-10 w-full" /></div></div>;
}

function LibraryCard({ p, saved, connected, onView, onAdd }: { p: LibraryItem; saved: boolean; connected: boolean; onView: () => void; onAdd: () => void }) {
  const navigate = useNavigate();
  const sold = soldText(p), comm = commissionText(p);
  return <article className="lib-card" data-card={productKey(p.fornecedor, p.itemId)}>
    <div className="lib-card-photo">{p.imagens[0] && <img src={p.imagens[0]} alt="" loading="lazy" decoding="async" />}
      <span className="lib-cat-badge">{catName(p.categoria)}</span><SupplierBadge f={p.fornecedor} />
      {!connected && <span className="lib-connect-badge">Conecte {p.fornecedor === "ml" ? "o ML" : "a Shopee"}</span>}</div>
    <div className="lib-card-body">
      <h3 title={p.titulo}>{p.titulo}</h3>
      <strong className="lib-price tabular-nums">{brl(p.preco)}</strong>
      {sold && <span className="lib-sold">{sold}</span>}
      {comm && <span className={p.comissao ? "lib-comm" : "lib-comm lib-comm-muted"}>{comm}</span>}
      <div className="lib-card-row"><Button variant="outline" className="lib-card-view" onClick={onView}>Ver produto</Button>
        <Button variant="outline" size="icon" aria-label={`Analisar métricas de ${p.titulo}`} onClick={onView}><BarChart3 /></Button></div>
      {!connected ? <Button onClick={() => void navigate({ to: "/painel/fornecedores" })}><Truck />Conectar {p.fornecedor === "ml" ? "ML" : "Shopee"}</Button>
        : saved ? <Button variant="outline" className="lib-saved" onClick={onAdd}><Check />Em Meus produtos</Button>
        : <Button onClick={onAdd}><Plus />Adicionar a Meus produtos</Button>}
    </div>
  </article>;
}

function ViewDialog({ p, loading, open, saved, onClose, onWorkspace }: { p: LibraryItem | null; loading: boolean; open: boolean; saved: boolean; onClose: () => void; onAdd?: () => void; onWorkspace: () => void }) {
  const [pic, setPic] = useState(0);
  const [adding, setAdding] = useState(false);
  const onAdd = () => setAdding(true);
  const openAt = useOpenAtSupplier();
  useEffect(() => { setPic(0); setAdding(false); }, [p?.itemId]);
  const shareText = p ? `${p.titulo}\nPor ${brl(p.preco)} na ${SUPPLIER_NAME[p.fornecedor]}` : "";
  return <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}><DialogContent className="lib-dialog lib-view">
    {!p ? <><DialogTitle className="sr-only">Produto</DialogTitle><DialogDescription>{loading ? "Carregando produto…" : "Produto não encontrado na biblioteca."}</DialogDescription></> : <div className="lib-view-grid">
      <div className="lib-gallery"><div className="lib-gallery-main">{p.imagens[pic] && <img src={p.imagens[pic]} alt={p.titulo} />}</div>
        {p.imagens.length > 1 && <div className="lib-thumbs">{p.imagens.slice(0, 4).map((src, i) => <button key={src} type="button" aria-label={`Foto ${i + 1}`} aria-pressed={pic === i} onClick={() => setPic(i)}><img src={src} alt="" loading="lazy" /></button>)}</div>}</div>
      {adding ? <div className="lib-view-info lib-addpanel" key="add"><DialogTitle className="lib-addpanel-title">Adicionar a Meus produtos</DialogTitle><DialogDescription className="sr-only">Escolha onde adicionar</DialogDescription><AddContent product={p} saved={saved} compact fechar={() => setAdding(false)} /></div>
      : <div className="lib-view-info lib-infopanel" key="info">
        <div className="lib-view-badges">{p.validado && <span className="lib-vbadge lib-vbadge-ok"><ShieldCheck aria-hidden="true" />Validado</span>}<span className="lib-vbadge">{catName(p.categoria)}</span><span className="lib-vbadge"><CircleDot aria-hidden="true" />Novo e ativo</span><SupplierBadge f={p.fornecedor} /></div>
        <DialogTitle className="lib-view-title">{p.titulo}</DialogTitle>
        <DialogDescription className="sr-only">Detalhes do produto</DialogDescription>
        <strong className="lib-view-price tabular-nums">{brl(p.preco)}</strong>
        {p.precoOriginal && p.precoOriginal > p.preco && <s className="lib-view-old tabular-nums">{brl(p.precoOriginal)}</s>}
        <dl className="lib-view-blocks">
          <div><dt>Vendas</dt><dd>{soldText(p) ?? "—"}</dd></div>
          <div><dt>Comissão estimada</dt><dd>{commissionText(p)?.replace("Comissão estimada ", "").replace("Comissão: ", "") ?? "—"}</dd></div>
          <div><dt>Vendedor</dt><dd>{p.fornecedor === "ml" ? (p.reputacao ? `Reputação ${repName(p.reputacao)}` : "—") : p.avaliacao ? `Avaliação ${p.avaliacao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ★` : "—"}</dd></div>
          <div><dt>Preço consultado</dt><dd className="tabular-nums">{fmtStamp(p.atualizadoEm)}</dd></div>
        </dl>
        <div className="lib-view-actions">
          {saved ? <Button variant="outline" onClick={onAdd}><Check />Em Meus produtos</Button> : <Button onClick={onAdd}><Plus />Adicionar a Meus produtos</Button>}
          {p.fornecedor === "ml" ? <Button variant="outline" onClick={onWorkspace}>Abrir área de divulgação</Button>
            : <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(shareText).then(() => toast.success("Mensagem copiada.")); }}><Copy />Copiar mensagem</Button>}
          <Button variant="outline" onClick={() => void openAt(p)}>Abrir no {SUPPLIER_NAME[p.fornecedor]} ↗</Button>
          {p.fornecedor === "shopee" && <Button variant="ghost" asChild><a href={whatsappShareUrl(shareText)} target="_blank" rel="noopener noreferrer">Enviar no WhatsApp</a></Button>}
        </div>
      </div>}
    </div>}
  </DialogContent></Dialog>;
}
const REP: Record<string, string> = { "3_yellow": "amarela", "4_light_green": "verde-clara", "5_green": "verde", "2_orange": "laranja", "1_red": "vermelha" };
const repName = (r: string) => REP[r] ?? r;
