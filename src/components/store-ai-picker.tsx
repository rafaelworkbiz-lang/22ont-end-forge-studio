import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { escolherIdentidade, gerarIdentidade, getBriefing, getIaUsage, refinarIdentidade, salvarVariacoes } from "@/lib/store-ai.functions";
import { IA_ESTILOS, IA_OPCOES, type IaEstilo, type IaTipo } from "@/lib/store-ai-moderation";
import { sugestoes, type Briefing } from "@/lib/store-ai-art";
import { nicheHeadline } from "@/lib/store-rules";

type Props = { lojaId: string; tipo: IaTipo; nome: string; nicho: string | null; cor: string; ratio?: number; fonte?: string | undefined; onChosen: (path: string, url: string | null) => void };
type Gen = { id: string; urls: string[]; ideias: string[] };

/** Monta no navegador ícone 512, favicon 64 e versão horizontal (símbolo + nome com a fonte da loja). */
async function montarVariacoes(url: string, nome: string, fonte: string) {
  const img = new Image(); img.crossOrigin = "anonymous"; img.src = url; await img.decode();
  const quad = (s: number) => { const c = document.createElement("canvas"); c.width = c.height = s; c.getContext("2d")!.drawImage(img, 0, 0, s, s); return c.toDataURL("image/png"); };
  await document.fonts?.load(`800 96px ${fonte}`).catch(() => null);
  const h = 256; const c = document.createElement("canvas"); const ctx = c.getContext("2d")!;
  ctx.font = `800 110px ${fonte}`; const w = Math.ceil(h + 32 + ctx.measureText(nome).width + 24);
  c.width = Math.min(w, 2400); c.height = h;
  ctx.drawImage(img, 0, 0, h, h); ctx.font = `800 110px ${fonte}`; ctx.fillStyle = "#16140F"; ctx.textBaseline = "middle"; ctx.fillText(nome, h + 32, h / 2 + 6);
  return { icone: quad(512), favicon: quad(64), horizontal: c.toDataURL("image/png") };
}

/** Geração de logo/banner por IA a partir do briefing e da loja real; nome e frase são compostos pelo app. */
export function StoreAiPicker({ lojaId, tipo, nome, nicho, cor, ratio = 16 / 6, fonte: fonteProp, onChosen }: Props) {
  const fonte = fonteProp ?? '"Bricolage Grotesque", sans-serif';
  const gerar = useServerFn(gerarIdentidade); const escolher = useServerFn(escolherIdentidade); const usage = useServerFn(getIaUsage);
  const variar = useServerFn(salvarVariacoes);
  const qc = useQueryClient();
  const u = useQuery({ queryKey: ["ia-usage"], queryFn: () => usage(), staleTime: 30_000 });
  const [desc, setDesc] = useState(""); const [cor1, setCor1] = useState(cor.toUpperCase()); const [cor2, setCor2] = useState("#FFFFFF");
  const [estilo, setEstilo] = useState<IaEstilo>("Moderno");
  const [busy, setBusy] = useState<false | "gerar">(false); const [msg, setMsg] = useState<{ text: string; limit?: boolean } | null>(null);
  const [gen, setGen] = useState<Gen | null>(null); const [sel, setSel] = useState<number | null>(null); const [choosing, setChoosing] = useState(false);
  const [final, setFinal] = useState<string | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const usado = u.data?.usado ?? 0; const limite = u.data?.limite ?? 0; const esgotado = !!u.data && usado >= limite;
  const n = IA_OPCOES[tipo]; const sug = sugestoes(nicho);
  const setUso = (r: { usado: number; limite: number }) => qc.setQueryData(["ia-usage"], (o: typeof u.data) => o && { ...o, usado: r.usado, limite: r.limite });

  async function run() {
    setBusy("gerar"); setMsg(null); setSel(null); setFinal(null);
    const briefing: Briefing = { cores: `${cor1} e ${cor2}` };
    const r = await gerar({ data: { lojaId, tipo, estilo, descricao: desc.trim() || null, comTexto: false, briefing } }).catch(() => null);
    setBusy(false);
    if (!r) { setMsg({ text: "Não conseguimos gerar agora. Tente de novo em instantes." }); return; }
    setUso(r);
    if (r.ok) setGen({ id: r.geracaoId, urls: r.opcoes, ideias: r.ideias }); else setMsg({ text: r.error, limit: r.code === "limite" });
  }
  async function pick(i: number) {
    if (!gen || choosing) return; setSel(i); setChoosing(true); setFinal(null);
    const r = await escolher({ data: { geracaoId: gen.id, indice: i } }).catch(() => null); setChoosing(false);
    if (!r?.ok) { setMsg({ text: r?.error ?? "Não foi possível usar essa opção." }); return; }
    onChosen(r.path, r.url);
    if (tipo === "logo" && r.url) {
      try { const v = await montarVariacoes(r.url, nome, fonte); const s = await variar({ data: { geracaoId: r.geracaoId, ...v } }); setFinal(s.ok ? "Logo aplicado na sua loja." : null); }
      catch { setFinal(null); }
    }
  }
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0; if (!d || !gen) return;
    e.preventDefault(); const j = (i + d + gen.urls.length) % gen.urls.length; refs.current[j]?.focus();
  };
  const label = gen ? "Gerar outras 2 opções" : tipo === "logo" ? "Gerar logo com IA" : "Gerar banner com IA";

  return <div className="ia-pick">
    <label className="ed-field"><span>{tipo === "logo" ? "Como você imagina seu logo?" : "Como você imagina seu banner?"}</span>
      <textarea className="ia-desc" rows={3} value={desc} maxLength={200} onChange={e => setDesc(e.target.value)} placeholder={tipo === "logo" ? `ex.: uma ${sug.simbolo[0]} simples e acolhedora` : "ex.: cozinha clara com plantas e luz natural"} /></label>
    <label className="ed-field"><span>Cores</span>
      <span className="ia-colors"><input type="color" value={cor1} onChange={e => setCor1(e.target.value.toUpperCase())} aria-label="Cor principal" /><input type="color" value={cor2} onChange={e => setCor2(e.target.value.toUpperCase())} aria-label="Cor de apoio" /></span></label>
    <fieldset className="ed-pills"><legend>Estilo</legend>{IA_ESTILOS.map(s => <button key={s} type="button" aria-pressed={estilo === s} onClick={() => setEstilo(s)}>{s}</button>)}</fieldset>
    <div className="ia-actions"><Button onClick={() => void run()} disabled={!!busy || esgotado} aria-describedby={`ia-msg-${tipo}`}>{busy === "gerar" ? <Loader2 className="animate-spin" /> : <Sparkles />}{busy === "gerar" ? "Criando…" : label}</Button>
      <span className="ia-count">Gerações de IA este mês: {Number.isInteger(usado) ? usado : usado.toFixed(1)} de {limite}</span></div>
    <div id={`ia-msg-${tipo}`} aria-live="polite">{(msg || esgotado) && <p className="ia-msg">{msg?.text ?? `Você usou as ${limite} gerações de IA deste mês.`}{(msg?.limit || esgotado) && u.data?.plano === "mensal" && <> <Link to="/painel/perfil" className="ia-up">Conhecer o Vitalício</Link></>}</p>}{final && <p className="ia-msg">{final}</p>}</div>
    {busy && <div className={`ia-grid ia-grid-${tipo}`} aria-busy="true" aria-label="Criando opções">{Array.from({ length: n }, (_, i) => <span key={i} className="ia-skel" />)}</div>}
    {!busy && gen && <div className={`ia-grid ia-grid-${tipo}`} role="radiogroup" aria-label={tipo === "logo" ? "Opções de logo" : "Opções de banner"}>
      {gen.urls.map((url, i) => <div key={url} className="ia-opt-wrap">
        <button ref={el => { refs.current[i] = el; }} type="button" role="radio" aria-checked={sel === i} tabIndex={sel === i || (sel === null && i === 0) ? 0 : -1} className="ia-opt" onClick={() => void pick(i)} onKeyDown={e => onKey(e, i)} aria-label={`Opção ${i + 1}${gen.ideias[i] ? `: ${gen.ideias[i]}` : ""}`}>
          {tipo === "logo" ? <span className="ia-logo"><img src={url} alt="" width={96} height={96} /></span>
            : <span className="ia-banner" style={{ backgroundImage: `url("${url}")`, aspectRatio: String(ratio) }} />}
          {sel === i && choosing && <Loader2 className="ia-opt-spin animate-spin" aria-hidden="true" />}
        </button>
      </div>)}</div>}
  </div>;
}
