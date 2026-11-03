import { describe, expect, it } from "vitest";
import { profileEligibility, whatsappShareUrl, discountPercent, isValidTag } from "@/lib/product-share";

describe("elegibilidade para o perfil ML", () => {
  it("aceita novo, ativo e reputação amarela/verde", () => {
    for (const r of ["3_yellow", "4_light_green", "5_green"]) expect(profileEligibility({ condition: "new", status: "active", reputation: r }).eligible).toBe(true);
  });
  it("recusa usado", () => expect(profileEligibility({ condition: "used", status: "active", reputation: "5_green" }).eligible).toBe(false));
  it("recusa pausado", () => expect(profileEligibility({ condition: "new", status: "paused", reputation: "5_green" }).eligible).toBe(false));
  it("verde é elegível", () => expect(profileEligibility({ condition: "new", status: "active", reputation: "5_green" }).state).toBe("elegivel"));
  it("vermelha ou laranja não é elegível", () => {
    expect(profileEligibility({ condition: "new", status: "active", reputation: "1_red" }).state).toBe("nao_elegivel");
    expect(profileEligibility({ condition: "new", status: "active", reputation: "2_orange" }).state).toBe("nao_elegivel");
  });
  it("sem reputação fica não verificado e liberado", () => {
    const r = profileEligibility({ condition: "new", status: "active", reputation: null });
    expect(r.state).toBe("nao_verificado"); expect(r.eligible).toBe(true);
  });
  it("valida formato da tag", () => { expect(isValidTag("minha.tag_1")).toBe(true); expect(isValidTag("a")).toBe(false); expect(isValidTag("tag com espaço")).toBe(false); });
});

describe("compartilhamento", () => {
  it("monta link wa.me com texto codificado", () => expect(whatsappShareUrl("Oi & tchau")).toBe("https://wa.me/?text=Oi%20%26%20tchau"));
  it("calcula desconto", () => { expect(discountPercent(75, 100)).toBe(25); expect(discountPercent(100, null)).toBe(0); });
});

import { safeAffiliateLink, completedSteps, postedTodayCount, groupsForCategory } from "@/lib/product-share";
describe("PATCH-001.2", () => {
  const url = "https://www.mercadolivre.com.br/p/MLB123456";
  it("sem tag confirmada não gera link", () => expect(safeAffiliateLink(url, "minhatag", false)).toBeNull());
  it("tag inválida não gera link", () => expect(safeAffiliateLink(url, "", true)).toBeNull());
  it("tag confirmada gera link com a tag", () => expect(safeAffiliateLink(url, "minhatag", true)).toContain("matt_word=minhatag"));
  it("progresso: grupos com 1+ postado e perfil publicado", () => {
    const s = completedSteps(["link"], 1, true);
    expect([...s].sort()).toEqual(["grupos", "link", "perfil"]);
    expect(completedSteps([], 0, false).size).toBe(0);
  });
  it("conta só postagens de hoje e sem duplicar o mesmo grupo", () => {
    const now = new Date("2026-10-29T15:00:00Z");
    const posts = [{ grupoId: "a", postadoEm: "2026-10-29T14:00:00Z" }, { grupoId: "a", postadoEm: "2026-10-29T14:30:00Z" }, { grupoId: "b", postadoEm: "2026-10-27T14:00:00Z" }];
    expect(postedTodayCount(posts, ["a", "b"], now)).toBe(1);
  });
  it("sem grupos da categoria usa os gerais", () => {
    const r = groupsForCategory("MLB1747", [{ id: "1", name: "x", niche: "Achadinhos", url: "u" }], []);
    expect(r.general).toBe(true); expect(r.groups).toHaveLength(1);
  });
});
