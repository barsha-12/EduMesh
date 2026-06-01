import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useToastStore } from '../store/toastStore';
import { generateStudyNotes, generateFlashcards } from '../services/ai';
import { FileText, Sparkles, Loader2, Trash2, ChevronDown, Clock, Download, Brain } from 'lucide-react';
import { exportNotesPDF } from '../services/pdf';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Pill from '../components/ui/Pill';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Literature', 'Computer Science', 'Economics', 'Psychology',
];

const DEPTH_OPTIONS = ['Brief', 'Standard', 'Detailed'];

export default function StudyNotes() {
  const { savedNotes, saveNote, deleteNote, updateStats, addSubjectStudied, addFlashcards } = useStudyStore();
  const addToast = useToastStore((s) => s.addToast);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [depth, setDepth] = useState('Standard');
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [expandedNote, setExpandedNote] = useState(null);
  const notesContainerRef = useRef(null);

  const handleMakeFlashcards = async () => {
    if (!generatedNotes) return;
    setIsGeneratingFlashcards(true);
    try {
      const cards = await generateFlashcards(generatedNotes, subject, topic);
      if (!cards || cards.length === 0) throw new Error('No flashcards could be generated.');
      await addFlashcards(cards, subject, topic);
      addToast(`Successfully created ${cards.length} flashcards!`, 'success');
    } catch (err) {
      console.error('Flashcard generation error:', err);
      addToast(err.message || 'Failed to generate flashcards.', 'error');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic.trim()) return;

    setIsGenerating(true);
    setGeneratedNotes('');

    try {
      const notes = await generateStudyNotes(subject, topic);
      if (!notes) throw new Error('Failed to generate notes.');
      setGeneratedNotes(notes);

      updateStats({
        totalNotes: (useStudyStore.getState().studyStats.totalNotes || 0) + 1,
        totalStudyMinutes: (useStudyStore.getState().studyStats.totalStudyMinutes || 0) + 5,
      });
      addSubjectStudied(subject);
    } catch (err) {
      console.error('StudyNotes error:', err);
      alert(err.message || 'Failed to generate study notes. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
  };

  const handleDownloadPDF = async () => {
    if (!generatedNotes) return;
    try {
      exportNotesPDF('EduMesh Study Notes', `${subject} - ${topic}`, generatedNotes);
      addToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      addToast('Failed to generate PDF.', 'error');
    }
  };

  const renderMarkdown = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} className="font-display font-bold text-[1.3rem] text-primary mt-6 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="font-body font-semibold text-base text-slate mt-4 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="relative ml-4 mb-2 font-body text-base leading-[1.75] text-primary/80 pl-3">
            <span className="absolute left-0 top-[10px] w-[6px] h-[6px] rounded-full bg-lavender"></span>
            {renderInlineFormatting(line.slice(2))}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)[1];
        return (
          <li key={i} className="relative ml-4 mb-2 font-body text-base leading-[1.75] text-primary/80 pl-5">
            <span className="absolute left-0 font-body font-bold text-orchid">{num}.</span>
            {renderInlineFormatting(line.replace(/^\d+\.\s/, ''))}
          </li>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      if (line.startsWith('```')) return null;
      if (line.startsWith('>')) return (
        <blockquote key={i} className="border-l-[3px] border-periwinkle bg-[rgba(178,204,255,0.12)] p-4 mb-4 italic rounded-r-lg">
          <span className="font-body font-semibold not-italic text-primary block mb-1">Example →</span>
          {line.slice(1).trim()}
        </blockquote>
      );
      return <p key={i} className="font-body text-base text-primary/80 leading-[1.75] mb-4">{renderInlineFormatting(line)}</p>;
    });
  };

  const renderInlineFormatting = (text) => {
    // Handle **bold** with lemon highlight
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold bg-[rgba(245,245,168,0.40)]">{part.slice(2, -2)}</strong>;
      }
      // Handle `code` with seafoam
      const codeParts = part.split(/(`[^`]+`)/);
      return codeParts.map((cp, j) => {
        if (cp.startsWith('`') && cp.endsWith('`')) {
          return <code key={`${i}-${j}`} className="font-mono text-sm bg-[rgba(168,255,236,0.20)] border-l-[3px] border-seafoam px-2 py-0.5 rounded">{cp.slice(1, -1)}</code>;
        }
        return cp;
      });
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
      className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-128px)]"
    >
      {/* Left Panel — Generation Controls */}
      <div className="lg:w-[35%] lg:shrink-0">
        <GlassCard variant="base" className="sticky top-4">
          <h2 className="font-display font-bold text-[1.4rem] text-primary mb-1">Generate Notes</h2>
          <p className="font-body text-secondary text-sm mb-6">AI creates structured study notes for any topic.</p>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Subject */}
            <div>
              <label className="font-body font-semibold text-[0.85rem] text-secondary mb-2 block">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.80)] border-[1.5px] border-[rgba(204,204,204,0.50)] rounded-[14px] px-4 py-3 font-body text-base text-primary outline-none appearance-none cursor-pointer transition-all focus:border-lavender focus:shadow-[0_0_0_4px_rgba(208,170,255,0.20)]"
                required
              >
                <option value="">Select subject...</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="font-body font-semibold text-[0.85rem] text-secondary mb-2 block">Topic</label>
              <InputField 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Electromagnetic Induction"
                required
              />
            </div>

            {/* Depth */}
            <div>
              <label className="font-body font-semibold text-[0.85rem] text-secondary mb-2 block">Depth</label>
              <div className="flex bg-[rgba(255,255,255,0.5)] p-1 rounded-pill">
                {DEPTH_OPTIONS.map(d => (
                  <button 
                    key={d} 
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`flex-1 py-2 rounded-pill text-sm font-body font-medium transition-all ${depth === d ? 'bg-gradient-to-r from-periwinkle to-lavender text-primary shadow-sm' : 'text-secondary'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              type="submit"
              size="lg"
              disabled={isGenerating || !subject || !topic.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Notes ✦
                </>
              )}
            </Button>

            {/* Download PDF */}
            {generatedNotes && !isGenerating && (
              <Button variant="ghost" size="lg" onClick={handleDownloadPDF} className="w-full border-[1.5px] border-taupe">
                <Download size={18} className="text-slate" />
                📥 Download as PDF
              </Button>
            )}
          </form>

          {/* Saved Notes List */}
          {savedNotes.length > 0 && (
            <div className="mt-8 border-t border-[rgba(204,204,204,0.3)] pt-6">
              <h3 className="font-body font-semibold text-sm text-secondary mb-3">Saved Notes ({savedNotes.length})</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto chat-scroll">
                {savedNotes.map(note => (
                  <div key={note.id} 
                    className={`flex items-center gap-3 px-3 py-2 rounded-[12px] cursor-pointer transition-all group ${expandedNote === note.id ? 'bg-gradient-to-r from-lavender/20 to-periwinkle/20' : 'hover:bg-[rgba(208,170,255,0.08)]'}`}
                    onClick={() => {
                      setExpandedNote(expandedNote === note.id ? null : note.id);
                      if (expandedNote !== note.id) {
                        setGeneratedNotes(note.content);
                        setSubject(note.subject);
                        setTopic(note.topic);
                      }
                    }}
                  >
                    <FileText size={16} className="text-periwinkle shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-sm text-primary truncate">{note.topic}</p>
                      <p className="font-body text-[0.7rem] text-muted">{note.subject}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                      className="opacity-0 group-hover:opacity-100 text-pearl hover:text-rose transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Right Panel — Notes Output */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            /* Skeleton shimmer */
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GlassCard variant="peach" className="animate-pulse space-y-6">
                <div className="h-8 bg-[rgba(255,217,179,0.3)] rounded-pill w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-[rgba(255,217,179,0.2)] rounded-pill w-full"></div>
                  <div className="h-4 bg-[rgba(255,217,179,0.2)] rounded-pill w-5/6"></div>
                  <div className="h-4 bg-[rgba(255,217,179,0.2)] rounded-pill w-4/6"></div>
                </div>
                <div className="h-4 bg-[rgba(255,217,179,0.2)] rounded-pill w-full"></div>
                <div className="h-4 bg-[rgba(255,217,179,0.2)] rounded-pill w-3/4"></div>
              </GlassCard>
            </motion.div>
          ) : generatedNotes ? (
            /* Generated Notes */
            <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard variant="peach">
                {/* Header Pill */}
                <Pill variant="subject" className="mb-6 text-sm">
                  {subject} — {topic}
                </Pill>

                {/* Save button */}
                <div className="flex justify-end gap-3 mb-4">
                  <Button size="sm" variant="ghost" className="border border-periwinkle text-periwinkle" onClick={handleMakeFlashcards} disabled={isGeneratingFlashcards}>
                    {isGeneratingFlashcards ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
                    {isGeneratingFlashcards ? 'Creating...' : 'Make Flashcards'}
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save Notes ✦
                  </Button>
                </div>

                {/* Notes Content */}
                <div className="ai-notes selection:bg-lavender/30" ref={notesContainerRef}>
                  {renderMarkdown(generatedNotes)}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            /* Empty State */
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GlassCard variant="base" className="flex flex-col items-center justify-center text-center py-24 min-h-[50vh]">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-lavender/30 absolute -top-2 -left-2 animate-[float_6s_ease-in-out_infinite]"></div>
                  <div className="w-20 h-20 rounded-full bg-mint/30 absolute -bottom-2 -right-2 animate-[float_8s_ease-in-out_infinite_reverse]"></div>
                  <div className="w-24 h-24 rounded-full bg-peach/30 relative animate-[float_5s_ease-in-out_infinite] flex items-center justify-center">
                    <FileText size={32} className="text-secondary" />
                  </div>
                </div>
                <p className="font-body text-muted mt-4">Select a subject and topic to generate notes</p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
