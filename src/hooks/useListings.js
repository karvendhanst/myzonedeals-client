import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchListingsApi,
  fetchListingByIdApi,
  fetchMapListingsApi,
  fetchNearbyListingsApi,
  createListingApi,
  updateListingApi,
  deleteListingApi,
  submitListingApi,
  publishListingApi,
  archiveListingApi,
  markSoldApi,
} from '../api/listingApi';

/* ─── Query keys ─── */
export const listingKeys = {
  all: ['listings'],
  list: (params) => ['listings', 'list', params],
  detail: (id) => ['listings', 'detail', id],
  map: (params) => ['listings', 'map', params],
  nearby: (params) => ['listings', 'nearby', params],
};

/* ════════════════════════════════════════════════
   READ hooks
════════════════════════════════════════════════ */

export const useListings = (params = {}) =>
  useQuery({
    queryKey: listingKeys.list(params),
    queryFn: () => fetchListingsApi(params),
    staleTime: 30_000,
  });

export const useListing = (id) =>
  useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => fetchListingByIdApi(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

export const useMapListings = (params = {}) =>
  useQuery({
    queryKey: listingKeys.map(params),
    queryFn: () => fetchMapListingsApi(params),
    staleTime: 30_000,
    select: (data) => data.listings ?? [],
  });

export const useNearbyListings = (params = {}) =>
  useQuery({
    queryKey: listingKeys.nearby(params),
    queryFn: () => fetchNearbyListingsApi(params),
    enabled: Boolean(params.latitude && params.longitude),
    staleTime: 30_000,
    select: (data) => data.listings ?? [],
  });

/* ════════════════════════════════════════════════
   WRITE mutations
════════════════════════════════════════════════ */

export const useCreateListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createListingApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: listingKeys.all }),
  });
};

export const useUpdateListing = (id) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => updateListingApi(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listingKeys.detail(id) });
      qc.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
};

export const useDeleteListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteListingApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: listingKeys.all }),
  });
};

export const useSubmitListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitListingApi,
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: listingKeys.detail(id) }),
  });
};

export const usePublishListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishListingApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: listingKeys.all }),
  });
};

export const useArchiveListing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveListingApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: listingKeys.all }),
  });
};

export const useMarkSold = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markSoldApi,
    onSuccess: () => qc.invalidateQueries({ queryKey: listingKeys.all }),
  });
};
