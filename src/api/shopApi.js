import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, 
});

// Create Shop API
export const createShopApi = async (formData) => {
  const token = localStorage.getItem("mzd_token");
  const { data } = await API.post("/shop/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Get My Shops API
export const getMyShopsApi = async () => {
  const token = localStorage.getItem("mzd_token");
  const { data } = await API.get("/shop/my-shops", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Update Shop API
export const updateShopApi = async (shopId, formData) => {
  const token = localStorage.getItem("mzd_token");
  const { data } = await API.patch(`/shop/update/${shopId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};