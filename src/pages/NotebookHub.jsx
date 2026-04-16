import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useAuthStore } from '../store/authStore';
import { Search, Plus, Star, Clock, Users, MoreVertical, Book, Code, Radio, Zap, Filter, LayoutGrid, List, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotebookHub() {
  const { user } = useAuthStore();
  const { notebooks = [], addNotebook } = useStudyStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Studios');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');

  const tabs = ['All Studios', 'Collaborative', 'Recent', 'Starred'];

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

  // Modern Display Logic
  const displayNotebooks = notebooks.length > 0 ? notebooks : [
    { id: '1', title: 'Neural Architectures', emoji: '🧠', lastEdited: '2h ago', sourcesCount: 12, isStarred: true },
    { id: '2', title: 'Macroeconomics Q3', emoji: '📉', lastEdited: 'Yesterday', sourcesCount: 8, isStarred: false },
    { id: '3', title: 'Bio-Engineering', emoji: '🧬', lastEdited: '3d ago', sourcesCount: 5, isStarred: false },
    { id: '4', title: 'Cognitive Science', emoji: '🎓', lastEdited: '1w ago', sourcesCount: 22, isStarred: true },
  ];

  const filteredNotebooks = displayNotebooks.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-v-bg text-v-text transition-all duration-500 pb-32">
      
      {/* Header Area */}
      <header className="max-w-7xl mx-auto px-8 py-20 space-y-12">
        <div className="space-y-4 text-center sm:text-left">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-v-primary/10 border border-v-primary/10 text-v-primary text-[10px] font-black uppercase tracking-widest mx-auto sm:mx-0">
             <Layers className="w-3 h-3" /> Synthesis Library
           </div>
           <h1 className="text-4xl sm:text-7xl font-black tracking-tighter leading-none" style={{ fontFamily: 'Outfit' }}>
             My <span className="text-v-primary">Workspaces</span>
           </h1>
           <p className="text-v-text/40 font-bold text-sm max-w-xl mx-auto sm:mx-0">
             Your personal vault of synthesized knowledge. Organized, searchable, and always synchronized.
           </p>
        </div>

        {/* Global Search */}
        <div className="relative group max-w-4xl mx-auto w-full">
          <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none text-v-text/10 group-focus-within:text-v-primary transition-all">
            <Search size={28} />
          </div>
          <input
            type="text"
            placeholder="Find a workspace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-24 pl-24 pr-10 bg-white/40 backdrop-blur-2xl rounded-[48px] border border-v-text/5 shadow-sm group-hover:shadow-2xl focus:shadow-v-primary/10 outline-none transition-all text-xl font-bold placeholder-v-text/10"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 space-y-16">
        {/* Navigation & Utilities */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex items-center gap-1.5 bg-v-surface p-1.5 rounded-[24px] w-fit shadow-inner">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? 'bg-white text-v-text shadow-xl' 
                  : 'text-v-text/30 hover:text-v-text'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-1.5 p-1 bg-v-surface rounded-2xl">
                <button className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-v-primary">
                    <LayoutGrid size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-v-text/20 hover:text-v-text transition-all">
                    <List size={18} />
                </button>
             </div>
             
             <div className="h-4 w-px bg-v-text/10" />
             
             <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-v-text/30 hover:text-v-text transition-all">
                <Filter size={16} /> Sort: Recent
             </button>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {/* Create Placeholder */}
          <motion.button
            whileHover={{ scale: 1.02, translateY: -8 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="group relative p-12 bg-v-secondary/10 border-4 border-dashed border-v-secondary rounded-[60px] flex flex-col items-center justify-center gap-6 hover:border-v-primary/40 transition-all min-h-[320px] shadow-sm hover:shadow-2xl"
          >
            <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center text-v-primary shadow-xl group-hover:rotate-12 transition-all">
              <Plus size={36} />
            </div>
            <div className="text-center">
              <span className="block font-black text-xs uppercase tracking-widest leading-none">New Studio</span>
              <span className="block text-[9px] font-bold uppercase tracking-widest opacity-30 mt-2">Initialize workspace</span>
            </div>
          </motion.button>

          {/* Actual Cards */}
          {filteredNotebooks.map((notebook, i) => (
            <motion.div
              key={notebook.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ translateY: -12 }}
              className="bg-white/60 backdrop-blur-3xl p-10 rounded-[60px] shadow-sm hover:shadow-2xl border border-v-text/5 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-v-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-v-primary/10 transition-colors" />
              
              <Link to={`/notebook/${notebook.id}`} className="block space-y-10 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 bg-v-surface rounded-[28px] flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-all">
                    {notebook.emoji}
                  </div>
                  {notebook.isStarred && (
                    <div className="w-8 h-8 bg-v-accent/20 rounded-xl flex items-center justify-center">
                      <Star size={14} className="fill-v-text text-v-text" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-black text-2xl tracking-tighter leading-none group-hover:text-v-primary transition-colors" style={{ fontFamily: 'Outfit' }}>{notebook.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-20">Activity · {notebook.lastEdited}</p>
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <div className="px-5 py-2.5 bg-v-surface rounded-2xl text-[10px] font-black uppercase tracking-widest text-v-text/40 flex items-center gap-2 group-hover:bg-v-primary/10 group-hover:text-v-primary transition-all">
                    <Book size={14} /> {notebook.sourcesCount} Docs
                  </div>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center text-v-text/10 hover:text-v-text transition-all">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Persistence Status */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-white/40 backdrop-blur-2xl px-8 py-3 rounded-full border border-v-text/5 shadow-2xl flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          Cloud Synchronization Active
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-v-bg/60 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[60px] shadow-2xl border border-v-text/5 p-16 space-y-12"
            >
              <div className="space-y-3 text-center">
                <h3 className="text-4xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>Initiate Research</h3>
                <p className="text-sm font-bold text-v-text/30">Define the boundary of your next discovery.</p>
              </div>

              <form onSubmit={handleCreateNotebook} className="space-y-10">
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g., Quantum Synthesis Lab"
                  value={newNotebookTitle}
                  onChange={(e) => setNewNotebookTitle(e.target.value)}
                  className="w-full bg-v-surface border border-v-text/5 px-8 py-6 rounded-[32px] outline-none text-xl font-black placeholder-v-text/10 focus:shadow-2xl focus:shadow-v-primary/10 transition-all"
                />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-5 bg-v-surface rounded-[32px] text-[10px] font-black uppercase tracking-widest hover:bg-v-text/5 transition-all text-v-text/30">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-5 bg-v-primary text-white rounded-[32px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-v-primary/20 hover:scale-[1.02] transition-all">
                    Create Studio
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
