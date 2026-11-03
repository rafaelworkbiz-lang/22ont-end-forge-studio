import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = { icon: LucideIcon; badge?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode; summary?: { value: ReactNode; label: string }; word?: string; children?: ReactNode; tone?: "dark" };

/** Bloco amarelo padrão no topo de cada aba do painel. Ao rolar, aparece uma barra fina fixa (56px). */
export function TabHeader({ icon: Icon, badge, title, description, actions, summary, word, children, tone }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setStuck(!e!.isIntersecting && e!.boundingClientRect.top < 0), { threshold: 0, rootMargin: "-40px 0px 0px 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <>
      <div className={`v2-tabbar ${stuck ? "is-on" : ""}`} aria-hidden={!stuck}>
        <div className="v2-tabbar-in">
          <span className="v2-tabhead-icon" aria-hidden="true"><Icon /></span>
          <strong>{title}</strong>
          {actions && <div className="v2-tabbar-actions" inert={!stuck || undefined}>{actions}</div>}
          <button type="button" className="v2-tabbar-top" tabIndex={stuck ? 0 : -1} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Voltar ao topo</button>
        </div>
      </div>
      <header ref={ref} className="v2-tabhead is-dark" data-tone={tone}>
        {word && <span className="v2-tabhead-word" aria-hidden="true">{word}</span>}
        <div className="v2-tabhead-main">
          <div className="v2-tabhead-top"><span className="v2-tabhead-icon" aria-hidden="true"><Icon /></span>{badge && <span className="v2-tabhead-kicker">{badge}</span>}</div>
          <h1>{title}</h1>
          {description && <div className={`v2-tabhead-desc ${more ? "is-open" : ""}`}><p>{description}</p><button type="button" className="v2-tabhead-more" onClick={() => setMore(m => !m)} aria-expanded={more}>{more ? "ver menos" : "ver mais"}</button></div>}
          {actions && <div className="v2-tabhead-actions">{actions}</div>}
          {children}
        </div>
        {summary && <div className="v2-tabhead-summary"><strong className="tabular-nums">{summary.value}</strong><span>{summary.label}</span></div>}
      </header>
    </>
  );
}

export function EmptyState({ icon: Icon, text, action }: { icon: LucideIcon; text: string; action: ReactNode }) {
  return <section className="v2-card v2-empty"><span className="v2-empty-icon" aria-hidden="true"><Icon /></span><p>{text}</p>{action}</section>;
}
