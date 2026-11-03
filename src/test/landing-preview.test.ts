import { describe, expect, it } from 'vitest';
import { presentationProducts, presentationTotals } from '@/lib/landing-preview';

describe('Illustrative public sales preview', () => {
  it('reconciles six products with the displayed totals', () => {
    expect(presentationProducts).toHaveLength(6);
    expect(presentationTotals).toEqual({ orders: 120, revenue: 38740.8, commission: 3486.67 });
  });
  it('keeps revenue and commission distinct with bundled imagery', () => {
    for (const product of presentationProducts) {
      expect(product.commission).toBeLessThan(product.revenue);
      expect(product.image).toBeTruthy();
    }
  });
});