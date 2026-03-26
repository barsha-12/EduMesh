import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

/**
 * Auth store — manages user authentication state, tokens, and login/logout flows.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      /**
       * Register a new user account.
       */
      register: async ({ email, password, displayName, role, language }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', { email, password, displayName, role, language });
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return res.data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      /**
       * Log in with email and password.
       */
      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, accessToken } = res.data.data;
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          return res.data;
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      /**
       * Log out and clear all auth state.
       */
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Silently handle — still clear local state
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      /**
       * Refresh the access token.
       */
      refreshToken: async () => {
        try {
          const res = await api.post('/auth/refresh');
          set({ accessToken: res.data.data.accessToken });
          return res.data.data.accessToken;
        } catch {
          get().logout();
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'edumesh-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
