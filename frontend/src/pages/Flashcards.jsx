import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useToastStore } from '../store/toastStore';
import { RotateCcw, ChevronLeft, ChevronRight, Sparkles, Brain, CheckCircle, Clock, Layers } from 'lucide-react';

// SM-2 Algorithm
function sm2(quality, repetitions, easeFactor, interval) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newInterval;
  let newReps;

  if (quality < 3) {
    newReps = 0;
    newInterval = 1;
  } else {
    newReps = repetitions + 1;
    if (newReps === 1) newInterval = 1;
    else if (newReps === 2) newInterval = 6;
    else newInterval = Math.round(interval * newEF);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    ease_factor: newEF,
    interval: newInterval,
    repetitions: newReps,
    next_review: nextReview.toISOString().split('T')[0],
  };
}

const ratingLabels = [
  { value: 1, label: 'Forgot', color: 'bg-v-primary' },
  { value: 2, label: 'Hard', color: 'bg-v-accent' },
  { value: 3, label: 'OK', color: 'bg-v-primary' },
  { value: 4, label: 'Good', color: 'bg-v-secondary' },
  { value: 5, label: 'Easy', color: 'bg-[#A0C2D2]' },
];

export default function Flashcards() {
  const { flashcards, loadFlashcards, getDueFlashcards, updateFlashcard } = useStudyStore();
  const addToast = useToastStore((s) => s.addToast);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dueCards, setDueCards] = useState([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  useEffect(() => {
    loadFlashcards();
  }, []);

  useEffect(() => {
    setDueCards(getDueFlashcards());
  }, [flashcards]);

  const currentCard = dueCards[currentIndex];

  const handleRate = async (quality) => {
    if (!currentCard) return;

    const updates = sm2(
      quality,
      currentCard.repetitions || 0,
      currentCard.ease_factor || 2.5,
      currentCard.interval || 1
    );

    await updateFlashcard(currentCard.id, updates);
    setReviewed((r) => r + 1);
    setIsFlipped(false);

    if (currentIndex < dueCards.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    } else {
      setSessionComplete(true);
      addToast('Flashcard session complete! 🎉', 'success');
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
        <main className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
          <div className="space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Flashcards</h1>
              <p className="text-sm text-gray-400">Spaced repetition for long-term memory.</p>
            </div>
            <div className="m3-card text-center !py-24">
              <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 mb-2">No flashcards yet.</p>
              <p className="text-sm text-gray-400">Generate study notes first, then click "Make Flashcards" to create them.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (sessionComplete || dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
        <main className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
          <div className="space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Flashcards</h1>
            </div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="m3-card text-center !py-16"
            >
              <div className="w-20 h-20 rounded-3xl bg-v-secondary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-v-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">All caught up! 🎉</h2>
              <p className="text-gray-400 mb-2">
                {reviewed > 0
                  ? `You reviewed ${reviewed} card${reviewed > 1 ? 's' : ''} this session.`
                  : 'No cards due for review right now.'}
              </p>
              <p className="text-sm text-gray-400">
                Total flashcards: {flashcards.length} · 
                Due today: {dueCards.length}
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
      <main className="max-w-4xl mx-auto px-6 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Flashcards</h1>
              <p className="text-sm text-gray-400">
                Card {currentIndex + 1} of {dueCards.length} due · {reviewed} reviewed
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock size={14} />
              <span>{flashcards.length} total cards</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#E8A2A2] to-[#A0C2D2] rounded-full"
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Card */}
          <div className="flex justify-center" style={{ perspective: '1000px' }}>
            <motion.div
              className="w-full max-w-xl cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentCard.id}-${isFlipped}`}
                  initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="m3-card !p-12 min-h-[280px] flex flex-col items-center justify-center text-center shadow-2xl"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                    {isFlipped ? 'Answer' : 'Question'} · {currentCard.subject}
                  </p>
                  <p className={`text-xl font-bold leading-relaxed ${isFlipped ? 'text-[#A0C2D2]' : ''}`}>
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                  <p className="text-xs text-gray-400 mt-8">
                    {isFlipped ? 'Rate your recall below' : 'Tap to reveal answer'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Rating Buttons — only show when flipped */}
          <AnimatePresence>
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex justify-center gap-3"
              >
                {ratingLabels.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => handleRate(r.value)}
                    className={`px-5 py-3 rounded-2xl text-white font-bold text-sm ${r.color} hover:scale-105 transition-transform shadow-lg`}
                  >
                    {r.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
