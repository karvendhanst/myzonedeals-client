import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDeal } from "../api/dealApi";

export const useCreateDeal = (shopId, options) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData();
      if (shopId) formData.append("shopId", shopId);
      
      Object.keys(payload).forEach(key => {
        if (key === "images") {
          payload.images.forEach(img => {
            if (img.file) {
              formData.append("images", img.file);
            }
          });
        } else {
          formData.append(key, payload[key]);
        }
      });
      
      return createDeal(formData);
    },
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["shopDeals", shopId] });
      queryClient.invalidateQueries({ queryKey: ["mapDeals"] });
      if (options?.onSuccess) {
        options.onSuccess(...args);
      }
    },
  });
};