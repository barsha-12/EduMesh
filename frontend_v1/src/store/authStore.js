import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  isDemoUser: false,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({
        session,
        user: session?.user || null,
        isAuthenticated: !!session,
        isInitializing: false,
      });

      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user || null,
          isAuthenticated: !!session,
          isInitializing: false,
        });
      });
    } catch (error) {
      console.error('Auth init error:', error);
      set({ isInitializing: false });
    }
  },

  signUp: async ({ email, password, displayName }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) throw error;
      set({ isLoading: false });
      return { data, error: null };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { data: null, error: err.message };
    }
  },

  signIn: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user, session, isAuthenticated: true, isLoading: false, isDemoUser: false });
      return { user, session, error: null };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { user: null, session: null, error: err.message };
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { data: null, error: err.message };
    }
  },

  signInAsDemo: async () => {
    try {
      const demoUsed = localStorage.getItem('edumesh_demo_used');
      if (demoUsed === 'true') {
        return { 
          error: 'Demo already used. Please sign up for a free account.',
          canUseDemoAgain: false 
        };
      }

      // Try to sign in as demo user
      const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
        email: 'demo@edumesh.test',
        password: 'demo_password_123',
      });

      if (!error && user) {
        localStorage.setItem('edumesh_demo_used', 'true');
        set({ user, session, isAuthenticated: true, isDemoUser: true });
        return { user, error: null, canUseDemoAgain: false };
      }

      // If demo account doesn't exist, create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'demo@edumesh.test',
        password: 'demo_password_123',
        options: {
          data: { display_name: 'Demo Student' },
        },
      });

      if (signUpError) throw signUpError;

      localStorage.setItem('edumesh_demo_used', 'true');
      set({ user: signUpData?.user || null, session: null, isAuthenticated: !!signUpData?.user, isDemoUser: true });
      return { user: signUpData?.user, error: null, canUseDemoAgain: false };
    } catch (error) {
      return { user: null, error: error.message, canUseDemoAgain: true };
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, isAuthenticated: false, isLoading: false, isDemoUser: false });
      return { error: null };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { error: err.message };
    }
  },

  changePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      set({ isLoading: false });
      return { data, error: null };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { data: null, error: err.message };
    }
  },

  clearError: () => set({ error: null }),
}));
