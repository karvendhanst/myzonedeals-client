import { useQuery } from "@tanstack/react-query";
import { getMyShopsApi } from "../api/shopApi";

export const useGetMyShops = () => {
  return useQuery({
    queryKey: ["myShops"],
    queryFn: getMyShopsApi,
  });
};
