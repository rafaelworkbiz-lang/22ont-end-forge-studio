import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Menu, X } from "lucide-react";
import mlLogo from "@/assets/fornecedor-mercadolivre.png.asset.json";
import shopeeLogo from "@/assets/fornecedor-shopee.png.asset.json";
import imgAirFryer from "@/assets/catalog-air-fryer.jpg";
import imgBottle from "@/assets/catalog-bottle.jpg";
import imgCharger from "@/assets/catalog-charger.jpg";
import imgWatch from "@/assets/catalog-watch.jpg";
import imgHeadphones from "@/assets/catalog-headphones.jpg";
import videoAsset from "@/assets/afiliaplace-video.mp4.asset.json";

/** Valor da parcela do Vitalício em 12x. Confirmar no checkout da Applyfy antes de publicar. */
export const PRECO_VITALICIO_PARCELA = "24,75";
/** Vídeo de apresentação (bucket público "lp"). null = ainda não disponível ("Em breve"). */
const VIDEO_SRC: string | null = videoAsset.url;
const VIDEO_VTT: string | null = null;

const CHECKOUT_MENSAL = "https://checkout.applyfy.com.br/checkout/cmvv7ihvg0ciu01q6pofcauy2?offer=9uw4neg";
const CHECKOUT_VITALICIO = "https://checkout.applyfy.com.br/checkout/cmvv7iqfj04ga01n60jjth2ss?offer=ggo7ayu";

export const FAQ: [string, string][] = [
  ["Preciso já ser afiliado do Mercado Livre ou da Shopee?", "Sim. O cadastro nos programas de afiliados do Mercado Livre e da Shopee é gratuito. Depois você conecta essas contas aqui, e todos os links saem com a sua identificação."],
  ["Quanto eu ganho por venda?", "A comissão é definida pelo Mercado Livre e pela Shopee, varia por categoria e é paga por eles. O AfiliaPlace não promete ganhos: o resultado depende dos produtos, da divulgação e do seu público."],
  ["Quantas lojas posso criar?", "Até 3 no plano Mensal e até 10 no Vitalício. Cada loja tem nome, visual e link próprios."],
  ["Como funciona a IA de logo e banner?", "Você informa o nome e o estilo da loja; a IA gera propostas de logo e banners com as fotos dos seus produtos. Você escolhe a que preferir e pode gerar de novo dentro do limite do plano."],
  ["Posso divulgar em qualquer grupo?", "O AfiliaPlace sugere grupos públicos de ofertas e prepara as mensagens; quem publica é você. Siga sempre as regras de cada grupo e evite enviar a mesma mensagem em excesso."],
  ["Funciona com a Shopee?", "Sim. Você conecta sua conta de afiliado da Shopee e os produtos saem com o seu link, assim como no Mercado Livre."],
  ["Funciona no celular?", "Sim. O painel e as lojas funcionam no navegador do celular e do notebook, sem instalar aplicativo."],
  ["O Vitalício pode ser parcelado?", "Sim, em até 12x no cartão, ou R$ 297,00 à vista. É um pagamento único: não há mensalidade depois."],
  ["E se eu cancelar o Mensal?", "Você usa até o fim do período pago. Depois disso, as lojas ficam pausadas e voltam ao ar quando você reativar a assinatura."],
];

const CHAPTERS: [number, string][] = [
  [12, "Conecte seus fornecedores"], [20, "Escolha produtos validados"], [30, "Sua loja, sua marca (com IA)"],
  [44, "Coloque no ar"], [52, "Divulgue nos grupos"], [62, "Acompanhe os resultados"],
];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const STEPS: [string, string][] = [
  ["Conecte os fornecedores", "Ligue suas contas de afiliado do Mercado Livre e da Shopee. Os links já saem com a sua identificação."],
  ["Escolha produtos validados", "Navegue por produtos em alta, filtre por categoria e comissão e guarde em Meus produtos."],
  ["Monte sua loja", "Dê um nome, escolha o tema e deixe a IA criar o logo e o banner."],
  ["Coloque no ar", "Uma conferência rápida e a loja ganha link próprio para compartilhar."],
  ["Divulgue", "Mensagens e artes prontas para grupos de WhatsApp e Facebook. Quem publica é você."],
];

const SOZINHO = ["Procurar produto bom um por um", "Montar link de afiliado na mão", "Criar arte e texto do zero", "Mandar link solto sem vitrine", "Não saber o que teve clique"];
const COM = ["Produtos validados em um só lugar", "Links com a sua identificação", "Mensagens e artes prontas", "Loja com a sua marca e link próprio", "Painel de cliques e visitas"];

const MENSAL_ITEMS = ["Até 3 lojas com link próprio", "Mercado Livre e Shopee", "Links com a sua tag de afiliado", "Produtos validados e Meus produtos", "Logo e banner com IA", "Grupos de Facebook e WhatsApp", "Scripts de mensagem prontos", "Dashboard de resultados", "Use no celular e no notebook", "Comunidade e suporte por e-mail"];
const VITAL_ITEMS = ["Até 10 lojas com link próprio", "Tudo do Mensal", "Grupos de Facebook e WhatsApp", "Links com a sua tag de afiliado", "Mais gerações de logo e banner com IA", "Atualizações sem custo extra", "Suporte prioritário", "Sem mensalidade"];

type Cena = "mensal" | "vitalicio";
const CENA_MS = 5000;
const PLANOS = {
  mensal: { titulo: "Mensal", selo: "Para começar", lojas: 3, itens: MENSAL_ITEMS, botao: "Assinar mensal" },
  vitalicio: { titulo: "Vitalício", selo: "Mais escolhido", lojas: 10, itens: VITAL_ITEMS, botao: "Quero o vitalício" },
} as const;

function GradeLojas({ total, aceso, extra }: { total: number; aceso: boolean; extra?: string | undefined }) {
  return (
    <div className="lp2-grade" data-aceso={aceso} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="lp2-loja" style={{ ["--i" as string]: i }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M3 9h18M9 20v-6h6v6" /></svg>
        </span>
      ))}
      {extra && <span className="lp2-loja-extra">{extra}</span>}
    </div>
  );
}

function CartaoPlano({ plano, ativo, onEntrar, onSair, preco, url }: {
  plano: Cena; ativo: boolean; onEntrar: () => void; onSair: () => void; preco: React.ReactNode; url: string;
}) {
  const p = PLANOS[plano];
  const id = `plano-${plano}`;
  return (
    <article
      className={`lp2-cartao lp2-cartao--${plano}`} data-ativo={ativo} aria-labelledby={id}
      onMouseEnter={onEntrar} onMouseLeave={onSair} onFocus={onEntrar}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) onSair(); }}
      onTouchStart={onEntrar}
    >
      <div className="lp2-cartao-top"><h3 id={id}>{p.titulo}</h3><span className={`lp2-selo lp2-selo--${plano}`}>{p.selo}</span></div>
      <div className="lp2-cartao-preco">{preco}</div>
      <div className="lp2-lojas-box">
        <p><strong>{p.lojas} lojas</strong> no ar</p>
        <GradeLojas total={p.lojas} aceso={ativo} extra={plano === "mensal" ? "+7 no Vitalício" : undefined} />
      </div>
      <ul>{p.itens.map((s) => <li key={s}><Check size={18} aria-hidden="true" />{s}</li>)}</ul>
      <a href={url} target="_blank" rel="noopener noreferrer" className={`lp2-btn lp2-block lp2-cartao-btn ${plano === "mensal" ? "lp2-btn-ghost" : "lp2-btn-dark"}`}>{p.botao}</a>
    </article>
  );
}

function SecaoPlanos({ mensalPrice, vitalPrice, mensalUrl, vitalUrl }: { mensalPrice: string; vitalPrice: string; mensalUrl: string; vitalUrl: string }) {
  const ref = useRef<HTMLElement>(null);
  const [cena, setCena] = useState<Cena>("vitalicio");
  const [foco, setFoco] = useState<Cena | null>(null);
  const [pausado, setPausado] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const [abaVisivel, setAbaVisivel] = useState(true);
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzido(mq.matches);
    const onMq = () => setReduzido(mq.matches);
    mq.addEventListener("change", onMq);
    const onVis = () => setAbaVisivel(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    let io: IntersectionObserver | undefined;
    if (ref.current && "IntersectionObserver" in window) {
      io = new IntersectionObserver((entries) => { const e = entries[0]; if (!e) return;
        setVisivel(e.isIntersecting);
        if (e.isIntersecting) setCena("vitalicio");
      }, { threshold: 0.25 });
      io.observe(ref.current);
    }
    return () => { mq.removeEventListener("change", onMq); document.removeEventListener("visibilitychange", onVis); io?.disconnect(); };
  }, []);

  const cenaAtual = foco ?? cena;
  void pausado; void setPausado;
  const rodando = !reduzido && visivel && abaVisivel && !foco;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trocas = useRef(0);
  const ultima = useRef(cenaAtual);
  if (ultima.current !== cenaAtual) { ultima.current = cenaAtual; trocas.current += 1; }
  const entrar = (c: Cena) => { if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setFoco(c), 1000); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const calc = () => {
      raf = 0;
      const r = el.getBoundingClientRect(); const vh = window.innerHeight;
      const entrada = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6)));
      const saida = Math.min(1, Math.max(0, r.bottom / (vh * 0.6)));
      const p = Math.min(entrada, saida);
      el.style.setProperty("--raio", `${(1 - p) * 56}px`);
      el.style.setProperty("--sobe", `${(1 - entrada) * 60}px`);
      el.style.setProperty("--lado", `${(1 - p) * 4}%`);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true }); window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!rodando) return;
    const t = setInterval(() => setCena((c) => (c === "vitalicio" ? "mensal" : "vitalicio")), CENA_MS);
    return () => clearInterval(t);
  }, [rodando]);

  const sair = () => { if (timer.current) clearTimeout(timer.current); setFoco((f) => { if (f) setCena(f); return null; }); };
  const faixa = "MENSAL · 3 LOJAS · VITALÍCIO · 10 LOJAS · ";

  return (
    <section id="planos" ref={ref} className="lp2-palco" data-cena={cenaAtual} data-rodando={rodando} style={{ ["--cena-ms" as string]: `${CENA_MS}ms` }}>
      {trocas.current > 0 && <span key={trocas.current} className="lp2-palco-pop" aria-hidden="true" />}
      <div className="lp2-palco-faixa-wrap" aria-hidden="true"><div className="lp2-palco-faixa">{faixa.repeat(3)}{faixa.repeat(3)}</div></div>
      <div className="lp2-palco-inner">
        <header className="lp2-palco-head">
          <p className="lp2-eyebrow">PLANOS</p>
          <h2>Dois planos. Sem letra miúda.</h2>
          <p className="lp2-lead">Os dois incluem Mercado Livre e Shopee, produtos validados, IA de logo e banner e a comunidade. A diferença está em quantas lojas você coloca no ar.</p>
          <div className="lp2-indicador">
            <span aria-hidden="true" className="lp2-indicador-trilhos">
              {(["mensal", "vitalicio"] as Cena[]).map((c) => (
                <span key={c} className="lp2-indicador-trilho">
                  {cenaAtual === c && <span key={`${cena}-${rodando}`} className={`lp2-indicador-barra ${rodando ? "run" : "full"}`} />}
                </span>
              ))}
            </span>
          </div>
        </header>
        <div className="lp2-cartoes">
          <CartaoPlano plano="mensal" ativo={cenaAtual === "mensal"} onEntrar={() => entrar("mensal")} onSair={sair} url={mensalUrl}
            preco={<p className="lp2-price"><small>R$</small> {mensalPrice} <small>/mês</small></p>} />
          <CartaoPlano plano="vitalicio" ativo={cenaAtual === "vitalicio"} onEntrar={() => entrar("vitalicio")} onSair={sair} url={vitalUrl}
            preco={<><p className="lp2-price big"><small>12x de R$</small> {PRECO_VITALICIO_PARCELA}</p><p className="lp2-cash">ou R$ {vitalPrice} à vista · pagamento único</p></>} />
        </div>
      </div>
    </section>
  );
}

function track(event: string, data?: Record<string, unknown>) {
  try {
    const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
    if (w.gtag) w.gtag("event", event, data);
    else w.dataLayer?.push({ event, ...data });
  } catch { /* sem analytics */ }
}

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".lp2 [data-reveal]"));
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido || !("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      e.target.classList.toggle("in", e.isIntersecting);
    }), { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
    let raf = 0;
    const calc = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        if (el.id === "planos") continue;
        const r = el.getBoundingClientRect();
        const saida = r.bottom < vh * 0.35 ? Math.min(1, (vh * 0.35 - r.bottom) / (vh * 0.35)) : 0;
        el.style.setProperty("--saida", saida.toFixed(3));
      }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    window.addEventListener("scroll", on, { passive: true });
    calc();

    let anim = 0;
    const parar = () => { if (anim) { cancelAnimationFrame(anim); anim = 0; } };
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey) return;
      const hash = a.getAttribute("href")!;
      const alvo = hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null;
      if (!alvo) return;
      ev.preventDefault();
      const nav = document.querySelector<HTMLElement>(".lp2-nav");
      const destino = Math.max(0, alvo.getBoundingClientRect().top + window.scrollY - (nav ? nav.offsetHeight + 24 : 80));
      history.replaceState(null, "", hash);
      parar();
      const inicio = window.scrollY, dist = destino - inicio;
      const dur = Math.min(1600, Math.max(700, Math.abs(dist) * 0.45));
      const t0 = performance.now();
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const passo = (agora: number) => {
        const t = Math.min(1, (agora - t0) / dur);
        window.scrollTo(0, inicio + dist * ease(t));
        anim = t < 1 ? requestAnimationFrame(passo) : 0;
      };
      anim = requestAnimationFrame(passo);
    };
    document.addEventListener("click", onClick);
    const evs = ["wheel", "touchstart", "keydown"] as const;
    evs.forEach((n) => window.addEventListener(n, parar, { passive: true }));
    return () => {
      io.disconnect(); window.removeEventListener("scroll", on); if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick); evs.forEach((n) => window.removeEventListener(n, parar)); parar();
    };
  }, []);
}

const NAV: [string, string][] = [["#video", "Vídeo"], ["#como-funciona", "Como funciona"], ["#recursos", "Recursos"], ["#planos", "Planos"], ["#faq", "Dúvidas"]];

function Brand() {
  return <span className="lp2-brand"><img src="/mascot-64.webp" alt="" width={32} height={32} />AfiliaPlace</span>;
}

function VideoSection() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const sent = useRef<Set<string>>(new Set());
  const start = (t = 0) => {
    const v = ref.current; if (!v || !VIDEO_SRC) return;
    setPlaying(true);
    v.loop = false;
    v.muted = false;
    v.currentTime = t;
    void v.play();
  };
  useEffect(() => {
    const v = ref.current; if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { v.pause(); return; }
    v.muted = true; void v.play().catch(() => {});
  }, []);
  const onTime = () => {
    const v = ref.current; if (!v || !playing) return;
    let idx = -1; CHAPTERS.forEach(([t], i) => { if (v.currentTime >= t) idx = i; }); setCurrent(idx);
    if (v.duration && v.currentTime / v.duration >= 0.5 && !sent.current.has("50")) { sent.current.add("50"); track("video_50"); }
  };
  return (
    <section id="video" className="lp2-section" data-reveal>
      <p className="lp2-eyebrow">VEJA EM 75 SEGUNDOS</p>
      <h2>Do produto à loja no ar, sem complicação.</h2>
      <p className="lp2-lead">Um tour rápido pelas cinco etapas. Tem legenda — dá para assistir sem som.</p>
      <div className="lp2-video-grid">
        <div className="lp2-player" style={{ position: "relative" }}>
          {VIDEO_SRC && (
            <video ref={ref} src={VIDEO_SRC} controls={playing} muted={!playing} loop={!playing} autoPlay playsInline preload="metadata" onTimeUpdate={onTime}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onPlay={() => { if (playing && !sent.current.has("play")) { sent.current.add("play"); track("video_play"); } }}
              onEnded={() => track("video_complete")}>
              {VIDEO_VTT && <track kind="captions" srcLang="pt-BR" label="Português" src={VIDEO_VTT} default />}
            </video>
          )}
          {!playing && (
            <div className="lp2-player-overlay">
              <button type="button" className="lp2-btn lp2-btn-yellow" disabled={!VIDEO_SRC} onClick={() => start(0)}
                aria-label="Assistir ao vídeo de apresentação do início">
                ▶ Assistir
              </button>
            </div>
          )}
        </div>
        <ol className="lp2-chapters">
          {CHAPTERS.map(([t, label], i) => (
            <li key={t}>
              <button type="button" className={i === current ? "on" : ""} disabled={!VIDEO_SRC}
                onClick={() => { track("chapter_click", { chapter: label }); start(t); }}>
                <span>{fmt(t)}</span>{label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export type PartnerCheckout = { monthly: { price: string; url: string }; lifetime: { price: string; url: string } };

export function LandingPage({ partner }: { partner?: PartnerCheckout | undefined } = {}) {
  useReveal();
  const [menu, setMenu] = useState(false);
  const mensalPrice = partner?.monthly.price ?? "172,00";
  const mensalUrl = partner?.monthly.url ?? CHECKOUT_MENSAL;
  const vitalUrl = partner?.lifetime.url ?? CHECKOUT_VITALICIO;
  const vitalPrice = partner?.lifetime.price ?? "297,00";

  return (
    <div className="lp2" id="topo">
      <header className="lp2-nav">
        <a href="#topo" aria-label="AfiliaPlace, início"><Brand /></a>
        <nav className="lp2-links" aria-label="Seções">{NAV.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        <div className="lp2-nav-cta">
          <Link to="/auth" className="lp2-btn lp2-btn-ghost">Entrar</Link>
          <a href="#planos" className="lp2-btn lp2-btn-dark">Assinar</a>
          <button type="button" className="lp2-btn lp2-btn-ghost lp2-menu-btn" onClick={() => setMenu(true)} aria-expanded={menu}><Menu size={18} aria-hidden="true" />Menu</button>
        </div>
      </header>
      {menu && (
        <div className="lp2-drawer-bg" onClick={() => setMenu(false)}>
          <div className="lp2-drawer" role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lp2-drawer-close" onClick={() => setMenu(false)} aria-label="Fechar menu"><X size={20} /></button>
            {NAV.map(([h, l]) => <a key={h} href={h} onClick={() => setMenu(false)}>{l}</a>)}
            <Link to="/auth" className="lp2-btn lp2-btn-ghost">Entrar</Link>
            <a href="#planos" className="lp2-btn lp2-btn-dark" onClick={() => setMenu(false)}>Assinar</a>
          </div>
        </div>
      )}

      <main>
        <section className="lp2-hero">
          <div className="lp2-hero-copy">
            <p className="lp2-eyebrow">MERCADO LIVRE + SHOPEE · NUM LUGAR SÓ</p>
            <h1 className="lp2-h1-anim" aria-label="Venda direto do seu fornecedor.">{"Venda direto do seu fornecedor.".split(" ").map((w, i) => <span key={w} aria-hidden="true" style={{ ["--i" as string]: i }}>{w}</span>)}</h1>
            <p className="lp2-lead">Mercado Livre e Shopee na palma da sua mão. Torne-se afiliado, escolha produtos validados, monte sua loja e divulgue com o seu link.</p>
            <div className="lp2-row">
              <a href="#planos" className="lp2-btn lp2-btn-dark">Ver planos</a>
              <a href="#video" className="lp2-btn lp2-btn-ghost">Assistir vídeo · 75s</a>
            </div>
            <div className="lp2-connects">
              <span>Conecta com</span>
              <span className="lp2-sup"><img src={mlLogo.url} alt="" width={22} height={22} />Mercado Livre</span>
              <span className="lp2-sup"><img src={shopeeLogo.url} alt="" width={22} height={22} />Shopee</span>
            </div>
          </div>
          <div className="lp2-store" aria-label="Exemplo de loja publicada">
            <div className="lp2-store-top"><strong>Casa Esperta</strong><span className="lp2-live">● No ar</span></div>
            <div className="lp2-store-banner">Achados para sua casa</div>
            <div className="lp2-store-grid">
              {[[imgAirFryer, "Air fryer 4L"], [imgBottle, "Garrafa térmica"], [imgCharger, "Carregador turbo"]].map(([src, n]) => (
                <div key={n} className="lp2-store-item"><img src={src} alt="" width={160} height={160} fetchPriority="high" /><span>{n}</span><em>Comprar</em></div>
              ))}
            </div>
          </div>
        </section>

        <section id="fornecedores" className="lp2-section lp2-forn" data-reveal>
          <p className="lp2-eyebrow">SEU FORNECEDOR</p>
          <h2>Seu fornecedor na palma da sua mão.</h2>
          <p className="lp2-lead">Conecte sua conta do Mercado Livre ou da Shopee, torne-se afiliado e venda produtos que já vendem — sem estoque e sem entrega.</p>
          <div className="lp2-forn-grid">
            <article className="lp2-card lp2-forn-ml"><img src={mlLogo.url} alt="" width={48} height={48} loading="lazy" /><h3>Mercado Livre</h3><p>Conexão oficial e links com a sua tag de afiliado.</p></article>
            <article className="lp2-card lp2-forn-sh"><img src={shopeeLogo.url} alt="" width={48} height={48} loading="lazy" /><h3>Shopee</h3><p>Produtos em alta com o seu link de afiliado.</p></article>
            <article className="lp2-card yellow"><span className="lp2-num">✓</span><h3>Torne-se afiliado</h3><p>Cadastro gratuito nos programas oficiais. A gente mostra o passo a passo.</p></article>
          </div>
        </section>

        <VideoSection />

        <section id="como-funciona" className="lp2-section" data-reveal>
          <p className="lp2-eyebrow">COMO FUNCIONA</p>
          <h2>Cinco passos do cadastro à primeira divulgação.</h2>
          <div className="lp2-steps">
            {STEPS.map(([t, d], i) => (
              <article key={t} className={`lp2-card${i === 0 ? " yellow" : ""}`}>
                <span className="lp2-num">0{i + 1}</span><h3>{t}</h3><p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="recursos" className="lp2-section" data-reveal>
          <p className="lp2-eyebrow">RECURSOS</p>
          <h2>Tudo o que o afiliado precisa, sem planilha e sem print.</h2>
          <div className="lp2-bento">
            <article className="lp2-card wide">
              <h3>Produtos validados</h3><p>Produtos em alta do Mercado Livre e da Shopee, com filtros por categoria e comissão.</p>
              <div className="lp2-filters"><span>Casa</span><span>Eletrônicos</span><span>Comissão ≥ 10%</span></div>
              <div className="lp2-mini-products">
                {[[imgWatch, "Smartwatch"], [imgHeadphones, "Fone bluetooth"]].map(([s, n]) => <div key={n}><img src={s} alt="" width={56} height={56} loading="lazy" /><span>{n}</span></div>)}
              </div>
            </article>
            <article className="lp2-card yellow rel"><span className="lp2-bgword sm" aria-hidden="true">IA</span><h3>Logo e banner com IA</h3><p>Descreva o estilo e escolha entre as propostas geradas para a sua loja.</p></article>
            <article className="lp2-card"><h3>Minhas lojas</h3><p>3 lojas no Mensal, 10 no Vitalício. Cada uma com nome, visual e link próprios.</p></article>
            <article className="lp2-card"><h3>Colocar no ar</h3><p>Conferência rápida antes de publicar e link pronto para compartilhar.</p></article>
            <article className="lp2-card"><h3>Divulgação</h3><p>Grupos públicos sugeridos, mensagens e artes prontas. Quem publica é você.</p></article>
            <article className="lp2-card wide">
              <h3>Painel de resultados</h3><p>Acompanhe cliques e visitas de cada loja.</p>
              <div className="lp2-stats"><div><strong>1.284</strong><span>cliques</span></div><div><strong>3.910</strong><span>visitas</span></div><div><strong>62%</strong><span>do celular</span></div></div>
              <small>Dados ilustrativos.</small>
            </article>
            <article className="lp2-card"><h3>Celular ou notebook</h3><p>Funciona no navegador, sem instalar aplicativo.</p></article>
          </div>
        </section>

        <section className="lp2-section" data-reveal>
          <h2>Sozinho ou com o AfiliaPlace.</h2>
          <div className="lp2-compare">
            <article className="lp2-card"><h3>Sozinho</h3><ul>{SOZINHO.map((s) => <li key={s}><X size={18} aria-hidden="true" />{s}</li>)}</ul></article>
            <article className="lp2-card yellow"><h3>Com o AfiliaPlace</h3><ul>{COM.map((s) => <li key={s}><Check size={18} aria-hidden="true" />{s}</li>)}</ul></article>
          </div>
        </section>

        <SecaoPlanos mensalPrice={mensalPrice} vitalPrice={vitalPrice} mensalUrl={mensalUrl} vitalUrl={vitalUrl} />

        <section id="faq" className="lp2-section" data-reveal>
          <p className="lp2-eyebrow">DÚVIDAS</p>
          <h2>Perguntas frequentes.</h2>
          <div className="lp2-faq">
            {FAQ.map(([q, a], i) => <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>)}
          </div>
          <p className="lp2-faq-mais">Ainda com dúvida? <a href="/auth">Fale com a gente</a></p>
        </section>

        <section className="lp2-final" data-reveal>
          <span className="lp2-bgword" aria-hidden="true">NO AR</span>
          <div>
            <h2>Sua próxima loja pode estar no ar hoje.</h2>
            <p className="lp2-lead">Escolha um plano e comece pelo primeiro passo: conectar seus fornecedores.</p>
            <a href="#planos" className="lp2-btn lp2-btn-dark">Ver planos</a>
          </div>
          <img src="/mascot-320.webp" alt="" width={240} height={240} loading="lazy" />
        </section>
      </main>

      <footer className="lp2-footer">
        <Brand />
        <nav aria-label="Rodapé">
          <a href="#planos">Planos</a><a href="#faq">Dúvidas</a>
          <Link to="/termos">Termos de uso</Link><Link to="/privacidade">Privacidade</Link><Link to="/auth">Entrar</Link>
        </nav>
        <p>© 2026 AfiliaPlace</p>
        <p className="lp2-legal">Mercado Livre e Shopee são marcas de seus respectivos donos. O AfiliaPlace não é afiliado, patrocinado nem endossado por essas empresas.</p>
      </footer>
    </div>
  );
}
