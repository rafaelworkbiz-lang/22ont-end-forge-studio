import { describe, it, expect } from "vitest";
import { validateInviteForm } from "@/lib/invite-form";
const ok = { foto: "data:image/png;base64,AA==", nome: "Rafael", sobrenome: "Mathias", email: "r@gmail.com", whatsapp: "11912345678", senha: "12345678", senha2: "12345678", termos: true };
describe("formulário de convite", () => {
  it("aceita dados completos", () => expect(validateInviteForm(ok)).toBeNull());
  it("exige foto", () => expect(validateInviteForm({ ...ok, foto: "" })).toMatch(/foto/));
  it("senhas diferentes", () => expect(validateInviteForm({ ...ok, senha2: "x2345678" })).toMatch(/iguais/));
});
