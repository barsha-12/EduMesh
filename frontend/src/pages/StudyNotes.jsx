import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { generateStudyNotes } from '../services/ai';
import Navbar from '../components/ui/Navbar';
import GlassCard from '../components/ui/GlassCard';
import { FileText, Sparkles, Loader2, Trash2, ChevronDown, Clock, BookOpen, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic.trim()) return;

    setIsGenerating(true);
    setGeneratedNotes('');

    const notes = await generateStudyNotes(subject, topic);
    setGeneratedNotes(notes);
    setIsGenerating(false);

    // Update stats
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

  const handleDownloadPDF = () => {
    if (!notesContainerRef.current || !generatedNotes) return;

    const element = notesContainerRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${subject}_${topic.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
    };

    html2pdf().set(opt).from(element).save();
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold mt-5 mb-2 text-white flex items-center gap-2">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold mt-4 mb-1 text-white/90">{line.slice(4)}</h3>;
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm text-white/60 leading-relaxed mb-1">{line.slice(2)}</li>;
      if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm text-white/60 leading-relaxed mb-1">{line.replace(/^\d+\.\s/, '')}</li>;
      if (line.trim() === '') return <br key={i} />;

      // Handle bold text
      const parts = line.split(/\*\*(.*?)\*\*/);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{part}</strong> : part
      );
      return <p key={i} className="text-sm text-white/60 leading-relaxed mb-1">{rendered}</p>;
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Study Notes
              </h1>
              <p className="text-sm text-white/40 mt-1">Generate AI-powered notes on any topic</p>
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 p-1 glass rounded-xl">
              <button
                onClick={() => setActiveView('generate')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'generate' ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:text-white/60'
                }`}
              >
                Generate
              </button>
              <button
                onClick={() => setActiveView('saved')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeView === 'saved' ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:text-white/60'
                }`}
              >
                Saved ({savedNotes.length})
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'generate' ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Input Form */}
                <GlassCard className="!rounded-2xl">
                  <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Subject</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="input-field !py-3"
                          required
                        >
                          <option value="" className="bg-surface-900">Select subject...</option>
                          {SUBJECTS.map((s) => (
                            <option key={s} value={s} className="bg-surface-900">{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Topic</label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. Newton's Laws of Motion"
                          className="input-field !py-3"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isGenerating || !subject || !topic.trim()}
                      className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-40"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Notes
                        </>
                      )}
                    </button>
                  </form>
                </GlassCard>

                {/* Loading Shimmer */}
                {isGenerating && (
                  <GlassCard className="!rounded-2xl">
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`h-4 bg-white/5 rounded animate-shimmer`} style={{ width: `${100 - i * 12}%` }} />
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Generated Notes */}
                {generatedNotes && !isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlassCard className="!rounded-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{topic}</p>
                            <p className="text-xs text-white/40">{subject}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleDownloadPDF}
                            className="btn-primary !text-xs !px-4 !py-2 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download PDF
                          </button>
                          <button
                            onClick={handleSave}
                            className="btn-primary !text-xs !px-4 !py-2"
                          >
                            Save Notes
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-white/5 pt-6" ref={notesContainerRef}>
                        {renderMarkdown(generatedNotes)}
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="saved"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {savedNotes.length === 0 ? (
                  <GlassCard className="!rounded-2xl text-center !py-16">
                    <BookOpen className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <p className="text-white/30 text-sm">No saved notes yet</p>
                    <p className="text-white/20 text-xs mt-1">Generate and save your first notes above</p>
                  </GlassCard>
                ) : (
                  savedNotes.map((note) => (
                    <GlassCard key={note.id} className="!rounded-2xl">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-white">{note.topic}</p>
                            <p className="text-xs text-white/40 flex items-center gap-2 mt-0.5">
                              <span>{note.subject}</span>
                              <span>•</span>
                              <Clock size={10} />
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronDown
                            className={`w-4 h-4 text-white/30 transition-transform ${expandedNote === note.id ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedNote === note.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/5 mt-4 pt-4">
                              {renderMarkdown(note.content)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
