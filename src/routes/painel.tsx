import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PanelShell } from "@/components/panel-shell";
import { InfluencerOnboarding } from "@/components/influencer-onboarding";
import { InfluencerWelcome } from "@/components/influencer-welcome";
import { useMyOnboarding } from "@/hooks/use-onboarding";
import { useAccount } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { getAccessStatus } from "@/lib/access.functions";
import { panelHead } from "@/lib/panel-head";
import logo from "@/assets/logo-icone.png.asset.json";

const MONTHLY_URL = "https://checkout.applyfy.com.br/checkout/cmvv7ihvg0ciu01q6pofcauy2?offer=9uw4neg";
const LIFETIME_URL = "https://checkout.applyfy.com.br/checkout/cmvv7iqfj04ga01n60jjth2ss?offer=ggo7ayu";

const Splash = () => <div className="auth-gate" role="status" aria-label="Verificando sua sessão"><div className="auth-gate-box"><div className="auth-gate-logo"><img src={logo.url} alt="" width={44} height={44} /></div><div className="auth-gate-wordmark" aria-hidden="true">Afilia<span>Place</span></div><div className="auth-gate-bar" aria-hidden="true"><i /></div><p className="auth-gate-txt">Preparando seu painel…</p></div></div>;

export function useAccessStatus() {
  const { user } = useAccount();
  const fetchAccess = useServerFn(getAccessStatus);
  return useQuery({ queryKey: ["access", user?.id], queryFn: () => fetchAccess(), enabled: !!user });
}

function PanelGate() {
  const { user, ready, signOut, isAdmin } = useAccount();
  const ob = useMyOnboarding();
  const navigate = useNavigate();
  const access = useAccessStatus();
  const wKey = `boas-vindas-${user?.id ?? ""}`;
  const [welcome, setWelcome] = useState<boolean | null>(null);
  useEffect(() => { if (user) setWelcome(localStorage.getItem(`boas-vindas-${user.id}`) === "1"); }, [user]);
  useEffect(() => {
    if (ready && !user) void navigate({ to: "/auth", replace: true });
  }, [ready, user, navigate]);
  if (!ready || !user || access.isPending) return <Splash />;
  if (access.data?.allowed) {
    if (!isAdmin && ob.isPending) return <Splash />;
    if (!isAdmin && ob.data?.isInfluencer && ob.data.status !== "ativo") return <InfluencerOnboarding ob={ob.data} />;
    if (!isAdmin && ob.data?.isInfluencer && ob.data.codigo && welcome === false) return <InfluencerWelcome codigo={ob.data.codigo} nome={String((user.user_metadata as any)?.name ?? "").split(" ")[0] ?? ""} onDone={() => { localStorage.setItem(wKey, "1"); setWelcome(true); }} />;
    return <PanelShell><Outlet /></PanelShell>;
  }
  const r = access.data?.reason;
  const title = r === "expired" ? "Sua assinatura venceu" : r === "cancelled" ? "Sua assinatura foi cancelada" : access.isError ? "Não foi possível conferir seu acesso" : "Escolha um plano para acessar";
  const text = r === "expired" ? "Renove para reativar suas lojas e voltar a usar o painel. O acesso volta automaticamente após a confirmação do pagamento."
    : r === "cancelled"
    ? "Renove para voltar a usar o painel. O acesso é liberado automaticamente após a confirmação do pagamento."
    : "Assine com o mesmo e-mail desta conta. O acesso é liberado automaticamente após a confirmação do pagamento.";
  return (
    <div className="auth-gate" style={{ flexDirection: "column", gap: 16, textAlign: "center", padding: 24 }}>
      <div className="auth-gate-wordmark">Afilia<span>Place</span></div>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>{title}</h1>
      <p style={{ maxWidth: 440, opacity: 0.75 }}>{text}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Button asChild variant="outline"><a href={MONTHLY_URL} target="_blank" rel="noopener noreferrer">Mensal R$ 172,00</a></Button>
        <Button asChild><a href={LIFETIME_URL} target="_blank" rel="noopener noreferrer">Vitalício R$ 297,00</a></Button>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="ghost" onClick={() => void access.refetch()}>Já paguei, verificar</Button>
        <Button variant="ghost" onClick={() => void signOut()}>Sair</Button>
      </div>
    </div>
  );
}

type PanelSearch = { janela?: string | undefined; id?: string | undefined; passo?: string | undefined; loja?: string | undefined; f?: string | undefined; code?: string | undefined; state?: string | undefined; produto?: string | undefined; divulgar?: string | undefined; etapa?: string | undefined };
const str = (v: unknown) => (typeof v === "string" ? v : undefined);

export const Route = createFileRoute("/painel")({
  validateSearch: (s: Record<string, unknown>): PanelSearch => ({
    janela: typeof s["janela"] === "string" && /^[a-z-]{2,30}$/.test(s["janela"]) ? s["janela"] : undefined,
    id: (typeof s["id"] === "string" || typeof s["id"] === "number") && /^[A-Za-z0-9_-]{2,40}$/.test(String(s["id"])) ? String(s["id"]) : undefined,
    passo: s["passo"] !== undefined && /^[1-5]$/.test(String(s["passo"])) ? String(s["passo"]) : undefined,
    loja: typeof s["loja"] === "string" && /^[0-9a-f-]{36}$/i.test(s["loja"]) ? s["loja"] : undefined,
    f: str(s["f"]),
    code: str(s["code"]),
    state: str(s["state"]),
    produto: typeof s["produto"] === "string" && /^(MLB\d{4,16}|(ml|shopee):[A-Za-z0-9_-]{2,40})$/.test(s["produto"]) ? s["produto"] : undefined,
    divulgar: typeof s["divulgar"] === "string" && /^MLB\d{4,16}$/.test(s["divulgar"]) ? s["divulgar"] : undefined,
    etapa: typeof s["etapa"] === "string" && /^(link|mensagem|grupos|perfil)$/.test(s["etapa"]) ? s["etapa"] : undefined,
  }),
  head: panelHead("Painel", "Seu painel AfiliaPlace: produtos, divulgação e resultados."),
  component: PanelGate,
});
