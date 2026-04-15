import { create } from 'zustand';

/**
 * Study store — manages chat messages, saved notes, quiz history, and stats.
 * All data is kept in local state (no backend needed for demo).
 */
export const useStudyStore = create((set, get) => ({
  // Chat
  chatMessages: [],
  isChatLoading: false,

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  setChatLoading: (loading) => set({ isChatLoading: loading }),

  clearChat: () => set({ chatMessages: [] }),

  // Notes
  savedNotes: JSON.parse(localStorage.getItem('edumesh-notes') || '[]'),

  saveNote: (note) =>
    set((state) => {
      const updated = [note, ...state.savedNotes];
      localStorage.setItem('edumesh-notes', JSON.stringify(updated));
      return { savedNotes: updated };
    }),

  deleteNote: (id) =>
    set((state) => {
      const updated = state.savedNotes.filter((n) => n.id !== id);
      localStorage.setItem('edumesh-notes', JSON.stringify(updated));
      return { savedNotes: updated };
    }),

  // Quiz
  quizHistory: JSON.parse(localStorage.getItem('edumesh-quizzes') || '[]'),

  saveQuizResult: (result) =>
    set((state) => {
      const updated = [result, ...state.quizHistory];
      localStorage.setItem('edumesh-quizzes', JSON.stringify(updated));
      return { quizHistory: updated };
    }),

  // Study Stats
  studyStats: JSON.parse(localStorage.getItem('edumesh-stats') || JSON.stringify({
    totalStudyMinutes: 0,
    totalNotes: 0,
    totalQuizzes: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
    streak: 0,
    lastStudyDate: null,
    subjectsStudied: [],
  })),

  updateStats: (updates) =>
    set((state) => {
      const newStats = { ...state.studyStats, ...updates };

      // Update streak
      const today = new Date().toDateString();
      const lastDate = state.studyStats.lastStudyDate;
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          newStats.streak = (state.studyStats.streak || 0) + 1;
        } else if (lastDate !== today) {
          newStats.streak = 1;
        }
        newStats.lastStudyDate = today;
      }

      localStorage.setItem('edumesh-stats', JSON.stringify(newStats));
      return { studyStats: newStats };
    }),

  addSubjectStudied: (subject) =>
    set((state) => {
      const subjects = [...new Set([...state.studyStats.subjectsStudied, subject])];
      const newStats = { ...state.studyStats, subjectsStudied: subjects };
      localStorage.setItem('edumesh-stats', JSON.stringify(newStats));
      return { studyStats: newStats };
    }),
}));
