import { describe, expect, it } from "vitest";
import { normalizeInvite, whatsappGroups } from "@/lib/whatsapp-groups-data";

describe("WhatsApp public invitations", () => {
  it("normalizes query parameters without changing the invite code", () => {
    expect(normalizeInvite("https://chat.whatsapp.com/BWrfMVjEdfgLtkcDjFwJSe?mode=gi_t")).toBe("https://chat.whatsapp.com/BWrfMVjEdfgLtkcDjFwJSe");
  });
  it("rejects lookalike domains, unsafe schemes and invalid paths", () => {
    for (const value of ["https://chat.whatsapp.com.evil.test/BWrfMVjEdfgLtkcDjFwJSe", "javascript:alert(1)", "http://chat.whatsapp.com/BWrfMVjEdfgLtkcDjFwJSe", "https://chat.whatsapp.com/short", "https://chat.whatsapp.com/BWrfMVjEdfgLtkcDjFwJSe/extra"]) {
      expect(normalizeInvite(value)).toBeNull();
    }
  });
  it("keeps sourced invitations distinct and member counts explicit", () => {
    expect(new Set(whatsappGroups.map(g => g.url)).size).toBe(whatsappGroups.length);
    for (const group of whatsappGroups) {
      expect(normalizeInvite(group.url)).toBe(group.url);
      expect(group.source).toMatch(/^https:\/\//);
      expect(group.members === null || Number.isSafeInteger(group.members) && group.members > 0).toBe(true);
    }
  });
});