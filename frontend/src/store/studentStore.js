import { create } from 'zustand';
import api from '../services/api';

/**
 * Student store — manages learner profile, feed, sessions, and streak data.
 */
export const useStudentStore = create((set, get) => ({
  profile: null,
  learnerProfile: null,
  feed: [],
  sessions: [],
  streak: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/student/profile');
      set({
        profile: res.data.data.profile,
        learnerProfile: res.data.data.learnerProfile,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to load profile' });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put('/student/profile', data);
      set({
        profile: res.data.data.profile,
        learnerProfile: res.data.data.learnerProfile,
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Update failed');
    }
  },

  fetchFeed: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/student/feed');
      set({ feed: res.data.data.feed || res.data.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Failed to load feed' });
    }
  },

  fetchSessions: async (page = 1) => {
    try {
      const res = await api.get(`/student/sessions?page=${page}`);
      set({ sessions: res.data.data.sessions });
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to load sessions');
    }
  },

  startSession: async (contentId) => {
    try {
      const res = await api.post('/student/session/start', { contentId });
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to start session');
    }
  },

  endSession: async (data) => {
    try {
      const res = await api.post('/student/session/end', data);
      return res.data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to end session');
    }
  },

  fetchStreak: async () => {
    try {
      const res = await api.get('/student/streak');
      set({ streak: res.data.data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load streak' });
    }
  },
}));
