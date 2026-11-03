import { describe, it, expect } from "vitest";
import { classifyShopeeError, decryptSecret, encryptSecret, maskAppId, sha256Hex, shopeeAuthHeader } from "@/lib/shopee-core";

describe("shopee core", () => {
  it("signs SHA256(AppId + Timestamp + Payload + Secret)", async () => {
    const payload = '{"query":"x"}';
    const h = await shopeeAuthHeader("123456", "sec", payload, 1700000000);
    expect(h).toBe(`SHA256 Credential=123456, Timestamp=1700000000, Signature=${await sha256Hex(`1234561700000000${payload}sec`)}`);
  });
  it("masks app id like 1830••••92", () => { expect(maskAppId("18301234592")).toBe("1830••••92"); });
  it("encrypts and decrypts without keeping plaintext", async () => {
    const c = await encryptSecret("my-secret-value", "k".repeat(64));
    expect(c).not.toContain("my-secret-value");
    expect(await decryptSecret(c, "k".repeat(64))).toBe("my-secret-value");
    await expect(decryptSecret(c, "x".repeat(64))).rejects.toThrow();
  });
  it("classifies Shopee errors", () => {
    expect(classifyShopeeError(200, { errors: [{ message: "Invalid Signature", extensions: { code: 10020 } }] })).toBe("credencial");
    expect(classifyShopeeError(200, { errors: [{ message: "x", extensions: { code: 10030 } }] })).toBe("limite");
    expect(classifyShopeeError(200, { errors: [{ message: "x", extensions: { code: 10031 } }] })).toBe("permissao");
    expect(classifyShopeeError(503, null)).toBe("indisponivel");
  });
});
