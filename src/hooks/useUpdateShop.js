import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateShopApi } from '../api/shopApi';

export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shopId, formData }) => updateShopApi(shopId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myShops'] });
    },
  });
};
