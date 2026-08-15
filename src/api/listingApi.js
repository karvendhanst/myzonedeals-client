import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const listingClient = axios.create({
  baseURL: `${API_BASE}/listings`,
  withCredentials: true,
});

listingClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('mzd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

listingClient.interceptors.response.use(
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

/* ─── CRUD ─── */

export const createListingApi = async (formData) => {
  const { data } = await listingClient.post('/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const fetchListingsApi = async (params = {}) => {
  const { data } = await listingClient.get('/', { params });
  return data;
};

export const fetchListingByIdApi = async (id) => {
  const { data } = await listingClient.get(`/${id}`);
  return data;
};

export const updateListingApi = async (id, formData) => {
  const { data } = await listingClient.patch(`/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteListingApi = async (id) => {
  const { data } = await listingClient.delete(`/${id}`);
  return data;
};

/* ─── Map / Geo ─── */

export const fetchMapListingsApi = async (params = {}) => {
  const { data } = await listingClient.get('/map', { params });
  return data;
};

export const fetchNearbyListingsApi = async (params = {}) => {
  const { data } = await listingClient.get('/nearby', { params });
  return data;
};

/* ─── Lifecycle ─── */

export const submitListingApi = async (id) => {
  const { data } = await listingClient.post(`/${id}/submit`);
  return data;
};

export const publishListingApi = async (id) => {
  const { data } = await listingClient.post(`/${id}/publish`);
  return data;
};

export const archiveListingApi = async (id) => {
  const { data } = await listingClient.post(`/${id}/archive`);
  return data;
};

export const markSoldApi = async (id) => {
  const { data } = await listingClient.post(`/${id}/mark-sold`);
  return data;
};

/* ─── Admin ─── */

export const approveListingApi = async (id, reviewReason = '') => {
  const { data } = await listingClient.post(`/${id}/approve`, { reviewReason });
  return data;
};

export const rejectListingApi = async (id, rejectionReason) => {
  const { data } = await listingClient.post(`/${id}/reject`, { rejectionReason });
  return data;
};
