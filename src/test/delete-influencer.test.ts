import { describe, it, expect } from "vitest";
import { motivoBloqueioExclusao } from "@/lib/influencer-rules";
describe("excluir conta de influenciador", () => {
  it("bloqueia excluir o administrador", () => expect(motivoBloqueioExclusao("u1", "adm", true)).toMatch(/administrador/));
  it("bloqueia excluir a própria conta", () => expect(motivoBloqueioExclusao("adm", "adm", false)).toMatch(/própria/));
  it("permite excluir influenciador comum", () => expect(motivoBloqueioExclusao("u1", "adm", false)).toBeNull());
});
