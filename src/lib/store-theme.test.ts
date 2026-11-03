import { describe, expect, it } from "vitest";
import { avisosContraste, cropFor, DEFAULT_TEMA, LAYOUTS, BANNER_POS, PALETAS, parseAparencia, textoSobre } from "./store-theme";
import { IA_ESTILOS, custoEstimado } from "./store-ai-moderation";

describe("tema e opções da loja", () => {
  it("13 layouts (inclui Imersivo), 8 posições de banner e 20 paletas", () => { expect(LAYOUTS).toHaveLength(13); expect(BANNER_POS).toHaveLength(8); expect(PALETAS).toHaveLength(20); });
  it("8 estilos de IA", () => expect(IA_ESTILOS).toHaveLength(8));
  it("texto escuro sobre amarelo e branco sobre azul escuro", () => { expect(textoSobre("#FFE600")).toBe("#16140F"); expect(textoSobre("#1F4FA8")).toBe("#FFFFFF"); });
  it("botão de cor média sem contraste AA gera aviso", () => expect(avisosContraste({ ...DEFAULT_TEMA(), cor_botao: "#777777" }).length).toBeGreaterThan(0));
  it("tema padrão não tem aviso", () => expect(avisosContraste(DEFAULT_TEMA())).toEqual([]));
  it("recorte 1536×1024 para 16:6 mantém a largura", () => expect(cropFor(1536, 1024, 16 / 6)).toEqual({ x: 0, y: 224, w: 1536, h: 576 }));
  it("recorte 1536×1024 para faixa 16:3", () => expect(cropFor(1536, 1024, 16 / 3).h).toBe(288));
  it("lojas antigas sem tema herdam a cor de destaque", () => { const a = parseAparencia(null, "#2E9E6B"); expect(a.tema.cor_destaque).toBe("#2E9E6B"); expect(a.posicao).toBe("topo"); });
  it("carrossel guarda no máximo 3 banners", () => expect(parseAparencia({ banners: ["a", "b", "c", "d"] }, "#FFE600").banners).toHaveLength(3));
  it("custo estimado: logo e banner com 2 opções", () => { expect(custoEstimado("logo")).toBe(0.084); expect(custoEstimado("banner")).toBe(0.126); });
});
