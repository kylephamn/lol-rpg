import { create } from 'zustand';
import { api } from '../utils/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('lol_rpg_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await api.login({ email, password });
      localStorage.setItem('lol_rpg_token', token);
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await api.register({ username, email, password });
      localStorage.setItem('lol_rpg_token', token);
      set({ user, token, loading: false });
      return true;
    } catch (err) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  loadMe: async () => {
    const token = localStorage.getItem('lol_rpg_token');
    if (!token) return;
    try {
      const user = await api.me();
      set({ user, token });
    } catch {
      localStorage.removeItem('lol_rpg_token');
      set({ user: null, token: null });
    }
  },

  logout: () => {
    localStorage.removeItem('lol_rpg_token');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
