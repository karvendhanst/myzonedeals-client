// import { create } from 'zustand';

// const useAuthStore = create((set) => ({
//     user: null,
//     token: localStorage.getItem('mzd_token'),
//     loading: true,

//     login: (newToken) => {
//         localStorage.setItem('mzd_token', newToken);
//         set({ token: newToken, user: { token: newToken }, loading: false });
//     },

//     logout: () => {
//         localStorage.removeItem('mzd_token');
//         set({ token: null, user: null, loading: false });
//     },

//     setLoading: (loading) => set({ loading }),

//     initialize: () => {
//         const token = localStorage.getItem('mzd_token');
//         if (token) {
//             set({ token, user: { token }, loading: false });
//         } else {
//             set({ token: null, user: null, loading: false });
//         }
//     }
// }));

// export default useAuthStore;

import { create } from 'zustand';

const getInitialState = () => {
  const token = localStorage.getItem('mzd_token');
  return {
    token: token || null,
    user: token ? { token } : null,
    loading: false, // ✅ Already resolved at store creation — no async needed
  };
};

const useAuthStore = create((set) => ({
  ...getInitialState(), // ✅ Runs synchronously before any component renders

  login: (newToken) => {
    localStorage.setItem('mzd_token', newToken);
    set({ token: newToken, user: { token: newToken }, loading: false });
  },

  logout: () => {
    localStorage.removeItem('mzd_token');
    set({ token: null, user: null, loading: false });
  },

  setLoading: (loading) => set({ loading }),

  initialize: () => {
    const token = localStorage.getItem('mzd_token');
    if (token) {
      set({ token, user: { token }, loading: false });
    } else {
      set({ token: null, user: null, loading: false });
    }
  },
}));

export default useAuthStore;
