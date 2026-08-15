import { useQuery } from '@tanstack/react-query';
import { fetchCategoriesApi, fetchCategoryTreeApi } from '../api/categoryApi';

export const categoryKeys = {
  all: ['categories'],
  list: (params) => ['categories', 'list', params],
  tree: (listingType) => ['categories', 'tree', listingType],
};

/** Flat list of categories, optionally filtered by listingType */
export const useCategories = (params = {}) =>
  useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => fetchCategoriesApi(params),
    staleTime: 5 * 60_000, // categories change rarely — cache for 5 min
    select: (data) => data.categories ?? [],
  });

/** Nested tree — useful for accordion/multi-level selectors */
export const useCategoryTree = (listingType) =>
  useQuery({
    queryKey: categoryKeys.tree(listingType),
    queryFn: () => fetchCategoryTreeApi(listingType),
    staleTime: 5 * 60_000,
    select: (data) => data.tree ?? [],
  });
