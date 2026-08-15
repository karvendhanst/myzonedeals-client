import { create } from 'zustand';

const getInitialState = () => {
  const token = localStorage.getItem('mzd_token');
  const roleStored = localStorage.getItem('mzd_role');
  return {
    token: token || null,
    user: token ? { token, role: roleStored ?? 'user' } : null,
    role: roleStored ?? null,
    loading: false,
  };
};

const useAuthStore = create((set) => ({
  ...getInitialState(),

  /**
   * Called after login / OTP verify / Google auth.
   * Optionally pass role so the store and localStorage stay in sync.
   */
  login: (newToken, role = 'user') => {
    localStorage.setItem('mzd_token', newToken);
    localStorage.setItem('mzd_role', role);
    set({ token: newToken, user: { token: newToken, role }, role, loading: false });
  },

  logout: () => {
    localStorage.removeItem('mzd_token');
    localStorage.removeItem('mzd_role');
    set({ token: null, user: null, role: null, loading: false });
  },

  setLoading: (loading) => set({ loading }),

  initialize: () => {
    const token = localStorage.getItem('mzd_token');
    const role = localStorage.getItem('mzd_role') ?? 'user';
    if (token) {
      set({ token, user: { token, role }, role, loading: false });
    } else {
      set({ token: null, user: null, role: null, loading: false });
    }
  },

  /** Helpers for permission checks in components */
  isDealer: () => {
    const s = useAuthStore.getState();
    return s.role === 'dealer' || s.role === 'admin';
  },
  isAdmin: () => useAuthStore.getState().role === 'admin',
}));

export default useAuthStore;
