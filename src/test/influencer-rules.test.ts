import { describe, expect, it } from "vitest";
import { COMISSAO_INICIAL, validarCodigo, validarComissao, validarLinks } from "@/lib/influencer-rules";

describe("PATCH-017 regras", () => {
  it("comissão inicial é 50%", () => { expect(COMISSAO_INICIAL).toBe(50); });
  it("comissão fora de 0–100% é recusada", () => { expect(validarComissao(120)).not.toBeNull(); expect(validarComissao(-1)).not.toBeNull(); expect(validarComissao(60)).toBeNull(); });
  it("código reservado é recusado", () => { expect(validarCodigo("admin")).not.toBeNull(); });
  it("código com 2 letras é recusado e com 4 é aceito", () => { expect(validarCodigo("ab")).not.toBeNull(); expect(validarCodigo("rafa")).toBeNull(); });
  it("Mensal igual ao Vitalício é recusado", () => {
    const l = "https://checkout.applyfy.com.br/checkout/x?code=a";
    expect(validarLinks(l, l, ["checkout.applyfy.com.br"], [], [])).toMatch(/diferentes/);
  });
  it("link de outro domínio é recusado", () => {
    expect(validarLinks("https://evil.com/a", "https://evil.com/b", ["checkout.applyfy.com.br"], [], [])).toMatch(/Applyfy/);
  });
});

import { motivoConviteInvalido, validarLinkGerente, gerarCodigoConvite } from "@/lib/influencer-rules";
describe("convites de gerente", () => {
  const base = { ativo: true, expira_em: "2030-01-01T00:00:00Z", usos: 0, limite_usos: 50 };
  const agora = new Date("2026-10-31T00:00:00Z");
  it("convite válido passa", () => { expect(motivoConviteInvalido(base, agora)).toBeNull(); });
  it("convite desativado é recusado", () => { expect(motivoConviteInvalido({ ...base, ativo: false }, agora)).toMatch(/desativado/); });
  it("convite expirado é recusado", () => { expect(motivoConviteInvalido({ ...base, expira_em: "2026-10-30T00:00:00Z" }, agora)).toMatch(/expirou/); });
  it("convite com 50 de 50 usos é recusado", () => { expect(motivoConviteInvalido({ ...base, usos: 50 }, agora)).toMatch(/limite/); });
  it("link do gerente precisa ser da Applyfy", () => { expect(validarLinkGerente("https://app.applyfy.com.br/panel/showcase/x")).toBeNull(); expect(validarLinkGerente("https://evil.com/x")).not.toBeNull(); });
  it("código de convite tem 10 caracteres válidos", () => { expect(gerarCodigoConvite()).toMatch(/^[a-z0-9]{10}$/); });
});

import { validarLinksGerente } from "@/lib/influencer-rules";
describe("validarLinksGerente", () => {
  it("recusa links iguais", () => { expect(validarLinksGerente("https://app.applyfy.com.br/a", "https://app.applyfy.com.br/a")).not.toBeNull(); });
  it("recusa outro domínio", () => { expect(validarLinksGerente("https://app.applyfy.com.br/a", "https://evil.com/b")).not.toBeNull(); });
  it("aceita dois links Applyfy diferentes", () => { expect(validarLinksGerente("https://app.applyfy.com.br/a", "https://app.applyfy.com.br/b")).toBeNull(); });
});
