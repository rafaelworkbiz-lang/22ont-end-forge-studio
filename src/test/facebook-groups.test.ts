import { describe, expect, it } from "vitest";
import { fbGroups, fbNiches, normalizeFacebookGroup } from "@/lib/facebook-groups-data";

describe("Facebook groups", () => {
  it("canonicalizes group URLs without tracking parameters", () => {
    expect(normalizeFacebookGroup("https://m.facebook.com/groups/ofertas/?ref=share")).toBe("https://www.facebook.com/groups/ofertas");
  });
  it("rejects unsafe and unrelated URLs", () => {
    for (const url of ["javascript:alert(1)", "https://facebook.com.evil.test/groups/test", "https://evil.test/groups/test", "https://www.facebook.com/groups/test/posts/123", "https://user:pass@facebook.com/groups/test"]) expect(normalizeFacebookGroup(url)).toBeNull();
  });
  it("uses unique sourced group URLs with explicit unknown counts", () => {
    expect(fbGroups.length).toBeGreaterThanOrEqual(274);
    expect(new Set(fbGroups.map(g => g.url)).size).toBe(fbGroups.length);
    expect(new Set(fbGroups.map(g => g.id)).size).toBe(fbGroups.length);
    for (const g of fbGroups) {
      expect(fbNiches).toContain(g.niche);
      expect(normalizeFacebookGroup(g.url)).toBe(g.url);
      expect(g.source).toMatch(/^https:\/\//);
      expect(g.members).toBeNull();
    }
  });
  it("includes dedicated categories for regional commerce", () => {
    for (const niche of ["Brique / Brick", "Troca e Venda", "Compra e Venda"]) expect(fbNiches).toContain(niche);
  });
  it("has sourced groups in each new commerce category", () => {
    for (const niche of ["Brique / Brick", "Troca e Venda", "Compra e Venda"]) {
      expect(fbGroups.some(g => g.niche === niche && g.source)).toBe(true);
    }
    expect(fbGroups.filter(g => Number(g.id.replace("fb-", "")) > 29).length).toBeGreaterThanOrEqual(9);
  });
});