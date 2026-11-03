/** Regras puras da IA de identidade (sem acesso a rede). */
export const IA_ESTILOS = ["Moderno", "Divertido", "Elegante", "Minimalista", "Mascote", "3D", "Vintage", "Orgânico"] as const;
export type IaEstilo = (typeof IA_ESTILOS)[number];
export type IaTipo = "logo" | "banner";
export const IA_OPCOES: Record<IaTipo, number> = { logo: 2, banner: 2 };

export const MSG_BLOQUEIO = "Não podemos gerar imagens com marcas, personagens ou pessoas reais. Descreva o estilo ou o tema da sua loja.";
export const MSG_ERRO = "Não conseguimos gerar agora. Tente de novo em instantes.";

/** Pessoas famosas mais pedidas; a tabela de marcas complementa a lista. */
const FAMOSOS = ["neymar", "pele", "messi", "cristiano ronaldo", "ronaldinho", "vini jr", "vinicius junior", "anitta", "ivete sangalo", "xuxa", "silvio santos", "faustao", "lula", "bolsonaro", "taylor swift", "beyonce", "michael jackson", "elon musk", "virginia fonseca", "whindersson", "luan santana", "gusttavo lima", "marilia mendonca", "ana maria braga", "casimiro", "felipe neto", "ronaldo fenomeno", "kim kardashian", "rihanna", "lady gaga"];

export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function has(text: string, termo: string) {
  const t = norm(termo); if (!t) return false;
  const padded = ` ${text} `;
  return padded.includes(` ${t} `) || (t.includes(" ") && padded.replace(/ /g, "").includes(t.replace(/ /g, "")));
}

/** Devolve o termo que causou o bloqueio, ou null quando o pedido pode seguir. */
export function moderar(campos: (string | null | undefined)[], marcas: string[], reservados: string[] = []): string | null {
  const text = norm(campos.filter(Boolean).join(" "));
  if (!text) return null;
  // Reservados de sistema (painel, login…) não bloqueiam textos comuns; só marcas reservadas com mais de 2 letras.
  const reservadosMarca = reservados.filter(r => r.length > 2 && !["admin", "painel", "loja", "api", "auth", "login", "suporte", "ajuda", "termos", "privacidade", "previa"].includes(r)).map(r => r.replace(/-/g, " "));
  for (const t of [...marcas, ...reservadosMarca, ...FAMOSOS]) if (has(text, t)) return t;
  const m = text.match(/\blogo (?:do|da|de|dos|das) ([a-z0-9]+(?: [a-z0-9]+)?)/);
  if (m && !["minha loja", "loja"].includes(m[1]!)) return m[1]!;
  return null;
}

/** Quantas gerações contam no mês: apenas as com sucesso. */
export const contaNoLimite = (status: string) => status === "ok";

export function inicioDoMes(now = new Date()) { return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)); }
export function renovaEm(now = new Date()) { return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)); }
export function msgLimite(limite: number, now = new Date()) {
  return `Você usou as ${limite} gerações de IA deste mês. Renova em ${renovaEm(now).toLocaleDateString("pt-BR", { timeZone: "UTC" })}.`;
}

const ESTILO_EN: Record<IaEstilo, string> = { Moderno: "modern, clean geometric shapes", Divertido: "playful, rounded, friendly", Elegante: "elegant, refined, thin lines", Minimalista: "minimalist, very few shapes, lots of negative space",
  Mascote: "cute original mascot character (not based on any existing character)", "3D": "soft 3D render, clay-like materials, gentle studio lighting", Vintage: "vintage retro print look, muted warm tones, subtle grain", "Orgânico": "organic hand-drawn shapes, natural textures, leaves and soft curves" };

/** Custo estimado (US$) por imagem na qualidade média do GPT Image, por tamanho. */
export const CUSTO_IMAGEM_USD: Record<IaTipo, number> = { logo: 0.042, banner: 0.063 };
export const custoEstimado = (tipo: IaTipo) => +(CUSTO_IMAGEM_USD[tipo] * IA_OPCOES[tipo]).toFixed(4);
const SAFE = "no text, no letters, no words, no numbers, no logos of other brands, no real people, no famous characters";

export function montarPrompt(tipo: IaTipo, o: { estilo: IaEstilo; nicho: string | null; descricao: string | null; cor: string; nome?: string; comTexto?: boolean }, variacao: number) {
  const tema = [o.nicho, o.descricao].filter(Boolean).join(", ") || "online shop of curated deals";
  if (tipo === "logo" && o.comTexto && o.nome) return `A logo for a small online store named "${o.nome}". Write the store name exactly as "${o.nome}" with correct spelling, next to or below a simple symbol. Theme: ${tema}. Style: ${ESTILO_EN[o.estilo]}. Main color ${o.cor}. Transparent background, centered, variation ${variacao + 1}. No other text, no logos of other brands, no real people, no famous characters.`;
  if (tipo === "logo") return `A simple centered icon symbol for a small online store. Theme: ${tema}. Style: ${ESTILO_EN[o.estilo]}. Main color ${o.cor}. Transparent background, single symbol, variation ${variacao + 1}. ${SAFE}.`;
  return `Wide background illustration for an online store banner. Theme: ${tema}. Style: ${ESTILO_EN[o.estilo]}. Main color ${o.cor}. Keep the left 45% calm and empty for text overlay, illustration elements on the right, variation ${variacao + 1}. ${SAFE}.`;
}
