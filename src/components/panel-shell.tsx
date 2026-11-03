import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { CommandPalette } from "@/components/command-palette";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Home, Store, Rocket, Heart, Flame, Megaphone, Truck, Settings, LogOut, PanelLeftClose, PanelLeftOpen, ShieldUser, MoreHorizontal, X, Search, Users } from "lucide-react";
import { useMyOnboarding } from "@/hooks/use-onboarding";
import { useAccount } from "@/components/auth-provider";
import { useMyProducts } from "@/components/my-products-query";
import { useMeliCallback } from "@/components/integrations";
import { CouponsCard } from "@/components/coupons-dialog";
import { Toaster } from "@/components/ui/sonner";
import { SaleNotifier } from "@/components/sale-notifier";
import { JanelaHost } from "@/components/janela";
import { WhatsappPrompt } from "@/components/whatsapp-prompt";
import { getMyCoupons } from "@/lib/coupons.functions";
import logo from "@/assets/logo-icone.png.asset.json";

type Ctx = { hidden: boolean; setHidden: (v: boolean) => void };
const PanelCtx = createContext<Ctx>({ hidden: false, setHidden: () => {} });
export const usePanel = () => useContext(PanelCtx);

type Item = { to: string; label: string; icon: typeof Home; count?: number };
const ITEMS: Item[] = [
  { to: "/painel", label: "Início", icon: Home },
  { to: "/painel/lojas", label: "Minhas lojas", icon: Store },
  { to: "/painel/publicar", label: "Colocar no ar", icon: Rocket },
  { to: "/painel/meus-produtos", label: "Meus produtos", icon: Heart, count: 0 },
  { to: "/painel/produtos", label: "Produtos validados", icon: Flame },
  { to: "/painel/divulgacao", label: "Divulgação", icon: Megaphone },
  { to: "/painel/fornecedores", label: "Fornecedores", icon: Truck },
];
const ADMIN_ITEMS: Item[] = [
  { to: "/painel/usuarios", label: "Administração", icon: ShieldUser },
];
const MOBILE = ["/painel", "/painel/produtos", "/painel/lojas", "/painel/divulgacao"];
const MOBILE_LABEL: Record<string, string> = { "/painel": "Início", "/painel/produtos": "Produtos", "/painel/lojas": "Lojas", "/painel/divulgacao": "Divulgar" };

function NavLink({ item, onClick }: { item: Item; onClick?: () => void }) {
  return (
    <Link to={item.to as "/painel"} title={item.label} data-tip={item.label} onClick={onClick} className="v2-nav-item" activeProps={{ className: "is-active", "aria-current": "page" }} activeOptions={{ exact: item.to === "/painel", includeSearch: false }}>
      <item.icon aria-hidden="true" /><span className="v2-nav-label">{item.label}</span>
      {item.count !== undefined && <span className="v2-nav-count tabular-nums" aria-label={`${item.count} produtos`}>{item.count}</span>}
    </Link>
  );
}

export function PanelShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOut } = useAccount();
  const ob = useMyOnboarding();
  const teamItems: Item[] = ob.data?.isInfluencer && ob.data.is_gerente && ob.data.status === "ativo" ? [{ to: "/painel/meu-time", label: "Meu time", icon: Users }] : [];
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  // ≥1440px: menu aberto por padrão (preferência salva por usuário). Abaixo: ícones, e abre por cima ao clicar.
  const wide = useWide();
  const compact = useCompactPanel();
  const prefKey = `afp:menu:${user?.id ?? "anon"}`;
  const [pref, setPref] = useState<"open" | "closed" | null>(null);
  const [peek, setPeek] = useState(false);
  useEffect(() => { try { const v = localStorage.getItem(prefKey); setPref(v === "open" || v === "closed" ? v : null); } catch { /* sem storage */ } }, [prefKey]);
  // Janela aberta (?janela=) recolhe o menu sem mudar a preferência salva; ao fechar, volta como estava.
  const janelaAberta = useRouterState({ select: s => typeof (s.location.search as Record<string, unknown>)["janela"] === "string" });
  const [dialogAberto, setDialogAberto] = useState(false);
  useEffect(() => {
    const sel = '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]';
    const check = () => setDialogAberto(!!document.querySelector(sel));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state"] });
    return () => mo.disconnect();
  }, []);
  const collapsed = janelaAberta || dialogAberto || (wide ? pref === "closed" : !peek);
  const overlay = !wide && peek && !janelaAberta;
  const toggleMenu = () => {
    if (!wide) { setPeek(p => !p); return; }
    const v = collapsed ? "open" : "closed"; setPref(v); try { localStorage.setItem(prefKey, v); } catch { /* sem storage */ }
  };
  useEffect(() => { if (!overlay) return; const k = (e: KeyboardEvent) => e.key === "Escape" && setPeek(false); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [overlay]);
  const [more, setMore] = useState(false);
  const fetchCoupons = useServerFn(getMyCoupons);
  const coupons = useQuery({ queryKey: ["my-coupons", user?.id], queryFn: () => fetchCoupons(), enabled: !!user, staleTime: 60_000 });
  const toSuppliers = useCallback(() => void navigate({ to: "/painel/fornecedores" }), [navigate]);
  useMeliCallback(toSuppliers);
  const meta = (user?.user_metadata ?? {}) as { name?: string; full_name?: string };
  const name = meta.name || meta.full_name || user?.email?.split("@")[0] || "Afiliado";
  const exit = async () => { try { await signOut(); } catch { toast.error("Não foi possível sair. Tente novamente."); } };
  const myCount = useMyProducts().data?.items.length ?? 0;
  const [palette, setPalette] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);
  const path = useRouterState({ select: s => s.location.pathname });
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const el = nav.querySelector<HTMLElement>(".v2-nav-item.is-active");
      if (!el) return setPill(null);
      const a = el.getBoundingClientRect(), b = nav.getBoundingClientRect();
      setPill({ top: a.top - b.top + nav.scrollTop, height: a.height });
    };
    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    void document.fonts?.ready.then(measure);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [path, collapsed, isAdmin, teamItems.length]);
  const extra = [...ITEMS.filter(i => !MOBILE.includes(i.to)), ...teamItems, ...(isAdmin ? ADMIN_ITEMS : [])];

  return (
    <PanelCtx.Provider value={{ hidden, setHidden }}>
      <div className={`v2-app light-theme affiliate-app-v2 ${compact ? "v2-compact" : ""} ${collapsed ? "is-collapsed" : ""} ${overlay ? "is-overlay" : ""}`}>
        {overlay && <div className="v2-side-backdrop" onClick={() => setPeek(false)} aria-hidden="true" />}
        <aside className="v2-sidebar v2-noscroll" aria-label="Menu principal">
          <div className="v2-brand">
            <img src={logo.url} alt="" width={44} height={44} />
            <span className="v2-brand-name">afiliaplace</span>
            <button type="button" className="v2-icon-btn" aria-label={collapsed ? "Expandir menu" : "Recolher menu"} aria-expanded={!collapsed} onClick={toggleMenu}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
          </div>
          <nav ref={navRef} className="v2-nav" style={{ position: "relative" }} onClick={e => { if (overlay && (e.target as HTMLElement).closest("a")) setPeek(false); }}>
            {pill && <span className="v2-nav-pill" aria-hidden="true" style={{ transform: `translateY(${pill.top}px)`, height: pill.height }} />}
            {ITEMS.map(i => <NavLink key={i.to} item={i.count !== undefined ? { ...i, count: myCount } : i} />)}
            {teamItems.length > 0 && <><div className="v2-nav-group">Time</div>{teamItems.map(i => <NavLink key={i.to} item={i} />)}</>}
            {isAdmin && <><div className="v2-nav-group">Administração</div>{ADMIN_ITEMS.map(i => <NavLink key={i.to} item={i} />)}</>}
          </nav>
          <div className="v2-sidebar-foot">
            {coupons.data?.isInfluencer && !collapsed && <CouponsCard coupons={coupons.data.coupons} />}
            <div className="v2-user"><span className="v2-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span><div className="v2-user-text"><strong>{name}</strong><span>{user?.email}</span></div></div>
            <NavLink item={{ to: "/painel/perfil", label: "Configurações", icon: Settings }} />
            <button type="button" className="v2-nav-item" onClick={exit} title="Sair da conta" data-tip="Sair da conta"><LogOut aria-hidden="true" /><span className="v2-nav-label">Sair da conta</span></button>
          </div>
        </aside>
        <main className="v2-main v2-noscroll">{children}</main>
        <nav className="v2-bottombar" aria-label="Menu principal (celular)">
          {MOBILE.map(to => { const it = ITEMS.find(i => i.to === to)!; return <Link key={to} to={to as "/painel"} className="v2-bottom-item" activeProps={{ className: "is-active", "aria-current": "page" }} activeOptions={{ exact: to === "/painel", includeSearch: false }}><it.icon aria-hidden="true" /><span>{MOBILE_LABEL[to]}</span></Link>; })}
          <button type="button" className={`v2-bottom-item ${more ? "is-active" : ""}`} aria-expanded={more} onClick={() => setMore(!more)}><MoreHorizontal aria-hidden="true" /><span>Mais</span></button>
        </nav>
        {more && <div className="v2-more-backdrop" onClick={() => setMore(false)}>
          <div className="v2-more-sheet" role="dialog" aria-label="Mais opções" onClick={e => e.stopPropagation()} onKeyDown={e => e.key === "Escape" && setMore(false)}>
            <div className="v2-more-head"><strong>Mais</strong><button type="button" className="v2-icon-btn" aria-label="Fechar" autoFocus onClick={() => setMore(false)}><X /></button></div>
            {extra.map(i => <NavLink key={i.to} item={i} onClick={() => setMore(false)} />)}
            {coupons.data?.isInfluencer && <CouponsCard coupons={coupons.data.coupons} />}
            <div className="v2-user"><span className="v2-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span><div className="v2-user-text"><strong>{name}</strong><span>{user?.email}</span></div></div>
            <NavLink item={{ to: "/painel/perfil", label: "Configurações", icon: Settings }} onClick={() => setMore(false)} />
            <button type="button" className="v2-nav-item" onClick={exit}><LogOut aria-hidden="true" /><span className="v2-nav-label">Sair da conta</span></button>
          </div>
        </div>}
        <CommandPalette open={palette} onOpenChange={setPalette} items={[...ITEMS, ...teamItems, ...(isAdmin ? ADMIN_ITEMS : []), { to: "/painel/perfil", label: "Configurações" }]} />
        <JanelaHost />
        <WhatsappPrompt enabled={!!user && !isAdmin} />
        <Toaster position="bottom-right" />
        <SaleNotifier userId={user?.id} />
      </div>
    </PanelCtx.Provider>
  );
}

function useWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => { const m = window.matchMedia("(min-width: 1440px)"); const on = () => setWide(m.matches); on(); m.addEventListener("change", on); return () => m.removeEventListener("change", on); }, []);
  return wide;
}

/** Densidade notebook: largura < 1600px ou altura útil < 800px (acima de 767px de largura). */
function useCompactPanel() {
  const [on, setOn] = useState(false);
  useEffect(() => { const f = () => setOn(window.innerWidth >= 768 && (window.innerWidth < 1600 || window.innerHeight < 800)); f(); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return on;
}
