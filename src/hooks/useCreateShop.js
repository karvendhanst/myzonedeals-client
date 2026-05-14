import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShopApi } from "../api/shopApi";

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShopApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myShops"] });
    },
  });
};