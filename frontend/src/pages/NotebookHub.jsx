import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useAuthStore } from '../store/authStore';
import { Search, Plus, Star, Clock, Users, MoreVertical, Book, Code, Radio, Zap, Filter, LayoutGrid, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotebookHub() {
  const { user } = useAuthStore();
  const { notebooks = [], addNotebook } = useStudyStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All notebooks');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');

  const tabs = ['All notebooks', 'Shared with me', 'Recent', 'Starred'];

  const handleCreateNotebook = (e) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;
    
    const id = Date.now().toString();
    addNotebook({
      id,
      title: newNotebookTitle,
      emoji: '📑',
      lastEdited: new Date().toISOString(),
      sourcesCount: 0,
      isStarred: false,
    });
    
    setIsCreateModalOpen(false);
    setNewNotebookTitle('');
    navigate(`/notebook/${id}`);
  };

  // Mock notebooks if none exist for demonstration
  const displayNotebooks = notebooks.length > 0 ? notebooks : [
    { id: '1', title: 'AI Research 2025', emoji: '🧪', lastEdited: '2 hours ago', sourcesCount: 12, isStarred: true },
    { id: '2', title: 'Product Strategy Q2', emoji: '📈', lastEdited: 'Yesterday', sourcesCount: 8, isStarred: false },
    { id: '3', title: 'Travel India Notes', emoji: '🌍', lastEdited: '3 days ago', sourcesCount: 5, isStarred: false },
    { id: '4', title: 'UPSC Preparation', emoji: '🎓', lastEdited: '1 week ago', sourcesCount: 22, isStarred: true },
  ];

  return (
    <div className="pb-24">
      {/* Top Nav */}
      <nav className="h-16 border-b border-black/[0.03] dark:border-white/[0.03] px-6 flex items-center justify-between sticky top-0 z-40 bg-[#F7F5E8]/80 dark:bg-[#1c1a16]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-black text-lg tracking-tight" style={{ fontFamily: 'Outfit' }}>Dashboard</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="px-4 py-1.5 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
            Try Plus <div className="w-2 h-2 bg-[#E8A2A2] rounded-full animate-pulse" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#A0C2D2] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-white/10 cursor-pointer">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Search Bar */}
        <div className="relative group max-w-4xl mx-auto w-full">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-16 pl-16 pr-6 bg-white dark:bg-white/5 rounded-3xl border-2 border-transparent focus:border-[#E8A2A2]/30 focus:outline-none shadow-sm group-hover:shadow-md transition-all text-lg font-medium"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-1 bg-[#EAE0DA] dark:bg-white/5 p-1 rounded-2xl w-fit">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab 
                  ? 'bg-white dark:bg-white/10 text-[#2c2c2c] dark:text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 text-gray-400 hover:text-[#E8A2A2] transition-colors">
                <LayoutGrid size={18} />
             </button>
             <div className="h-6 w-px bg-black/5 dark:bg-white/5" />
             <select className="bg-transparent text-sm font-bold focus:outline-none cursor-pointer">
                <option>Sort by: Recent</option>
                <option>Sort by: Name</option>
                <option>Sort by: Sources</option>
             </select>
          </div>
        </div>

        {/* Notebooks Grid */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black" style={{ fontFamily: 'Outfit' }}>My notebooks</h2>
            <Link to="/dashboard" className="text-xs font-bold text-[#E8A2A2] hover:underline uppercase tracking-widest">Manage All</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* New Notebook Prompt */}
            <motion.button
              whileHover={{ scale: 1.02, translateY: -4 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="m3-card !bg-transparent border-2 border-dashed border-black/10 dark:border-white/10 !p-10 flex flex-col items-center justify-center gap-4 group hover:border-[#E8A2A2]/50 transition-all min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-full bg-[#EAE0DA] dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#E8A2A2] group-hover:bg-[#E8A2A2]/10 transition-all">
                <Plus size={24} />
              </div>
              <span className="font-bold text-sm text-gray-500 group-hover:text-[#E8A2A2] transition-colors">New notebook</span>
            </motion.button>

            {/* Notebook Cards */}
            {displayNotebooks.map((notebook, i) => (
              <motion.div
                key={notebook.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ translateY: -4 }}
                className="m3-card group relative"
              >
                <Link to={`/notebook/${notebook.id}`} className="block space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{notebook.emoji}</div>
                    <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#E8A2A2]">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-black text-lg line-clamp-1 mb-1">{notebook.title}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Edited {notebook.lastEdited}</p>
                  </div>
                  <div className="pt-4 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#D5E3E8] dark:bg-white/5 rounded-full text-[10px] font-bold text-[#A0C2D2]">
                      <Book size={10} /> {notebook.sourcesCount} sources
                    </div>
                    {notebook.isStarred && (
                      <Star size={12} className="fill-[#E8A2A2] text-[#E8A2A2]" />
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-black/[0.03] dark:border-white/[0.03] text-center mt-20">
         <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] space-x-2">
           <span>Free tier: up to 50 notebooks</span>
           <span className="opacity-20">•</span>
           <span>50 sources each</span>
           <span className="opacity-20">•</span>
           <Link to="/pricing" className="text-[#E8A2A2] hover:underline">Upgrade to Plus</Link>
         </p>
      </footer>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md m3-card bg-white dark:bg-[#1c1a16] shadow-2xl !p-10 space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black" style={{ fontFamily: 'Outfit' }}>Identify your research</h3>
                <p className="text-sm text-gray-400 font-medium">Give your notebook a title to begin synthesis.</p>
              </div>

              <form onSubmit={handleCreateNotebook} className="space-y-6">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g., Quantum Computing Fundamentals"
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  className="input-field !bg-gray-50 dark:!bg-white/5 !text-lg !py-4"
                />
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Create Notebook
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
