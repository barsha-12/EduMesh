import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { generateQuiz } from '../services/ai';
import { Brain, Sparkles, Loader2, CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight, Clock, Target, History, ChevronRight, AlertTriangle, BookMarked, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'Electronics', 'Data Structures',
  'Engineering Drawing', 'Economics',
];

export default function Quiz() {
  const { saveQuizResult, quizHistory, updateStats, addSubjectStudied } = useStudyStore();
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);

  const [questions, setQuestions] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState('setup'); // setup | quiz | results

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic.trim()) return;

    setIsGenerating(true);
    const quiz = await generateQuiz(subject, topic, numQuestions);
    setIsGenerating(false);

    if (!quiz) {
      alert('Failed to generate quiz. Please check your API key and try again.');
      return;
    }

    setQuestions(quiz);
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
    setPhase('quiz');
  };

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === questions[currentQ].correctIndex;
    if (isCorrect) setScore((s) => s + 1);

    setAnswers((a) => [...a, {
      question: questions[currentQ].question,
      selected: optionIndex,
      correct: questions[currentQ].correctIndex,
      isCorrect,
      explanation: questions[currentQ].explanation
    }]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      const finalScore = Math.round((score / questions.length) * 100);
      saveQuizResult({
        id: Date.now().toString(),
        subject,
        topic,
        score: finalScore,
        correct: score,
        total: questions.length,
        createdAt: new Date().toISOString(),
      });
      updateStats({
        totalQuizzes: (useStudyStore.getState().studyStats.totalQuizzes || 0) + 1,
        totalCorrectAnswers: (useStudyStore.getState().studyStats.totalCorrectAnswers || 0) + score,
        totalQuestions: (useStudyStore.getState().studyStats.totalQuestions || 0) + questions.length,
      });
      addSubjectStudied(subject);
      setIsFinished(true);
      setPhase('results');
    }
  };

  const handleRetry = () => {
    setPhase('setup');
    setQuestions(null);
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsFinished(false);
  };

  const scorePercent = questions ? Math.round((score / questions.length) * 100) : 0;

  // Weakness Analysis Logic
  const getWeaknesses = () => {
     return answers.filter(a => !a.isCorrect);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
      <main className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Knowledge Check</h1>
              <p className="text-sm text-gray-400">Validate your understanding with AI-curated assessments.</p>
            </div>
            {phase !== 'setup' && (
              <button 
                onClick={handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-black/5 dark:bg-white/5 text-gray-400 hover:text-[#A0C2D2] rounded-2xl border border-gray-100 dark:border-white/5 transition-all text-sm font-bold uppercase tracking-widest"
              >
                <RotateCcw size={16} /> Quit Quiz
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* ── SETUP PHASE ── */}
            {phase === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-2 space-y-6">
                  <div className="m3-card shadow-xl bg-white dark:bg-gray-800">
                    <form onSubmit={handleGenerate} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Academic Subject</label>
                          <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="input-field"
                            required
                          >
                            <option value="">Select subject...</option>
                            {SUBJECTS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Assessment Topic</label>
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Cellular Respiration"
                            className="input-field"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Difficulty & Scope</label>
                        <div className="flex gap-3">
                          {[5, 10, 15].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNumQuestions(n)}
                              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border ${
                                numQuestions === n
                                  ? 'bg-[#A0C2D2] text-white border-[#A0C2D2] shadow-lg shadow-[#A0C2D2]/20'
                                  : 'bg-gray-50 dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/5 hover:border-gray-200'
                              }`}
                            >
                              {n} Qs
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isGenerating || !subject || !topic.trim()}
                        className="btn-primary w-full py-4 text-sm uppercase tracking-widest"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Calibrating Intelligence...
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5" />
                            Initialize Examination
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="m3-card bg-[#A0C2D2] text-white shadow-xl shadow-[#A0C2D2]/20">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold">Pro Analytics</h3>
                    </div>
                    <p className="text-xs text-indigo-100 mb-6">Track your mastery across different subjects.</p>
                    <div className="space-y-4">
                       <div className="bg-white/10 rounded-2xl p-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Recent Avg Score</p>
                          <p className="text-2xl font-bold">{quizHistory.length > 0 ? `${Math.round(quizHistory.reduce((a,q) => a+q.score,0)/quizHistory.length)}%` : '--'}</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                       <History size={14} /> Recent Performance
                    </h3>
                    <div className="space-y-3">
                      {quizHistory.slice(0, 3).map((quiz) => (
                        <div key={quiz.id} className="m3-card !p-4 bg-white dark:bg-gray-800 border-transparent hover:border-[#A0C2D2]/20">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                               <p className="text-sm font-bold truncate">{quiz.topic}</p>
                               <p className="text-[10px] text-gray-400 mt-0.5">{quiz.score}% Accuracy</p>
                            </div>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${quiz.score >= 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── QUIZ PHASE ── */}
            {phase === 'quiz' && questions && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-end px-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Question {currentQ + 1} of {questions.length}</p>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{subject} &bull; {topic}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-bold text-[#A0C2D2]">{Math.round(((currentQ + 1) / questions.length) * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 ring-1 ring-gray-200 dark:ring-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-[#A0C2D2] via-[#E8A2A2] to-[#A0C2D2] rounded-full shadow-lg shadow-[#A0C2D2]/20"
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="m3-card shadow-2xl bg-white dark:bg-gray-800 !p-8 sm:!p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#A0C2D2]" />
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQ}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-10"
                    >
                      <h2 className="text-xl sm:text-2xl font-bold leading-relaxed">
                        {questions[currentQ].question}
                      </h2>

                      <div className="grid grid-cols-1 gap-4">
                        {questions[currentQ].options.map((option, i) => {
                          let style = 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 hover:border-[#A0C2D2]/20 hover:bg-[#A0C2D2]/5';
                          
                          if (isAnswered) {
                            if (i === questions[currentQ].correctIndex) {
                              style = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-400';
                            } else if (i === selectedAnswer) {
                               style = 'bg-red-500/10 border-red-500/40 text-red-900 dark:text-red-400';
                            } else {
                               style = 'bg-gray-50/50 dark:bg-white/[0.02] border-transparent opacity-40';
                            }
                          } else if (selectedAnswer === i) {
                            style = 'bg-[#A0C2D2]/10 border-[#A0C2D2]/40 text-[#A0C2D2]';
                          }

                          return (
                            <motion.button
                              key={i}
                              whileHover={!isAnswered ? { x: 8 } : {}}
                              whileTap={!isAnswered ? { scale: 0.98 } : {}}
                              onClick={() => handleAnswer(i)}
                              disabled={isAnswered}
                              className={`w-full p-6 rounded-3xl border text-left flex items-center gap-5 transition-all duration-300 ${style}`}
                            >
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${
                                isAnswered && i === questions[currentQ].correctIndex ? 'bg-emerald-500 text-white' : 
                                isAnswered && i === selectedAnswer ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-700'
                              }`}>
                                {String.fromCharCode(65 + i)}
                              </div>
                              <span className="text-sm sm:text-base font-medium flex-1">{option}</span>
                              {isAnswered && i === questions[currentQ].correctIndex && <CheckCircle className="w-6 h-6 shrink-0" />}
                              {isAnswered && i === selectedAnswer && i !== questions[currentQ].correctIndex && <XCircle className="w-6 h-6 shrink-0" />}
                            </motion.button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {isAnswered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-[#A0C2D2]/5 dark:bg-[#A0C2D2]/10 rounded-3xl p-6 border border-[#A0C2D2]/10"
                          >
                            <div className="flex items-start gap-4">
                               <div className="w-8 h-8 rounded-xl bg-[#A0C2D2] flex items-center justify-center shrink-0">
                                  <Sparkles className="w-4 h-4 text-white" />
                               </div>
                               <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-[#A0C2D2] mb-1">Expert Context</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{questions[currentQ].explanation}</p>
                               </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {isAnswered && (
                   <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleNext} 
                    className="btn-primary w-full py-5 text-base shadow-2xl shadow-[#A0C2D2]/40"
                   >
                     {currentQ < questions.length - 1 ? (
                        <>Continue to Next Question <ArrowRight size={20} /></>
                      ) : (
                        <>Finalize Results <Trophy size={20} /></>
                      )}
                   </motion.button>
                )}
              </motion.div>
            )}

            {/* ── RESULTS PHASE ── */}
            {phase === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto space-y-8 pb-20"
              >
                <div className="m3-card shadow-2xl bg-white dark:bg-gray-800 text-center !p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-[#A0C2D2] to-purple-600" />
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className={`w-32 h-32 rounded-3xl mx-auto mb-8 flex items-center justify-center rotate-12 shadow-2xl ${
                      scorePercent >= 70 ? 'bg-emerald-500 text-white' : 'bg-[#A0C2D2] text-white'
                    }`}
                  >
                    <Trophy size={48} />
                  </motion.div>

                  <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>{scorePercent}% Mastery</h2>
                  <p className="text-gray-400 mb-8 font-medium">You identified {score} out of {questions.length} core concepts correctly.</p>

                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Subject Mastery</p>
                       <p className="text-xl font-bold">{scorePercent >= 70 ? 'Proficient' : 'Developing'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-3xl">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Academic Standing</p>
                       <p className="text-xl font-bold">{scorePercent >= 90 ? 'Expert' : scorePercent >= 70 ? 'Solid' : 'Needs Review'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={handleRetry} className="btn-primary px-10">
                      Try New Assessment
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 px-8 py-3 bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-200 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors font-bold">
                       Return to Hub
                    </button>
                  </div>
                </div>

                {/* ── WEAKNESS ANALYSIS (PHASE 3) ── */}
                {getWeaknesses().length > 0 && (
                   <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                   >
                      <div className="flex items-center gap-4 px-4">
                         <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                            <AlertTriangle className="text-rose-500 w-5 h-5" />
                         </div>
                         <h3 className="text-xl font-bold tracking-tight">AI Weakness Analysis</h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                         {getWeaknesses().map((w, i) => (
                            <div key={i} className="m3-card !bg-rose-500/5 border-rose-500/10 !p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                               <div className="space-y-3 flex-1">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">Weakness Detected</span>
                                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Question {answers.indexOf(w)+1}</p>
                                  </div>
                                  <h4 className="text-sm font-bold leading-relaxed">{w.question}</h4>
                                  <p className="text-xs text-gray-500 leading-relaxed italic">Concept failure: {w.explanation.split('.')[0]}.</p>
                               </div>
                               <button 
                                onClick={() => navigate('/chat', { state: { initialMsg: `Hey, I got this question wrong in my ${subject} quiz: "${w.question}". Can you explain the concept behind it simply?` }})}
                                className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-rose-500/20 text-rose-500 font-bold rounded-2xl hover:bg-rose-500 hover:text-white transition-all text-xs"
                               >
                                  <MessageSquare size={14} /> Review Concept
                               </button>
                            </div>
                         ))}
                      </div>

                      <div className="m3-card bg-[#A0C2D2] text-white !p-8 flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-indigo-100 italic">Recommended Action</p>
                            <h4 className="text-lg font-bold">Deep Dive into {topic} Core Principles</h4>
                         </div>
                         <ArrowRight />
                      </div>
                   </motion.div>
                )}

                {/* Review Table */}
                <div className="space-y-4 pt-10 border-t border-gray-100 dark:border-white/5">
                   <div className="flex items-center gap-4 px-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                         <BookMarked className="text-gray-400 w-5 h-5" />
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-gray-400">Response History</h3>
                   </div>
                   <div className="space-y-3">
                      {answers.map((a, i) => (
                        <div key={i} className="m3-card bg-white dark:bg-gray-800 border-transparent hover:border-black/5 dark:hover:border-white/5 !p-6 flex items-start gap-4">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${a.isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                              {a.isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold leading-tight">{a.question}</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                 <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${a.isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {a.isCorrect ? 'Correct Path' : 'Wrong Choice'}
                                 </span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
