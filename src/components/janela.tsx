import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import * as D from "@radix-ui/react-dialog";
import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** PATCH-011 · Janelas globais: cada janela tem endereço próprio (?janela=nome&...). */
export type Tamanho = "P" | "M" | "G" | "GG";
export type JanelaProps = { params: Record<string, string>; fechar: () => void };
type Def = { tamanho: Tamanho; titulo: (p: Record<string, string>) => string; subtitulo?: string; trilha?: string; component: ComponentType<JanelaProps> };

const lz = <T,>(f: () => Promise<{ default: ComponentType<T> }>) => lazy(f);
export const JANELAS: Record<string, Def> = {
  "loja-editor": { trilha: "Minhas lojas", tamanho: "GG", titulo: () => "Editar loja", subtitulo: "Salva sozinho a cada alteração", component: lz(() => import("@/components/janelas").then(m => ({ default: m.LojaEditorJanela }))) },
  publicar: { trilha: "Minhas lojas", tamanho: "GG", titulo: () => "Colocar no ar", subtitulo: "Endereço, análise e publicação", component: lz(() => import("@/components/janelas").then(m => ({ default: m.PublicarJanela }))) },
  "adicionar-produto": { trilha: "Produtos validados", tamanho: "M", titulo: () => "Adicionar produto", subtitulo: "Escolha onde guardar", component: lz(() => import("@/components/janelas").then(m => ({ default: m.AdicionarProdutoJanela }))) },
  "como-validamos": { trilha: "Produtos validados", tamanho: "M", titulo: () => "Como validamos", component: lz(() => import("@/components/janelas").then(m => ({ default: m.ComoValidamosJanela }))) },
  "escolher-loja": { trilha: "Meus produtos", tamanho: "M", titulo: () => "Adicionar à loja", component: lz(() => import("@/components/janelas").then(m => ({ default: m.EscolherLojaJanela }))) },
  "excluir-loja": { trilha: "Minhas lojas", tamanho: "P", titulo: () => "Excluir loja", component: lz(() => import("@/components/janelas").then(m => ({ default: m.ExcluirLojaJanela }))) },
  cupons: { trilha: "Início", tamanho: "M", titulo: () => "Cupons exclusivos", component: lz(() => import("@/components/janelas").then(m => ({ default: m.CuponsJanela }))) },
  fornecedor: { trilha: "Fornecedores", tamanho: "M", titulo: p => p["f"] === "shopee" ? "Usar a Shopee" : "Usar o Mercado Livre", subtitulo: "Responda rapidinho para conectar", component: lz(() => import("@/components/suppliers-onboarding").then(m => ({ default: m.FornecedorJanela }))) },
};
/** Parâmetros que pertencem às janelas (removidos ao fechar). */
export const JANELA_KEYS = ["janela", "id", "passo", "loja", "f", "ids", "alvo"] as const;

export function useJanela() {
  const navigate = useNavigate(); const router = useRouter();
  const abrir = useCallback((nome: string, params: Record<string, string | number> = {}, opts: { replace?: boolean } = {}) => {
    origem.current = document.activeElement as HTMLElement | null;
    void navigate({ to: ".", search: ((prev: Record<string, unknown>) => ({ ...strip(prev), janela: nome, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) })) as never, replace: opts.replace, state: { __janela: true } as never } as never);
  }, [navigate]);
  const fechar = useCallback(() => {
    const st = router.state.location.state as { __janela?: boolean } | undefined;
    if (st?.__janela) router.history.back();
    else void navigate({ to: ".", search: ((prev: Record<string, unknown>) => strip(prev)) as never, replace: true } as never);
  }, [navigate, router]);
  return { abrir, fechar };
}
const origem: { current: HTMLElement | null } = { current: null };
function strip(prev: Record<string, unknown>) { const n = { ...prev }; for (const k of JANELA_KEYS) delete n[k]; return n; }

/** Montado uma vez no layout do painel: lê ?janela= e mostra a janela registrada. */
export function JanelaHost() {
  const loc = useLocation(); const { fechar } = useJanela();
  const search = loc.search as Record<string, unknown>;
  const nome = typeof search["janela"] === "string" ? search["janela"] : null;
  const def = nome ? JANELAS[nome] : undefined;
  const params = Object.fromEntries(Object.entries(search).filter(([, v]) => typeof v === "string" || typeof v === "number").map(([k, v]) => [k, String(v)]));
  // Mantém o último conteúdo durante a animação de saída.
  const [last, setLast] = useState<{ nome: string; params: Record<string, string> } | null>(null);
  const key = nome ? `${nome}:${JSON.stringify(params)}` : null;
  useEffect(() => { if (nome && def) setLast({ nome, params }); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = last && JANELAS[last.nome];
  if (!shown || !last) return null;
  return <Janela open={!!def} tamanho={shown.tamanho} titulo={shown.titulo(last.params)} subtitulo={shown.subtitulo} trilha={shown.trilha} onClose={fechar}>
    <shown.component params={last.params} fechar={fechar} />
  </Janela>;
}

/** Casca padrão: cabeçalho fixo, corpo com rolagem própria, folha arrastável no celular. */
export function Janela({ open, tamanho, titulo, subtitulo, trilha, onClose, children, footer }: { trilha?: string | undefined; open: boolean; tamanho: Tamanho; titulo: string; subtitulo?: string | undefined; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null); const drag = useRef<{ y: number; t: number } | null>(null);
  const onDown = (e: React.PointerEvent) => { if (window.innerWidth >= 768) return; drag.current = { y: e.clientY, t: performance.now() }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { const d = drag.current; const el = ref.current; if (!d || !el) return; const dy = Math.max(0, e.clientY - d.y); el.style.transform = `translateY(${dy}px)`; el.style.transition = "none"; const ov = el.previousElementSibling as HTMLElement | null; if (ov) ov.style.opacity = String(1 - Math.min(1, dy / el.offsetHeight)); };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current; const el = ref.current; drag.current = null; if (!d || !el) return;
    const dy = e.clientY - d.y; const v = dy / Math.max(1, performance.now() - d.t);
    el.style.transition = ""; const ov = el.previousElementSibling as HTMLElement | null; if (ov) ov.style.opacity = "";
    if (dy > el.offsetHeight * 0.3 || v > 0.6) onClose(); else el.style.transform = "";
  };
  return <D.Root open={open} onOpenChange={o => { if (!o) onClose(); }}>
    <D.Portal>
      <D.Overlay className="janela-overlay" />
      <D.Content ref={ref} className={`janela janela-${tamanho}`} aria-describedby={undefined}
        onInteractOutside={e => { if (tamanho === "P") e.preventDefault(); }}
        onCloseAutoFocus={e => { if (origem.current?.isConnected) { e.preventDefault(); origem.current.focus(); } }}>
        <div className="janela-handle" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden="true"><span /></div>
        <header className="janela-head">
          <div className="janela-titles">{trilha && <nav className="janela-trilha" aria-label="Caminho">{trilha} › {titulo}</nav>}<D.Title className="janela-title">{titulo}</D.Title>{subtitulo && <p className="janela-sub">{subtitulo}</p>}</div>
          <D.Close className="janela-x" aria-label="Fechar"><X /></D.Close>
        </header>
        <div className="janela-body v2-noscroll"><Suspense fallback={<div className="janela-load"><Skeleton className="st-card-skel" /></div>}>{children}</Suspense></div>
        {footer && <footer className="janela-foot">{footer}</footer>}
      </D.Content>
    </D.Portal>
  </D.Root>;
}
