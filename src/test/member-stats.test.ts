import { describe, expect, it } from "vitest";
import { realMembers } from "@/lib/member-stats";
describe("contas de teste", () => {
  it("não contam nos totais", () => {
    expect(realMembers([{ plan: "monthly", is_test: true }, { plan: "monthly", is_test: false }, { plan: "lifetime" }]).length).toBe(2);
  });
});
