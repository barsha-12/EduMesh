import { create } from 'zustand';

/**
 * MongoDB Vercel Edge Proxy Helper
 */
const dbProxy = async (collection, action, payload = null, query = null, options = null) => {
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, action, payload, query, options })
    });
    if (!res.ok) return { data: null };
    return await res.json();
  } catch (e) {
    console.warn('DB Proxy failed:', e);
    return { data: null };
  }
};

/**
 * EduMesh Study Store (MongoDB Scaled Edition)
 */
export const useStudyStore = create((set, get) => ({
  // ─── Notebooks & Sources (localStorage local-only layer) ───
  notebooks: JSON.parse(localStorage.getItem('edumesh-notebooks') || '[]'),
  sources: JSON.parse(localStorage.getItem('edumesh-sources') || '[]'),

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

  // ─── Study Stats ───────────────────────────────────────────
  studyStats: JSON.parse(localStorage.getItem('edumesh-stats') || '{"streak":0,"totalNotes":0,"totalQuizzes":0,"totalStudyMinutes":0,"totalCorrectAnswers":0,"totalQuestions":0,"subjectsStudied":[]}'),

  updateStats: (updates) => {
    set((state) => {
      const updated = { ...state.studyStats, ...updates };
      localStorage.setItem('edumesh-stats', JSON.stringify(updated));
      return { studyStats: updated };
    });
  },
  addSubjectStudied: (subject) => {
    set((state) => {
      const subjects = new Set(state.studyStats.subjectsStudied || []);
      subjects.add(subject);
      const updated = { ...state.studyStats, subjectsStudied: [...subjects] };
      localStorage.setItem('edumesh-stats', JSON.stringify(updated));
      return { studyStats: updated };
    });
  },

  // ─── Chat ──────────────────────────────────────────────────
  chatMessages: [],
  isChatLoading: false,
  chatSessions: [],
  activeChatSessionId: null,

  setChatMessages: (messages) => set({ chatMessages: Array.isArray(messages) ? messages : [] }),
  setChatLoading: (loading) => set({ isChatLoading: loading }),

  createChatSession: async (title = 'New Chat') => {
    const { data } = await dbProxy('chat_sessions', 'insert', { title, created_at: new Date().toISOString() });
    
    if (data && data.length > 0) {
      set((state) => ({
        chatSessions: [data[0], ...state.chatSessions],
        activeChatSessionId: data[0].id,
        chatMessages: [],
      }));
      return data[0].id;
    }
    
    // Fallback if disconnected
    const id = 'local-' + Date.now();
    set((state) => ({
      chatSessions: [{ id, title, created_at: new Date().toISOString() }, ...state.chatSessions],
      activeChatSessionId: id,
      chatMessages: [],
    }));
    return id;
  },

  loadChatSessions: async () => {
    const { data } = await dbProxy('chat_sessions', 'find', null, null, { sort: { updated_at: -1 }, limit: 50 });
    if (data) {
      const normalized = data.map(s => ({ ...s, id: s.id || s._id }));
      set({ chatSessions: normalized });
    }
  },

  switchChatSession: async (sessionId) => {
    set({ activeChatSessionId: sessionId, chatMessages: [] });
    if (sessionId && !sessionId.toString().startsWith('local-')) {
      const { data } = await dbProxy('chat_messages', 'find', null, { session_id: sessionId }, { sort: { created_at: 1 } });
      if (data) {
        set({
          chatMessages: data.map(m => ({
            role: m.role,
            text: m.text,
            isBookmarked: m.isBookmarked || false,
            timestamp: new Date(m.created_at).getTime()
          }))
        });
      }
    }
  },

  addChatMessage: async (message) => {
    set((state) => ({ chatMessages: [...state.chatMessages, message] }));
    const sessionId = get().activeChatSessionId;
    
    if (sessionId && !sessionId.startsWith('local-')) {
      await dbProxy('chat_messages', 'insert', {
        session_id: sessionId,
        role: message.role,
        text: message.text,
        isBookmarked: message.isBookmarked || false,
        created_at: new Date().toISOString()
      });
      await dbProxy('chat_sessions', 'update', { updated_at: new Date().toISOString() }, { id: sessionId });
    }
  },
  
  toggleBookmarkMessage: async (index) => {
    const msgs = [...get().chatMessages];
    if (msgs[index]) {
      msgs[index].isBookmarked = !msgs[index].isBookmarked;
      set({ chatMessages: msgs });
      // We don't necessarily need to persist this instantly if it's transient, but for MongoDB we can bulk update later
    }
  },

  loadChatHistory: async () => {
    await get().loadChatSessions();
  },

  clearChat: async () => {
    const sessionId = get().activeChatSessionId;
    set({ chatMessages: [], activeChatSessionId: null });
    if (sessionId && !sessionId.startsWith('local-')) {
       await dbProxy('chat_messages', 'delete', null, { session_id: sessionId });
       await dbProxy('chat_sessions', 'delete', null, { id: sessionId });
    }
  },

  deleteChatSession: async (sessionId) => {
    set((state) => ({
      chatSessions: state.chatSessions.filter(s => s.id !== sessionId),
      activeChatSessionId: state.activeChatSessionId === sessionId ? null : state.activeChatSessionId,
      chatMessages: state.activeChatSessionId === sessionId ? [] : state.chatMessages
    }));
    
    if (sessionId && !sessionId.toString().startsWith('local-')) {
       await dbProxy('chat_messages', 'delete', null, { session_id: sessionId });
       await dbProxy('chat_sessions', 'delete', null, { id: sessionId });
    }
  },

  // ─── Notes ─────────────────────────────────────────────────
  savedNotes: JSON.parse(localStorage.getItem('edumesh-notes') || '[]'),

  saveNote: async (note) => {
    set((state) => {
      const updated = [note, ...state.savedNotes];
      localStorage.setItem('edumesh-notes', JSON.stringify(updated));
      return { savedNotes: updated };
    });
    
    await dbProxy('notes', 'insert', {
      subject: note.subject,
      topic: note.topic,
      content: note.content,
      tags: note.tags || [],
      created_at: note.createdAt
    });
    await get().upsertUserStats();
  },

  deleteNote: async (noteId) => {
    set((state) => {
      const updated = state.savedNotes.filter(n => n.id !== noteId);
      localStorage.setItem('edumesh-notes', JSON.stringify(updated));
      return { savedNotes: updated };
    });
    await dbProxy('notes', 'delete', null, { _id: noteId }); // Note: mongo might use ObjectID but we stringified it
  },

  // ─── Quizzes ───────────────────────────────────────────────
  quizHistory: JSON.parse(localStorage.getItem('edumesh-quizzes') || '[]'),

  saveQuizResult: async (result) => {
    set((state) => {
      const updated = [result, ...state.quizHistory];
      localStorage.setItem('edumesh-quizzes', JSON.stringify(updated));
      return { quizHistory: updated };
    });

    await dbProxy('quiz_results', 'insert', {
      subject: result.subject,
      topic: result.topic,
      score: result.score,
      correct_count: result.correct,
      total_count: result.total,
      difficulty: result.difficulty || 'medium',
      created_at: result.createdAt
    });
    await get().upsertUserStats();
  },

  getRecentQuizScores: (subject, count = 3) => {
    return get().quizHistory
      .filter(q => q.subject === subject)
      .slice(0, count)
      .map(q => q.score);
  },

  // ─── Flashcards ────────────────────────────────────────────
  flashcards: [],

  loadFlashcards: async () => {
    const { data } = await dbProxy('flashcards', 'find', null, null, { sort: { next_review: 1 } });
    if (data) set({ flashcards: data });
  },

  addFlashcards: async (cards, subject, topic) => {
    const payload = cards.map(c => ({
      front: c.front,
      back: c.back,
      subject,
      topic,
      ease_factor: 2.5,
      interval: 1,
      repetitions: 0,
      next_review: new Date().toISOString().split('T')[0],
    }));

    const { data } = await dbProxy('flashcards', 'insert', payload);
    if (data && data.length > 0) {
      set((state) => ({ flashcards: [...data, ...state.flashcards] }));
    } else {
      // Local fallback
      const localCards = payload.map((c, i) => ({ ...c, id: `local-${Date.now()}-${i}` }));
      set((state) => ({ flashcards: [...localCards, ...state.flashcards] }));
    }
  },

  updateFlashcard: async (id, updates) => {
    set((state) => ({ flashcards: state.flashcards.map(f => f.id === id ? { ...f, ...updates } : f) }));
    if (!String(id).startsWith('local-')) {
       await dbProxy('flashcards', 'update', updates, { id }); // MongoDB generic map
    }
  },

  getDueFlashcards: () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return get().flashcards.filter(f => {
      if (!f.next_review) return true;
      const reviewDate = f.next_review.split('T')[0];
      return reviewDate <= todayStr;
    });
  },

  clearAllFlashcards: async () => {
    set({ flashcards: [] });
    await dbProxy('flashcards', 'delete', null, {});
  },

  // ─── Exams (Panic Mode) ───────────────────────────────────
  exams: JSON.parse(localStorage.getItem('edumesh-exams') || '[]'),
  
  addExam: async (exam) => {
    const newExam = { ...exam, id: exam.id || Date.now().toString() };
    set((state) => {
      const updated = [...state.exams, newExam];
      localStorage.setItem('edumesh-exams', JSON.stringify(updated));
      return { exams: updated };
    });
    await dbProxy('exams', 'insert', { name: exam.name, subject: exam.subject, exam_date: exam.examDate });
  },
  deleteExam: async (examId) => {
    set((state) => {
      const updated = state.exams.filter(e => e.id !== examId);
      localStorage.setItem('edumesh-exams', JSON.stringify(updated));
      return { exams: updated };
    });
    await dbProxy('exams', 'delete', null, { id: examId });
  },

  // ─── User Stats Upsert ────────────────────────────────────
  upsertUserStats: async () => {
    const state = get();
    const avgScore = state.quizHistory.length > 0
      ? Math.round(state.quizHistory.reduce((a, q) => a + q.score, 0) / state.quizHistory.length) : 0;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = state.studyStats.lastStudyDate;
    let streak = state.studyStats.streak || 0;

    if (lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      streak = lastDate === yesterday ? streak + 1 : 1;
    }

    const statsUpdate = {
      streak,
      last_study_date: today,
      total_notes: state.savedNotes.length,
      total_quizzes: state.quizHistory.length,
      avg_score: avgScore,
    };

    state.updateStats({ ...statsUpdate, lastStudyDate: today });
    await dbProxy('user_stats', 'upsert', { ...statsUpdate, updated_at: new Date().toISOString() });
  },

  // ─── Global Sync (Initial Load) ───────────────────────────
  syncFromSupabase: async () => {
    // This is now syncing from MongoDB!
    const { data: notes } = await dbProxy('notes', 'find', null, null, { sort: { created_at: -1 } });
    if (notes && notes.length > 0) {
      const formatted = notes.map(n => ({ ...n, id: n._id || n.id, createdAt: n.created_at }));
      localStorage.setItem('edumesh-notes', JSON.stringify(formatted));
      set({ savedNotes: formatted });
    }

    const { data: quizzes } = await dbProxy('quiz_results', 'find', null, null, { sort: { created_at: -1 } });
    if (quizzes && quizzes.length > 0) {
      const formatted = quizzes.map(q => ({ ...q, id: q._id || q.id, correct: q.correct_count, total: q.total_count, createdAt: q.created_at }));
      localStorage.setItem('edumesh-quizzes', JSON.stringify(formatted));
      set({ quizHistory: formatted });
    }

    const { data: statsData } = await dbProxy('user_stats', 'find', null, null, { limit: 1 });
    if (statsData && statsData.length > 0) {
      const stats = statsData[0];
      const formatted = {
        streak: stats.streak || 0,
        lastStudyDate: stats.last_study_date,
        totalNotes: stats.total_notes || 0,
        totalQuizzes: stats.total_quizzes || 0,
        avgScore: stats.avg_score || 0,
        totalStudyMinutes: stats.total_study_minutes || 0,
      };
      localStorage.setItem('edumesh-stats', JSON.stringify(formatted));
      set({ studyStats: formatted });
    }

    await get().loadFlashcards();

    const { data: exams } = await dbProxy('exams', 'find', null, null, { sort: { exam_date: 1 } });
    if (exams && exams.length > 0) {
      const formatted = exams.map(e => ({ id: e._id || e.id, name: e.name, subject: e.subject, examDate: e.exam_date }));
      localStorage.setItem('edumesh-exams', JSON.stringify(formatted));
      set({ exams: formatted });
    }

    await get().loadChatSessions();
  },
}));
