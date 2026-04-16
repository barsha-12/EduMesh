import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../../store/studyStore';
import { useToastStore } from '../../store/toastStore';
import { generateCramPlan, generateCheatSheet } from '../../services/ai';
import { AlertTriangle, Clock, Plus, X, Sparkles, FileText, Loader2, Trash2 } from 'lucide-react';

export default function ExamCountdown() {
  const { exams, addExam, deleteExam, quizHistory, savedNotes } = useStudyStore();
  const addToast = useToastStore((s) => s.addToast);
  const [showForm, setShowForm] = useState(false);
  const [examName, setExamName] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [panicExam, setPanicExam] = useState(null);
  const [cramPlan, setCramPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Find nearest exam within 48 hours
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const threshold = 48 * 60 * 60 * 1000;
      
      const panic = exams.find(e => {
        const diff = new Date(e.examDate).getTime() - now;
        return diff > 0 && diff <= threshold;
      });

      setPanicExam(panic || null);
    };

    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [exams]);

  // Update countdown every second when in panic mode
  useEffect(() => {
    if (!panicExam) return;
    
    const update = () => {
      const diff = new Date(panicExam.examDate).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown('NOW');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [panicExam]);

  const handleAddExam = () => {
    if (!examName || !examDate) return;
    addExam({ name: examName, subject: examSubject, examDate: new Date(examDate).toISOString() });
    setExamName('');
    setExamSubject('');
    setExamDate('');
    setShowForm(false);
    addToast('Exam added to countdown!', 'success');
  };

  const handleCramPlan = async () => {
    if (!panicExam) return;
    setIsGenerating(true);

    // Find 5 weakest topics for this subject
    const subjectQuizzes = quizHistory.filter(q => q.subject === panicExam.subject);
    const topicScores = {};
    subjectQuizzes.forEach(q => {
      if (!topicScores[q.topic]) topicScores[q.topic] = [];
      topicScores[q.topic].push(q.score);
    });

    const weakTopics = Object.entries(topicScores)
      .map(([topic, scores]) => ({ topic, avg: scores.reduce((a, b) => a + b, 0) / scores.length }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 5)
      .map(t => t.topic);

    if (weakTopics.length === 0) {
      weakTopics.push('General concepts');
    }

    const plan = await generateCramPlan(panicExam.subject || panicExam.name, weakTopics);
    setCramPlan(plan);
    setIsGenerating(false);
  };

  const handleCheatSheet = async () => {
    if (!panicExam) return;
    setIsGenerating(true);

    const subjectNotes = savedNotes
      .filter(n => n.subject === panicExam.subject)
      .map(n => n.content)
      .join('\n\n');

    if (!subjectNotes) {
      addToast('No notes found for this subject.', 'warning');
      setIsGenerating(false);
      return;
    }

    const sheet = await generateCheatSheet(panicExam.subject || panicExam.name, subjectNotes);
    setCramPlan(sheet);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4">
      {/* Panic Mode Banner */}
      <AnimatePresence>
        {panicExam && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="m3-card !p-0 overflow-hidden border-red-500/20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-red-500/5" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">⚠️ Panic Mode Active</p>
                    <p className="font-bold">{panicExam.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black tabular-nums text-red-500">{countdown}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Time Remaining</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCramPlan} disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Cram Plan
                </button>
                <button onClick={handleCheatSheet} disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-red-500/20 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-500/5 transition-colors disabled:opacity-50">
                  <FileText size={16} /> Cheat Sheet
                </button>
              </div>

              {cramPlan && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 max-h-64 overflow-y-auto chat-scrollbar">
                  <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{cramPlan}</pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam List / Add Form */}
      <div className="m3-card !p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#E8A2A2]" />
            <h3 className="text-sm font-bold">Exam Countdown</h3>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400">
            {showForm ? <X size={16} /> : <Plus size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4">
              <div className="space-y-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)}
                  placeholder="Exam name" className="input-field !py-2 text-sm" />
                <input type="text" value={examSubject} onChange={(e) => setExamSubject(e.target.value)}
                  placeholder="Subject (optional)" className="input-field !py-2 text-sm" />
                <input type="datetime-local" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                  className="input-field !py-2 text-sm" />
                <button onClick={handleAddExam} className="btn-primary w-full !py-2 text-xs">Add Exam</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {exams.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">No upcoming exams set.</p>
        ) : (
          <div className="space-y-2">
            {exams.slice(0, 5).map((exam) => {
              const diff = new Date(exam.examDate).getTime() - Date.now();
              const daysLeft = Math.max(0, Math.ceil(diff / 86400000));
              return (
                <div key={exam.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 group">
                  <div>
                    <p className="text-sm font-bold">{exam.name}</p>
                    <p className="text-[10px] text-gray-400">{new Date(exam.examDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      daysLeft <= 2 ? 'bg-red-500/10 text-red-500' : daysLeft <= 7 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {daysLeft === 0 ? 'Today!' : `${daysLeft}d`}
                    </span>
                    <button onClick={() => deleteExam(exam.id)}
                      className="p-1 rounded-lg text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
