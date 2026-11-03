import { describe, it, expect } from "vitest";
import { normalizeWhatsapp, hasWhatsapp } from "@/lib/members.functions";
describe("whatsapp", () => {
  it("adiciona 55 a número com DDD", () => expect(normalizeWhatsapp("(11) 91234-5678")).toBe("5511912345678"));
  it("rejeita número curto", () => expect(normalizeWhatsapp("1234")).toBeNull());
  it("zeros contam como sem WhatsApp", () => expect(hasWhatsapp("5500000000000")).toBe(false));
});
