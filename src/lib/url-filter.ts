/** Atualiza um filtro na busca do endereço; valor padrão (ou vazio) sai do endereço. */
export function withFilter(prev: Record<string, unknown>, key: string, value: string, def: string): Record<string, unknown> {
  const next = { ...prev };
  if (value === def || value === "") delete next[key]; else next[key] = value;
  return next;
}
/** Lê um filtro do endereço aceitando só valores permitidos (quando informados). */
export function readFilter(search: Record<string, unknown>, key: string, def: string, allowed?: readonly string[]): string {
  const v = search[key];
  const s = typeof v === "string" ? v : typeof v === "number" ? String(v) : def;
  return allowed && !allowed.includes(s) ? def : s;
}
