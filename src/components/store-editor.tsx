import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { Link, useBlocker, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, ArrowDown, ArrowUp, Check, GripVertical, Laptop, Loader2, Redo2, RefreshCw, Smartphone, Undo2, Upload, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/components/auth-provider";
import { useMyProducts } from "@/components/my-products-query";
import { LojaPublica, type LojaItem, type LojaView } from "@/components/loja-publica";
import { getStore, saveStore } from "@/lib/stores.functions";
import { listLibrary } from "@/lib/library.functions";
import { StoreAiPicker } from "@/components/store-ai-picker";
import { NOME_MAX, type Preset } from "@/lib/store-rules";
import { avisosContraste, BANNER_POS, BOTOES, CANTOS, CARTOES, cropFor, ESPACOS, extras, FILTROS, FONTES, FOTOS, FUNDOS, LAYOUTS, PALETAS, RODAPES, temaVars, textoSobre, TOPOS, type Alinhamento, type BannerAltura, type BannerPos, type Tema } from "@/lib/store-theme";

type Draft = {
  nome: string; nicho: string | null; logoPath: string | null; logoUrl: string | null; logoEstilo: string; bannerPath: string | null; bannerUrl: string | null; bannerEstilo: string;
  preset: Preset; tema: Tema; posicao: BannerPos; altura: BannerAltura; alinhamento: Alinhamento; frase: string; botao: string; banners: { path: string; url: string }[];
};
type Snap = { d: Draft; sel: string[] };
type SaveState = "idle" | "pending" | "saving" | "saved" | "error" | "conflict";
const STEPS = ["Nome", "Identidade", "Layout", "Tema", "Produtos"] as const;
const LAST = STEPS.length - 1;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

async function toWebp(file: File, maxW: number, ratio?: number | null): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const c0 = ratio ? cropFor(bmp.width, bmp.height, ratio) : { x: 0, y: 0, w: bmp.width, h: bmp.height };
  const scale = Math.min(1, maxW / c0.w);
  const c = document.createElement("canvas"); c.width = Math.round(c0.w * scale); c.height = Math.round(c0.h * scale);
  c.getContext("2d")!.drawImage(bmp, c0.x, c0.y, c0.w, c0.h, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error("webp")), "image/webp", 0.86));
}

/** Setas do teclado movem a seleção dentro de um grupo de opções (role=radio). */
function radioKeys(e: KeyboardEvent<HTMLElement>) {
  const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; if (!d) return;
  const list = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])')];
  const i = list.indexOf(document.activeElement as HTMLButtonElement); if (i < 0) return;
  e.preventDefault(); const n = list[(i + d + list.length) % list.length]!; n.focus(); n.click();
}
function Radios({ label, children, className = "ed-opts" }: { label: string; children: ReactNode; className?: string }) {
  return <div className={className} role="radiogroup" aria-label={label} onKeyDown={radioKeys}>{children}</div>;
}

export function StoreEditor({ id, passo }: { id: string; passo?: number | undefined }) {
  const fetchStore = useServerFn(getStore); const save = useServerFn(saveStore);
  const qc = useQueryClient(); const navigate = useNavigate(); const { user } = useAccount();
  // Sempre lido fresco do banco: o editor nunca abre com uma versão antiga em cache.
  const q = useQuery({ queryKey: ["store", id], queryFn: () => fetchStore({ data: { id } }), staleTime: 0, gcTime: 0, refetchOnWindowFocus: false });
  const mine = useMyProducts();
  const lib = useServerFn(listLibrary);
  const amostra = useQuery({ queryKey: ["editor-amostra"], queryFn: () => lib({ data: { q: "", fornecedor: "", categoria: "", sort: "vendidos", page: 0 } }), staleTime: 600_000 });
  const [d, setD] = useState<Draft | null>(null); const [sel, setSel] = useState<string[]>([]);
  const [step, setStepState] = useState(0);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop"); const [zoom, setZoom] = useState(1);
  const [st, setSt] = useState<SaveState>("idle"); const [savedAt, setSavedAt] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [hist, setHist] = useState<{ past: Snap[]; future: Snap[] }>({ past: [], future: [] });
  const versao = useRef(0); const dRef = useRef<Draft | null>(null); const selRef = useRef<string[]>([]); const stepRef = useRef(0);
  const dirty = useRef(false); const prodTouched = useRef(false); const timer = useRef<number | null>(null); const inflight = useRef<Promise<void> | null>(null);
  const lastPush = useRef(0);

  const hydrate = useCallback((s: NonNullable<NonNullable<typeof q.data>["store"]>) => {
    const a = s.aparencia;
    const draft: Draft = { nome: s.nome, nicho: s.nicho, logoPath: s.logoPath, logoUrl: s.logoUrl, logoEstilo: s.logoEstilo, bannerPath: s.bannerPath, bannerUrl: s.bannerUrl, bannerEstilo: s.bannerEstilo,
      preset: s.preset, tema: a.tema, posicao: a.posicao, altura: a.altura, alinhamento: a.alinhamento, frase: a.frase ?? "", botao: a.botao ?? "", banners: a.banners.map((p, i) => ({ path: p, url: s.bannersUrls[i] ?? "" })) };
    dRef.current = draft; setD(draft); selRef.current = s.produtos.map(p => p.meuProdutoId); setSel(selRef.current);
    versao.current = s.versao; setSavedAt(s.atualizadoEm); dirty.current = false; prodTouched.current = false; setSt("idle");
    const start = Math.min(LAST, Math.max(0, passo !== undefined ? passo - 1 : s.passoAtual)); stepRef.current = start; setStepState(start);
  }, [passo]);
  useEffect(() => { const s = q.data?.store; if (s && !dRef.current) hydrate(s); }, [q.data, hydrate]);

  /** Grava o estado atual. Encadeia chamadas para nunca ter dois salvamentos ao mesmo tempo. */
  const flush = useCallback(async (): Promise<void> => {
    if (timer.current) { window.clearTimeout(timer.current); timer.current = null; }
    if (inflight.current) { await inflight.current; }
    const cur = dRef.current; if (!cur || !dirty.current) return;
    dirty.current = false; setSt("saving");
    const produtos = prodTouched.current ? selRef.current : undefined; prodTouched.current = false;
    const run = (async () => {
      const r = await save({ data: { id, versao: versao.current, produtos, patch: {
        nome: cur.nome.trim() || "Minha loja", nicho: cur.nicho, logoPath: cur.logoPath, logoEstilo: cur.logoEstilo as never, bannerPath: cur.bannerPath, bannerEstilo: cur.bannerEstilo as never,
        preset: cur.preset, tema: cur.tema, bannerPosicao: cur.posicao, bannerAltura: cur.altura, bannerAlinhamento: cur.alinhamento,
        bannerFrase: cur.frase.trim() || null, bannerBotao: cur.botao.trim() || null, banners: cur.banners.map(b => b.path), passoAtual: stepRef.current,
      } } }).catch(() => null);
      if (r?.ok) { versao.current = r.versao; setSavedAt(r.salvoEm); setSt(dirty.current ? "pending" : "saved"); void qc.invalidateQueries({ queryKey: ["stores"] }); if (produtos) void qc.invalidateQueries({ queryKey: ["my-products"] }); return; }
      dirty.current = true; if (produtos) prodTouched.current = true;
      if (r && "conflito" in r && r.conflito) { setSt("conflict"); toast.warning("Esta loja foi alterada em outra aba. Recarregue para continuar."); }
      else setSt("error");
    })();
    inflight.current = run; await run; inflight.current = null;
    if (dirty.current && timer.current === null && stRef.current === "pending") void flush();
  }, [id, save, qc]);
  const stRef = useRef<SaveState>("idle"); stRef.current = st;

  const schedule = useCallback((immediate = false) => {
    dirty.current = true; if (stRef.current === "conflict") return; setSt("pending");
    if (timer.current) window.clearTimeout(timer.current);
    if (immediate) { void flush(); return; }
    timer.current = window.setTimeout(() => { timer.current = null; void flush(); }, 800);
  }, [flush]);

  const pushHist = (force = false) => {
    const now = Date.now(); if (!force && now - lastPush.current < 700) return; lastPush.current = now;
    const snap = { d: dRef.current!, sel: selRef.current };
    setHist(h => ({ past: [...h.past, snap].slice(-20), future: [] }));
  };
  const update = (patch: Partial<Draft>, opts: { immediate?: boolean; typing?: boolean } = {}) => {
    if (!dRef.current) return; pushHist(!opts.typing);
    const next = { ...dRef.current, ...patch }; dRef.current = next; setD(next); schedule(opts.immediate);
  };
  const setProducts = (next: string[]) => { pushHist(true); prodTouched.current = true; selRef.current = next; setSel(next); schedule(); };
  const restore = (from: "past" | "future") => setHist(h => {
    const list = h[from]; const snap = list[list.length - 1]; if (!snap || !dRef.current) return h;
    const cur = { d: dRef.current, sel: selRef.current };
    dRef.current = snap.d; setD(snap.d); if (snap.sel !== selRef.current) { prodTouched.current = true; selRef.current = snap.sel; setSel(snap.sel); }
    schedule();
    return from === "past" ? { past: list.slice(0, -1), future: [...h.future, cur] } : { past: [...h.past, cur], future: list.slice(0, -1) };
  });

  const setStep = (n: number) => {
    stepRef.current = n; setStepState(n); dirty.current = true; void flush();
    void navigate({ to: ".", search: ((prev: Record<string, unknown>) => ({ ...prev, passo: String(n + 1) })) as never, replace: true, state: (s: unknown) => s } as never);
  };

  // Salva na hora ao trocar de aba/minimizar ou fechar a página.
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === "hidden") void flush(); };
    const onUnload = () => { void flush(); };
    document.addEventListener("visibilitychange", onHide); window.addEventListener("pagehide", onUnload);
    return () => { document.removeEventListener("visibilitychange", onHide); window.removeEventListener("pagehide", onUnload); };
  }, [flush]);
  useEffect(() => { const on = () => { if (stRef.current === "error") void flush(); }; window.addEventListener("online", on); return () => window.removeEventListener("online", on); }, [flush]);
  useEffect(() => () => { if (dirty.current) void flush(); }, [flush]);
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || (e.target as HTMLElement)?.closest("input, textarea")) return;
      if (e.key.toLowerCase() === "z") { e.preventDefault(); restore(e.shiftKey ? "future" : "past"); } else if (e.key.toLowerCase() === "y") { e.preventDefault(); restore("future"); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  useBlocker({
    shouldBlockFn: async () => { await flush(); return (dirty.current && stRef.current !== "saved") && !window.confirm("Não foi possível salvar as últimas alterações. Sair mesmo assim?"); },
    enableBeforeUnload: () => dirty.current || stRef.current === "saving",
  });

  const reloadFromServer = async () => { dRef.current = null; setD(null); setHist({ past: [], future: [] }); const r = await q.refetch(); if (r.data?.store) hydrate(r.data.store); };

  const products = mine.data?.items ?? [];
  const byId = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
  const move = (pid: string, dir: -1 | 1) => { const i = sel.indexOf(pid), j = i + dir; if (i < 0 || j < 0 || j >= sel.length) return; const n = [...sel]; [n[i], n[j]] = [n[j]!, n[i]!]; setProducts(n); };
  const ratio = BANNER_POS.find(b => b.id === d?.posicao)?.ratio ?? 16 / 6;

  async function upload(kind: "logo" | "banner" | "extra", file: File | undefined) {
    if (!file || !user || !dRef.current) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { toast.error("Envie PNG, JPG ou WebP."); return; }
    if (file.size > 4 * 1024 * 1024) { toast.error("A imagem precisa ter até 4 MB."); return; }
    const blob = await toWebp(file, kind === "logo" ? 512 : 1600, kind === "logo" ? 1 : ratio).catch(() => null);
    if (!blob) { toast.error("Não foi possível ler a imagem."); return; }
    const path = `${user.id}/${id}/${kind}-${Date.now()}.webp`;
    const { error } = await supabase.storage.from("lojas").upload(path, blob, { contentType: "image/webp", upsert: true });
    if (error) { toast.error("Falha ao enviar a imagem."); return; }
    const { data: signed } = await supabase.storage.from("lojas").createSignedUrl(path, 3600);
    const url = signed?.signedUrl ?? null; const cur = dRef.current;
    if (kind === "extra") { update({ banners: [...cur.banners, { path, url: url ?? "" }].slice(0, 2) }, { immediate: true }); return; }
    const old = kind === "logo" ? cur.logoPath : cur.bannerPath;
    update(kind === "logo" ? { logoPath: path, logoUrl: url } : { bannerPath: path, bannerUrl: url }, { immediate: true });
    if (old) void supabase.storage.from("lojas").remove([old]);
  }
  function clearImage(kind: "logo" | "banner") {
    const old = kind === "logo" ? d?.logoPath : d?.bannerPath; if (old) void supabase.storage.from("lojas").remove([old]);
    update(kind === "logo" ? { logoPath: null, logoUrl: null } : { bannerPath: null, bannerUrl: null }, { immediate: true });
  }

  if (q.isLoading || (!d && q.data?.store)) return <div className="v2-page"><Skeleton className="st-card-skel" /></div>;
  if (!q.data?.store || !d) return <div className="v2-page"><div className="v2-card v2-empty"><p>Loja não encontrada.</p><Button asChild><Link to="/painel/lojas">Minhas lojas</Link></Button></div></div>;

  const t = d.tema;
  const view: LojaView = { id, nome: d.nome.trim() || "Minha loja", nicho: d.nicho, logoUrl: d.logoUrl, logoEstilo: d.logoEstilo, bannerUrl: d.bannerUrl, bannerEstilo: d.bannerEstilo, cor: t.cor_destaque, preset: d.preset,
    aparencia: { tema: t, posicao: d.posicao, altura: d.altura, alinhamento: d.alinhamento, frase: d.frase || null, botao: d.botao || null, banners: d.banners.map(b => b.url).filter(Boolean) } };
  const items: LojaItem[] = sel.map(pid => byId.get(pid)).filter(p => p && p.status !== "fora_do_ar" && p.produto).map(p => ({ meuProdutoId: p!.id, fornecedor: p!.fornecedor, titulo: p!.produto!.titulo, imagem: p!.produto!.imagens[0] ?? null, preco: p!.produto!.preco, categoria: p!.produto!.categoria }));
  const exemplos: LojaItem[] = (amostra.data?.items ?? []).filter(x => x.imagens[0] && !items.some(r => r.titulo === x.titulo)).slice(0, 8).map(x => ({ meuProdutoId: `exemplo-${x.fornecedor}-${x.itemId}`, fornecedor: x.fornecedor, titulo: x.titulo, imagem: x.imagens[0] ?? null, preco: x.preco, categoria: x.categoria, precoOriginal: x.precoOriginal }));
  const prevItems = step < LAST && items.length < 8 ? [...items, ...exemplos.slice(0, 8 - items.length)] : items;
  const next = () => { if (step < LAST) setStep(step + 1); else void flush().then(() => navigate({ to: "/painel/publicar", search: { loja: id } } as never)); };
  const avisos = avisosContraste(t);
  const setTema = (p: Partial<Tema>) => update({ tema: { ...t, ...p, paleta: p.paleta !== undefined ? p.paleta : null } });
  const ex = extras(t);
  const opt = <V extends string,>(label: string, list: { id: V; nome: string }[], cur: V, set: (v: V) => void) => <><h3>{label}</h3>
    <Radios label={label}>{list.map(o => <button key={o.id} type="button" role="radio" aria-checked={cur === o.id} tabIndex={cur === o.id ? 0 : -1} onClick={() => set(o.id)}>{o.nome}</button>)}</Radios></>;

  const saveLabel = st === "saving" ? <><Loader2 className="animate-spin" aria-hidden="true" />Salvando…</>
    : st === "pending" ? "Alterações pendentes"
    : st === "error" ? <><AlertTriangle aria-hidden="true" />Não foi possível salvar — <button type="button" className="ed-retry" onClick={() => void flush()}>Tentar de novo</button></>
    : st === "conflict" ? <><AlertTriangle aria-hidden="true" />Alterada em outra aba — <button type="button" className="ed-retry" onClick={() => void reloadFromServer()}>Recarregar</button></>
    : savedAt ? <><Check aria-hidden="true" />Salvo às {hhmm(savedAt)}</> : null;

  return <div className="ed">
    <div className="ed-top">
      <ol className="ed-steps v2-noscroll" aria-label="Etapas">{STEPS.map((s, i) => <li key={s}><button type="button" aria-current={step === i ? "step" : undefined} onClick={() => setStep(i)} className={i < step ? "is-done" : ""}>
        {i < step ? <Check aria-hidden="true" /> : <span>{i + 1}</span>}{s}</button></li>)}</ol>
      <span className="ed-hist"><Button variant="ghost" size="icon" aria-label="Desfazer" title="Desfazer (Ctrl+Z)" disabled={!hist.past.length} onClick={() => restore("past")}><Undo2 /></Button>
        <Button variant="ghost" size="icon" aria-label="Refazer" title="Refazer (Ctrl+Shift+Z)" disabled={!hist.future.length} onClick={() => restore("future")}><Redo2 /></Button></span>
      <span className={`ed-saved is-${st}`} role="status" aria-live="polite">{saveLabel}</span></div>
    <div className="ed-body">
      <section className="ed-panel v2-card v2-noscroll">
        {step === 0 && <div className="ed-sec"><h2>Nome da loja</h2>
          <label className="ed-field"><span>Nome</span><input value={d.nome} maxLength={NOME_MAX} onChange={e => update({ nome: e.target.value }, { typing: true })} onBlur={() => void flush()} /><small>{d.nome.length}/{NOME_MAX}</small></label>
          <p className="ed-hint">Não use marcas registradas no nome, inclusive de fornecedores como Mercado Livre ou Shopee.</p>
          <label className="ed-field"><span>Nicho</span><input value={d.nicho ?? ""} maxLength={20} placeholder="ex.: Casa e cozinha" onChange={e => update({ nicho: e.target.value || null }, { typing: true })} onBlur={() => void flush()} /><small>{(d.nicho ?? "").length}/20</small></label></div>}
        {step === 1 && <div className="ed-sec"><h2>Identidade</h2>
          <h3>Logo</h3>
          {d.logoUrl && <div className="ed-current"><img src={d.logoUrl} alt="Logo atual" /><span>Logo em uso</span></div>}
          <div className="ed-row"><label className="ed-upload"><Upload aria-hidden="true" />Enviar meu logo<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => { void upload("logo", e.target.files?.[0]); e.target.value = ""; }} /></label>
            {d.logoPath && <Button variant="outline" size="sm" onClick={() => clearImage("logo")}><X />Remover</Button>}</div>
          <StoreAiPicker lojaId={id} tipo="logo" fonte={FONTES.find(f => f.id === t.fonte)?.titulo} nome={view.nome} nicho={d.nicho} cor={t.cor_destaque} ratio={1} onChosen={(path, url) => { const n = { ...dRef.current!, logoPath: path, logoUrl: url }; dRef.current = n; setD(n); void qc.invalidateQueries({ queryKey: ["stores"] }); }} />
          <h3>Banner</h3>
          {d.bannerUrl && <div className="ed-current is-banner"><img src={d.bannerUrl} alt="Banner atual" /><span>Banner em uso</span></div>}
          <p className="ed-hint">A imagem é recortada para a posição escolhida em Layout ({BANNER_POS.find(b => b.id === d.posicao)?.nome}).</p>
          <div className="ed-row"><label className="ed-upload"><Upload aria-hidden="true" />Enviar meu banner<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => { void upload("banner", e.target.files?.[0]); e.target.value = ""; }} /></label>
            {d.bannerPath && <Button variant="outline" size="sm" onClick={() => clearImage("banner")}><X />Remover</Button>}</div>
          {d.posicao === "carrossel" && <div className="ed-row ed-extras">{d.banners.map((b, i) => <span key={b.path} className="ed-extra" style={{ backgroundImage: `url("${b.url}")` }}><button type="button" aria-label={`Remover banner ${i + 2}`} onClick={() => { void supabase.storage.from("lojas").remove([b.path]); update({ banners: d.banners.filter(x => x.path !== b.path) }, { immediate: true }); }}><X /></button></span>)}
            {d.banners.length < 2 && <label className="ed-upload"><Upload aria-hidden="true" />Adicionar banner {d.banners.length + 2} de 3<input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => { void upload("extra", e.target.files?.[0]); e.target.value = ""; }} /></label>}</div>}
          <StoreAiPicker lojaId={id} tipo="banner" fonte={FONTES.find(f => f.id === t.fonte)?.titulo} nome={view.nome} nicho={d.nicho} cor={t.cor_destaque} ratio={ratio} onChosen={(path, url) => { const n = { ...dRef.current!, bannerPath: path, bannerUrl: url }; dRef.current = n; setD(n); void qc.invalidateQueries({ queryKey: ["stores"] }); }} /></div>}
        {step === 3 && <div className="ed-sec"><h2>Tema</h2>
          <h3>Paletas prontas</h3>
          <Radios label="Paleta" className="ed-palettes">{PALETAS.map(p => <button key={p.id} type="button" role="radio" aria-checked={t.paleta === p.id} tabIndex={t.paleta === p.id ? 0 : -1} onClick={() => setTema({ cor_destaque: p.destaque, cor_fundo: p.fundo, cor_botao: p.botao, paleta: p.id })}>
            <span className="ed-pal" style={{ background: p.fundo }}><i style={{ background: p.destaque }} /><i style={{ background: p.botao, color: textoSobre(p.botao) }}>Aa</i></span>{p.nome}</button>)}</Radios>
          <h3>Cores</h3>
          <div className="ed-colors">
            <label className="ed-color"><input type="color" value={t.cor_destaque} onChange={e => setTema({ cor_destaque: e.target.value.toUpperCase() })} /><span>Destaque</span></label>
            <label className="ed-color"><input type="color" value={t.cor_botao} onChange={e => setTema({ cor_botao: e.target.value.toUpperCase() })} /><span>Botões</span></label>
          </div>
          <Radios label="Fundo">{FUNDOS.map(f => <button key={f.id} type="button" role="radio" aria-checked={t.cor_fundo === f.id} tabIndex={t.cor_fundo === f.id ? 0 : -1} onClick={() => setTema({ cor_fundo: f.id })}><span className="ed-swatch" style={{ background: f.id }} />{f.nome}</button>)}</Radios>
          {avisos.length > 0 && <div className="ed-warn" role="alert">{avisos.map(a => <p key={a}><AlertTriangle aria-hidden="true" />{a}</p>)}<p className="ed-hint">O texto foi ajustado automaticamente para continuar legível.</p></div>}
          <h3>Cantos</h3>
          <Radios label="Cantos">{CANTOS.map(c => <button key={c.id} type="button" role="radio" aria-checked={t.cantos === c.id} tabIndex={t.cantos === c.id ? 0 : -1} onClick={() => setTema({ cantos: c.id, paleta: t.paleta ?? null })}><span className="ed-corner" style={{ borderRadius: c.raio }} />{c.nome}</button>)}</Radios>
          <h3>Fonte</h3>
          <Radios label="Fonte">{FONTES.map(f => <button key={f.id} type="button" role="radio" aria-checked={t.fonte === f.id} tabIndex={t.fonte === f.id ? 0 : -1} onClick={() => setTema({ fonte: f.id, paleta: t.paleta ?? null })}><span className="ed-font" style={{ fontFamily: f.titulo }}>Aa</span>{f.nome}</button>)}</Radios>
          {opt("Estilo dos cartões", CARTOES, ex.cartao, v => setTema({ cartao: v, paleta: t.paleta ?? null }))}
          {opt("Estilo dos botões", BOTOES, ex.botaoEstilo, v => setTema({ botaoEstilo: v, paleta: t.paleta ?? null }))}
          {opt("Espaçamento", ESPACOS, ex.espaco, v => setTema({ espaco: v, paleta: t.paleta ?? null }))}
          {opt("Topo da loja", TOPOS, ex.topo, v => setTema({ topo: v, paleta: t.paleta ?? null }))}
        </div>}
        {step === 2 && <div className="ed-sec"><h2>Layout</h2>
          <h3>Produtos</h3>
          <Radios label="Layout de produtos" className="ed-presets">{LAYOUTS.map(p => <button key={p.id} type="button" role="radio" aria-checked={d.preset === p.id} tabIndex={d.preset === p.id ? 0 : -1} onClick={() => update({ preset: p.id })}>
            <span className={`ed-thumb ed-thumb-${p.id}`} style={temaVars(t) as CSSProperties} aria-hidden="true"><i /><i /><i /><i /><i /><i /></span><strong>{p.nome}</strong><small>{p.desc}</small></button>)}</Radios>
          <p className="ed-hint">Trocar o layout não remove produtos.</p>
          {opt("Foto do produto", FOTOS, ex.foto, v => setTema({ foto: v, paleta: t.paleta ?? null }))}
          <h3>Mostrar nos cartões</h3>
          <div className="ed-toggles">{([["selo", "Selo do fornecedor"], ["preco", "Preço"], ["botao", "Botão"], ["desconto", "Selo de desconto (verde)"]] as const).map(([k, l]) => <label key={k}><input type="checkbox" checked={!!ex.mostrar[k]} onChange={e => setTema({ mostrar: { ...ex.mostrar, [k]: e.target.checked }, paleta: t.paleta ?? null })} />{l}</label>)}</div>
          {ex.mostrar.desconto && <label className="ed-field"><span>Frase do selo verde</span><input value={ex.mostrar.seloTexto ?? ""} maxLength={20} placeholder="Oferta" onChange={e => setTema({ mostrar: { ...ex.mostrar, seloTexto: e.target.value }, paleta: t.paleta ?? null })} onBlur={() => void flush()} /><small>Mostra "-X%" e o preço antigo só quando o Mercado Livre informa um desconto real.</small></label>}
          {opt("Filtro de categorias", FILTROS, ex.filtro, v => setTema({ filtro: v, paleta: t.paleta ?? null }))}
          {opt("Rodapé", RODAPES, ex.rodape, v => setTema({ rodape: v, paleta: t.paleta ?? null }))}
          <h3>Posição do banner</h3>
          <Radios label="Posição do banner" className="ed-presets">{BANNER_POS.map(b => <button key={b.id} type="button" role="radio" aria-checked={d.posicao === b.id} tabIndex={d.posicao === b.id ? 0 : -1} onClick={() => update({ posicao: b.id })}>
            <span className={`ed-thumb ed-bpos ed-bpos-${b.id}`} style={temaVars(t) as CSSProperties} aria-hidden="true"><b /><i /><i /><i /></span><strong>{b.nome}</strong></button>)}</Radios>
          {d.posicao !== "nenhum" && <>
            <Radios label="Altura do banner">{(["P", "M", "G"] as const).map(h => <button key={h} type="button" role="radio" aria-checked={d.altura === h} tabIndex={d.altura === h ? 0 : -1} onClick={() => update({ altura: h })}>{h === "P" ? "Pequeno" : h === "M" ? "Médio" : "Grande"}</button>)}</Radios>
            <Radios label="Alinhamento do texto">{(["esquerda", "centro"] as const).map(a => <button key={a} type="button" role="radio" aria-checked={d.alinhamento === a} tabIndex={d.alinhamento === a ? 0 : -1} onClick={() => update({ alinhamento: a })}>{a === "esquerda" ? "Texto à esquerda" : "Texto ao centro"}</button>)}</Radios>
            <label className="ed-field"><span>Frase do banner</span><input value={d.frase} maxLength={90} placeholder="Achados que facilitam o seu dia" onChange={e => update({ frase: e.target.value }, { typing: true })} onBlur={() => void flush()} /></label>
            <label className="ed-field"><span>Texto do botão</span><input value={d.botao} maxLength={24} placeholder="Ver achados" onChange={e => update({ botao: e.target.value }, { typing: true })} onBlur={() => void flush()} /></label>
          </>}
        </div>}
        {step === 4 && <div className="ed-sec"><h2>Produtos</h2><p className="ed-count" aria-live="polite">{sel.length} selecionados</p><p className="ed-hint">Na loja, produtos fora do ar ou de fornecedor desconectado ficam ocultos automaticamente.</p>
          {mine.isLoading ? <Skeleton className="st-card-skel" /> : !products.length ? <div className="v2-empty"><p>Você ainda não tem produtos salvos.</p><Button asChild><Link to="/painel/produtos">Ver produtos validados</Link></Button></div>
          : <ul className="ed-prods">{[...sel.map(pid => byId.get(pid)).filter(Boolean), ...products.filter(p => !sel.includes(p.id))].map(p => {
            const on = sel.includes(p!.id); const off = p!.status === "fora_do_ar";
            return <li key={p!.id} className={`${off ? "is-off" : ""}${dragId === p!.id ? " is-drag" : ""}`} draggable={on && !off} onDragStart={() => setDragId(p!.id)} onDragEnd={() => setDragId(null)}
              onDragOver={e => { if (on && dragId && dragId !== p!.id) { e.preventDefault(); } }} onDrop={() => { if (!dragId) return; const n = sel.filter(x => x !== dragId); n.splice(n.indexOf(p!.id) + (sel.indexOf(dragId) < sel.indexOf(p!.id) ? 1 : 0), 0, dragId); setProducts(n); setDragId(null); }}>
              {on && !off ? <GripVertical className="ed-grip" aria-hidden="true" /> : <span className="ed-grip" />}
              <input type="checkbox" checked={on} disabled={off && !on} aria-label={`Incluir ${p!.produto?.titulo ?? "produto"}`} onChange={() => setProducts(on ? sel.filter(x => x !== p!.id) : [...sel, p!.id])} />
              {p!.produto?.imagens[0] ? <img src={p!.produto.imagens[0]} alt="" width={44} height={44} loading="lazy" /> : <span className="ed-noimg" />}
              <div className="ed-prod-txt"><strong>{p!.produto?.titulo ?? "Produto indisponível"}</strong><small>{p!.fornecedor === "ml" ? "Mercado Livre" : "Shopee"} · {p!.produto ? brl(p!.produto.preco) : "—"}{off ? " · Saiu do ar no fornecedor" : ""}</small></div>
              {on && <span className="ed-move"><Button variant="ghost" size="icon" aria-label="Subir" disabled={sel[0] === p!.id} onClick={() => move(p!.id, -1)}><ArrowUp /></Button><Button variant="ghost" size="icon" aria-label="Descer" disabled={sel[sel.length - 1] === p!.id} onClick={() => move(p!.id, 1)}><ArrowDown /></Button></span>}
            </li>; })}</ul>}</div>}
        <div className="ed-foot"><Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Voltar</Button>
          <Button onClick={next} disabled={step === 0 && !d.nome.trim()} title={step === 0 && !d.nome.trim() ? "Dê um nome para a loja" : undefined}>{step === LAST ? "Publicar loja" : "Continuar"}</Button></div>
      </section>
      <section className="ed-preview" aria-label="Prévia ao vivo">
        <div className="ed-ptools">
          <div className="ed-device" role="group" aria-label="Dispositivo"><button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Laptop aria-hidden="true" />Computador</button><button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone aria-hidden="true" />Celular</button></div>
          <div className="ed-zoom" role="group" aria-label="Zoom da prévia"><Button variant="ghost" size="icon" aria-label="Diminuir zoom" disabled={zoom <= 0.5} onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}><ZoomOut /></Button>
            <button type="button" className="ed-zoom-val" onClick={() => setZoom(1)} title="Ajustar à tela">{zoom === 1 ? "Ajustar" : `${Math.round(zoom * 100)}%`}</button>
            <Button variant="ghost" size="icon" aria-label="Aumentar zoom" disabled={zoom >= 1.5} onClick={() => setZoom(z => Math.min(1.5, +(z + 0.25).toFixed(2)))}><ZoomIn /></Button>
            {st === "conflict" && <Button variant="outline" size="sm" onClick={() => void reloadFromServer()}><RefreshCw />Recarregar</Button>}</div>
        </div>
        <ScaledFrame width={device === "mobile" ? 390 : 1180} zoom={zoom} mobile={device === "mobile"}>
          <LojaPublica loja={view} itens={prevItems} consultadoEm={mine.data?.consultadoEm ?? new Date().toISOString()} mobile={device === "mobile"} hrefFor={i => i.meuProdutoId.startsWith("exemplo-") ? "#" : `/r/${id}/${i.meuProdutoId}?c=editor`} />
        </ScaledFrame>
      </section>
    </div>
  </div>;
}

/** Renderiza a loja na largura real do aparelho e reduz para caber no espaço disponível (nunca corta). */
function ScaledFrame({ width, zoom, mobile, children }: { width: number; zoom: number; mobile: boolean; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null); const inner = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => setBox({ w: outer.current?.clientWidth ?? 0, h: inner.current?.offsetHeight ?? 0 }));
    if (outer.current) ro.observe(outer.current); if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);
  const fit = box.w ? Math.min(1, box.w / width) : 1; const s = fit * zoom;
  return <div ref={outer} className={`ed-frame v2-noscroll${mobile ? " is-mobile" : ""}`}>
    <div style={{ width: width * s, height: box.h * s, margin: "0 auto" }}>
      <div ref={inner} style={{ width, transform: `scale(${s})`, transformOrigin: "top left" }}>{children}</div>
    </div>
  </div>;
}
