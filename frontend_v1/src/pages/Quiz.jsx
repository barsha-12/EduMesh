import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { generateQuiz } from '../services/ai';
import Navbar from '../components/ui/Navbar';
import GlassCard from '../components/ui/GlassCard';
import { Brain, Sparkles, Loader2, CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight, Clock } from 'lucide-react';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'Electronics', 'Data Structures',
  'Engineering Drawing', 'Economics',
];

export default function Quiz() {
  const { saveQuizResult, quizHistory, updateStats, addSubjectStudied } = useStudyStore();

  // Setup state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);

  // Quiz state
  const [questions, setQuestions] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  // Loading
  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState('setup'); // setup | quiz | results | history

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
    }]);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Finish quiz
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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Practice Quiz
              </h1>
              <p className="text-sm text-white/40 mt-1">Test your knowledge with AI-generated questions</p>
            </div>
            {phase !== 'setup' && (
              <button onClick={handleRetry} className="btn-secondary !px-3 !py-2 flex items-center gap-2 !text-xs">
                <RotateCcw size={14} /> New Quiz
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* ── SETUP PHASE ── */}
            {phase === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
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
                          placeholder="e.g. Linked Lists"
                          className="input-field !py-3"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5 ml-1">Number of Questions</label>
                      <div className="flex gap-2">
                        {[5, 10].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setNumQuestions(n)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              numQuestions === n
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-white/5 text-white/40 border border-white/5 hover:border-white/10'
                            }`}
                          >
                            {n} Questions
                          </button>
                        ))}
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
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          Start Quiz
                        </>
                      )}
                    </button>
                  </form>
                </GlassCard>

                {/* Quiz History */}
                {quizHistory.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white/60" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Past Quizzes
                    </h2>
                    <div className="space-y-3">
                      {quizHistory.slice(0, 5).map((quiz) => (
                        <GlassCard key={quiz.id} className="!p-4 !rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                quiz.score >= 70 ? 'bg-emerald-500/10' : quiz.score >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'
                              }`}>
                                <Brain className={`w-5 h-5 ${
                                  quiz.score >= 70 ? 'text-emerald-400' : quiz.score >= 40 ? 'text-amber-400' : 'text-red-400'
                                }`} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-white">{quiz.topic}</p>
                                <p className="text-xs text-white/40 flex items-center gap-2">
                                  {quiz.subject} • {quiz.correct}/{quiz.total} correct •
                                  <Clock size={10} />
                                  {new Date(quiz.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`text-2xl font-bold ${
                              quiz.score >= 70 ? 'text-emerald-400' : quiz.score >= 40 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {quiz.score}%
                            </span>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── QUIZ PHASE ── */}
            {phase === 'quiz' && questions && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Question {currentQ + 1} of {questions.length}</span>
                    <span>{score} correct</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <GlassCard className="!rounded-2xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentQ}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg mt-0.5 shrink-0">
                          Q{currentQ + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-white leading-relaxed">
                          {questions[currentQ].question}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {questions[currentQ].options.map((option, i) => {
                          let optionStyle = 'border-white/10 hover:border-white/20 hover:bg-white/5';
                          if (isAnswered) {
                            if (i === questions[currentQ].correctIndex) {
                              optionStyle = 'border-emerald-500/50 bg-emerald-500/10';
                            } else if (i === selectedAnswer && i !== questions[currentQ].correctIndex) {
                              optionStyle = 'border-red-500/50 bg-red-500/10';
                            } else {
                              optionStyle = 'border-white/5 opacity-50';
                            }
                          } else if (selectedAnswer === i) {
                            optionStyle = 'border-indigo-500/50 bg-indigo-500/10';
                          }

                          return (
                            <motion.button
                              key={i}
                              whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                              onClick={() => handleAnswer(i)}
                              disabled={isAnswered}
                              className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all duration-300 ${optionStyle}`}
                            >
                              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/60 shrink-0">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="text-sm text-white/80 flex-1">{option}</span>
                              {isAnswered && i === questions[currentQ].correctIndex && (
                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                              )}
                              {isAnswered && i === selectedAnswer && i !== questions[currentQ].correctIndex && (
                                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <AnimatePresence>
                        {isAnswered && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden"
                          >
                            <div className={`p-4 rounded-xl border ${
                              selectedAnswer === questions[currentQ].correctIndex
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-amber-500/5 border-amber-500/20'
                            }`}>
                              <p className="text-xs font-medium text-white/50 mb-1">
                                {selectedAnswer === questions[currentQ].correctIndex ? '✅ Correct!' : '❌ Incorrect'}
                              </p>
                              <p className="text-sm text-white/70">{questions[currentQ].explanation}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </GlassCard>

                {/* Next Button */}
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button onClick={handleNext} className="btn-primary flex items-center gap-2 w-full justify-center">
                      {currentQ < questions.length - 1 ? (
                        <>Next Question <ArrowRight size={16} /></>
                      ) : (
                        <>See Results <Trophy size={16} /></>
                      )}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── RESULTS PHASE ── */}
            {phase === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <GlassCard className="!rounded-2xl text-center !py-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                      scorePercent >= 70 ? 'bg-emerald-500/10 border-2 border-emerald-500/30' :
                      scorePercent >= 40 ? 'bg-amber-500/10 border-2 border-amber-500/30' :
                      'bg-red-500/10 border-2 border-red-500/30'
                    }`}
                  >
                    <span className={`text-3xl font-bold ${
                      scorePercent >= 70 ? 'text-emerald-400' :
                      scorePercent >= 40 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {scorePercent}%
                    </span>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {scorePercent >= 70 ? '🎉 Great Job!' : scorePercent >= 40 ? '👍 Good Effort!' : '💪 Keep Practicing!'}
                  </h2>
                  <p className="text-white/40 text-sm">
                    You got <span className="text-white font-semibold">{score} out of {questions.length}</span> questions correct
                  </p>
                  <p className="text-xs text-white/30 mt-1">{subject} • {topic}</p>

                  <div className="flex gap-3 justify-center mt-8">
                    <button onClick={handleRetry} className="btn-primary flex items-center gap-2">
                      <RotateCcw size={14} /> Take Another Quiz
                    </button>
                  </div>
                </GlassCard>

                {/* Review Answers */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white/40">Review Answers</h3>
                  {answers.map((a, i) => (
                    <GlassCard key={i} className="!p-4 !rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          a.isCorrect ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}>
                          {a.isCorrect
                            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            : <XCircle className="w-3.5 h-3.5 text-red-400" />
                          }
                        </div>
                        <div>
                          <p className="text-sm text-white/80 font-medium">{a.question}</p>
                          {!a.isCorrect && (
                            <p className="text-xs text-white/40 mt-1">
                              Your answer: <span className="text-red-400">{questions[i].options[a.selected]}</span> • 
                              Correct: <span className="text-emerald-400">{questions[i].options[a.correct]}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
