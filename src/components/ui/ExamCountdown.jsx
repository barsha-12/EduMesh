import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../../store/studyStore';
import { useToastStore } from '../../store/toastStore';
import { generateCramPlan, generateCheatSheet } from '../../services/ai';
import { AlertTriangle, Clock, Plus, X, Sparkles, FileText, Loader2, Trash2 } from 'lucide-react';
import InputField from './InputField';
import Button from './Button';

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
            className="glass-base overflow-hidden border-[1.5px] border-coral relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,187,170,0.15)] via-[rgba(255,217,179,0.15)] to-[rgba(255,187,170,0.15)]" />
            <div className="relative p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-coral flex items-center justify-center animate-pulse-soft">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold font-body uppercase tracking-widest text-coral">⚠️ Panic Mode Active</p>
                    <p className="font-bold font-display text-primary">{panicExam.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black font-display tabular-nums text-coral">{countdown}</p>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Time Remaining</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCramPlan} disabled={isGenerating} size="md" variant="danger" className="flex-1">
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Cram Plan
                </Button>
                <Button onClick={handleCheatSheet} disabled={isGenerating} size="md" variant="secondary" className="flex-1">
                  <FileText size={16} /> Cheat Sheet
                </Button>
              </div>

              {cramPlan && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-[rgba(255,255,255,0.7)] rounded-[16px] p-4 border-[1.5px] border-[rgba(204,204,204,0.4)] max-h-64 overflow-y-auto chat-scroll">
                  <pre className="text-sm font-body text-primary whitespace-pre-wrap leading-relaxed">{cramPlan}</pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam List / Add Form */}
      <div className="glass-base !p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-coral" />
            <h3 className="text-sm font-display font-bold text-primary">Exam Countdown</h3>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="p-1.5 rounded-lg hover:bg-[rgba(204,204,204,0.3)] text-secondary transition-colors">
            {showForm ? <X size={16} /> : <Plus size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4">
              <div className="space-y-3 p-4 bg-[rgba(255,255,255,0.6)] rounded-[16px]">
                <InputField type="text" value={examName} onChange={(e) => setExamName(e.target.value)}
                  placeholder="Exam name" className="!py-2 text-sm" />
                <InputField type="text" value={examSubject} onChange={(e) => setExamSubject(e.target.value)}
                  placeholder="Subject (optional)" className="!py-2 text-sm" />
                <InputField type="datetime-local" value={examDate} onChange={(e) => setExamDate(e.target.value)}
                  className="!py-2 text-sm" />
                <Button onClick={handleAddExam} className="w-full !py-2 text-xs">Add Exam</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {exams.length === 0 ? (
          <p className="text-xs font-body text-secondary text-center py-2">No upcoming exams set.</p>
        ) : (
          <div className="space-y-2">
            {exams.slice(0, 5).map((exam) => {
              const diff = new Date(exam.examDate).getTime() - Date.now();
              const daysLeft = Math.max(0, Math.ceil(diff / 86400000));
              return (
                <div key={exam.id} className="flex items-center justify-between py-2 px-3 rounded-[12px] hover:bg-[rgba(204,204,204,0.15)] group transition-colors">
                  <div>
                    <p className="text-sm font-body font-bold text-primary">{exam.name}</p>
                    <p className="text-[10px] font-body text-secondary">{new Date(exam.examDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-body px-2 py-1 rounded-[8px] ${
                      daysLeft <= 2 ? 'bg-[rgba(255,176,176,0.3)] text-rose' : daysLeft <= 7 ? 'bg-[rgba(245,245,168,0.4)] text-sand' : 'bg-[rgba(178,255,212,0.3)] text-mint'
                    }`}>
                      {daysLeft === 0 ? 'Today!' : `${daysLeft}d`}
                    </span>
                    <button onClick={() => deleteExam(exam.id)}
                      className="p-1 rounded-lg text-muted hover:text-rose opacity-0 group-hover:opacity-100 transition-all">
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
