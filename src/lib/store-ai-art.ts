import type { IaEstilo, IaTipo } from "./store-ai-moderation";

/** Briefing opcional que o usuário preenche antes de gerar (salvo em lojas.briefing). */
export type Briefing = { publico?: string | undefined; personalidade?: string[] | undefined; simbolo?: string | undefined; cores?: string | undefined; evitar?: string | undefined };
export type Conceito = { nome_curto: string; tipo: string; ideia: string; prompt_imagem: string };
export type ProdutoCtx = { titulo: string; categoria: string; foto: string | null };

/** Direção de arte fixa por estilo (tabela do PATCH-012). */
export const DIRECAO: Record<IaEstilo, Record<IaTipo, string>> = {
  Moderno: { logo: "geometric symbol, simple shapes, exactly 2 colors, uniform stroke weight", banner: "product photography on a solid color background, long soft shadows" },
  Divertido: { logo: "rounded shapes, vivid colors, playful personality", banner: "products floating, colorful organic shapes around them" },
  Elegante: { logo: "thin lines, monogram feel, generous white space", banner: "soft light, marble or linen surfaces, neutral tones" },
  Minimalista: { logo: "one shape, one color, clever negative space", banner: "a single product, clean background, asymmetric composition" },
  Mascote: { logo: "simple original character, front facing, friendly expression", banner: "original mascot interacting with the products" },
  "3D": { logo: "soft clay-like volume, studio lighting", banner: "3D scene with the products on pedestals" },
  Vintage: { logo: "seal or emblem, light print texture", banner: "faded palette, old label shapes used as graphic forms" },
  Orgânico: { logo: "nature elements, hand-drawn line", banner: "plants, wood, natural window light" },
};

/** Lista fixa do que a IA nunca deve gerar. */
export const PROIBIDO = ["shopping cart", "generic shopping bag", "light bulb", "gear", "globe", "rocket", "handshake", "growth arrow", "generic purple/blue gradients", "glow or neon effects", "abstract backgrounds unrelated to the niche", "third-party brands, logos or characters", "real people", "sports team crests"];
export const NEGATIVO = `Never include: ${PROIBIDO.join(", ")}.`;

export const TIPOS_LOGO = ["símbolo geométrico", "mascote original", "monograma desenhado", "ilustração do produto-chave"];
export const TIPOS_BANNER = ["vitrine de produtos", "cenário do nicho", "close de produto-chave"];

/** Sugestões clicáveis por nicho para o briefing. */
const SUG: Record<string, { publico: string[]; personalidade: string[]; simbolo: string[] }> = {
  casa: { publico: ["famílias", "quem mora sozinho", "recém-casados"], personalidade: ["acolhedora", "prática", "organizada"], simbolo: ["casinha", "folha", "xícara"] },
  moda: { publico: ["mulheres 25–40", "jovens", "público plus size"], personalidade: ["confiante", "moderna", "elegante"], simbolo: ["cabide", "laço", "agulha"] },
  beleza: { publico: ["iniciantes em skincare", "maquiadoras", "público 30+"], personalidade: ["delicada", "radiante", "confiável"], simbolo: ["gota", "flor", "espelho"] },
  bebe: { publico: ["mães de primeira viagem", "avós", "gestantes"], personalidade: ["acolhedora", "divertida", "segura"], simbolo: ["nuvem", "estrela", "ursinho"] },
  pet: { publico: ["tutores de cães", "tutores de gatos", "famílias"], personalidade: ["divertida", "carinhosa", "leal"], simbolo: ["patinha", "osso", "orelhas"] },
  tech: { publico: ["gamers", "home office", "estudantes"], personalidade: ["precisa", "moderna", "esperta"], simbolo: ["raio de sinal", "chip", "fone"] },
  fitness: { publico: ["iniciantes na academia", "corredores", "público 40+"], personalidade: ["enérgica", "motivadora", "forte"], simbolo: ["batimento", "halter", "folha"] },
};
const GERAL = { publico: ["quem busca achadinhos", "famílias", "jovens"], personalidade: ["prática", "confiável", "divertida"], simbolo: ["estrela", "coração", "inicial da loja"] };
export function sugestoes(nicho: string | null) {
  const n = (nicho ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const k = Object.keys(SUG).find(x => n.includes(x)) ?? (/(eletron|celular|game)/.test(n) ? "tech" : /(crianc|infantil)/.test(n) ? "bebe" : /(cozinha|decor)/.test(n) ? "casa" : null);
  return k ? SUG[k]! : GERAL;
}

export function limparBriefing(b: Briefing | null | undefined): Briefing {
  const t = (s?: string, m = 120) => (s ?? "").trim().slice(0, m) || undefined;
  return { publico: t(b?.publico), personalidade: (b?.personalidade ?? []).map(s => s.trim().slice(0, 30)).filter(Boolean).slice(0, 3), simbolo: t(b?.simbolo), cores: t(b?.cores, 80), evitar: t(b?.evitar) };
}

/** Instruções do diretor de arte (modelo de texto). */
export function promptDiretor(o: { tipo: IaTipo; n: number; estilo: IaEstilo; nome: string; nicho: string | null; tema: { cor_destaque: string; cor_fundo: string; fonte: string }; briefing: Briefing; produtos: ProdutoCtx[]; descricao: string | null; comTexto?: boolean }) {
  const tipos = (o.tipo === "logo" ? TIPOS_LOGO : TIPOS_BANNER).slice(0, o.n);
  return [
    `You are an art director for small Brazilian online stores. Write ${o.n} DIFFERENT ${o.tipo} concepts for the store below.`,
    `Each concept must use a different type, in this order: ${tipos.join("; ")} (adapt each to the style).`,
    `Style "${o.estilo}" direction: ${DIRECAO[o.estilo][o.tipo]}.`,
    o.tipo === "logo" ? `The symbol must still read clearly at 32px: bold silhouette, few details, flat or nearly flat, centered on a transparent background. ${o.comTexto ? `Include the store name "${o.nome}" spelled exactly.` : "No letters, words or text of any kind."}` : "Wide banner scene with a large calm empty area on the left third for the app to overlay text. No letters, words or text of any kind.",
    NEGATIVO,
    `Store: name "${o.nome}", niche "${o.nicho ?? "variados"}", theme colors ${o.tema.cor_destaque} and ${o.tema.cor_fundo}, font mood "${o.tema.fonte}".`,
    `Briefing: audience=${o.briefing.publico ?? "-"}; personality=${(o.briefing.personalidade ?? []).join(", ") || "-"}; symbol idea=${o.briefing.simbolo ?? "-"}; liked colors=${o.briefing.cores ?? "-"}; avoid=${o.briefing.evitar ?? "-"}; extra=${o.descricao ?? "-"}.`,
    `Top products: ${o.produtos.map(p => `${p.titulo} (${p.categoria})`).join("; ") || "-"}.`,
    `For each concept return: nome_curto (2-4 words pt-BR), tipo (the type used), ideia (one short sentence in Brazilian Portuguese explaining the idea, like "Folha + casa: lar natural e acolhedor"), prompt_imagem (detailed English prompt: shape, composition, hex colors, style, lighting, plus the "never include" list).`,
  ].join("\n");
}

/** Descarta conceitos repetidos (mesmo tipo ou ideia quase igual). */
export function filtrarConceitos(cs: Conceito[], n: number): Conceito[] {
  const out: Conceito[] = [];
  const key = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").split(/\s+/).filter(w => w.length > 3).sort().join(" ");
  for (const c of cs) {
    if (!c?.prompt_imagem?.trim()) continue;
    if (out.some(o => o.tipo.toLowerCase() === c.tipo.toLowerCase() || key(o.ideia) === key(c.ideia))) continue;
    out.push(c); if (out.length === n) break;
  }
  return out;
}

/** Peso no limite mensal: geração completa = 1, refinamento = 0.5. */
export const PESO = { geracao: 1, refino: 0.5 } as const;
export const somarUso = (rows: { status: string; peso?: number | null }[]) => rows.filter(r => r.status === "ok").reduce((s, r) => s + Number(r.peso ?? 1), 0);
/** Mínimo de opções aprovadas para não regerar. */
export const minAprovadas = (n: number) => Math.min(3, n);
