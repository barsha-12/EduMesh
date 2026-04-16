import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Brain, BookOpen, Settings, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const commands = [
    { id: 'chat', label: 'Ask AI Chatbot', icon: MessageSquare, path: '/chat', tags: ['bot', 'tutor', 'help'] },
    { id: 'quiz', label: 'Take a Quiz', icon: Brain, path: '/quiz', tags: ['test', 'practice', 'exam'] },
    { id: 'notes', label: 'View Study Notes', icon: BookOpen, path: '/notes', tags: ['library', 'docs', 'read'] },
    { id: 'feynman', label: 'Start Feynman Session', icon: Zap, path: '/feynman', tags: ['teach', 'explain', 'learn'] },
    { id: 'settings', label: 'Preferences', icon: Settings, path: '/settings', tags: ['account', 'profile'] },
  ];

  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase()) || 
    c.tags.some(t => t.includes(search.toLowerCase()))
  );

  const executeCommand = (path) => {
    setIsOpen(false);
    setSearch('');
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-v-bg rounded-3xl shadow-2xl overflow-hidden border border-v-surface"
          >
            <div className="flex items-center px-4 py-4 border-b border-v-surface">
              <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Where to? (e.g. Chat, Quiz, Notes)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400 outline-none"
              />
              <div className="px-2 py-1 bg-v-surface rounded text-xs font-bold text-gray-500 uppercase">ESC</div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No matching commands found.</div>
              ) : (
                filtered.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd.path)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-v-surface/40 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-v-surface flex items-center justify-center shrink-0">
                      <cmd.icon className="w-5 h-5 text-v-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{cmd.label}</h4>
                      <p className="text-xs text-gray-400">Navigate to {cmd.path}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
