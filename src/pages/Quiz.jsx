import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { generateQuiz } from '../services/ai';
import { Brain, Sparkles, Loader2, CheckCircle, XCircle, RotateCcw, ArrowRight, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import InputField from '../components/ui/InputField';
import Pill from '../components/ui/Pill';

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Literature', 'Computer Science', 'Economics', 'Psychology',
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [phase, setPhase] = useState('setup'); // setup | quiz | results

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject || !topic.trim()) return;

    setIsGenerating(true);
    
    try {
      const subjectQuizzes = quizHistory.filter(q => q.subject === subject);
      const avgScore = subjectQuizzes.length > 0 ? (subjectQuizzes.reduce((a,q) => a+q.score,0)/subjectQuizzes.length) : 0;
      
      let difficultyHint = '';
      if (avgScore >= 80) difficultyHint = `The student is an expert (${avgScore}% avg). Make the questions highly challenging.`;
      else if (avgScore > 0 && avgScore < 50) difficultyHint = `The student struggles (${avgScore}% avg). Make foundational questions.`;
      else difficultyHint = 'Make it a mix of intermediate level questions.';

      const quiz = await generateQuiz(subject, topic, numQuestions, difficultyHint);
      if (!quiz) throw new Error('Failed to generate quiz.');

      setQuestions(quiz);
      setCurrentQ(0);
      setScore(0);
      setAnswers([]);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setPhase('quiz');
    } catch (err) {
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
      });
      addSubjectStudied(subject);
      setPhase('results');
    }
  };

  const handleRetry = () => {
    setPhase('setup');
    setQuestions(null);
  };

  const scorePercent = questions ? Math.round((score / questions.length) * 100) : 0;

  // Score Donut SVG
  const ScoreDonut = ({ value, size = 160 }) => {
    const radius = (size / 2) - 12;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    const isGood = value >= 70;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(204,204,204,0.20)" strokeWidth="10" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={`url(#scoreGrad)`} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isGood ? '#B2FFD4' : '#FFB0B0'} />
            <stop offset="100%" stopColor={isGood ? '#A8FFEC' : '#FFBBAA'} />
          </linearGradient>
        </defs>
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" className="font-display font-[800] text-[2.5rem]" fill="var(--text-primary)">
          {value}%
        </text>
      </svg>
    );
  };

  const getOptionState = (i) => {
    if (!isAnswered) {
      if (selectedAnswer === i) return 'selected';
      return 'idle';
    }
    if (i === questions[currentQ].correctIndex) return 'correct';
    if (i === selectedAnswer && i !== questions[currentQ].correctIndex) return 'wrong';
    return 'idle';
  };

  const optionStyles = {
    idle: 'bg-[rgba(255,255,255,0.72)] backdrop-blur-[16px] border-[1.5px] border-[rgba(255,255,255,0.55)] hover:border-periwinkle hover:bg-[rgba(178,204,255,0.08)]',
    selected: 'bg-[rgba(178,204,255,0.20)] border-[2px] border-periwinkle',
    correct: 'bg-[rgba(178,255,212,0.25)] border-[2px] border-mint',
    wrong: 'bg-[rgba(255,176,176,0.20)] border-[2px] border-rose',
  };

  const letterStyles = {
    idle: 'bg-pearl/30',
    selected: 'bg-gradient-to-br from-periwinkle to-lavender text-white',
    correct: 'bg-gradient-to-br from-lime to-mint text-primary',
    wrong: 'bg-gradient-to-br from-rose to-coral text-primary',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start justify-center min-h-[calc(100vh-128px)]"
    >
      <div className="w-full max-w-[720px]">
        <AnimatePresence mode="wait">

          {/* ═══ SETUP PHASE ═══ */}
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <GlassCard variant="seafoam" className="text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-seafoam to-mint flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Brain size={36} className="text-white" />
                </motion.div>
                <h1 className="font-display font-bold text-[1.8rem] text-primary mb-2">Practice Quiz</h1>
                <p className="font-body text-secondary text-sm mb-8">AI generates {numQuestions} MCQ questions for your chosen topic.</p>

                <form onSubmit={handleGenerate} className="space-y-5 text-left max-w-md mx-auto">
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
                      placeholder="e.g. Cellular Respiration"
                      required
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isGenerating || !subject || !topic.trim()}
                    className="w-full bg-gradient-to-br from-seafoam to-mint"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Quiz 🧠'
                    )}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {/* ═══ QUIZ PHASE ═══ */}
          {phase === 'quiz' && questions && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Progress Header */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-body font-semibold text-secondary text-sm">
                    Question {currentQ + 1} of {questions.length}
                  </p>
                  <button onClick={handleRetry} className="text-secondary hover:text-primary text-sm font-body font-medium flex items-center gap-1 transition-colors">
                    <RotateCcw size={14} /> Quit
                  </button>
                </div>
                <div className="w-full h-1.5 bg-[rgba(204,204,204,0.25)] rounded-pill overflow-hidden">
                  <motion.div
                    animate={{ width: `${((currentQ + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                    className="h-full rounded-pill bg-gradient-to-r from-seafoam to-mint"
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <GlassCard variant="seafoam">
                <div className="flex items-start gap-3 mb-6">
                  <span className="shrink-0 w-10 h-10 rounded-full bg-seafoam/30 flex items-center justify-center font-body font-semibold text-primary text-sm">
                    Q{currentQ + 1}
                  </span>
                  <p className="font-body font-semibold text-[1.15rem] text-primary leading-relaxed">
                    {questions[currentQ].question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {questions[currentQ].options.map((option, i) => {
                    const state = getOptionState(i);
                    return (
                      <motion.button
                        key={i}
                        whileTap={!isAnswered ? { scale: 1.02 } : {}}
                        onClick={() => handleAnswer(i)}
                        disabled={isAnswered}
                        className={`w-full p-4 rounded-card text-left flex items-center gap-4 transition-all duration-300 ${optionStyles[state]}`}
                      >
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-mono text-sm font-normal transition-all ${letterStyles[state]}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="font-body text-base text-primary flex-1">{option}</span>
                        {isAnswered && i === questions[currentQ].correctIndex && (
                          <Check size={20} className="text-mint shrink-0" />
                        )}
                        {isAnswered && i === selectedAnswer && i !== questions[currentQ].correctIndex && (
                          <X size={20} className="text-rose shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Submit / Next */}
                {!isAnswered ? (
                  <Button 
                    size="lg" 
                    disabled={selectedAnswer === null}
                    onClick={() => handleAnswer(selectedAnswer)}
                    className="w-full mt-6"
                  >
                    Submit Answer →
                  </Button>
                ) : (
                  /* Explanation panel */
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <GlassCard variant="lavender" interactive={false} className="border-l-4 border-l-lavender">
                      <h4 className="font-body font-semibold text-primary mb-2">Why this answer?</h4>
                      <p className="font-body text-secondary text-sm leading-relaxed">{questions[currentQ].explanation}</p>
                    </GlassCard>
                    <Button size="lg" onClick={handleNext} className="w-full mt-4">
                      {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results →'}
                    </Button>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* ═══ RESULTS PHASE ═══ */}
          {phase === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <GlassCard variant="base" className="text-center">
                {/* Score Circle */}
                <div className="flex justify-center mb-6">
                  <ScoreDonut value={scorePercent} />
                </div>

                {/* Title */}
                <h2 className="font-display font-bold text-[1.5rem] mb-2">
                  {scorePercent >= 70 ? (
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-lavender to-periwinkle">Excellent! 🎉</span>
                  ) : scorePercent >= 50 ? (
                    'Good effort! 📚'
                  ) : (
                    <span className="text-coral">Keep practicing! 💪</span>
                  )}
                </h2>
                <p className="font-body font-medium text-secondary mb-8">
                  You answered {score}/{questions.length} correctly
                </p>

                {/* Results breakdown */}
                <div className="space-y-2 mb-8 text-left">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-[12px] bg-[rgba(255,255,255,0.5)]">
                      <span className="font-mono text-sm text-secondary w-8">Q{i+1}</span>
                      <span className="font-body text-sm text-primary flex-1 truncate">{a.question}</span>
                      <Pill variant={a.isCorrect ? 'correct' : 'wrong'} className="text-[0.7rem]">
                        {a.isCorrect ? 'Correct' : 'Review'}
                      </Pill>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="ghost" onClick={handleRetry} className="border-[1.5px] border-taupe">
                    Try Again
                  </Button>
                  <Button variant="primary" onClick={() => { handleRetry(); setTopic(''); setSubject(''); }}>
                    New Topic
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
