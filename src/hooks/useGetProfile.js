import { useQuery } from '@tanstack/react-query';
import { getDealerProfileApi } from '../api/dealerApi';
import useAuthStore from '../store/authStore';

export const useGetProfile = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['dealerProfile'],
    queryFn: getDealerProfileApi,
    enabled: !!token && token !== "null",
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
