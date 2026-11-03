import { lazy, Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ViewSkeleton } from "./view-skeleton";
import { AuditLog, UsersManager } from "./users-manager";
import { getAdminConfig, saveAdminConfig, type AdminConfig } from "@/lib/influencers.functions";
const InfluencersManager = lazy(() => import("./influencers-manager").then((m) => ({ default: m.InfluencersManager })));
const SubscriptionsManager = lazy(() => import("./subscriptions-manager").then((m) => ({ default: m.SubscriptionsManager })));
const ManagersManager = lazy(() => import("./managers-manager").then((m) => ({ default: m.ManagersManager })));
const RecoveryManager = lazy(() => import("./recovery-manager").then((m) => ({ default: m.RecoveryManager })));
const CouponsManager = lazy(() => import("./coupons-manager").then((m) => ({ default: m.CouponsManager })));

export const ADMIN_TABS = [["usuarios", "Usuários"], ["influenciadores", "Influenciadores"], ["membros-time", "Membros de time"], ["gerentes", "Gerentes"], ["assinaturas", "Assinaturas"], ["recuperacao", "Recuperação"], ["cupons", "Cupons"], ["historico", "Histórico"], ["config", "Configurações"]] as const;
export type AdminTab = (typeof ADMIN_TABS)[number][0];

export function AdminHub() {
  const search = useSearch({ strict: false }) as { aba?: string };
  const navigate = useNavigate();
  const tab = (ADMIN_TABS.find(([k]) => k === search.aba)?.[0] ?? "usuarios") as AdminTab;
  const go = (aba: AdminTab) => void navigate({ to: ".", search: (s: Record<string, unknown>) => ({ ...s, aba }), replace: true });
  return <div>
    <div className="catalog-chips um-tabs" role="tablist">{ADMIN_TABS.map(([k, l]) => <Button key={k} role="tab" aria-selected={tab === k} variant={tab === k ? "default" : "outline"} onClick={() => go(k)}>{l}</Button>)}</div>
    <Suspense fallback={<ViewSkeleton />}>
      {tab === "usuarios" ? <UsersManager /> : tab === "influenciadores" ? <InfluencersManager /> : tab === "membros-time" ? <InfluencersManager team /> : tab === "gerentes" ? <ManagersManager /> : tab === "assinaturas" ? <SubscriptionsManager /> : tab === "cupons" ? <CouponsManager /> : tab === "historico" ? <AuditLog /> : tab === "config" ? <ConfigForm /> :
        <RecoveryManager />}
    </Suspense>
  </div>;
}

function ConfigForm() {
  const get = useServerFn(getAdminConfig), save = useServerFn(saveAdminConfig);
  const q = useQuery({ queryKey: ["admin-config"], queryFn: () => get() });
  const [f, setF] = useState<AdminConfig | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (q.data && !f) setF(q.data); }, [q.data, f]);
  if (!f) return <ViewSkeleton />;
  return <form className="um-form v2-card" onSubmit={async (e) => { e.preventDefault(); setBusy(true); try { await save({ data: f }); toast.success("Configurações salvas"); } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); } }}>
    <label>Comissão inicial (oferta de entrada, %)<input type="number" min={0} max={100} step={0.1} value={f.percentual_influenciador} onChange={(e) => setF({ ...f, percentual_influenciador: Number(e.target.value) })} /><small>Novos influenciadores começam com esse valor. Mais que isso é negociado com a administração e precisa ser ajustado também na Applyfy.</small></label>
    <label>Domínios de checkout aceitos (separados por vírgula)<input value={f.dominios_checkout.join(", ")} onChange={(e) => setF({ ...f, dominios_checkout: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></label>
    <label>Link padrão Mensal<input type="url" value={f.link_padrao_mensal} onChange={(e) => setF({ ...f, link_padrao_mensal: e.target.value })} /></label>
    <label>Link padrão Vitalício<input type="url" value={f.link_padrao_vitalicio} onChange={(e) => setF({ ...f, link_padrao_vitalicio: e.target.value })} /></label>
    <label>Link para criar conta na Applyfy<input type="url" value={f.link_cadastro_applyfy} onChange={(e) => setF({ ...f, link_cadastro_applyfy: e.target.value })} /></label>
    <label>Pedir afiliação — Mensal<input type="url" value={f.link_afiliacao_mensal} onChange={(e) => setF({ ...f, link_afiliacao_mensal: e.target.value })} /></label>
    <label>Pedir afiliação — Vitalício<input type="url" value={f.link_afiliacao_vitalicio} onChange={(e) => setF({ ...f, link_afiliacao_vitalicio: e.target.value })} /></label>
    {Object.entries(f.modelos_whatsapp).map(([k, v]) => <label key={k}>Mensagem de WhatsApp — {k.replace(/_/g, " ")}<textarea rows={3} value={v} onChange={(e) => setF({ ...f, modelos_whatsapp: { ...f.modelos_whatsapp, [k]: e.target.value } })} /><small>Use {"{nome}"}, {"{plano}"}, {"{valor}"} e {"{link}"}.</small></label>)}
    <Button type="submit" className="um-primary" disabled={busy}>{busy ? "Salvando…" : "Salvar configurações"}</Button>
  </form>;
}
