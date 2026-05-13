// src/api/dealApi.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const dealClient = axios.create({
  baseURL: `${API_BASE}/deals`,
  withCredentials: true,         
});

dealClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mzd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

dealClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      'Unknown error';
    return Promise.reject(new Error(message));
  }
);

/* ─────────────────────────────────────────
   API functions
───────────────────────────────────────── */

export const createDeal = async (formData) => {
  const { data } = await dealClient.post('/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};


export const fetchDealsByShop = async (shopId) => {
  const { data } = await dealClient.get('/', { params: { shopId } });
  return data;
};


export const fetchDealById = async (id) => {
  const { data } = await dealClient.get(`/${id}`);
  return data;
};


export const updateDeal = async (id, payload) => {
  const { data } = await dealClient.patch(`/${id}`, payload);
  return data;
};


export const deleteDeal = async (id) => {
  const { data } = await dealClient.delete(`/${id}`);
  return data;
};

export const fetchMapDeals = async () => {
  const { data } = await dealClient.get("/map");
  
  return data;
};