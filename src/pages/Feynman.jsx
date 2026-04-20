import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendFeynmanMessage, scoreFeynmanSession } from '../services/ai';
import { useToastStore } from '../store/toastStore';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Send, GraduationCap, Sparkles, Trophy, AlertTriangle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'Electronics', 'Data Structures',
  'Engineering Drawing', 'Economics',
];

export default function Feynman() {
  const { user } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const [phase, setPhase] = useState('setup'); // setup | teaching | scoring | results
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [exchanges, setExchanges] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [exchanges, isLoading]);

  // Animate score counter
  useEffect(() => {
    if (score && phase === 'results') {
      let current = 0;
      const target = score.feynman_score;
      const step = Math.max(1, Math.floor(target / 50));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedScore(current);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [score, phase]);

  const startSession = async () => {
    if (!topic.trim()) return;
    setPhase('teaching');
    setIsLoading(true);

    try {
      const firstMessage = await sendFeynmanMessage(topic, []);
      const aiMsg = { role: 'ai', text: firstMessage, timestamp: Date.now() };
      setExchanges([aiMsg]);
    } catch (err) {
      console.error('Feynman start error:', err);
      addToast('Failed to start session. AI is unavailable.', 'error');
      setPhase('setup');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', text: input.trim(), timestamp: Date.now() };
    const updated = [...exchanges, userMsg];
    setExchanges(updated);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await sendFeynmanMessage(topic, updated);
      const aiMsg = { role: 'ai', text: reply, timestamp: Date.now() };
      setExchanges([...updated, aiMsg]);
    } catch (err) {
      console.error('Feynman message error:', err);
      addToast('Feedback failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    setPhase('scoring');
    setIsLoading(true);
    try {
      const result = await scoreFeynmanSession(topic, exchanges);
      setScore(result);

      // Save to Supabase
      if (user?.id && !user.id.startsWith('demo')) {
        await supabase.from('feynman_sessions').insert([{
          user_id: user.id,
          topic,
          subject,
          score: result.feynman_score,
          strong_concepts: result.strong_concepts,
          weak_concepts: result.weak_concepts,
          feedback: result.feedback,
          exchanges,
        }]);
      }

      addToast(`Feynman session scored: ${result.feynman_score}/100`, 'success');
      setPhase('results');
    } catch (err) {
      console.error('Scoring error:', err);
      addToast('Failed to score session.', 'error');
      setPhase('teaching');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setPhase('setup');
    setExchanges([]);
    setScore(null);
    setAnimatedScore(0);
    setInput('');
    setTopic('');
  };

  const exchangeCount = exchanges.filter(e => e.role === 'user').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
      <main className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Feynman Mode
              </h1>
              <p className="text-sm text-gray-400">Teach the AI to test your understanding.</p>
            </div>
            {phase !== 'setup' && (
              <button onClick={resetSession} className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 text-gray-400 hover:text-[#E8A2A2] rounded-2xl text-sm font-bold">
                <RotateCcw size={16} /> Reset
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* SETUP */}
            {phase === 'setup' && (
              <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="m3-card !p-8 space-y-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] flex items-center justify-center">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">How it works</h2>
                      <p className="text-sm text-gray-400">The AI plays a confused student. You explain. It probes gaps in your knowledge.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                      <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field">
                        <option value="">Select subject...</option>
                        {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Topic to Teach</label>
                      <input
                        type="text" value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Photosynthesis"
                        className="input-field" required
                      />
                    </div>
                  </div>

                  <button onClick={startSession} disabled={!topic.trim()} className="btn-primary w-full py-4">
                    <GraduationCap size={20} /> Start Teaching Session
                  </button>
                </div>
              </motion.div>
            )}

            {/* TEACHING */}
            {phase === 'teaching' && (
              <motion.div key="teaching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Exchange {exchangeCount}/5 · {topic}
                  </span>
                  {exchangeCount >= 2 && (
                    <button onClick={endSession} className="px-4 py-2 bg-[#E8A2A2] text-white rounded-2xl text-sm font-bold hover:scale-105 transition-transform">
                      End & Score
                    </button>
                  )}
                </div>

                {/* Chat area */}
                <div className="m3-card !p-4 sm:!p-8 min-h-[300px] max-h-[500px] overflow-y-auto chat-scrollbar space-y-4">
                  {exchanges.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#A0C2D2] text-white rounded-tr-sm'
                          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="p-4 rounded-3xl rounded-tl-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5">
                        <div className="typing-indicator flex gap-1.5">
                          <span className="bg-[#A0C2D2]/50"></span>
                          <span className="bg-[#A0C2D2]/50"></span>
                          <span className="bg-[#A0C2D2]/50"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEnd} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="m3-card !p-2 flex gap-2 items-center shadow-xl">
                  <input
                    type="text" value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Explain the concept..."
                    className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-3 text-sm placeholder-gray-400 dark:text-white"
                    disabled={isLoading}
                  />
                  <button type="submit" disabled={!input.trim() || isLoading}
                    className="w-12 h-12 rounded-2xl bg-[#A0C2D2] text-white flex items-center justify-center shadow-lg disabled:opacity-30">
                    <Send size={20} />
                  </button>
                </form>

                {exchangeCount >= 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <button onClick={endSession} className="btn-primary px-8 py-4">
                      <Trophy size={20} /> End Session & Get Score
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* SCORING */}
            {phase === 'scoring' && (
              <motion.div key="scoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="m3-card text-center !py-20">
                <div className="w-16 h-16 bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] rounded-full animate-pulse mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-400 font-bold text-sm">Analyzing your teaching session...</p>
              </motion.div>
            )}

            {/* RESULTS */}
            {phase === 'results' && score && (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="m3-card text-center !p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E8A2A2] via-[#A0C2D2] to-v-primary" />
                  
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className={`w-32 h-32 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl rotate-6 ${
                      score.feynman_score >= 70 ? 'bg-v-secondary' : score.feynman_score >= 40 ? 'bg-v-primary' : 'bg-v-primary'
                    }`}>
                    <span className="text-5xl font-black text-white -rotate-6">{animatedScore}</span>
                  </motion.div>

                  <h2 className="text-3xl font-bold mb-2">
                    {score.feynman_score >= 80 ? 'Excellent Teacher!' : score.feynman_score >= 60 ? 'Good Understanding' : 'Keep Studying'}
                  </h2>
                  <p className="text-gray-400 mb-8">{score.feedback}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="bg-v-secondary/5 border border-v-secondary/10 rounded-3xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-v-secondary mb-2">Strong</p>
                      <div className="flex flex-wrap gap-1.5">
                        {score.strong_concepts.map((c, i) => (
                          <span key={i} className="text-xs bg-v-secondary/10 text-v-secondary dark:text-v-secondary px-2 py-1 rounded-lg font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-v-primary/5 border border-v-primary/10 rounded-3xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-v-primary mb-2">Needs Work</p>
                      <div className="flex flex-wrap gap-1.5">
                        {score.weak_concepts.map((c, i) => (
                          <span key={i} className="text-xs bg-v-primary/10 text-v-primary dark:text-v-primary px-2 py-1 rounded-lg font-medium">{c}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={resetSession} className="btn-primary px-8">Try Another Topic</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
