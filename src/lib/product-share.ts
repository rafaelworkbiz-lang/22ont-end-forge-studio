// Regras puras (sem navegador/servidor) do modal de produto.
import { affiliateLink as buildAffiliateLink } from "./meli-categories";

export const ELIGIBLE_REPUTATION = ["3_yellow", "4_light_green", "5_green"] as const;

export type EligibilityInput = { condition?: string | null | undefined; status?: string | null | undefined; reputation?: string | null | undefined };

export type EligibilityState = "elegivel" | "nao_elegivel" | "nao_verificado";
export const UNVERIFIED_NOTE = "Não conseguimos verificar a reputação do vendedor. O Mercado Livre pode não aceitar este produto no seu perfil.";

export function profileEligibility({ condition, status, reputation }: EligibilityInput): { state: EligibilityState; eligible: boolean; reason: string | null } {
  if (condition && condition !== "new") return { state: "nao_elegivel", eligible: false, reason: "Só produtos novos podem ir para o seu perfil." };
  if (status && status !== "active") return { state: "nao_elegivel", eligible: false, reason: "Este anúncio não está ativo no Mercado Livre." };
  if (!reputation) return { state: "nao_verificado", eligible: true, reason: UNVERIFIED_NOTE };
  if (!(ELIGIBLE_REPUTATION as readonly string[]).includes(reputation)) return { state: "nao_elegivel", eligible: false, reason: "A reputação do vendedor está abaixo do mínimo exigido (amarela ou melhor)." };
  if (condition !== "new" || status !== "active") return { state: "nao_verificado", eligible: true, reason: UNVERIFIED_NOTE };
  return { state: "elegivel", eligible: true, reason: null };
}

export const TAG_PATTERN = /^[A-Za-z0-9._-]{2,60}$/;
export const isValidTag = (tag: string) => TAG_PATTERN.test(tag);

export function whatsappShareUrl(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function discountPercent(price: number, original?: number | null) {
  if (!original || original <= price) return 0;
  return Math.round((1 - price / original) * 100);
}

export const reputationColor: Record<string, string> = {
  "1_red": "#e5484d", "2_orange": "#f2994a", "3_yellow": "#f5c518", "4_light_green": "#8bc34a", "5_green": "#30a46c",
};

// ---- PATCH-001.2: link seguro, etapas e grupos ----

/** Sem tag confirmada (canEarn) e válida, nenhum link é gerado. */
export function safeAffiliateLink(permalink: string, tag: string, canEarn: boolean): string | null {
  if (!canEarn || !isValidTag(tag) || !permalink) return null;
  try { return buildAffiliateLink(permalink, tag); } catch { return null; }
}

export const WORKSPACE_STEPS = [
  { id: "visao", label: "Visão geral" },
  { id: "link", label: "Link de afiliado" },
  { id: "mensagem", label: "Mensagem pronta" },
  { id: "grupos", label: "Divulgar nos grupos" },
  { id: "perfil", label: "Perfil ML" },
] as const;
export type StepId = (typeof WORKSPACE_STEPS)[number]["id"];
export const TRACKED_STEPS: StepId[] = ["link", "mensagem", "grupos", "perfil"];
export const isStepId = (v: unknown): v is StepId => typeof v === "string" && WORKSPACE_STEPS.some(s => s.id === v);

/** Etapas concluídas de um produto: link/mensagem pelo registro, grupos com 1+ postado, perfil se publicado. */
export function completedSteps(recorded: Iterable<string>, postedCount: number, published: boolean): Set<StepId> {
  const r = new Set(recorded);
  const out = new Set<StepId>();
  if (r.has("link")) out.add("link");
  if (r.has("mensagem")) out.add("mensagem");
  if (postedCount > 0 || r.has("grupos")) out.add("grupos");
  if (published) out.add("perfil");
  return out;
}

const sameDaySP = (iso: string, now: Date) => {
  const f = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  return f(new Date(iso)) === f(now);
};
/** Quantos dos grupos listados foram marcados como postados hoje (fuso de São Paulo). */
export function postedTodayCount(posts: { grupoId: string; postadoEm: string }[], groupIds: string[], now = new Date()) {
  const ids = new Set(groupIds);
  return new Set(posts.filter(p => ids.has(p.grupoId) && sameDaySP(p.postadoEm, now)).map(p => p.grupoId)).size;
}

const categoryNiche: Record<string, string> = {
  MLB1051: "Eletrônicos", MLB1648: "Eletrônicos", MLB1000: "Eletrônicos", MLB5726: "Casa e Cozinha", MLB1574: "Casa e Cozinha",
  MLB1430: "Moda e Desapego", MLB1246: "Beleza", MLB1144: "Games", MLB1384: "Mães e Bebês", MLB1071: "Pets",
};
export const nicheForCategory = (categoryId: string | undefined): string | null => (categoryId ? categoryNiche[categoryId] ?? null : null);
export type ShareGroup = { id: string; name: string; url: string; network: "facebook" | "whatsapp" };
/** Grupos do nicho da categoria; sem nenhum, usa os gerais (Achadinhos/Promoções). */
export function groupsForCategory(categoryId: string | undefined, fb: { id: string; name: string; niche: string; url: string }[], wa: { id: string; name: string; niche: string; url: string }[], limit = 12): { groups: ShareGroup[]; general: boolean } {
  const niche = categoryId ? categoryNiche[categoryId] : undefined;
  const tag = (net: ShareGroup["network"]) => (g: { id: string; name: string; url: string }): ShareGroup => ({ id: `${net}:${g.id}`, name: g.name, url: g.url, network: net });
  const specific = niche ? [...fb.filter(g => g.niche === niche).map(tag("facebook")), ...wa.filter(g => g.niche === niche).map(tag("whatsapp"))] : [];
  if (specific.length) return { groups: specific.slice(0, limit), general: false };
  const gen = (n: string) => n === "Achadinhos" || n === "Promoções e Cupons";
  const f = fb.filter(g => gen(g.niche)).map(tag("facebook")), w = wa.filter(g => gen(g.niche)).map(tag("whatsapp"));
  const mixed: ShareGroup[] = [];
  for (let i = 0; mixed.length < limit && (i < f.length || i < w.length); i++) { const a = w[i], b = f[i]; if (a) mixed.push(a); if (b && mixed.length < limit) mixed.push(b); }
  return { groups: mixed, general: true };
}
