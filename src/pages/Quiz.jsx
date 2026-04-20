import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { generateQuiz } from '../services/ai';
import { Brain, Sparkles, Loader2, CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight, History, Target, ChevronRight, AlertTriangle, BookMarked, MessageSquare, Swords } from 'lucide-react';
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
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [pastBattleScore, setPastBattleScore] = useState(null);

  const [questions, setQuestions] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState('setup'); // setup | quiz | results

  // Concept Battle - Check if topic is in history
  const handleTopicChange = (val) => {
    setTopic(val);
    const pastQuizzes = quizHistory.filter(q => q.topic.toLowerCase() === val.toLowerCase());
    if (pastQuizzes.length > 0) {
      setIsBattleMode(true);
      setPastBattleScore(pastQuizzes[0].score);
    } else {
      setIsBattleMode(false);
      setPastBattleScore(null);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic.trim()) return;

    setIsGenerating(true);
    
    try {
      // Adaptive logic calculation
      const subjectQuizzes = quizHistory.filter(q => q.subject === subject);
      const avgScore = subjectQuizzes.length > 0 ? (subjectQuizzes.reduce((a,q) => a+q.score,0)/subjectQuizzes.length) : 0;
      
      let difficultyHint = '';
      if (avgScore >= 80) difficultyHint = `The student is an expert (${avgScore}% avg). Make the questions highly challenging and conceptual.`;
      else if (avgScore > 0 && avgScore < 50) difficultyHint = `The student struggles with this (${avgScore}% avg). Make the questions foundational to build confidence.`;
      else difficultyHint = 'Make it a mix of intermediate level questions.';

      const quiz = await generateQuiz(subject, topic, numQuestions, difficultyHint);

      if (!quiz) {
        throw new Error('Neural mapping failed. Please refine your topic.');
      }

      setQuestions(quiz);
      setCurrentQ(0);
      setScore(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsFinished(false);
      setPhase('quiz');
    } catch (err) {
      console.error('Quiz generation error:', err);
      alert(err.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
  };

  const scorePercent = questions ? Math.round((score / questions.length) * 100) : 0;
  const getWeaknesses = () => answers.filter(a => !a.isCorrect);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
      <main className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Knowledge Check</h1>
              <p className="text-sm text-gray-400">Validate your understanding with AI, adaptive difficulty, and battle mode.</p>
            </div>
            {phase !== 'setup' && (
              <button onClick={handleRetry} className="flex items-center gap-2 px-5 py-2.5 bg-black/5 dark:bg-white/5 text-gray-400 hover:text-[#A0C2D2] rounded-2xl border border-gray-100 dark:border-white/5 transition-all text-sm font-bold uppercase tracking-widest">
                <RotateCcw size={16} /> Quit Quiz
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            
            {/* ── SETUP PHASE ── */}
            {phase === 'setup' && (
              <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="m3-card shadow-xl bg-white dark:bg-gray-800">
                    <form onSubmit={handleGenerate} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Subject</label>
                          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field" required>
                            <option value="">Select subject...</option>
                            {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">Topic Name</label>
                          <input type="text" value={topic} onChange={(e) => handleTopicChange(e.target.value)} placeholder="e.g. Cellular Respiration" className="input-field" required />
                        </div>
                      </div>

                      {/* Battle Mode Alert */}
                      <AnimatePresence>
                        {isBattleMode && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="bg-v-secondary/10 border border-v-secondary/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-v-secondary text-white flex items-center justify-center shrink-0">
                                <Swords size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-v-secondary dark:text-v-secondary text-sm">Battle Your Past Self</p>
                                <p className="text-xs text-v-secondary dark:text-v-secondary">Previous score for this topic was <span className="font-bold">{pastBattleScore}%</span>. Can you beat it?</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400 ml-1">How many questions?</label>
                        <div className="flex gap-3">
                          {[5, 10, 15].map((n) => (
                            <button key={n} type="button" onClick={() => setNumQuestions(n)}
                              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all border ${
                                numQuestions === n ? 'bg-[#A0C2D2] text-white border-[#A0C2D2] shadow-lg' : 'bg-gray-50 dark:bg-white/5 text-gray-400 border-gray-100 hover:border-gray-200'
                              }`}>
                              {n} Qs
                            </button>
                          ))}
                        </div>
                      </div>

                      <button type="submit" disabled={isGenerating || !subject || !topic.trim()} className="btn-primary w-full py-4 text-sm uppercase tracking-widest">
                        {isGenerating ? (<><Loader2 className="w-5 h-5 animate-spin" /> Preparing Adaptive AI Questions...</>) : (<><Brain className="w-5 h-5" /> Initialize Quiz</>)}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="m3-card bg-[#A0C2D2] text-white shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <Target className="w-6 h-6 text-white" />
                      <h3 className="font-bold">Adaptive Engine</h3>
                    </div>
                    <p className="text-xs text-v-secondary leading-relaxed">
                      EduMesh dynamically tailors question difficulty based on your past mastery in this subject. If your historic average score is low, we ask foundational questions. If it's high, we test edge-cases.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"><History size={14} /> Recent Performance</h3>
                    <div className="space-y-3">
                      {quizHistory.slice(0, 3).map((quiz) => (
                        <div key={quiz.id} className="m3-card !p-4 border-transparent hover:border-[#A0C2D2]/20">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                               <p className="text-sm font-bold truncate">{quiz.topic}</p>
                               <p className="text-[10px] text-gray-400 mt-0.5">{quiz.score}% ({quiz.subject})</p>
                            </div>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${quiz.score >= 70 ? 'bg-v-secondary/10 text-v-secondary' : 'bg-v-primary/10 text-v-primary'}`}>
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
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto space-y-8">
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end px-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Question {currentQ + 1} of {questions.length}</p>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{subject} &bull; {topic}</h3>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-bold text-[#A0C2D2]">{Math.round(((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      animate={{ width: `${((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                      className="h-full bg-[#A0C2D2] rounded-full shadow-lg" transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>

                {/* 3D Flip Card Container */}
                <div style={{ perspective: '1200px' }} className="h-[450px] relative">
                  <motion.div
                    className="w-full h-full absolute"
                    style={{ transformStyle: 'preserve-3d' }}
                    initial={false}
                    animate={{ rotateY: isAnswered ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    {/* Front Face (Question) */}
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 shadow-2xl backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                      <h2 className="text-xl sm:text-2xl font-bold leading-relaxed mb-8">{questions[currentQ].question}</h2>
                      <div className="grid grid-cols-1 gap-4">
                        {questions[currentQ].options.map((option, i) => (
                          <motion.button key={i} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}
                            onClick={() => handleAnswer(i)}
                            className="bg-gray-50 border-gray-100 hover:border-[#A0C2D2]/30 w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all dark:bg-white/5 dark:border-white/5">
                            <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-sm font-bold">{String.fromCharCode(65 + i)}</div>
                            <span className="font-medium text-sm sm:text-base flex-1">{option}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Back Face (Answer + Explanation) */}
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 shadow-2xl" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                      <div className="flex flex-col h-full justify-between">
                         <div>
                            <div className={`flex items-center gap-3 mb-6 p-4 rounded-2xl ${selectedAnswer === questions[currentQ].correctIndex ? 'bg-v-secondary/10 text-v-secondary dark:text-v-secondary' : 'bg-v-primary/10 text-v-primary dark:text-v-primary'}`}>
                               {selectedAnswer === questions[currentQ].correctIndex ? <CheckCircle className="w-8 h-8 text-v-secondary shrink-0" /> : <XCircle className="w-8 h-8 text-v-primary shrink-0" />}
                               <div>
                                  <p className="font-bold text-lg">{selectedAnswer === questions[currentQ].correctIndex ? 'Correct!' : 'Incorrect'}</p>
                                  <p className="text-sm font-medium">The correct answer was <span className="font-bold underline">{questions[currentQ].options[questions[currentQ].correctIndex]}</span></p>
                               </div>
                            </div>
                            
                            <div className="bg-[#A0C2D2]/5 border border-[#A0C2D2]/10 rounded-2xl p-6">
                               <div className="flex items-center gap-2 mb-3 text-[#A0C2D2]">
                                  <Sparkles size={16} />
                                  <p className="text-xs font-bold uppercase tracking-widest">AI Expert Context</p>
                               </div>
                               <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{questions[currentQ].explanation}</p>
                            </div>
                         </div>
                         
                         <button onClick={handleNext} className="btn-primary w-full py-4 shadow-xl">
                            {currentQ < questions.length - 1 ? 'Next Question' : 'Complete Quiz'} <ArrowRight size={18} />
                         </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── RESULTS PHASE ── */}
            {phase === 'results' && (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-8 pb-20">
                <div className="m3-card shadow-2xl bg-white dark:bg-gray-800 text-center !p-12 relative overflow-hidden">
                  
                  {isBattleMode && (
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-v-secondary/10 border border-v-secondary/20 text-v-secondary rounded-full text-xs font-bold whitespace-nowrap">
                        {scorePercent > pastBattleScore ? '🔥 You beat your past score of ' + pastBattleScore + '%!' : '😔 You scored lower than your past ' + pastBattleScore + '%'}
                     </div>
                  )}

                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
                    className={`w-32 h-32 mt-6 rounded-3xl mx-auto mb-8 flex items-center justify-center rotate-12 shadow-2xl ${scorePercent >= 70 ? 'bg-v-secondary text-white' : 'bg-[#A0C2D2] text-white'}`}>
                    <Trophy size={48} />
                  </motion.div>

                  <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>{scorePercent}% Mastery</h2>
                  <p className="text-gray-400 mb-8 font-medium">You identified {score} out of {questions.length} core concepts correctly.</p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={handleRetry} className="btn-primary px-10">Try New Assessment</button>
                    <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-200 rounded-2xl hover:bg-black/10 font-bold">
                       Return to Hub
                    </button>
                  </div>
                </div>

                {getWeaknesses().length > 0 && (
                   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
                      <div className="flex items-center gap-4 px-4">
                         <div className="w-10 h-10 rounded-xl bg-v-primary/10 flex items-center justify-center">
                            <AlertTriangle className="text-v-primary w-5 h-5" />
                         </div>
                         <h3 className="text-xl font-bold tracking-tight">AI Weakness Analysis</h3>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                         {getWeaknesses().map((w, i) => (
                            <div key={i} className="m3-card !bg-v-primary/5 border-v-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                               <div className="space-y-3 flex-1">
                                  <p className="text-[10px] font-black bg-v-primary text-white px-2 py-0.5 rounded-md uppercase w-fit inline-block tracking-widest">Needs Review</p>
                                  <h4 className="text-sm font-bold leading-relaxed">{w.question}</h4>
                                  <p className="text-xs text-gray-500 leading-relaxed italic">{w.explanation}</p>
                               </div>
                               <button onClick={() => navigate('/chat', { state: { initialMsg: `Explain this question I got wrong simpler: "${w.question}"` }})}
                                className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-v-primary/20 text-v-primary font-bold rounded-2xl hover:bg-v-primary hover:text-white transition-all text-xs">
                                  <MessageSquare size={14} /> Revise Topic
                               </button>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
