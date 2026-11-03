import { useCallback } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { readFilter, withFilter } from "@/lib/url-filter";

/** Filtro guardado no endereço da página (recarregar/voltar mantém). */
export function useUrlFilter<T extends string>(key: string, def: T, allowed?: readonly T[]): [T, (v: T) => void] {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();
  const value = readFilter(search, key, def, allowed) as T;
  const set = useCallback((v: T) => {
    void navigate({ to: ".", replace: true, search: ((p: Record<string, unknown>) => withFilter(p, key, v, def)) as never });
  }, [navigate, key, def]);
  return [value, set];
}
