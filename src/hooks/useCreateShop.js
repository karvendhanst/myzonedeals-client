import { useMutation } from "@tanstack/react-query";
import { createShopApi } from "../api/shopApi";

export const useCreateShop = () => {
  return useMutation({
    mutationFn: createShopApi,
  });
};