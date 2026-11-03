import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getDemoOverview } from './demo.functions';
import { expandSales } from './demo-engine';

export function useTestData(userId: string | undefined) {
  const fetchDemo = useServerFn(getDemoOverview);
  return useQuery({
    queryKey: ['influencer-demo', userId],
    queryFn: async () => {
      const r = await fetchDemo();
      if (!r.enabled) return r;
      const { products, sales, v, ...rest } = r;
      return { ...rest, sales: expandSales({ v, products, sales }, 'sale') };
    },
    enabled: !!userId, refetchInterval: 15000, refetchIntervalInBackground: false,
    staleTime: 12000, retry: 1,
  });
}
