import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "@/components/auth-provider";
import { listMyProducts } from "@/lib/my-products.functions";

/** Leve: usado pelo menu lateral para o contador real sem carregar a biblioteca. */
export function useMyProducts() {
  const { user } = useAccount();
  const fetchMine = useServerFn(listMyProducts);
  return useQuery({ queryKey: ["my-products", user?.id], queryFn: () => fetchMine(), enabled: !!user, staleTime: 30_000 });
}
