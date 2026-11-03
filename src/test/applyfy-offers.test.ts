import { describe, it, expect } from "vitest";
import { parseApplyfy } from "@/lib/applyfy-event";
const ev = (offer: string) => ({ event: "approved", customer: { email: "a@b.com" }, product: { offer } });
describe("novas ofertas Applyfy", () => {
  it("checkout mensal novo vira plano mensal", () => { expect(parseApplyfy(ev("9uw4neg")).plan).toBe("monthly"); expect(parseApplyfy(ev("cmvv7ihvg0ciu01q6pofcauy2")).plan).toBe("monthly"); });
  it("checkout vitalício novo vira vitalício", () => { expect(parseApplyfy(ev("ggo7ayu")).plan).toBe("lifetime"); expect(parseApplyfy(ev("cmvv7iqfj04ga01n60jjth2ss")).plan).toBe("lifetime"); });
  it("ofertas antigas continuam valendo", () => { expect(parseApplyfy(ev("OBULDYP")).plan).toBe("monthly"); expect(parseApplyfy(ev("B0QAGV6")).plan).toBe("lifetime"); });
});
