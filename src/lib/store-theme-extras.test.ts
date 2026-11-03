import { describe, expect, it } from "vitest";
import { extras, parseTema, temaVars, LAYOUTS, PALETAS, FONTES } from "./store-theme";

describe("Tema e layout profissionais", () => {
  it("loja antiga recebe os padrões", () => { const e = extras(parseTema({ cor_destaque: "#FFE600" }, "#FFE600")); expect(e).toMatchObject({ cartao: "borda", botaoEstilo: "preenchido", espaco: "normal", topo: "claro", foto: "quadrada", filtro: "pilulas", rodape: "completo", mostrar: { selo: true, preco: true, botao: true } }); });
  it("guarda as novas escolhas", () => { const t = parseTema({ cartao: "elevado", foto: "retrato", mostrar: { selo: false, preco: true, botao: true } }, "#FFE600"); expect(extras(t).cartao).toBe("elevado"); expect(extras(t).foto).toBe("retrato"); expect(extras(t).mostrar.selo).toBe(false); });
  it("ignora valor inválido", () => expect(extras(parseTema({ cartao: "xyz" }, "#FFE600")).cartao).toBe("borda"));
  it("fundo preto deixa o texto branco", () => expect(temaVars(parseTema({ cor_fundo: "#0E0D0B" }, "#FFE600"))["--loja-ink"]).toBe("#FFFFFF"));
  it("13 layouts (inclui Imersivo), 20 paletas e 7 fontes", () => { expect(LAYOUTS).toHaveLength(13); expect(PALETAS).toHaveLength(20); expect(FONTES).toHaveLength(7); });
});
