/** Tema, layouts e banners das lojas (PATCH-010). Regras puras, sem rede. */
import { contrastRatio } from "./store-rules";

export type Cantos = "retos" | "suaves" | "arredondados" | "pilula";
export type Fonte = "moderna" | "elegante" | "divertida" | "classica" | "geometrica" | "minimal" | "editorial";
export type Cartao = "sombra" | "borda" | "plano" | "elevado";
export type BotaoEstilo = "preenchido" | "contorno" | "pilula";
export type Espaco = "compacto" | "normal" | "arejado";
export type Topo = "claro" | "cor" | "escuro";
export type Foto = "quadrada" | "retrato" | "paisagem";
export type Filtro = "pilulas" | "abas" | "oculto";
export type Rodape = "simples" | "completo";
export type Mostrar = { selo: boolean; preco: boolean; botao: boolean; desconto?: boolean; seloTexto?: string };
export type Tema = { cor_destaque: string; cor_fundo: string; cor_botao: string; cantos: Cantos; fonte: Fonte; paleta?: string | null;
  cartao?: Cartao; botaoEstilo?: BotaoEstilo; espaco?: Espaco; topo?: Topo; foto?: Foto; filtro?: Filtro; rodape?: Rodape; mostrar?: Mostrar };

export const FUNDOS = [{ id: "#FFFFFF", nome: "Branco" }, { id: "#FBF7EE", nome: "Creme" }, { id: "#F3F3F1", nome: "Cinza claro" }, { id: "#F2EADF", nome: "Areia" }, { id: "#EEF3F8", nome: "Gelo azulado" }, { id: "#22211E", nome: "Grafite" }, { id: "#0E0D0B", nome: "Preto" }] as const;
export const CANTOS: { id: Cantos; nome: string; raio: number }[] = [{ id: "retos", nome: "Retos", raio: 2 }, { id: "suaves", nome: "Suaves", raio: 10 }, { id: "arredondados", nome: "Bem arredondados", raio: 22 }, { id: "pilula", nome: "Pílula", raio: 32 }];
export const FONTES: { id: Fonte; nome: string; titulo: string; texto: string }[] = [
  { id: "moderna", nome: "Moderna", titulo: '"Bricolage Grotesque", "Plus Jakarta Sans", sans-serif', texto: '"Plus Jakarta Sans", system-ui, sans-serif' },
  { id: "elegante", nome: "Elegante", titulo: '"Fraunces", Georgia, serif', texto: '"Plus Jakarta Sans", system-ui, sans-serif' },
  { id: "divertida", nome: "Divertida", titulo: '"Baloo 2", "Plus Jakarta Sans", sans-serif', texto: '"Nunito", system-ui, sans-serif' },
  { id: "classica", nome: "Clássica", titulo: '"Playfair Display", Georgia, serif', texto: '"Lora", Georgia, serif' },
  { id: "geometrica", nome: "Geométrica", titulo: '"Outfit", sans-serif', texto: '"Outfit", system-ui, sans-serif' },
  { id: "minimal", nome: "Minimal", titulo: '"Manrope", sans-serif', texto: '"Manrope", system-ui, sans-serif' },
  { id: "editorial", nome: "Editorial", titulo: '"DM Serif Display", Georgia, serif', texto: '"DM Sans", system-ui, sans-serif' },
];
export const CARTOES: { id: Cartao; nome: string }[] = [{ id: "sombra", nome: "Sombra leve" }, { id: "borda", nome: "Com borda" }, { id: "plano", nome: "Plano" }, { id: "elevado", nome: "Elevado" }];
export const BOTOES: { id: BotaoEstilo; nome: string }[] = [{ id: "preenchido", nome: "Preenchido" }, { id: "contorno", nome: "Contorno" }, { id: "pilula", nome: "Pílula" }];
export const ESPACOS: { id: Espaco; nome: string }[] = [{ id: "compacto", nome: "Compacto" }, { id: "normal", nome: "Normal" }, { id: "arejado", nome: "Arejado" }];
export const TOPOS: { id: Topo; nome: string }[] = [{ id: "claro", nome: "Claro" }, { id: "cor", nome: "Na cor da loja" }, { id: "escuro", nome: "Escuro" }];
export const FOTOS: { id: Foto; nome: string }[] = [{ id: "quadrada", nome: "Quadrada" }, { id: "retrato", nome: "Retrato" }, { id: "paisagem", nome: "Paisagem" }];
export const FILTROS: { id: Filtro; nome: string }[] = [{ id: "pilulas", nome: "Pílulas" }, { id: "abas", nome: "Abas" }, { id: "oculto", nome: "Escondido" }];
export const RODAPES: { id: Rodape; nome: string }[] = [{ id: "simples", nome: "Simples" }, { id: "completo", nome: "Completo" }];
export const PALETAS: { id: string; nome: string; destaque: string; fundo: string; botao: string }[] = [
  { id: "casa-clara", nome: "Casa Clara", destaque: "#C98A2B", fundo: "#FBF7EE", botao: "#3D3A31" },
  { id: "cozinha-quente", nome: "Cozinha Quente", destaque: "#E4572E", fundo: "#FFFFFF", botao: "#B23A1A" },
  { id: "beleza-rosada", nome: "Beleza Rosada", destaque: "#D9537B", fundo: "#FBF7EE", botao: "#A3264E" },
  { id: "tech-azul", nome: "Tech Azul", destaque: "#2F6FDB", fundo: "#F3F3F1", botao: "#1F4FA8" },
  { id: "pet-verde", nome: "Pet Verde", destaque: "#2E9E6B", fundo: "#FFFFFF", botao: "#1D6E49" },
  { id: "bebe-suave", nome: "Bebê Suave", destaque: "#7FB3D5", fundo: "#FFFFFF", botao: "#3D6E8F" },
  { id: "moda-grafite", nome: "Moda Grafite", destaque: "#3D3A31", fundo: "#F3F3F1", botao: "#16140F" },
  { id: "fitness-energia", nome: "Fitness Energia", destaque: "#F2A900", fundo: "#FFFFFF", botao: "#16140F" },
  { id: "amarelo-afilia", nome: "Amarelo Afilia", destaque: "#FFE600", fundo: "#FFFFFF", botao: "#16140F" },
  { id: "lavanda", nome: "Lavanda", destaque: "#8A6FD1", fundo: "#FBF7EE", botao: "#5A43A0" },
  { id: "grafite-ouro", nome: "Grafite & Ouro", destaque: "#C9A227", fundo: "#22211E", botao: "#C9A227" },
  { id: "preto-luxo", nome: "Preto Luxo", destaque: "#E8D9B0", fundo: "#0E0D0B", botao: "#E8D9B0" },
  { id: "azul-marinho", nome: "Azul Marinho", destaque: "#1B3A6B", fundo: "#EEF3F8", botao: "#1B3A6B" },
  { id: "verde-floresta", nome: "Verde Floresta", destaque: "#2F5D46", fundo: "#F2EADF", botao: "#2F5D46" },
  { id: "terracota", nome: "Terracota", destaque: "#C0603E", fundo: "#F2EADF", botao: "#8C3F24" },
  { id: "cafe", nome: "Café", destaque: "#6F4E37", fundo: "#FBF7EE", botao: "#4A3222" },
  { id: "oceano", nome: "Oceano", destaque: "#0E8C9B", fundo: "#FFFFFF", botao: "#0A5F69" },
  { id: "vinho", nome: "Vinho", destaque: "#7B1E3A", fundo: "#FBF7EE", botao: "#7B1E3A" },
  { id: "menta", nome: "Menta", destaque: "#3FBF9F", fundo: "#FFFFFF", botao: "#1F7A64" },
  { id: "noite-neon", nome: "Noite Coral", destaque: "#FF6B5A", fundo: "#22211E", botao: "#FF6B5A" },
];

export type Layout = "vitrine" | "compacta" | "destaque" | "lista" | "oferta" | "carrossel" | "mosaico" | "revista" | "galeria" | "minimal" | "catalogo" | "boutique" | "imersivo";
export const LAYOUTS: { id: Layout; nome: string; desc: string }[] = [
  { id: "vitrine", nome: "Vitrine", desc: "Grade de 4" }, { id: "compacta", nome: "Grade compacta", desc: "Grade de 5, cartão menor" },
  { id: "destaque", nome: "Destaque", desc: "1 grande + grade" }, { id: "lista", nome: "Lista", desc: "Linhas com foto e preço" },
  { id: "oferta", nome: "Oferta do dia", desc: "Faixa de oferta + grade" }, { id: "carrossel", nome: "Carrossel por categoria", desc: "Uma fileira por categoria" },
  { id: "mosaico", nome: "Mosaico", desc: "Blocos de tamanhos diferentes" }, { id: "revista", nome: "Revista", desc: "Cartões grandes alternados" },
  { id: "galeria", nome: "Galeria grande", desc: "2 por linha, fotos grandes" }, { id: "minimal", nome: "Minimal", desc: "Só foto e preço" },
  { id: "catalogo", nome: "Catálogo", desc: "3 colunas, mais texto" }, { id: "boutique", nome: "Boutique", desc: "Destaques alternados" }, { id: "imersivo", nome: "Imersivo", desc: "Banner em tela cheia" },
];
export const isLayout = (v: string): v is Layout => LAYOUTS.some(l => l.id === v);

export type BannerPos = "topo" | "dividido" | "faixa" | "carrossel" | "entre" | "lateral" | "flutuante" | "nenhum";
export const BANNER_POS: { id: BannerPos; nome: string; ratio: number | null }[] = [
  { id: "topo", nome: "Topo largo", ratio: 16 / 6 }, { id: "dividido", nome: "Topo dividido", ratio: 4 / 3 },
  { id: "faixa", nome: "Faixa fina", ratio: 16 / 3 }, { id: "carrossel", nome: "Carrossel (até 3)", ratio: 16 / 6 },
  { id: "entre", nome: "Entre seções", ratio: 16 / 4 }, { id: "lateral", nome: "Lateral", ratio: 3 / 4 },
  { id: "flutuante", nome: "Cartão flutuante", ratio: 16 / 6 }, { id: "nenhum", nome: "Sem banner", ratio: null },
];
export type BannerAltura = "P" | "M" | "G";
export type Alinhamento = "esquerda" | "centro";
export const isBannerPos = (v: string): v is BannerPos => BANNER_POS.some(b => b.id === v);
export const MOSTRAR_PADRAO: Mostrar = { selo: true, preco: true, botao: true };
/** Valores efetivos (lojas antigas não têm os campos novos). */
export function extras(t: Tema) {
  return { cartao: t.cartao ?? "borda", botaoEstilo: t.botaoEstilo ?? "preenchido", espaco: t.espaco ?? "normal", topo: t.topo ?? "claro", foto: t.foto ?? "quadrada", filtro: t.filtro ?? "pilulas", rodape: t.rodape ?? "completo", mostrar: { ...MOSTRAR_PADRAO, ...t.mostrar } };
}

/** Recorte central (em px) de uma imagem w×h para a proporção pedida. */
export function cropFor(w: number, h: number, ratio: number) {
  if (w / h > ratio) { const cw = Math.round(h * ratio); return { x: Math.round((w - cw) / 2), y: 0, w: cw, h }; }
  const ch = Math.round(w / ratio); return { x: 0, y: Math.round((h - ch) / 2), w, h: ch };
}

export const DEFAULT_TEMA = (cor = "#FFE600"): Tema => ({ cor_destaque: cor, cor_fundo: "#FFFFFF", cor_botao: cor === "#FFE600" ? "#16140F" : cor, cantos: "suaves", fonte: "moderna", paleta: null });

export function parseTema(raw: unknown, corLegada: string): Tema {
  const d = DEFAULT_TEMA(corLegada); if (!raw || typeof raw !== "object") return d;
  const r = raw as Partial<Tema>; const hex = (v: unknown, f: string) => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : f;
  return { cor_destaque: hex(r.cor_destaque, d.cor_destaque), cor_fundo: hex(r.cor_fundo, d.cor_fundo), cor_botao: hex(r.cor_botao, d.cor_botao),
    cantos: CANTOS.some(c => c.id === r.cantos) ? r.cantos! : d.cantos, fonte: FONTES.some(f => f.id === r.fonte) ? r.fonte! : d.fonte, paleta: typeof r.paleta === "string" ? r.paleta : null,
    ...pick("cartao", r.cartao, CARTOES), ...pick("botaoEstilo", r.botaoEstilo, BOTOES), ...pick("espaco", r.espaco, ESPACOS), ...pick("topo", r.topo, TOPOS),
    ...pick("foto", r.foto, FOTOS), ...pick("filtro", r.filtro, FILTROS), ...pick("rodape", r.rodape, RODAPES),
    ...(r.mostrar && typeof r.mostrar === "object" ? { mostrar: { selo: r.mostrar.selo !== false, preco: r.mostrar.preco !== false, botao: r.mostrar.botao !== false, desconto: r.mostrar.desconto === true, seloTexto: typeof r.mostrar.seloTexto === "string" ? r.mostrar.seloTexto.slice(0, 20) : "" } } : {}) };
}
function pick<K extends string, V extends string>(k: K, v: unknown, list: { id: V }[]): Partial<Record<K, V>> {
  return list.some(x => x.id === v) ? { [k]: v as V } as Partial<Record<K, V>> : {};
}

const INK = "#16140F", WHITE = "#FFFFFF";
/** Texto legível sobre uma cor (AA 4.5:1 quando possível). */
export function textoSobre(bg: string) { return contrastRatio(bg, INK) >= contrastRatio(bg, WHITE) ? INK : WHITE; }
export const passaAA = (a: string, b: string) => contrastRatio(a, b) >= 4.5;

/** Avisos de contraste do tema: o texto sempre é ajustado, mas cores fracas ganham aviso. */
export function avisosContraste(t: Tema): string[] {
  const out: string[] = [];
  if (!passaAA(t.cor_botao, textoSobre(t.cor_botao))) out.push("A cor dos botões tem pouco contraste com o texto. Escolha um tom mais claro ou mais escuro.");
  if (contrastRatio(t.cor_destaque, t.cor_fundo) < 1.15) out.push("A cor de destaque ficou muito parecida com o fundo e pode sumir na loja.");
  return out;
}

/** Variáveis CSS usadas pela prévia, loja pública e artes. */
export function temaVars(t: Tema): Record<string, string> {
  const f = FONTES.find(x => x.id === t.fonte)!; const raio = CANTOS.find(c => c.id === t.cantos)!.raio;
  return { "--loja-cor": t.cor_destaque, "--loja-on": textoSobre(t.cor_destaque), "--loja-bg": t.cor_fundo, "--loja-btn": t.cor_botao, "--loja-btn-on": textoSobre(t.cor_botao),
    "--loja-r": `${raio}px`, "--loja-font-t": f.titulo, "--loja-font": f.texto,
    "--loja-ink": textoSobre(t.cor_fundo), "--loja-gap": { compacto: "10px", normal: "14px", arejado: "22px" }[extras(t).espaco] };
}

export type Aparencia = { tema: Tema; posicao: BannerPos; altura: BannerAltura; alinhamento: Alinhamento; frase: string | null; botao: string | null; banners: string[] };
type AparenciaRaw = { tema?: unknown; posicao?: string | null; altura?: string | null; alinhamento?: string | null; frase?: string | null; botao?: string | null; banners?: unknown };
/** Normaliza o que vem do banco; `banners` devolve caminhos (assinar antes de exibir). */
export function parseAparencia(r: AparenciaRaw | null | undefined, cor: string): Aparencia {
  const x = r ?? {};
  return { tema: parseTema(x.tema, cor), posicao: x.posicao && isBannerPos(x.posicao) ? x.posicao : "topo",
    altura: x.altura === "P" || x.altura === "G" ? x.altura : "M", alinhamento: x.alinhamento === "centro" ? "centro" : "esquerda",
    frase: x.frase ?? null, botao: x.botao ?? null, banners: Array.isArray(x.banners) ? (x.banners as unknown[]).filter((b): b is string => typeof b === "string").slice(0, 3) : [] };
}
