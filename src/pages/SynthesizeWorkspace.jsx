import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import Skeleton from '../components/ui/Skeleton';
import { 
  Plus, BookOpen, MessageSquare, 
  Send, Sparkles, X, FileText, 
  Upload, ChevronRight, LogOut,
  Settings, Search, Star, Copy, Check, Download,
  ChevronUp, Mic, MicOff, History
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getAIModel, setAIModel, sendChatMessage } from '../services/ai';
import ModelPicker from '../components/ui/ModelPicker';

export default function SynthesizeWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    notebooks, sources, addSource, 
    chatMessages, addChatMessage, 
    isChatLoading, setChatLoading,
    toggleBookmarkMessage
  } = useStudyStore();
  
  const notebook = notebooks.find(nb => nb.id === id);
  const notebookSources = sources.filter(s => s.notebookId === id);
  const recentNotebooks = notebooks.slice(0, 3);

  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeModel, setActiveModel] = useState(getAIModel());
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const recognition = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (window.webkitSpeechRecognition || window.SpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.onresult = (e) => setInput(prev => prev + ' ' + e.results[0][0].transcript);
      recognition.current.onend = () => setIsListening(false);
    }
  }, [chatMessages, isChatLoading]);

  const handleMicToggle = () => {
    if (isListening) recognition.current?.stop();
    else { setIsListening(true); recognition.current?.start(); }
  };

  const handleModelSelect = (model) => {
    setAIModel(model);
    setActiveModel(model);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExport = () => {
    const content = chatMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${notebook.title}_Synthesis.txt`;
    a.click();
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const msg = input;
    setInput('');
    addChatMessage({ role: 'user', text: msg, timestamp: Date.now() });
    setChatLoading(true);

    try {
      const response = await sendChatMessage(msg, chatMessages);
      addChatMessage({ role: 'ai', text: response, timestamp: Date.now() });
    } catch (err) {
      addChatMessage({ role: 'ai', text: "❌ Sorry, I encountered an error. Please try again.", timestamp: Date.now() });
    } finally {
      setChatLoading(false);
    }
  };

  const filteredMessages = searchQuery.trim() 
    ? chatMessages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : chatMessages;

  if (!notebook) return null;

  return (
    <div className="h-screen flex bg-v-bg text-v-text font-sans antialiased overflow-hidden transition-colors duration-500">
      
      {/* Sidebar (Left) - Hidden on mobile, Bottom nav covers it */}
      <aside className="hidden lg:flex w-72 bg-v-secondary p-8 flex-col shrink-0 overflow-y-auto">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-v-secondary/50">
            <Sparkles className="text-v-text w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>EduMesh</span>
        </div>

        <div className="flex-1 space-y-8">
           <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Recent Studios</p>
              <div className="space-y-2">
                 {recentNotebooks.map(nb => (
                   <button
                    key={nb.id}
                    onClick={() => navigate(`/notebook/${nb.id}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg ${
                      nb.id === id ? 'bg-v-accent shadow-md' : 'hover:bg-white/30'
                    }`}
                   >
                     <span className="text-lg">{nb.emoji}</span>
                     <span className="text-sm font-bold truncate">{nb.title}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-auto w-full py-4 bg-v-accent rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl shadow-v-accent/20 hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> New Studio
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 glass-scrollbar bg-v-bg pb-20 lg:pb-0">
        
        {/* Dynamic Header */}
        <header className="px-6 sm:px-12 py-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-none" style={{ fontFamily: 'Outfit' }}>
                {notebook.emoji} {notebook.title}
              </h2>
           </div>
           
           <div className="flex items-center gap-2 sm:gap-4 relative">
              {isSearchOpen && (
                <motion.input 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  className="bg-v-surface px-4 py-2 rounded-xl text-xs font-bold outline-none border border-v-primary/10"
                  placeholder="Filter chat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
              <button 
                 onClick={() => setIsSearchOpen(!isSearchOpen)}
                 className={`p-2.5 rounded-xl transition-all ${isSearchOpen ? 'bg-v-primary text-white shadow-lg' : 'bg-white shadow-sm text-v-text/40'}`}
              >
                 <Search size={18} />
              </button>

              <button 
                 onClick={handleExport}
                 className="hidden sm:flex p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-v-text/40"
                 title="Export Synthesis"
              >
                 <Download size={18} />
              </button>

              <div className="relative">
                <button 
                  onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
                  className="hidden sm:flex px-6 py-2.5 bg-white rounded-2xl shadow-sm border border-v-secondary/20 items-center gap-3 group hover:border-v-primary/40 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  Engine: {activeModel === 'gemini' ? 'Gemini' : 'Groq'}
                  <ChevronUp className={`w-3 h-3 transition-transform ${isModelPickerOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 sm:px-12 pb-12 space-y-12">
           {/* Upload Dropzone */}
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => addSource({ notebookId: id, name: 'Research_Doc.pdf', type: 'pdf' })}
            className="w-full py-12 border-4 border-dashed border-v-secondary rounded-[40px] bg-white/40 flex flex-col items-center justify-center cursor-pointer hover:border-v-accent hover:bg-white transition-all group shadow-sm hover:shadow-xl"
           >
              <div className="w-16 h-16 rounded-3xl bg-v-secondary/30 flex items-center justify-center text-v-primary group-hover:scale-110 transition-transform mb-4 shadow-inner">
                 <Upload size={32} />
              </div>
              <h3 className="text-lg font-black tracking-tight">Drop your research here</h3>
              <p className="text-[10px] font-black uppercase opacity-30 tracking-[0.2em]">Synthesize PDFs, Links, or Notes</p>
           </motion.div>

           {/* Chat Interface */}
           <div className="max-w-4xl mx-auto w-full space-y-8">
              {filteredMessages.length === 0 ? (
                <div className="py-20 text-center space-y-4 opacity-20">
                   <div className="w-20 h-20 bg-v-surface rounded-[32px] mx-auto flex items-center justify-center">
                    <BookOpen size={32} />
                   </div>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Synthesis</h3>
                   <p className="text-sm font-medium">No results found in this studio.</p>
                </div>
              ) : (
                <div className="space-y-12">
                   {filteredMessages.map((msg, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group/msg`}
                      >
                         <div className={`relative max-w-[92%] sm:max-w-[85%] p-7 rounded-[40px] shadow-sm transition-all ${
                           msg.role === 'user' 
                             ? 'bg-v-accent rounded-tr-none text-v-text' 
                             : 'bg-white rounded-tl-none border border-v-surface shadow-xl shadow-v-secondary/5 text-v-text'
                         }`}>
                            {msg.role === 'ai' ? (
                              <div className="ai-response prose prose-sm max-w-none font-medium leading-relaxed">
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="font-bold leading-relaxed">{msg.text}</p>
                            )}

                            {/* Elite Actions Bar */}
                            <div className={`absolute top-0 flex gap-1 transition-all opacity-0 group-hover/msg:opacity-100 ${msg.role === 'user' ? 'right-full mr-4' : 'left-full ml-4'}`}>
                               {msg.role === 'ai' && (
                                 <>
                                   <button onClick={() => toggleBookmarkMessage(chatMessages.indexOf(msg))} className={`p-2 rounded-xl transition-all ${msg.isBookmarked ? 'bg-v-accent text-v-text shadow-lg' : 'bg-v-surface/40 text-v-text/20 hover:text-v-text'}`}>
                                       <Star size={14} className={msg.isBookmarked ? 'fill-current' : ''} />
                                   </button>
                                   <button onClick={() => handleCopy(msg.text, i)} className="p-2 bg-v-surface/40 rounded-xl text-v-text/20 hover:text-v-text transition-all">
                                       {copiedIndex === i ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                   </button>
                                 </>
                               )}
                            </div>
                         </div>
                      </motion.div>
                   ))}
                   {isChatLoading && (
                      <div className="flex justify-start">
                         <div className="bg-white p-6 rounded-[32px] rounded-tl-none w-full max-w-md space-y-3 shadow-xl">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-2 pt-2">
                              <span className="w-1.5 h-1.5 bg-v-primary rounded-full animate-bounce" />
                              <span className="w-1.5 h-1.5 bg-v-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 bg-v-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                         </div>
                      </div>
                   )}
                   <div ref={chatEndRef} />
                </div>
              )}
           </div>
        </div>

        {/* Input Bar */}
        <div className="px-6 sm:px-12 py-10 bg-v-bg/80 backdrop-blur-xl border-t border-v-text/5">
           <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative h-16">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Talk to your documents using ${activeModel === 'gemini' ? 'Gemini' : 'Groq'}...`}
                className="w-full h-full pl-6 sm:pl-8 pr-32 bg-white border border-v-text/5 rounded-[32px] shadow-sm focus:shadow-2xl focus:shadow-v-primary/10 transition-all outline-none font-bold text-sm"
              />
              <div className="absolute right-2 sm:right-3 top-3 bottom-3 flex gap-1 sm:gap-2">
                <button 
                  type="button" 
                  onClick={handleMicToggle}
                  className={`px-3 sm:px-4 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-100 text-rose-500 animate-pulse' : 'bg-v-surface text-v-text/30 hover:text-v-text'}`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button 
                  type="submit"
                  disabled={!input.trim() || isChatLoading}
                  className="px-4 sm:px-6 bg-v-primary text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-v-primary/20 disabled:opacity-50"
                >
                   <Send size={18} />
                </button>
              </div>
           </form>
           <div className="flex justify-center mt-3 sm:hidden">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/40 rounded-full text-[8px] font-black uppercase tracking-widest opacity-30">
                 <History size={10} /> Active Studio Session
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
