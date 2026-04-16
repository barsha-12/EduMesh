import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { generateStudyNotes } from '../services/ai';
import { FileText, Sparkles, Loader2, Trash2, ChevronDown, Clock, BookOpen, Download, Plus, LayoutGrid, Library, Search, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry',  'Computer Science',
  'Biology', 'English', 'Electronics', 'Data Structures',
  'Engineering Drawing', 'Economics',
];

export default function StudyNotes() {
  const { savedNotes, saveNote, deleteNote, updateStats, addSubjectStudied } = useStudyStore();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState('generate'); // 'generate' | 'saved'
  const [expandedNote, setExpandedNote] = useState(null);
  const notesContainerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic.trim()) return;

    setIsGenerating(true);
    setGeneratedNotes('');

    const notes = await generateStudyNotes(subject, topic);
    setGeneratedNotes(notes);
    setIsGenerating(false);

    updateStats({
      totalNotes: (useStudyStore.getState().studyStats.totalNotes || 0) + 1,
      totalStudyMinutes: (useStudyStore.getState().studyStats.totalStudyMinutes || 0) + 5,
    });
    addSubjectStudied(subject);
  };

  const handleSave = () => {
    if (!generatedNotes) return;
    saveNote({
      id: Date.now().toString(),
      subject,
      topic,
      content: generatedNotes,
      createdAt: new Date().toISOString(),
    });
    setGeneratedNotes('');
    setTopic('');
    setActiveView('saved');
  };

  const handleDownloadPDF = async () => {
    if (!generatedNotes) return;
    const htmlContent = marked.parse(generatedNotes);
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; line-height: 1.6;">
        <h1 style="color: #6366f1; margin-bottom: 5px;">EduMesh Study Material</h1>
        <p style="color: #666; margin-bottom: 30px;">${subject} &bull; ${topic}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 30px;" />
        ${htmlContent}
      </div>
    `;
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    await doc.html(tempDiv, {
      callback: function (doc) {
        doc.save(`${subject}_${topic.replace(/\s+/g, '_')}.pdf`);
        document.body.removeChild(tempDiv);
      },
      x: 10, y: 10, width: 190, windowWidth: 800
    });
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black mt-10 mb-6 text-v-text tracking-tight" style={{ fontFamily: 'Outfit' }}>{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-black mt-8 mb-4 text-v-primary tracking-tight" style={{ fontFamily: 'Outfit' }}>{line.slice(4)}</h3>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 list-disc text-sm text-v-text/60 font-bold leading-relaxed mb-3">{line.slice(2)}</li>;
      if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-6 list-decimal text-sm text-v-text/60 font-bold leading-relaxed mb-3">{line.replace(/^\d+\.\s/, '')}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm text-v-text/60 font-bold leading-relaxed mb-4">{line}</p>;
    });
  };

  const filteredNotes = savedNotes.filter(note => {
    const matchesSearch = note.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'All' || note.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = ['All', ...new Set(savedNotes.map(n => n.subject))];

  return (
    <div className="min-h-screen bg-v-bg text-v-text transition-all duration-500 pb-32">
      <main className="max-w-7xl mx-auto px-8 py-16 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
          
          {/* Elite Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-v-primary/10 border border-v-primary/10 text-v-primary text-[10px] font-black uppercase tracking-widest mx-auto lg:mx-0">
                <FileText className="w-3 h-3" /> Core Synthesis
              </div>
              <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-none" style={{ fontFamily: 'Outfit' }}>
                Study <span className="text-v-primary">Notes</span>
              </h1>
              <p className="text-v-text/40 font-bold text-sm max-w-xl mx-auto lg:mx-0">
                Transform complex topics into professional, structured research material using high-caliber AI engines.
              </p>
            </div>

            <div className="flex p-1.5 bg-v-surface rounded-[24px] w-fit shadow-inner mx-auto lg:mx-0">
              <button
                onClick={() => setActiveView('generate')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === 'generate' ? 'bg-white text-v-primary shadow-xl' : 'text-v-text/30 hover:text-v-text'
                }`}
              >
                <Plus size={14} /> Power Generator
              </button>
              <button
                onClick={() => setActiveView('saved')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeView === 'saved' ? 'bg-white text-v-primary shadow-xl' : 'text-v-text/30 hover:text-v-text'
                }`}
              >
                <Library size={14} /> Research Vault ({savedNotes.length})
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'generate' ? (
              <motion.div key="generate" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-12">
                
                {/* Elite Input Form */}
                <div className="bg-white/40 backdrop-blur-3xl rounded-[60px] p-10 lg:p-16 border border-v-text/5 shadow-2xl">
                  <form onSubmit={handleGenerate} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-v-text/20 ml-6">Research Discipline</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-white border border-v-text/5 px-8 py-6 rounded-[32px] outline-none text-lg font-black appearance-none focus:shadow-2xl focus:shadow-v-primary/10 transition-all cursor-pointer box-border"
                          required
                        >
                          <option value="">Select subject...</option>
                          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-v-text/20 ml-6">Target Topic</label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. Neural Plasticity"
                          className="w-full bg-white border border-v-text/5 px-8 py-6 rounded-[32px] outline-none text-lg font-black placeholder-v-text/10 focus:shadow-2xl focus:shadow-v-primary/10 transition-all box-border"
                          required
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isGenerating || !subject || !topic.trim()}
                      className="w-full lg:w-fit px-12 py-6 bg-v-primary text-white rounded-[32px] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-v-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Mapping Neural Pathways...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Initialize Synthesis
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Content Area */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/40 backdrop-blur-xl rounded-[60px] p-16 space-y-10 animate-pulse border border-v-text/5">
                      <div className="h-10 bg-v-text/5 rounded-[20px] w-1/3" />
                      <div className="space-y-4">
                        <div className="h-4 bg-v-text/5 rounded-full w-full" />
                        <div className="h-4 bg-v-text/5 rounded-full w-5/6" />
                        <div className="h-4 bg-v-text/5 rounded-full w-4/6" />
                      </div>
                    </motion.div>
                  )}

                  {generatedNotes && !isGenerating && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white shadow-2xl rounded-[60px] overflow-hidden border border-v-text/5">
                      <div className="p-10 lg:p-16 bg-v-primary/5 border-b border-v-text/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex items-center gap-8">
                          <div className="w-20 h-20 rounded-[40px] bg-v-primary flex items-center justify-center shadow-2xl shadow-v-primary/30">
                            <FileText className="w-10 h-10 text-white" />
                          </div>
                          <div className="space-y-1">
                            <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>{topic}</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-v-text/30">{subject} &bull; Elite Study Material</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button onClick={handleDownloadPDF} className="w-16 h-16 bg-white border border-v-text/5 rounded-[28px] flex items-center justify-center text-v-text/20 hover:text-v-primary transition-all shadow-sm">
                            <Download size={24} />
                          </button>
                          <button onClick={handleSave} className="px-10 py-6 bg-v-primary text-white rounded-[32px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-v-primary/20 hover:scale-[1.02] transition-all">
                            Store in Vault
                          </button>
                        </div>
                      </div>
                      <div className="p-10 lg:p-20 text-v-text/80 font-medium leading-loose selection:bg-v-primary selection:text-white" ref={notesContainerRef}>
                        {renderMarkdown(generatedNotes)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div key="saved" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="space-y-10">
                
                {/* Vault Filters */}
                {savedNotes.length > 0 && (
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-v-text/10 group-focus-within:text-v-primary transition-all" />
                      <input 
                        type="text" 
                        placeholder="Search your library..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white h-20 pl-20 pr-8 rounded-[32px] border border-v-text/5 outline-none font-bold text-lg placeholder-v-text/10 focus:shadow-xl transition-all"
                      />
                    </div>
                    <div className="relative lg:w-64">
                      <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-v-text/10 pointer-events-none" />
                      <select 
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        className="w-full h-20 bg-white pl-16 pr-8 rounded-[32px] border border-v-text/5 outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer"
                      >
                        {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                  {savedNotes.length === 0 ? (
                    <div className="bg-white/40 backdrop-blur-xl rounded-[60px] p-24 text-center border border-v-text/5 flex flex-col items-center gap-8">
                      <div className="w-24 h-24 bg-v-surface rounded-[40px] flex items-center justify-center shadow-inner">
                        <Library className="w-12 h-12 text-v-text/10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-black text-v-text/40 tracking-tight">Research Vault is Empty</p>
                        <p className="text-sm font-bold text-v-text/20">Synthesize your first material to begin your collection.</p>
                      </div>
                      <button onClick={() => setActiveView('generate')} className="px-12 py-5 bg-v-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl shadow-v-primary/20 hover:scale-105 transition-all">
                         Initialize Synthesis
                      </button>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div key={note.id} className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-v-text/5 overflow-hidden group hover:bg-white hover:shadow-2xl hover:shadow-v-primary/5 transition-all">
                        <div className="p-8 flex items-center justify-between cursor-pointer" onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}>
                          <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-[28px] bg-v-primary/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-all">
                              <FileText className="w-8 h-8 text-v-primary" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-xl tracking-tighter leading-none" style={{ fontFamily: 'Outfit' }}>{note.topic}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-v-text/20 flex items-center gap-3">
                                {note.subject} &bull; <Clock size={12} /> {new Date(note.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="w-12 h-12 rounded-[20px] flex items-center justify-center text-v-text/10 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                              <Trash2 size={20} />
                            </button>
                            <div className={`w-12 h-12 rounded-[20px] bg-v-surface flex items-center justify-center text-v-text/30 transition-transform ${expandedNote === note.id ? 'rotate-180' : ''}`}>
                              <ChevronDown size={22} />
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedNote === note.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-v-text/[0.02]">
                              <div className="p-12 lg:p-20 border-t border-v-text/5 text-sm lg:text-base font-medium leading-loose text-v-text/70" style={{ fontFamily: 'Inter' }}>
                                {renderMarkdown(note.content)}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
