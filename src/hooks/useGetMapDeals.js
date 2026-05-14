import { useQuery } from "@tanstack/react-query";
import { fetchMapDeals } from "../api/dealApi";

export const useGetMapDeals = () => {
  return useQuery({
    queryKey: ["mapDeals"],
    queryFn: fetchMapDeals,
    select: (data) => data.deals || [],
  });
};
