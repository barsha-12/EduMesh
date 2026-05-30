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
            className="absolute inset-0 bg-[rgba(58,60,74,0.40)] backdrop-blur-[4px]"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl glass-base overflow-hidden"
          >
            <div className="flex items-center px-5 py-4 border-b border-[rgba(204,204,204,0.30)]">
              <Search className="w-5 h-5 text-slate mr-3 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Where to? (e.g. Chat, Quiz, Notes)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-lg font-body text-primary placeholder:text-muted outline-none"
              />
              <div className="px-2.5 py-1 bg-[rgba(204,204,204,0.20)] rounded-[8px] text-[10px] font-body font-bold text-muted uppercase tracking-widest">ESC</div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2 chat-scroll">
              {filtered.length === 0 ? (
                <div className="p-8 text-center font-body text-muted">No matching commands found.</div>
              ) : (
                filtered.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd.path)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-[16px] hover:bg-[rgba(208,170,255,0.08)] transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-[14px] bg-[rgba(208,170,255,0.12)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(208,170,255,0.22)] transition-colors">
                      <cmd.icon className="w-5 h-5 text-lavender" />
                    </div>
                    <div>
                      <h4 className="font-body font-semibold text-primary">{cmd.label}</h4>
                      <p className="text-xs font-body text-muted">Navigate to {cmd.path}</p>
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
