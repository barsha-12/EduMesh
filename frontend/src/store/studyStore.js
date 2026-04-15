import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * EduMesh Neural Store
 * Manages notebooks, sources, chat, and studio outputs with persistent sync.
 */
export const useStudyStore = create((set, get) => ({
  // Notebooks
  notebooks: JSON.parse(localStorage.getItem('edumesh-notebooks') || '[]'),

  addNotebook: (notebook) => {
    set((state) => {
      const updated = [notebook, ...state.notebooks];
      localStorage.setItem('edumesh-notebooks', JSON.stringify(updated));
      return { notebooks: updated };
    });
  },

  updateNotebook: (id, updates) => {
    set((state) => {
      const updated = state.notebooks.map(nb => nb.id === id ? { ...nb, ...updates } : nb);
      localStorage.setItem('edumesh-notebooks', JSON.stringify(updated));
      return { notebooks: updated };
    });
  },

  deleteNotebook: (id) => {
    set((state) => {
      const updated = state.notebooks.filter(nb => nb.id !== id);
      const updatedSources = state.sources.filter(s => s.notebookId !== id);
      localStorage.setItem('edumesh-notebooks', JSON.stringify(updated));
      localStorage.setItem('edumesh-sources', JSON.stringify(updatedSources));
      return { notebooks: updated, sources: updatedSources };
    });
  },

  // Sources
  sources: JSON.parse(localStorage.getItem('edumesh-sources') || '[]'),

  addSource: (source) => {
    set((state) => {
      const updated = [...state.sources, { ...source, id: Date.now().toString(), isSelected: true }];
      localStorage.setItem('edumesh-sources', JSON.stringify(updated));
      return { sources: updated };
    });
  },

  toggleSource: (id) => {
    set((state) => {
      const updated = state.sources.map(s => s.id === id ? { ...s, isSelected: !s.isSelected } : s);
      localStorage.setItem('edumesh-sources', JSON.stringify(updated));
      return { sources: updated };
    });
  },

  deleteSource: (id) => {
    set((state) => {
      const updated = state.sources.filter(s => s.id !== id);
      localStorage.setItem('edumesh-sources', JSON.stringify(updated));
      return { sources: updated };
    });
  },

  // Chat
  chatMessages: [],
  isChatLoading: false,

  setChatMessages: (messages) => set({ chatMessages: Array.isArray(messages) ? messages : [] }),

  addChatMessage: async (message) => {
    set((state) => ({ chatMessages: [...state.chatMessages, message] }));

    // Sync to Supabase in background
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('chat_history').insert([{
        user_id: session.user.id,
        role: message.role,
        text: message.text,
        timestamp: new Date(message.timestamp).toISOString()
      }]);
    }
  },

  loadChatHistory: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .order('timestamp', { ascending: true });

    if (!error && data) {
      set({
        chatMessages: data.map(m => ({
          role: m.role,
          text: m.text,
          timestamp: new Date(m.timestamp).getTime()
        }))
      });
    }
  },

  setChatLoading: (loading) => set({ isChatLoading: loading }),

  clearChat: async () => {
    set({ chatMessages: [] });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('chat_history').delete().eq('user_id', session.user.id);
    }
  },

  // Studio Outputs
  savedNotes: JSON.parse(localStorage.getItem('edumesh-notes') || '[]'),

  saveNote: async (note) => {
    set((state) => {
      const updated = [note, ...state.savedNotes];
      localStorage.setItem('edumesh-notes', JSON.stringify(updated));
      return { savedNotes: updated };
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('notes').insert([{
        user_id: session.user.id,
        subject: note.subject,
        topic: note.topic,
        content: note.content,
        created_at: note.createdAt
      }]);
    }
  },

  // Quiz
  quizHistory: JSON.parse(localStorage.getItem('edumesh-quizzes') || '[]'),

  saveQuizResult: async (result) => {
    set((state) => {
      const updated = [result, ...state.quizHistory];
      localStorage.setItem('edumesh-quizzes', JSON.stringify(updated));
      return { quizHistory: updated };
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('quiz_results').insert([{
        user_id: session.user.id,
        subject: result.subject,
        topic: result.topic,
        score: result.score,
        correct_count: result.correct,
        total_count: result.total,
        created_at: result.createdAt
      }]);
    }
  },

  // Global Sync (Initial Load)
  syncFromSupabase: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Sync logic for notes/quizzes/notebooks
    // (Simplified for MVP, primarily relying on LocalStorage for notebook structure)
  }
}));
