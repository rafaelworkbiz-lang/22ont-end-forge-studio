import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode , createContext, useContext } from "react";
import { extras, parseAparencia, temaVars, type Aparencia } from "@/lib/store-theme";
import { slugify } from "@/lib/divulgacao-core";
import { ChevronLeft, ChevronRight, ArrowDown, ArrowUpRight, BadgeCheck, CalendarClock, Search, ShieldCheck } from "lucide-react";
import { meliCategories } from "@/lib/meli-categories";
import { nicheHeadline, textOn, type Preset } from "@/lib/store-rules";

export type LojaView = { id: string; nome: string; nicho: string | null; logoUrl: string | null; logoEstilo: string; bannerUrl: string | null; bannerEstilo: string; cor: string; preset: Preset; aparencia?: Aparencia };
export type LojaItem = { meuProdutoId: string; fornecedor: "ml" | "shopee"; titulo: string; imagem: string | null; preco: number; categoria: string; precoOriginal?: number | null };

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const catName = (id: string) => meliCategories.find(c => c.id === id && id)?.name ?? "Achados";
const SUP = { ml: "Mercado Livre", shopee: "Shopee" } as const;

export function StoreLogo({ loja, size = 44 }: { loja: Pick<LojaView, "nome" | "logoUrl" | "logoEstilo" | "cor">; size?: number }) {
  if (loja.logoUrl) return <img src={loja.logoUrl} alt={`Logo ${loja.nome}`} width={size} height={size} className="loja-logo-img" style={{ width: size, height: size }} />;
  const ini = (loja.nome.trim()[0] ?? "L").toLocaleUpperCase("pt-BR");
  return <span className={`loja-mono loja-mono-${loja.logoEstilo}`} style={{ width: size, height: size, fontSize: size * 0.48, ["--loja-cor" as string]: loja.cor, ["--loja-on" as string]: textOn(loja.cor) }} aria-label={`Logo ${loja.nome}`} role="img">{ini}</span>;
}

export function bannerStyle(loja: Pick<LojaView, "bannerUrl" | "bannerEstilo" | "cor">) {
  if (loja.bannerUrl) return { bg: `center / cover no-repeat url("${loja.bannerUrl}")`, on: "#FFFFFF", image: true };
  if (loja.bannerEstilo === "escuro") return { bg: "#3D3A31", on: "#FFFFFF", image: false };
  if (loja.bannerEstilo === "neutro") return { bg: "#F4F2EC", on: "#16140F", image: false };
  return { bg: loja.cor, on: textOn(loja.cor), image: false };
}

/** Loja do afiliado: prévia, página pública e base das artes usam o mesmo tema. */
export function LojaPublica({ loja, itens, consultadoEm, mobile = false, hrefFor }: { loja: LojaView; itens: LojaItem[]; consultadoEm: string; mobile?: boolean; hrefFor: (i: LojaItem) => string }) {
  const [q, setQ] = useState(""); const [cat, setCat] = useState(""); const [slide, setSlide] = useState(0);
  const ap = loja.aparencia ?? parseAparencia(null, loja.cor);
  const cats = useMemo(() => [...new Set(itens.map(i => i.categoria).filter(Boolean))], [itens]);
  useEffect(() => { const h = decodeURIComponent(window.location.hash.slice(1)); const m = h && cats.find(c => slugify(c) === h); if (m) setCat(m); }, [cats]);
  const list = itens.filter(i => (!cat || i.categoria === cat) && (!q.trim() || i.titulo.toLocaleLowerCase("pt-BR").includes(q.trim().toLocaleLowerCase("pt-BR"))));
  const vars = temaVars(ap.tema); const ex = extras(ap.tema);
  const b = bannerStyle({ ...loja, cor: ap.tema.cor_destaque });
  const slides = [loja.bannerUrl, ...ap.banners].filter((u): u is string => !!u);
  useEffect(() => { if (ap.posicao !== "carrossel" || slides.length < 2) return; const t = window.setInterval(() => setSlide(x => (x + 1) % slides.length), 5000); return () => window.clearInterval(t); }, [ap.posicao, slides.length]);
  const featured = (loja.preset === "oferta" || loja.preset === "destaque" || loja.preset === "imersivo" || ap.posicao === "lateral") ? list[0] : undefined;
  const rest = loja.preset === "destaque" && featured ? list.slice(1) : list;
  const data = new Date(consultadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const frase = ap.frase || nicheHeadline(loja.nicho);
  const scrollTo = (e: MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); e.currentTarget.closest(".loja")?.querySelector("#achados")?.scrollIntoView({ behavior: "smooth" }); };
  const heroText = <div className="loja-hero-text"><span className="loja-chip">Achados da semana</span><h1>{frase}</h1>
    <a href="#achados" className="loja-cta" onClick={scrollTo}>{ap.botao || "Ver achados"} <ArrowDown aria-hidden="true" /></a></div>;
  const bg = ap.posicao === "carrossel" && slides.length ? { bg: `center / cover no-repeat url("${slides[slide % slides.length]}")`, on: "#FFFFFF", image: true } : b;
  const hero = ap.posicao === "nenhum" ? null
    : ap.posicao === "dividido" ? <section className={`loja-hero loja-hero-dividido is-${ap.altura} is-${ap.alinhamento}`} style={{ color: "var(--loja-ink)" }}>{heroText}<div className="loja-hero-img" style={{ background: b.bg }} /></section>
    : <section className={`loja-hero loja-hero-${ap.posicao} is-${ap.altura} is-${ap.alinhamento}`} style={{ background: bg.bg, color: bg.on }}>
      {bg.image && <span className="loja-hero-shade" aria-hidden="true" />}
      {ap.posicao === "faixa" ? <div className="loja-hero-text"><h1>{frase}</h1><a href="#achados" className="loja-cta" onClick={scrollTo}>{ap.botao || "Ver achados"}</a></div> : heroText}
      {featured && ap.posicao !== "faixa" && <a className="loja-offer" href={hrefFor(featured)} target="_blank" rel="noopener noreferrer"><span className="loja-offer-tag">Oferta do dia</span>
        {featured.imagem && <img src={featured.imagem} alt="" width={120} height={120} loading="lazy" />}<span className="loja-offer-name">{featured.titulo}</span><strong>{brl(featured.preco)}</strong></a>}
      {ap.posicao === "carrossel" && slides.length > 1 && <div className="loja-dots">{slides.map((_, i) => <button key={i} type="button" aria-label={`Banner ${i + 1}`} aria-pressed={i === slide % slides.length} onClick={() => setSlide(i)} />)}</div>}
    </section>;
  const grid = loja.preset === "carrossel"
    ? <section id="achados" className="loja-rows">{!list.length && <p className="loja-empty">Nenhum achado por aqui ainda.</p>}
        {[...new Set(list.map(i => i.categoria))].map(c => <div key={c || "x"} className="loja-row"><h2>{catName(c)}</h2><HScroll>{list.filter(i => i.categoria === c).map(i => <ProductCard key={i.meuProdutoId} i={i} href={hrefFor(i)} />)}</HScroll></div>)}</section>
    : <section id="achados" className={`loja-grid loja-grid-${loja.preset}`} key={loja.preset}>
      {!list.length && <p className="loja-empty">Nenhum achado por aqui ainda.</p>}
      {loja.preset === "destaque" && featured && <ProductCard i={featured} href={hrefFor(featured)} big />}
      {rest.map((i, n) => <ProductCard key={i.meuProdutoId} i={i} href={hrefFor(i)} row={loja.preset === "lista"} big={(loja.preset === "mosaico" && n % 5 === 0) || (loja.preset === "boutique" && n % 3 === 0)} mag={loja.preset === "revista" ? (n % 2 ? "r" : "l") : undefined} />)}
    </section>;
  return <SeloCtx.Provider value={ex.mostrar.desconto ? (ex.mostrar.seloTexto || "Oferta") : null}><div className={`loja loja-l-${loja.preset}${mobile ? " is-mobile" : ""}`} style={vars as CSSProperties}
    data-cartao={ex.cartao} data-botao={ex.botaoEstilo} data-espaco={ex.espaco} data-topo={ex.topo} data-foto={ex.foto} data-filtro={ex.filtro}
    data-sem-selo={ex.mostrar.selo ? undefined : ""} data-sem-preco={ex.mostrar.preco ? undefined : ""} data-sem-botao={ex.mostrar.botao ? undefined : ""}>
    <header className="loja-top"><div className="loja-brand"><StoreLogo loja={{ ...loja, cor: ap.tema.cor_destaque }} size={mobile ? 34 : 40} /><strong>{loja.nome}</strong></div>
      <label className="loja-search"><Search aria-hidden="true" /><span className="sr-only">Buscar na loja</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar achados…" /></label></header>
    {ap.posicao !== "entre" && hero}
    {loja.preset === "oferta" && <div className="loja-band">Oferta do dia · preços consultados em {data}</div>}
    {cats.length > 1 && loja.preset !== "carrossel" && ex.filtro !== "oculto" && <nav className="loja-cats v2-noscroll" aria-label="Categorias"><button type="button" aria-pressed={!cat} onClick={() => setCat("")}>Todos</button>{cats.map(c => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{catName(c)}</button>)}</nav>}
    {ap.posicao === "entre" && <>
      <section className={`loja-grid loja-grid-${loja.preset === "carrossel" ? "vitrine" : loja.preset}`}>{rest.slice(0, 4).map(i => <ProductCard key={i.meuProdutoId} i={i} href={hrefFor(i)} row={loja.preset === "lista"} />)}</section>
      {hero}</>}
    {ap.posicao === "entre" && loja.preset !== "carrossel" ? <section id="achados" className={`loja-grid loja-grid-${loja.preset}`}>{rest.slice(4).map(i => <ProductCard key={i.meuProdutoId} i={i} href={hrefFor(i)} row={loja.preset === "lista"} />)}</section> : grid}
    {ex.rodape === "completo" && <section className="loja-trust">
      <div><ShieldCheck aria-hidden="true" /><strong>Compra segura no fornecedor</strong><span>O pagamento e a entrega são feitos no Mercado Livre ou na Shopee.</span></div>
      <div><BadgeCheck aria-hidden="true" /><strong>Escolhidos a dedo</strong><span>Produtos selecionados por {loja.nome}.</span></div>
      <div><CalendarClock aria-hidden="true" /><strong>Preço pode mudar</strong><span>Preços consultados em {data}. Confira o valor final no fornecedor.</span></div>
    </section>}
    <footer className="loja-foot"><p>{loja.nome} é uma loja afiliada. Ao comprar pelos links, o afiliado pode receber comissão, sem custo extra para você. As compras são feitas no Mercado Livre e na Shopee.</p><span>Feito com afiliaplace</span></footer>
  </div></SeloCtx.Provider>;
}

/** Lista horizontal com rolagem invisível, bordas esmaecidas e setas. */
export function HScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null); const [edge, setEdge] = useState({ l: false, r: false });
  const check = () => { const el = ref.current; if (!el) return; setEdge({ l: el.scrollLeft > 4, r: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 }); };
  useEffect(() => { check(); const el = ref.current; if (!el) return; const ro = new ResizeObserver(check); ro.observe(el); return () => ro.disconnect(); }, []);
  const go = (d: number) => ref.current?.scrollBy({ left: d * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return <div className={`hs ${edge.l ? "has-l" : ""} ${edge.r ? "has-r" : ""} ${className}`}>
    {edge.l && <button type="button" className="hs-btn hs-l" aria-label="Anterior" onClick={() => go(-1)}><ChevronLeft /></button>}
    <div ref={ref} className="hs-track v2-noscroll" onScroll={check} tabIndex={0}>{children}</div>
    {edge.r && <button type="button" className="hs-btn hs-r" aria-label="Próximo" onClick={() => go(1)}><ChevronRight /></button>}
  </div>;
}

const SeloCtx = createContext<string | null>(null);
function ProductCard({ i, href, big, row, mag }: { i: LojaItem; href: string; big?: boolean; row?: boolean; mag?: "l" | "r" | undefined }) {
  const selo = useContext(SeloCtx);
  const pct = i.precoOriginal && i.precoOriginal > i.preco ? Math.round((1 - i.preco / i.precoOriginal) * 100) : 0;
  return <article className={`loja-card${big ? " is-big" : ""}${row ? " is-row" : ""}${mag ? ` is-mag is-mag-${mag}` : ""}`}>
    <div className="loja-card-photo">{i.imagem ? <img src={i.imagem} alt="" width={240} height={240} loading="lazy" decoding="async" /> : null}<span className={`loja-sup loja-sup-${i.fornecedor}`}>{SUP[i.fornecedor]}</span>{i.meuProdutoId.startsWith("exemplo-") && <span className="loja-exemplo">Exemplo</span>}{selo !== null && (selo || pct > 0) && <span className="loja-off">{[selo, pct > 0 ? `-${pct}%` : ""].filter(Boolean).join(" · ")}</span>}</div>
    <div className="loja-card-body"><h3 title={i.titulo}>{i.titulo}</h3><strong className="tabular-nums">{selo !== null && pct > 0 && <s className="loja-de">{brl(i.precoOriginal!)}</s>}{brl(i.preco)}</strong>
      <a className="loja-buy" href={href} target="_blank" rel="noopener noreferrer">Comprar <ArrowUpRight aria-hidden="true" /></a></div>
  </article>;
}
