import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listStores } from "@/lib/stores.functions";

export function useStores() {
  const fn = useServerFn(listStores);
  return useQuery({ queryKey: ["stores"], queryFn: () => fn(), staleTime: 30_000 });
}
