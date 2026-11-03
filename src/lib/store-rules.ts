/** Regras puras das lojas (sem dependências de servidor ou navegador). */
export type { Layout as Preset } from "./store-theme";
export const NICHOS = ["Casa", "Cozinha", "Beleza", "Tecnologia", "Pet", "Bebês", "Moda", "Fitness"] as const;
export const CORES = [
  { id: "#FFE600", nome: "Amarelo" }, { id: "#3D3A31", nome: "Grafite" }, { id: "#E4572E", nome: "Laranja" },
  { id: "#2F6FDB", nome: "Azul" }, { id: "#2E9E6B", nome: "Verde" },
] as const;
export const LOGO_ESTILOS = ["quadrado", "circulo", "folha", "sublinhado"] as const;
export const BANNER_ESTILOS = ["cor", "escuro", "neutro"] as const;
export const NOME_MAX = 32;
export const LIMIT_MESSAGE = "Você usou todas as lojas do seu plano.";

/** Limite de lojas por plano (rascunhos contam). Espelha public.limite_lojas no banco. */
export function storeLimit(a: { reason: string; plan: string | null }): number {
  if (a.reason === "admin" || a.reason === "influencer") return 10;
  if (a.reason !== "active") return 0;
  return a.plan === "lifetime" ? 10 : 3;
}

function lum(hex: string) {
  const n = hex.replace("#", ""); const c = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = c.map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(a: string, b: string) { const [x = 0, y = 0] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }
/** Texto sobre a cor da loja: escuro (#16140F) ou branco, o que tiver maior contraste. */
export function textOn(bg: string) { return contrastRatio(bg, "#16140F") >= contrastRatio(bg, "#FFFFFF") ? "#16140F" : "#FFFFFF"; }

export function nicheHeadline(nicho: string | null | undefined) {
  const n = (nicho ?? "").toLocaleLowerCase("pt-BR");
  return n ? `Achados que facilitam a sua ${n === "bebês" ? "rotina com o bebê" : n === "pet" ? "vida com o pet" : n}` : "Achados que facilitam o seu dia";
}

/** Produto aparece na loja só se está no ar e o fornecedor está conectado. */
export function isVisibleInStore(p: { status: string | null | undefined; fornecedor: "ml" | "shopee" }, connected: { ml: boolean; shopee: boolean }) {
  return p.status === "ativo" && connected[p.fornecedor];
}
export function hiddenReason(p: { status: string | null | undefined; fornecedor: "ml" | "shopee" }, connected: { ml: boolean; shopee: boolean }) {
  if (p.status !== "ativo") return "Saiu do ar no fornecedor";
  if (!connected[p.fornecedor]) return p.fornecedor === "ml" ? "Mercado Livre desconectado" : "Shopee desconectada";
  return null;
}
export function remainingText(left: number, plano: string) {
  return left <= 0 ? `Nenhuma loja restante no plano ${plano}` : `Resta${left > 1 ? "m" : ""} ${left} loja${left > 1 ? "s" : ""} no plano ${plano}`;
}

/* PATCH-006 · Endereço e checklist de publicação */
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MIN = 3, SLUG_MAX = 40;
export type SlugProblem = "curto" | "longo" | "formato" | "reservado" | "em_uso";
export const SLUG_MSG: Record<SlugProblem, string> = {
  curto: `Use pelo menos ${SLUG_MIN} caracteres.`, longo: `Use no máximo ${SLUG_MAX} caracteres.`,
  formato: "Use só letras minúsculas, números e hífens entre palavras.", reservado: "Este endereço é reservado.", em_uso: "Este endereço já está em uso.",
};
/** Converte texto livre em endereço válido (sem acento, minúsculo, hífens). */
export function slugify(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, SLUG_MAX).replace(/-+$/, "");
}
/** Validação de formato (sem consultar o banco). Reservados são comparados sem diferenciar maiúsculas. */
export function slugFormatProblem(slug: string, reservados: Iterable<string> = []): SlugProblem | null {
  if (slug.length < SLUG_MIN) return "curto";
  if (slug.length > SLUG_MAX) return "longo";
  if (!SLUG_RE.test(slug)) return "formato";
  const low = slug.toLowerCase();
  for (const r of reservados) if (r.toLowerCase() === low) return "reservado";
  return null;
}
export function slugSuggestions(base: string, taken: (s: string) => boolean, max = 3) {
  const b = slugify(base) || "minha-loja"; const out: string[] = [];
  const cands = [b, `${b}-achados`, `${b}-ofertas`, `achados-${b}`, `${b}-oficial`, ...Array.from({ length: 20 }, (_, i) => `${b}-${i + 2}`)];
  for (const c0 of cands) { const c = c0.slice(0, SLUG_MAX).replace(/-+$/, ""); if (!slugFormatProblem(c) && !taken(c) && !out.includes(c)) out.push(c); if (out.length >= max) break; }
  return out;
}

export type CheckState = { planoAtivo: boolean; produtosAtivos: number; semFornecedor: number; semLink: number; temLogo: boolean; temBanner: boolean };
export type CheckItem = { id: string; tipo: "bloqueia" | "aviso" | "auto"; ok: boolean; texto: string };
export function buildChecklist(s: CheckState): CheckItem[] {
  return [
    { id: "plano", tipo: "bloqueia", ok: s.planoAtivo, texto: s.planoAtivo ? "Plano ativo" : "Seu plano não está ativo" },
    { id: "produtos", tipo: "bloqueia", ok: s.produtosAtivos >= 1, texto: s.produtosAtivos >= 1 ? `${s.produtosAtivos} produto(s) ativo(s)` : "Adicione pelo menos 1 produto ativo" },
    { id: "fornecedor", tipo: "bloqueia", ok: s.semFornecedor === 0, texto: s.semFornecedor === 0 ? "Fornecedores conectados" : `${s.semFornecedor} produto(s) de fornecedor não conectado` },
    { id: "links", tipo: "bloqueia", ok: s.semLink === 0, texto: s.semLink === 0 ? "Links de afiliado prontos" : `${s.semLink} produto(s) sem link de afiliado` },
    { id: "minimo", tipo: "aviso", ok: s.produtosAtivos >= 4, texto: s.produtosAtivos >= 4 ? "Pelo menos 4 produtos" : "Recomendamos pelo menos 4 produtos" },
    { id: "visual", tipo: "aviso", ok: s.temLogo && s.temBanner, texto: s.temLogo && s.temBanner ? "Logo e banner definidos" : "Defina logo e banner para uma loja mais completa" },
    { id: "aviso", tipo: "auto", ok: true, texto: "Aviso de loja afiliada incluído automaticamente" },
  ];
}
export const canPublish = (items: CheckItem[]) => items.every(i => i.tipo !== "bloqueia" || i.ok);
