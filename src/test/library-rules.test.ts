import { describe, it, expect } from "vitest";
import { commissionValue, mlValidated, myProductStatus, parseProductKey, shopeeValidated } from "@/lib/library-rules";

describe("library rules", () => {
  it("validates ML only when active, new, reputation yellow+ and ranked", () => {
    expect(mlValidated({ status: "active", condition: "new", reputation: "3_yellow", ranked: true })).toBe(true);
    expect(mlValidated({ status: "active", condition: "new", reputation: "2_orange", ranked: true })).toBe(false);
    expect(mlValidated({ status: "active", condition: "used", reputation: "5_green", ranked: true })).toBe(false);
    expect(mlValidated({ status: "paused", condition: "new", reputation: "5_green", ranked: true })).toBe(false);
    expect(mlValidated({ status: "active", condition: "new", reputation: null, ranked: true })).toBe(false);
  });
  it("validates Shopee at rating 4.5 or more", () => {
    expect(shopeeValidated({ rating: 4.5, ranked: true })).toBe(true);
    expect(shopeeValidated({ rating: 4.4, ranked: true })).toBe(false);
  });
  it("computes my product status", () => {
    expect(myProductStatus(100, { preco: 90, status: "ativo" })).toBe("preco_caiu");
    expect(myProductStatus(100, { preco: 100, status: "ativo" })).toBe("ativo");
    expect(myProductStatus(100, { preco: 80, status: "fora_do_ar" })).toBe("fora_do_ar");
    expect(myProductStatus(100, null)).toBe("fora_do_ar");
  });
  it("parses ?produto=fornecedor:id", () => {
    expect(parseProductKey("ml:MLB123")).toEqual({ fornecedor: "ml", itemId: "MLB123" });
    expect(parseProductKey("amazon:1")).toBeNull();
  });
  it("commission from official Shopee fraction", () => { expect(commissionValue(200, 0.08)).toBe(16); expect(commissionValue(200, null)).toBeNull(); });
});
