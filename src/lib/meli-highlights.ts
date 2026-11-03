export type Highlight = { id: string; position: number; type: "PRODUCT" | "USER_PRODUCT" | "ITEM" };

export function rankedHighlights(value: unknown): Highlight[] | null {
  if (!value || typeof value !== "object" || !("content" in value) || !Array.isArray(value.content)) return null;
  const seen = new Set<string>();
  return value.content.filter((entry): entry is Highlight => {
    if (!entry || typeof entry !== "object") return false;
    const { id, position, type } = entry;
    if (typeof id !== "string" || !/^MLB\w+$/.test(id) || !Number.isInteger(position) || position < 1 || !["PRODUCT", "USER_PRODUCT", "ITEM"].includes(type) || seen.has(id)) return false;
    seen.add(id); return true;
  }).sort((a, b) => a.position - b.position);
}

export function hotCategoryBatch(ids: string[], category: string, page: number): string[] {
  if (category) return page === 0 && ids.includes(category) ? [category] : [];
  return ids.slice(page * 2, page * 2 + 2);
}