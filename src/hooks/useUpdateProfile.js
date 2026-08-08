import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDealerProfileApi } from '../api/dealerApi';

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDealerProfileApi,
    onSuccess: (data) => {
      queryClient.setQueryData(['dealerProfile'], data);
      queryClient.invalidateQueries({ queryKey: ['dealerProfile'] });
    },
  });
};
