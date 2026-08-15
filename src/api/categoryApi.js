import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const categoryClient = axios.create({
  baseURL: `${API_BASE}/categories`,
  withCredentials: true,
});

export const fetchCategoriesApi = async (params = {}) => {
  const { data } = await categoryClient.get('/', { params });
  return data;
};

export const fetchCategoryTreeApi = async (listingType) => {
  const { data } = await categoryClient.get('/tree', {
    params: listingType ? { listingType } : {},
  });
  return data;
};

export const fetchCategoryBySlugApi = async (slug) => {
  const { data } = await categoryClient.get(`/${slug}`);
  return data;
};
