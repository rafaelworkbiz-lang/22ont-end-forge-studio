import { describe, expect, it } from "vitest";
import { buildChecklist, canPublish, slugFormatProblem, slugSuggestions, slugify } from "@/lib/store-rules";

const ok = { planoAtivo: true, produtosAtivos: 4, semFornecedor: 0, semLink: 0, temLogo: true, temBanner: true };
describe("endereço da loja", () => {
  it("exige 3 a 40 caracteres", () => {
    expect(slugFormatProblem("ab")).toBe("curto");
    expect(slugFormatProblem("abc")).toBeNull();
    expect(slugFormatProblem("a".repeat(40))).toBeNull();
    expect(slugFormatProblem("a".repeat(41))).toBe("longo");
  });
  it("aceita só minúsculas, números e hífens entre palavras", () => {
    expect(slugFormatProblem("casa-achados-2")).toBeNull();
    expect(slugFormatProblem("-casa")).toBe("formato");
    expect(slugFormatProblem("casa--x")).toBe("formato");
    expect(slugFormatProblem("Casa")).toBe("formato");
  });
  it("bloqueia reservados sem diferenciar maiúsculas", () => {
    expect(slugFormatProblem("shopee", ["Shopee"])).toBe("reservado");
    expect(slugFormatProblem("mercado-livre", ["mercado-livre"])).toBe("reservado");
  });
  it("normaliza nome e sugere livres", () => {
    expect(slugify("Casa & Achados Ótimos")).toBe("casa-achados-otimos");
    expect(slugSuggestions("Casa", s => s === "casa")).toEqual(["casa-achados", "casa-ofertas", "achados-casa"]);
  });
});
describe("checklist de publicação", () => {
  it("libera quando bloqueantes estão ok mesmo com avisos", () => {
    expect(canPublish(buildChecklist({ ...ok, produtosAtivos: 1, temLogo: false }))).toBe(true);
  });
  for (const [k, v] of [["planoAtivo", false], ["produtosAtivos", 0], ["semFornecedor", 1], ["semLink", 1]] as const)
    it(`bloqueia quando ${k} falha`, () => expect(canPublish(buildChecklist({ ...ok, [k]: v }))).toBe(false));
});
