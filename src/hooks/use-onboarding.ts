import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "@/components/auth-provider";
import { getMyOnboarding } from "@/lib/influencer-onboarding.functions";

export function useMyOnboarding() {
  const { user } = useAccount();
  const fn = useServerFn(getMyOnboarding);
  return useQuery({ queryKey: ["onboarding", user?.id], queryFn: () => fn(), enabled: !!user, staleTime: 30_000, refetchInterval: (q) => (q.state.data as any)?.status === "links_enviados" ? 30_000 : false });
}
