import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { 
  Plus, BookOpen, MessageSquare, Layout, 
  MoreVertical, ChevronLeft, Send, Sparkles, 
  Trash2, FileText, Video, Link as LinkIcon,
  Play, Share2, Download, Mic, Brain, Zap, Clock,
  Target, Radio
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Studio Modules
import AudioPlayer from '../components/studio/AudioPlayer';
import MindMap from '../components/studio/MindMap';
import StudyGuide from '../components/studio/StudyGuide';

export default function NotebookWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notebooks, sources, addSource, toggleSource, deleteSource, chatMessages, addChatMessage, isChatLoading, setChatLoading } = useStudyStore();
  
  const notebook = notebooks.find(nb => nb.id === id);
  const notebookSources = sources.filter(s => s.notebookId === id);
  const selectedSourcesCount = notebookSources.filter(s => s.isSelected).length;

  const [input, setInput] = useState('');
  const [activeStudioTab, setActiveStudioTab] = useState('notes');
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);

  // If notebook not found, redirect to hub
  useEffect(() => {
    if (!notebook && notebooks.length > 0) {
      navigate('/dashboard');
    }
  }, [notebook, notebooks, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    addChatMessage(userMessage);
    setInput('');
    setChatLoading(true);

    // Mock AI Response with Citations
    setTimeout(() => {
      const aiResponse = {
        role: 'ai',
        text: `Based on your ${selectedSourcesCount} selected sources, here is what I found:\n\n### Executive Summary\nYour research indicates a strong correlation between **neural synthesis** and cognitive efficiency. Specifically, the data from *Document A* suggests that a 3-panel layout reduces cognitive load by 40% [1].\n\n### Key Findings\n- **Modality**: Users prefer audio overviews for long-form content [2].\n- **Visuals**: Mind maps help in concept retention [3].\n\n*Citations:*\n[1] source_001.pdf\n[2] youtube_transcript_q2.txt\n[3] research_gate_article.url`,
        timestamp: Date.now()
      };
      addChatMessage(aiResponse);
      setChatLoading(false);
    }, 1500);
  };

  const handleAddSource = (type) => {
    const sourceTypes = {
      pdf: { name: 'research_paper.pdf', icon: FileText },
      youtube: { name: 'lecture_01.yt', icon: Youtube },
      url: { name: 'article_link.url', icon: LinkIcon }
    };
    
    addSource({
      notebookId: id,
      name: sourceTypes[type].name,
      type: type,
    });
    setIsAddSourceOpen(false);
  };

  if (!notebook) return null;

  return (
    <div className="h-screen flex flex-col bg-[#F7F5E8] dark:bg-[#1c1a16] text-[#2c2c2c] dark:text-[#f7f5e8] overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-black/[0.03] dark:border-white/[0.03] px-4 flex items-center justify-between shrink-0 bg-[#F7F5E8]/80 dark:bg-[#1c1a16]/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">{notebook.emoji}</span>
            <h1 className="font-black tracking-tight text-sm" style={{ fontFamily: 'Outfit' }}>{notebook.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-3 py-1.5 bg-[#E8A2A2]/10 text-[#E8A2A2] rounded-full text-[10px] font-black uppercase tracking-widest border border-[#E8A2A2]/20">
              <Sparkles size={12} /> Share Notebook
           </button>
           <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
              <MoreVertical size={20} />
           </button>
        </div>
      </header>

      {/* Main 3-Panel Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: SOURCES */}
        <aside className="w-80 border-r border-black/[0.03] dark:border-white/[0.03] flex flex-col bg-[#EAE0DA]/30 dark:bg-[#2a2620]/30 shrink-0">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto chat-scrollbar">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400">Sources</h2>
              <button 
                onClick={() => setIsAddSourceOpen(!isAddSourceOpen)}
                className="p-1.5 bg-[#E8A2A2] text-[#2c2c2c] rounded-lg shadow-lg shadow-[#E8A2A2]/20 hover:scale-110 transition-transform"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add Source Menu */}
            <AnimatePresence>
              {isAddSourceOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-3 gap-2 overflow-hidden"
                >
                  <button onClick={() => handleAddSource('pdf')} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-white/5 rounded-xl border border-black/5 hover:border-[#E8A2A2]/30 transition-all">
                    <FileText size={20} className="text-blue-400" />
                    <span className="text-[10px] font-bold">PDF</span>
                  </button>
                  <button onClick={() => handleAddSource('youtube')} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-white/5 rounded-xl border border-black/5 hover:border-[#E8A2A2]/30 transition-all">
                    <Video size={20} className="text-red-400" />
                    <span className="text-[10px] font-bold">YouTube</span>
                  </button>
                  <button onClick={() => handleAddSource('url')} className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-white/5 rounded-xl border border-black/5 hover:border-[#E8A2A2]/30 transition-all">
                    <LinkIcon size={20} className="text-[#A0C2D2]" />
                    <span className="text-[10px] font-bold">URL</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              {notebookSources.length === 0 ? (
                <div className="text-center py-20 space-y-4 px-4">
                  <div className="w-12 h-12 bg-[#D5E3E8] rounded-2xl mx-auto flex items-center justify-center">
                    <BookOpen size={24} className="text-[#A0C2D2]" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 leading-relaxed italic">Upload your research materials to begin synthesis.</p>
                </div>
              ) : (
                notebookSources.map((source) => (
                  <div 
                    key={source.id} 
                    className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      source.isSelected 
                      ? 'bg-white dark:bg-white/10 border-[#E8A2A2]/30 shadow-sm' 
                      : 'bg-transparent border-transparent opacity-60 grayscale hover:grayscale-0'
                    }`}
                    onClick={() => toggleSource(source.id)}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#F7F5E8] dark:bg-white/5 flex items-center justify-center shrink-0">
                      {source.type === 'pdf' && <FileText size={16} className="text-blue-400" />}
                      {source.type === 'youtube' && <Video size={16} className="text-red-400" />}
                      {source.type === 'url' && <LinkIcon size={16} className="text-[#A0C2D2]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{source.name}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSource(source.id); }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Panel Footer */}
          <div className="p-6 border-t border-black/[0.03] dark:border-white/[0.03] space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
               <span>Context Window</span>
               <span className="text-[#E8A2A2]">{selectedSourcesCount} Selected</span>
            </div>
            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(selectedSourcesCount / Math.max(notebookSources.length, 1)) * 100}%` }}
                 className="h-full bg-[#E8A2A2]"
               />
            </div>
          </div>
        </aside>

        {/* Center Panel: CHAT / NOTEBOOK GUIDE */}
        <main className="flex-1 flex flex-col bg-white dark:bg-black/20 min-w-0">
          <div className="flex-1 overflow-y-auto chat-scrollbar p-6 md:p-12 space-y-12">
             {chatMessages.length === 0 ? (
                <div className="max-w-2xl mx-auto py-20 space-y-8">
                   <div className="space-y-4">
                      <h2 className="text-4xl font-black tracking-tight font-['Outfit']">Notebook Guide</h2>
                      <p className="text-lg text-gray-400 font-medium">I've parsed your documents. What would you like to synthesize today?</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { title: 'Executive Summary', icon: Sparkles },
                        { title: 'List key themes', icon: Zap },
                        { title: 'Generate FAQ', icon: MessageSquare },
                        { title: 'Critical Weaknesses', icon: Target }
                      ].map((prompt, i) => (
                        <button 
                          key={i}
                          onClick={() => setInput(prompt.title)}
                          className="p-6 rounded-[32px] bg-[#F7F5E8] dark:bg-white/5 border border-black/[0.03] text-left hover:scale-[1.02] active:scale-[0.98] transition-all group"
                        >
                           <prompt.icon className="text-[#E8A2A2] mb-4 group-hover:rotate-12 transition-transform" />
                           <span className="font-bold text-sm">{prompt.title}</span>
                        </button>
                      ))}
                   </div>
                </div>
             ) : (
                <div className="max-w-3xl mx-auto space-y-8">
                   {chatMessages.map((msg, i) => (
                     <motion.div 
                       key={i} 
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : ''}`}
                     >
                       {msg.role === 'ai' && (
                         <div className="w-10 h-10 rounded-2xl bg-[#E8A2A2] flex items-center justify-center shrink-0">
                           <Sparkles size={20} className="text-[#2c2c2c]" />
                         </div>
                       )}
                       <div className={`p-6 rounded-[32px] text-sm leading-relaxed ${
                         msg.role === 'user' 
                         ? 'bg-[#A0C2D2] text-white rounded-tr-none max-w-lg' 
                         : 'bg-[#F7F5E8] dark:bg-[#2a2620] text-[#2c2c2c] dark:text-[#f7f5e8] rounded-tl-none ai-response shadow-sm'
                       }`}>
                         <ReactMarkdown>{msg.text}</ReactMarkdown>
                         <div className="mt-4 flex items-center justify-between opacity-40 text-[10px] font-black uppercase tracking-widest">
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {msg.role === 'ai' && (
                              <div className="flex gap-2">
                                 <button className="hover:text-black dark:hover:text-white">Copy</button>
                                 <button className="hover:text-black dark:hover:text-white">Source</button>
                              </div>
                            )}
                         </div>
                       </div>
                     </motion.div>
                   ))}
                   {isChatLoading && (
                      <div className="flex gap-6">
                        <div className="w-10 h-10 rounded-2xl bg-[#E8A2A2] flex items-center justify-center animate-pulse">
                           <Sparkles size={20} className="text-[#2c2c2c]" />
                        </div>
                        <div className="p-6 bg-[#F7F5E8] dark:bg-[#2a2620] rounded-[32px] rounded-tl-none">
                           <div className="typing-indicator flex gap-1">
                              <span></span><span></span><span></span>
                           </div>
                        </div>
                      </div>
                   )}
                </div>
             )}
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-black/[0.03] dark:border-white/[0.03]">
             <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative group">
                <input
                  type="text"
                  placeholder={`Ask about your ${selectedSourcesCount} sources...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-16 pl-8 pr-20 bg-[#F7F5E8] dark:bg-white/5 rounded-3xl border-2 border-transparent focus:border-[#E8A2A2]/30 focus:outline-none transition-all font-medium text-sm"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isChatLoading}
                  className="absolute right-3 top-3 w-10 h-10 bg-[#E8A2A2] text-[#2c2c2c] rounded-2xl flex items-center justify-center shadow-lg shadow-[#E8A2A2]/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                >
                   <Send size={18} />
                </button>
             </form>
          </div>
        </main>

        {/* Right Panel: STUDIO */}
        <aside className="w-96 border-l border-black/[0.03] dark:border-white/[0.03] flex flex-col bg-[#EAE0DA]/30 dark:bg-[#2a2620]/30 shrink-0">
          <div className="h-14 border-b border-black/[0.03] dark:border-white/[0.03] flex items-center px-4 overflow-x-auto whitespace-nowrap chat-scrollbar no-scrollbar">
             {[
               { id: 'notes', name: 'Studio', icon: Layout },
               { id: 'audio', name: 'Audio', icon: Radio },
               { id: 'mindmap', name: 'Mind Map', icon: Brain },
               { id: 'history', name: 'Timeline', icon: Clock }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveStudioTab(tab.id)}
                 className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${
                   activeStudioTab === tab.id 
                   ? 'text-[#E8A2A2] border-[#E8A2A2]' 
                   : 'text-gray-400 border-transparent hover:text-gray-600'
                 }`}
               >
                 <tab.icon size={12} /> {tab.name}
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto chat-scrollbar">
             <AnimatePresence mode="wait">
                {activeStudioTab === 'notes' && (
                  <motion.div 
                    key="notes"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="h-full"
                  >
                     <StudyGuide notebookTitle={notebook.title} />
                  </motion.div>
                )}

                {activeStudioTab === 'audio' && (
                  <motion.div 
                    key="audio"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="h-full"
                  >
                     <AudioPlayer notebookTitle={notebook.title} />
                  </motion.div>
                )}

                {activeStudioTab === 'mindmap' && (
                   <motion.div 
                    key="mindmap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                  >
                     <MindMap notebookTitle={notebook.title} />
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Studio Footer */}
          <div className="p-6 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between">
             <button className="p-2 hover:bg-black/5 rounded-xl transition-colors"><Download size={18} /></button>
             <button className="p-2 hover:bg-black/5 rounded-xl transition-colors"><Share2 size={18} /></button>
             <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest">Saved to Notes</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
