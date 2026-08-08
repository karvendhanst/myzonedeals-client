import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const dealerClient = axios.create({
  baseURL: `${API_BASE}/dealer`,
  withCredentials: true,
});

dealerClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("mzd_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

dealerClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ??
      err.response?.data?.error ??
      err.message ??
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

/* ─────────────────────────────────────────
   API functions
───────────────────────────────────────── */

/** GET /api/dealer/profile — returns full dealer data */
export const getDealerProfileApi = async () => {
  const { data } = await dealerClient.get("/profile");
  return data;
};

/** PATCH /api/dealer/profile — update name and/or phone */
export const updateDealerProfileApi = async (payload) => {
  const { data } = await dealerClient.patch("/profile", payload);
  return data;
};

/** POST /api/dealer/profile/picture — upload/replace avatar */
export const uploadProfilePictureApi = async (formData) => {
  const { data } = await dealerClient.post("/profile/picture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
