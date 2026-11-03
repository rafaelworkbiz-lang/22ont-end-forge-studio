import { describe, expect, it } from "vitest";
import { fillTemplate, intervalStatus, parseGroupCsv, productLink, startOfTodaySP, storeLink } from "@/lib/divulgacao-core";

describe("Divulgação v2", () => {
  it("link da loja leva o canal", () => expect(storeLink("casa-achados", "whatsapp")).toBe("https://afiliaplace.site/loja/casa-achados?c=whatsapp"));
  it("link de categoria usa âncora", () => expect(storeLink("casa", "facebook", "Casa e Cozinha")).toBe("https://afiliaplace.site/loja/casa?c=facebook#casa-e-cozinha"));
  it("link de produto passa pelo /r com canal", () => expect(productLink("L", "P", "facebook")).toBe("https://afiliaplace.site/r/L/P?c=facebook"));
  it("preenche as variáveis", () => expect(fillTemplate("{produto} por {preco} na {loja}: {link}", { produto: "Mixer", preco: "R$ 10,00", loja: "Casa", link: "x" })).toBe("Mixer por R$ 10,00 na Casa: x"));
  it("antes do intervalo não pode postar", () => {
    const now = Date.parse("2026-10-30T12:00:00Z");
    const r = intervalStatus("2026-10-30T10:00:00Z", 6, now);
    expect(r.canPost).toBe(false); expect(r.waitHours).toBe(4); expect(Math.floor(r.hoursSince ?? 0)).toBe(2);
  });
  it("depois do intervalo pode postar", () => expect(intervalStatus("2026-10-30T05:00:00Z", 6, Date.parse("2026-10-30T12:00:00Z")).canPost).toBe(true));
  it("dia de hoje começa à meia-noite de São Paulo", () => expect(startOfTodaySP(new Date("2026-10-30T02:00:00Z"))).toBe("2026-10-29T03:00:00.000Z"));
  it("CSV aceita linha válida e recusa rede inválida", () => {
    const r = parseGroupCsv("rede,nome,link,nichos,membros,regras,frequencia\nwhatsapp,Ofertas,https://chat.whatsapp.com/abc,Achadinhos;Ofertas,120,Sem spam,8\ntelegram,X,https://t.me/x,,,,");
    expect(r.rows).toHaveLength(1); expect(r.rows[0]?.nichos).toEqual(["Achadinhos", "Ofertas"]); expect(r.rows[0]?.frequencia_min_horas).toBe(8); expect(r.errors).toEqual([3]);
  });
});
