import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  isDemoUser: false,

  initializeAuth: () => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          display_name: session.user.user_metadata?.full_name || session.user.email,
          avatar_url: session.user.user_metadata?.avatar_url
        };
        
        set({
          user,
          isAuthenticated: true,
          isInitializing: false,
        });

        // Sync with MongoDB for scaling 1000+ members
        try {
          await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ syncOnly: true, user })
          });
        } catch (e) {
          console.warn('MongoDB sync failed, but user is authenticated via Supabase');
        }

      } else {
        set({ user: null, isAuthenticated: false, isInitializing: false });
      }
    });

    return () => subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    });

    if (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  signInAsDemo: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(r => setTimeout(r, 600));

      const mockUser = {
        id: 'demo-bypassed-user-000',
        email: 'demo@edumesh.local',
        display_name: 'Demo Researcher'
      };

      set({ 
        user: mockUser,
        isAuthenticated: true, 
        isDemoUser: true, 
        isLoading: false 
      });

      return { user: mockUser, error: null };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { user: null, error: error.message };
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabase.auth.signOut();
      
      // Clear backend session cookie
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      set({ user: null, isAuthenticated: false, isLoading: false, isDemoUser: false });
      return { error: null };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { error: err.message };
    }
  },

  clearError: () => set({ error: null }),
}));
