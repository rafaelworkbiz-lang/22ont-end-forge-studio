import { describe, expect, it } from "vitest";
import { readFilter, withFilter } from "./url-filter";
describe("filtros no endereço", () => {
  it("guarda o filtro escolhido e mantém os outros", () => expect(withFilter({ janela: "x" }, "cat", "Moda", "")).toEqual({ janela: "x", cat: "Moda" }));
  it("remove o filtro quando volta ao padrão", () => expect(withFilter({ ordem: "preco" }, "ordem", "vendidos", "vendidos")).toEqual({}));
  it("ignora valor não permitido", () => expect(readFilter({ f: "amazon" }, "f", "", ["", "ml", "shopee"])).toBe(""));
  it("lê valor permitido", () => expect(readFilter({ f: "ml" }, "f", "", ["", "ml", "shopee"])).toBe("ml"));
});
