import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Facebook, Flame, Lock, MessageCircle, ShieldAlert, ShieldCheck, Sparkles, Truck, Undo2, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MeliProduct } from "@/lib/meli.functions";
import { markPublished } from "@/lib/perfil.functions";
import { markStep, toggleGroupPost, unmarkPublished } from "@/lib/workspace.functions";
import { completedSteps, discountPercent, nicheForCategory, isValidTag, postedTodayCount, reputationColor, safeAffiliateLink, whatsappShareUrl, WORKSPACE_STEPS, TRACKED_STEPS, type StepId } from "@/lib/product-share";
import { meliCategories } from "@/lib/meli-categories";
import { groupsForNiche } from "@/lib/divulgacao.functions";
import { whatsappScripts } from "@/components/product-script-dialog";
import { useCopy, useProductDetail } from "@/components/product-modal";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const repLabel: Record<string, string> = { "1_red": "Vermelha", "2_orange": "Laranja", "3_yellow": "Amarela", "4_light_green": "Verde-clara", "5_green": "Verde" };
const tplNames = ["Achadinho do dia", "Oferta relâmpago", "Olha esse preço", "Achado imperdível"];

export type TagStatus = "ok" | "pending" | "invalid" | "none";
export type Progress = { steps: { itemId: string; etapa: string }[]; posts: { itemId: string; grupoId: string; postadoEm: string }[] };

export type WorkspaceProps = {
  items: MeliProduct[]; id: string; step: StepId; tag: string; canEarn: boolean; tagStatus: TagStatus; confirming: boolean;
  published: Set<string>; profileUrl: string | null; progress: Progress | undefined; userId: string;
  onStep: (s: StepId) => void; onSelect: (id: string) => void; onClose: () => void; onConfirmTag: () => void; onOpenIntegrations: () => void;
};

export function ProductWorkspace(p: WorkspaceProps) {
  // Overlay em tela cheia direto no <body>: cobre a sidebar sem alterar o estado salvo dela.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(<Workspace {...p} />, document.body);
}

function Workspace(p: WorkspaceProps) {
  const { items, id, step, onStep, onSelect, onClose } = p;
  const idx = items.findIndex(i => i.id === id);
  const summary = idx >= 0 ? items[idx] ?? null : null;
  const prev = idx > 0 ? items[idx - 1] : null, next = idx >= 0 ? items[idx + 1] ?? null : null;
  const q = useProductDetail(id);
  const d = q.data?.detail ?? null;
  const qc = useQueryClient();
  const { done, copy } = useCopy();
  const mark = useServerFn(markStep);
  const toggle = useServerFn(toggleGroupPost);
  const pubFn = useServerFn(markPublished);
  const unpubFn = useServerFn(unmarkPublished);
  const progressKey = ["workspace-progress", p.userId];
  const refresh = () => void qc.invalidateQueries({ queryKey: progressKey });
  const stepMut = useMutation({ mutationFn: (etapa: "link" | "mensagem") => mark({ data: { itemId: id, etapa } }), onSuccess: refresh });
  const postMut = useMutation({ mutationFn: (v: { grupoId: string; posted: boolean }) => toggle({ data: { itemId: id, ...v } }), onSuccess: r => { if (!r.ok) toast.error("Não foi possível salvar."); refresh(); } });
  const pub = useMutation({ mutationFn: (on: boolean) => (on ? pubFn : unpubFn)({ data: { itemId: id } }), onSuccess: (r, on) => {
    if (r.ok) toast.success(on ? "Marcado como publicado no seu perfil." : "Publicação desfeita."); else toast.error("Não foi possível salvar.");
    void qc.invalidateQueries({ queryKey: ["perfil-state"] });
  } });

  const title = d?.title || summary?.title || "";
  const price = d?.price ?? summary?.price ?? 0;
  const permalink = d?.permalink || summary?.permalink || "";
  const link = safeAffiliateLink(permalink, p.tag, p.canEarn);
  const pictures = d?.pictures.length ? d.pictures : summary?.thumbnail ? [summary.thumbnail] : [];
  const freeShipping = d?.freeShipping ?? summary?.freeShipping ?? false;
  const isPublished = p.published.has(id);
  const posts = useMemo(() => (p.progress?.posts ?? []).filter(x => x.itemId === id), [p.progress, id]);
  const nicheFn = useServerFn(groupsForNiche);
  const nicho = nicheForCategory(summary?.categoryId);
  const gq = useQuery({ queryKey: ["workspace-groups", nicho], queryFn: () => nicheFn({ data: { nicho } }), staleTime: 300_000 });
  const groups = useMemo(() => (gq.data?.groups ?? []).map(g => ({ id: g.id, name: g.nome, url: g.link, network: g.rede })), [gq.data]);
  const general = gq.data?.general ?? true;
  const postedToday = postedTodayCount(posts, groups.map(g => g.id));
  const doneSteps = completedSteps((p.progress?.steps ?? []).filter(s => s.itemId === id).map(s => s.etapa), postedToday, isPublished);
  const category = meliCategories.find(c => c.id && c.id === summary?.categoryId)?.name ?? "Produtos";

  const copyLink = () => { if (!link) return; void copy("link", link); stepMut.mutate("link"); };

  // Teclado: ←/→ produto, 1–5 etapa, C copia, Esc fecha (ignora campos)
  const kb = useRef({ prev, next, copyLink, onStep, onSelect, onClose });
  kb.current = { prev, next, copyLink, onStep, onSelect, onClose };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const c = kb.current;
      if (e.key === "Escape") { e.preventDefault(); c.onClose(); }
      else if (e.key === "ArrowLeft" && c.prev) { e.preventDefault(); c.onSelect(c.prev.id); }
      else if (e.key === "ArrowRight" && c.next) { e.preventDefault(); c.onSelect(c.next.id); }
      else if (/^[1-5]$/.test(e.key)) { e.preventDefault(); c.onStep(WORKSPACE_STEPS[Number(e.key) - 1]!.id); }
      else if (e.key.toLowerCase() === "c") { e.preventDefault(); c.copyLink(); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  // trava o scroll do fundo e foca o painel ao abrir
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = document.documentElement, b = document.body; const oh = h.style.overflow, ob = b.style.overflow; h.style.overflow = "hidden"; b.style.overflow = "hidden"; root.current?.focus(); return () => { h.style.overflow = oh; b.style.overflow = ob; }; }, []);
  // fila: mantém o atual visível
  const queueRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = queueRef.current; if (!el) return; const w = (e: WheelEvent) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) { e.preventDefault(); el.scrollLeft += e.deltaY; } }; el.addEventListener("wheel", w, { passive: false }); return () => el.removeEventListener("wheel", w); }, []);
  useEffect(() => { queueRef.current?.querySelector<HTMLElement>("[aria-current='true']")?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" }); }, [id]);
  // swipe no celular
  const touch = useRef<{ x: number; y: number } | null>(null);

  const stepIdx = WORKSPACE_STEPS.findIndex(s => s.id === step);
  const nextStep = WORKSPACE_STEPS[stepIdx + 1];
  const goNext = () => nextStep ? onStep(nextStep.id) : next ? onSelect(next.id) : onClose();
  const nextLabel = nextStep ? `Próximo passo: ${nextStep.label}` : next ? "Próximo produto" : "Voltar ao catálogo";

  const noLink = <NoLink status={p.tagStatus} confirming={p.confirming} onConfirm={p.onConfirmTag} onOpenIntegrations={p.onOpenIntegrations} />;
  const tagBadge = p.tagStatus === "ok" && p.canEarn && isValidTag(p.tag)
    ? <span className="pw-tag ok"><ShieldCheck />Tag <strong>{p.tag}</strong></span>
    : <span className="pw-tag warn"><ShieldAlert />Tag não confirmada{p.tagStatus === "pending" && <Button size="sm" onClick={p.onConfirmTag} disabled={p.confirming}>Confirmar</Button>}</span>;

  return <div className="pw" role="dialog" aria-modal="true" aria-label={title || "Produto"} ref={root} tabIndex={-1}
    onTouchStart={e => { const t = e.touches[0]; if (!t) return; touch.current = { x: t.clientX, y: t.clientY }; }}
    onTouchEnd={e => { const s = touch.current; touch.current = null; if (!s) return; const t = e.changedTouches[0]; if (!t) return; const dx = t.clientX - s.x, dy = t.clientY - s.y;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5 && !(e.target as HTMLElement).closest(".pw-pills, .pw-queue, .pw-gallery")) { if (dx < 0 && next) onSelect(next.id); if (dx > 0 && prev) onSelect(prev.id); } }}>
    <span className="pw-handle" aria-hidden />
    <header className="pw-top">
      <Button variant="ghost" size="sm" onClick={onClose} className="pw-back"><ArrowLeft />Catálogo</Button>
      <nav className="pw-crumb" aria-label="Categoria"><span>Produtos</span><ChevronRight /><strong>{category}</strong></nav>
      <div className="pw-count">
        <Button variant="ghost" size="icon" disabled={!prev} onClick={() => prev && onSelect(prev.id)} aria-label="Produto anterior"><ChevronLeft /></Button>
        <span aria-live="polite">{idx >= 0 ? idx + 1 : "—"} de {items.length}</span>
        <Button variant="ghost" size="icon" disabled={!next} onClick={() => next && onSelect(next.id)} aria-label="Próximo produto"><ChevronRight /></Button>
      </div>
      {tagBadge}
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar"><X /></Button>
    </header>

    <div className="pw-mini">{pictures[0] && <img src={pictures[0]} alt="" />}<div><p>{title}</p><strong>{price ? brl(price) : "—"}</strong></div></div>

    <aside className="pw-steps" aria-label="Etapas">
      <ol>{WORKSPACE_STEPS.map((s, i) => { const ok = doneSteps.has(s.id); return <li key={s.id}>
        <button type="button" className={s.id === step ? "on" : ""} aria-current={s.id === step ? "step" : undefined} onClick={() => onStep(s.id)}>
          <span className={ok ? "pw-num ok" : "pw-num"}>{ok ? <Check /> : i + 1}</span>{s.label}</button></li>; })}</ol>
      <dl className="pw-keys"><div><dt>← →</dt><dd>Produto</dd></div><div><dt>1–5</dt><dd>Etapa</dd></div><div><dt>C</dt><dd>Copiar link</dd></div><div><dt>Esc</dt><dd>Fechar</dd></div></dl>
    </aside>
    <div className="pw-pills" role="tablist" aria-label="Etapas">{WORKSPACE_STEPS.map((s, i) => <button key={s.id} role="tab" aria-selected={s.id === step} className={s.id === step ? "on" : ""} onClick={() => onStep(s.id)}>
      <span className={doneSteps.has(s.id) ? "pw-num ok" : "pw-num"}>{doneSteps.has(s.id) ? <Check /> : i + 1}</span>{s.label}</button>)}</div>

    <main className="pw-main" key={`${id}:${step}`}>
      {step === "visao" && <Overview loading={q.isLoading && !summary} title={title} price={price} pictures={pictures} freeShipping={freeShipping} hot={!!summary?.bestseller}
        isNew={d?.condition === "new"} sold={d?.sold ?? summary?.sold ?? 0} reputation={d?.reputation ?? null} repLoading={q.isLoading} original={d?.originalPrice ?? null} published={isPublished} error={q.data?.error ?? null} />}
      {step === "link" && <section className="pw-sec"><h2>Link de afiliado</h2>
        {link ? <>
          <div className="pw-linkbox"><input readOnly value={link} aria-label="Link de afiliado" onFocus={e => e.currentTarget.select()} />
            <Button onClick={copyLink}>{done === "link" ? <Check /> : <Copy />}Copiar</Button>
            <Button variant="outline" asChild><a href={link} target="_blank" rel="noopener noreferrer"><ExternalLink />Testar link</a></Button></div>
          <ul className="pw-facts"><li><ShieldCheck />Sua tag: <strong>{p.tag}</strong></li><li><Check />Domínio mercadolivre.com.br visível</li></ul>
        </> : noLink}
      </section>}
      {step === "mensagem" && <MessageStep summary={summary} title={title} price={price} freeShipping={freeShipping} link={link} noLink={noLink} onDone={() => stepMut.mutate("mensagem")} />}
      {step === "grupos" && <section className="pw-sec"><h2>Divulgar nos grupos</h2>
        <p className="pw-sub">{general ? "Não há grupos específicos desta categoria. Mostrando grupos gerais de achadinhos e promoções." : `Grupos de ${category}.`} <strong className="pw-counter">{postedToday} de {groups.length} postados hoje</strong></p>
        {!link && <div className="pw-inline-warn">{noLink}</div>}
        <ul className="pw-groups">{groups.map(g => { const on = posts.some(x => x.grupoId === g.id) && postedTodayCount(posts, [g.id]) > 0; return <li key={g.id}>
          <span className={`pw-net ${g.network}`}>{g.network === "facebook" ? <><Facebook />Facebook</> : <><MessageCircle />WhatsApp</>}</span>
          <span className="pw-gname">{g.name}</span>
          <Button size="sm" variant="outline" asChild><a href={g.url} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir grupo</a></Button>
          <Button size="sm" variant={on ? "secondary" : "default"} aria-pressed={on} disabled={postMut.isPending} onClick={() => postMut.mutate({ grupoId: g.id, posted: !on })}>{on ? <><Check />Postado</> : "Marcar postado"}</Button>
        </li>; })}</ul>
      </section>}
      {step === "perfil" && <section className="pw-sec"><h2>Publicar no meu perfil</h2>
        {!d ? <div className="pm-skel pm-skel-line" /> : d.eligibility === "elegivel" ? <p className="pw-elig ok"><ShieldCheck />Produto elegível para o seu perfil.</p>
          : d.eligibility === "nao_elegivel" ? <p className="pw-elig bad"><Lock />{d.ineligibleReason}</p> : <p className="pw-elig warn"><ShieldAlert />{d.note}</p>}
        {!link ? noLink : isPublished ? <div className="pw-published"><p><UserCheck />Este produto está marcado como publicado no seu perfil.</p>
          <div>{p.profileUrl && <Button variant="outline" asChild><a href={p.profileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink />Ver meu perfil</a></Button>}
            <Button variant="ghost" onClick={() => pub.mutate(false)} disabled={pub.isPending}><Undo2 />Desfazer publicação</Button></div></div>
        : <ol className="pw-howto">
          <li><span className="pw-num">1</span><div><p>Abra o produto no Mercado Livre</p>{d?.eligible ? <Button size="sm" variant="outline" asChild><a href={link} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir ↗</a></Button> : <Button size="sm" variant="outline" disabled><ExternalLink />Abrir ↗</Button>}</div></li>
          <li><span className="pw-num">2</span><div><p>Na barra de afiliados no topo, clique em <strong>Compartilhar</strong></p></div></li>
          <li><span className="pw-num">3</span><div><p>Volte aqui e confirme</p><Button size="sm" disabled={!d?.eligible || pub.isPending} onClick={() => pub.mutate(true)}><Check />Marcar como publicado</Button></div></li>
        </ol>}
      </section>}
      <div className="pw-nextstep"><Button onClick={goNext}>{nextLabel}<ChevronRight /></Button></div>
    </main>

    <aside className="pw-side">
      <div className="pw-side-img">{pictures[0] ? <img src={pictures[0]} alt="" /> : <div className="pm-skel pm-skel-img" />}</div>
      <p className="pw-side-title">{title || "Carregando..."}</p>
      <strong className="pw-side-price">{price ? brl(price) : "—"}</strong>
      <ul className="pw-prog">{TRACKED_STEPS.map(s => <li key={s} className={doneSteps.has(s) ? "ok" : ""}><span className="pw-dot">{doneSteps.has(s) && <Check />}</span>{WORKSPACE_STEPS.find(x => x.id === s)?.label}</li>)}</ul>
      {link ? <Button className="pw-primary" onClick={copyLink}>{done === "link" ? <Check /> : <Copy />}Copiar link de afiliado</Button> : noLink}
      <Button variant="outline" disabled={!next} onClick={() => next && onSelect(next.id)}>Próximo produto →</Button>
    </aside>

    <footer className="pw-queue-wrap"><span className="pw-queue-label">Na fila</span>
      <div className="pw-queue" ref={queueRef}>{items.map(it => <button key={it.id} type="button" aria-current={it.id === id} className={it.id === id ? "on" : ""} onClick={() => onSelect(it.id)}>
        {it.thumbnail && <img src={it.thumbnail} alt="" loading="lazy" />}<span>{it.title}</span><strong>{brl(it.price)}</strong></button>)}</div>
    </footer>

    <div className="pw-mobile-bar">
      <Button variant="outline" onClick={goNext}>{nextStep ? "Próximo passo" : next ? "Próximo produto" : "Catálogo"}</Button>
      {link ? <Button onClick={copyLink}>{done === "link" ? <Check /> : <Copy />}Copiar link</Button> : <Button disabled><Lock />Link bloqueado</Button>}
    </div>
  </div>;
}

function NoLink({ status, confirming, onConfirm, onOpenIntegrations }: { status: TagStatus; confirming: boolean; onConfirm: () => void; onOpenIntegrations: () => void }) {
  return <div className="pw-nolink" role="status"><div className="pw-nolink-head"><Lock /><p>Confirme sua tag para gerar o link</p></div>
    {status === "pending" ? <Button size="sm" className="w-full" onClick={onConfirm} disabled={confirming}>Confirmar</Button> : <Button size="sm" variant="outline" className="w-full" onClick={onOpenIntegrations}>Ir para Integrações</Button>}</div>;
}

function Overview(o: { loading: boolean; title: string; price: number; pictures: string[]; freeShipping: boolean; hot: boolean; isNew: boolean; sold: number; reputation: string | null; repLoading: boolean; original: number | null; published: boolean; error: string | null }) {
  const [pic, setPic] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const off = discountPercent(o.price, o.original);
  return <section className="pw-sec pw-overview">
    <div className="pw-gallery">
      {o.pictures.length > 1 && <div className="pw-thumbs">{o.pictures.slice(0, 8).map((src, i) => <button key={src} type="button" aria-label={`Foto ${i + 1}`} aria-current={i === pic} className={i === pic ? "on" : ""} onClick={() => setPic(i)} onMouseEnter={() => setPic(i)}><img src={src} alt="" loading="lazy" /></button>)}</div>}
      <div className="pw-photo" onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }} onMouseLeave={() => setZoom(null)}>
        {o.loading || !o.pictures[pic] ? <div className="pm-skel pm-skel-img" /> : <img src={o.pictures[pic]} alt={o.title} style={zoom ? { transform: "scale(1.9)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />}
      </div>
    </div>
    <div className="pm-chips">
      {o.isNew && <span className="pm-chip"><Sparkles />Novo</span>}
      {o.freeShipping && <span className="pm-chip"><Truck />Frete grátis</span>}
      {o.hot && <span className="pm-chip hot"><Flame />Quente</span>}
      {o.published && <span className="pm-chip ok"><UserCheck />No perfil</span>}
    </div>
    <h2 className="pw-title">{o.title}</h2>
    <div className="pw-metrics">
      <div><span>Preço</span><strong>{o.price ? brl(o.price) : "—"}</strong>{off > 0 && <small>{off}% OFF</small>}</div>
      <div><span>Frete</span><strong>{o.freeShipping ? "Grátis" : "Pago"}</strong></div>
      <div><span>Vendidos</span><strong>{o.sold > 0 ? o.sold.toLocaleString("pt-BR") : "—"}</strong></div>
      <div><span>Vendedor</span>{o.reputation ? <strong className="pm-rep"><i style={{ background: reputationColor[o.reputation] ?? "var(--muted-foreground)" }} aria-hidden />{repLabel[o.reputation] ?? "—"}</strong> : o.repLoading ? <span className="pm-skel pm-skel-chip" /> : <strong>Não verificado</strong>}</div>
    </div>
    {o.error && <p className="pm-note">{o.error}</p>}
  </section>;
}

function MessageStep({ summary, title, price, freeShipping, link, noLink, onDone }: { summary: MeliProduct | null; title: string; price: number; freeShipping: boolean; link: string | null; noLink: React.ReactNode; onDone: () => void }) {
  const [tpl, setTpl] = useState(0);
  const { done, copy } = useCopy();
  const scripts = useMemo(() => link && title ? whatsappScripts({ ...(summary ?? { id: "", thumbnail: "", permalink: "", sold: 0, categoryId: "" }), title, price, freeShipping } as MeliProduct, link) : [], [summary, title, price, freeShipping, link]);
  if (!link) return <section className="pw-sec"><h2>Mensagem pronta</h2>{noLink}</section>;
  const msg = scripts[tpl] ?? "";
  return <section className="pw-sec"><h2>Mensagem pronta</h2>
    <div className="pw-msg">
      <ul className="pw-tpls" role="listbox" aria-label="Modelos">{scripts.map((_, i) => <li key={i}><button type="button" role="option" aria-selected={i === tpl} className={i === tpl ? "on" : ""} onClick={() => setTpl(i)}>{tplNames[i] ?? `Modelo ${i + 1}`}</button></li>)}</ul>
      <div className="pw-wa"><div className="pw-bubble">{msg}</div>
        <div className="pw-wa-actions"><Button variant="outline" onClick={() => { void copy("msg", msg, "Mensagem copiada"); onDone(); }}>{done === "msg" ? <Check /> : <Copy />}Copiar mensagem</Button>
          <Button asChild><a href={whatsappShareUrl(msg)} target="_blank" rel="noopener noreferrer" onClick={onDone}><MessageCircle />Enviar no WhatsApp</a></Button></div></div>
    </div>
  </section>;
}
