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
      
      if (data.session) {
        set({ user: data.user, session: data.session, isAuthenticated: true, isLoading: false });
      } else {
        // If email confirms are enabled but unconfirmed:
        set({ error: "Account created! Please check your email to confirm.", isLoading: false });
      }
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
    set({ isLoading: true, error: null });
    try {
      // Fake delay for UI realism before bypassing auth
      await new Promise(r => setTimeout(r, 600));

      // Completely bypass Supabase API for the Demo Login!
      // This permanently avoids the 429 Rate Limit error.
      const mockUser = {
        id: 'demo-bypassed-user-000',
        email: 'demo@edumesh.local',
        user_metadata: { display_name: 'Demo Researcher' }
      };

      const mockSession = { access_token: 'mock-demo-token-12345', user: mockUser };

      set({ 
        user: mockUser, 
        session: mockSession, 
        isAuthenticated: true, 
        isDemoUser: true, 
        isLoading: false 
      });

      return { user: mockUser, error: null, canUseDemoAgain: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
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
