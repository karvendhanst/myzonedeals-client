import { useQuery } from '@tanstack/react-query';
import { fetchDealsByShop } from '../api/dealApi';

export const useGetShopDeals = (shopId) => {
  return useQuery({
    queryKey: ['shopDeals', shopId],
    queryFn: () => fetchDealsByShop(shopId),
    enabled: !!shopId,
  });
};
