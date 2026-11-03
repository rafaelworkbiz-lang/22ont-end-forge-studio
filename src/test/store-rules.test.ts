import { describe, expect, it } from "vitest";
import { contrastRatio, hiddenReason, isVisibleInStore, storeLimit, textOn } from "@/lib/store-rules";

describe("limite de lojas", () => {
  it("Mensal permite 3", () => expect(storeLimit({ reason: "active", plan: "monthly" })).toBe(3));
  it("Vitalício permite 10", () => expect(storeLimit({ reason: "active", plan: "lifetime" })).toBe(10));
  it("sem plano ativo não cria", () => expect(storeLimit({ reason: "expired", plan: "monthly" })).toBe(0));
});

describe("contraste da cor da loja", () => {
  it("amarelo usa texto escuro", () => expect(textOn("#FFE600")).toBe("#16140F"));
  it("grafite usa texto branco", () => expect(textOn("#3D3A31")).toBe("#FFFFFF"));
  it("todas as cores atingem AA", () => {
    for (const c of ["#FFE600", "#3D3A31", "#E4572E", "#2F6FDB", "#2E9E6B"]) expect(contrastRatio(c, textOn(c))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("produtos ocultos", () => {
  const on = { ml: true, shopee: false };
  it("fora do ar some", () => expect(isVisibleInStore({ status: "fora_do_ar", fornecedor: "ml" }, on)).toBe(false));
  it("fornecedor desconectado some", () => expect(hiddenReason({ status: "ativo", fornecedor: "shopee" }, on)).toBe("Shopee desconectada"));
  it("ativo e conectado aparece", () => expect(isVisibleInStore({ status: "ativo", fornecedor: "ml" }, on)).toBe(true));
});
