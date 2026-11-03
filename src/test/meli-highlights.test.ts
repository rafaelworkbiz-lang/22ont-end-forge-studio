import { describe, expect, it } from "vitest";
import { hotCategoryBatch, rankedHighlights } from "@/lib/meli-highlights";

describe("official hot product rankings", () => {
  it("preserves official positions and supported product types, rejecting duplicates", () => {
    expect(rankedHighlights({ content: [
      { id: "MLB123", position: 4, type: "PRODUCT" },
      { id: "MLBU456", position: 1, type: "USER_PRODUCT" },
      { id: "MLB123", position: 5, type: "PRODUCT" },
      { id: "MLB789", position: 2, type: "ITEM" },
      { id: "fake", position: 3, type: "PRODUCT" },
      { id: "MLB999", position: 0, type: "PRODUCT" },
      { id: "MLB111", position: 7, type: "UNKNOWN" },
    ] })).toEqual([
      { id: "MLBU456", position: 1, type: "USER_PRODUCT" },
      { id: "MLB789", position: 2, type: "ITEM" },
      { id: "MLB123", position: 4, type: "PRODUCT" },
    ]);
  });
  it("distinguishes an unavailable response from an empty official ranking", () => {
    expect(rankedHighlights(null)).toBeNull();
    expect(rankedHighlights({ results: [] })).toBeNull();
    expect(rankedHighlights({ content: [] })).toEqual([]);
  });
  it("bounds category requests and prevents repeat pagination in a single category", () => {
    const ids = ["MLB1051", "MLB1648", "MLB1000"];
    expect(hotCategoryBatch(ids, "", 0)).toEqual(ids.slice(0, 2));
    expect(hotCategoryBatch(ids, "", 1)).toEqual(["MLB1000"]);
    expect(hotCategoryBatch(ids, "", 2)).toEqual([]);
    expect(hotCategoryBatch(ids, "MLB1051", 0)).toEqual(["MLB1051"]);
    expect(hotCategoryBatch(ids, "MLB1051", 1)).toEqual([]);
    expect(hotCategoryBatch(ids, "invalid", 0)).toEqual([]);
  });
});