import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useToastStore } from '../store/toastStore';
import { CheckCircle, Clock, Layers } from 'lucide-react';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';

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
  { value: 1, label: 'Forgot', color: 'bg-rose text-[#3A3C4A]' },
  { value: 2, label: 'Hard', color: 'bg-peach text-[#3A3C4A]' },
  { value: 3, label: 'OK', color: 'bg-lemon text-[#3A3C4A]' },
  { value: 4, label: 'Good', color: 'bg-mint text-[#3A3C4A]' },
  { value: 5, label: 'Easy', color: 'bg-periwinkle text-white' },
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
      <div className="min-h-screen bg-[#FAFAF5] text-[#3A3C4A] font-body relative overflow-hidden">
        <AnimatedBackground />
        <main className="max-w-4xl mx-auto px-6 py-8 sm:py-16 relative z-10">
          <div className="space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold tracking-tight">Flashcards</h1>
              <p className="text-sm font-body text-secondary">Spaced repetition for long-term memory.</p>
            </div>
            <GlassCard interactive={false} className="text-center !py-24 shadow-sm border-dashed">
              <div className="w-20 h-20 rounded-full bg-lavender/30 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-10 h-10 text-periwinkle" />
              </div>
              <h2 className="text-xl font-display font-bold text-primary mb-2">No flashcards yet</h2>
              <p className="text-sm text-secondary">Generate study notes first, then click "Make Flashcards" to create them.</p>
            </GlassCard>
          </div>
        </main>
      </div>
    );
  }

  if (sessionComplete || dueCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF5] text-[#3A3C4A] font-body relative overflow-hidden">
        <AnimatedBackground />
        <main className="max-w-4xl mx-auto px-6 py-8 sm:py-16 relative z-10">
          <div className="space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold tracking-tight">Flashcards</h1>
              <p className="text-sm font-body text-secondary">Spaced repetition for long-term memory.</p>
            </div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <GlassCard interactive={false} className="text-center !py-20 border-[1.5px] border-mint/40 shadow-sm bg-gradient-to-b from-white/60 to-mint/10">
                <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-mint to-seafoam flex items-center justify-center mx-auto mb-8 shadow-[0_8px_32px_rgba(168,255,236,0.4)]">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="font-display text-[2rem] font-bold mb-3 text-primary">All caught up! 🎉</h2>
                <p className="text-secondary text-[1.1rem] mb-8">
                  {reviewed > 0
                    ? `Great job! You reviewed ${reviewed} card${reviewed > 1 ? 's' : ''} this session.`
                    : 'You have no cards due for review right now.'}
                </p>
                
                <div className="flex items-center justify-center gap-6 text-sm font-medium">
                  <div className="px-5 py-2.5 rounded-full bg-white/60 border border-pearl shadow-sm">
                    <span className="text-muted">Total Cards:</span> <span className="text-primary font-bold">{flashcards.length}</span>
                  </div>
                  <div className="px-5 py-2.5 rounded-full bg-white/60 border border-pearl shadow-sm">
                    <span className="text-muted">Due Today:</span> <span className="text-primary font-bold">0</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#3A3C4A] font-body relative overflow-hidden">
      <AnimatedBackground />
      <main className="max-w-4xl mx-auto px-6 py-8 sm:py-16 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold tracking-tight">Flashcards</h1>
              <p className="text-sm font-medium text-secondary">
                Card <span className="text-periwinkle font-bold">{currentIndex + 1}</span> of {dueCards.length} due · {reviewed} reviewed
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted bg-white/60 px-4 py-2 rounded-full border border-pearl shadow-sm">
              <Clock size={16} className="text-periwinkle" />
              <span>{flashcards.length} total cards</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 bg-taupe/20 rounded-full overflow-hidden shadow-inner">
            <motion.div
              animate={{ width: `${((currentIndex + 1) / dueCards.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-lavender to-periwinkle rounded-full"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* Card Container */}
          <div className="flex justify-center" style={{ perspective: '1200px' }}>
            <motion.div
              className="w-full max-w-2xl cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentCard.id}-${isFlipped}`}
                  initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0, scale: 0.95 }}
                  animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                  exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                  className="glass-base !rounded-[32px] p-12 min-h-[340px] flex flex-col items-center justify-center text-center shadow-[0_16px_40px_rgba(208,170,255,0.15)] border-[1.5px] border-white/60 relative overflow-hidden"
                  style={{ background: isFlipped ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)' }}
                >
                  {/* Decorative background blurs inside card */}
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] opacity-40 transition-colors duration-500 ${isFlipped ? 'bg-mint' : 'bg-lavender'}`}></div>
                  <div className={`absolute -bottom-12 -left-12 w-32 h-32 rounded-full blur-[40px] opacity-40 transition-colors duration-500 ${isFlipped ? 'bg-periwinkle' : 'bg-peach'}`}></div>

                  <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-black/5 text-[0.75rem] font-bold uppercase tracking-[0.15em] text-muted mb-8">
                      {isFlipped ? 'Answer' : 'Question'} <span className="opacity-40 mx-2">|</span> <span className={isFlipped ? 'text-periwinkle' : 'text-lavender'}>{currentCard.subject}</span>
                    </div>
                    
                    <h2 className={`font-display text-[1.6rem] sm:text-[2rem] font-bold leading-snug max-w-[90%] ${isFlipped ? 'text-[#3A3C4A]' : 'text-[#3A3C4A]'}`}>
                      {isFlipped ? currentCard.back : currentCard.front}
                    </h2>
                    
                    <p className="text-[0.85rem] font-medium text-muted mt-10 opacity-70">
                      {isFlipped ? 'Rate your recall below' : 'Tap to reveal answer'}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Rating Buttons */}
          <div className="h-[60px] flex justify-center items-center">
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3, staggerChildren: 0.05 }}
                  className="flex flex-wrap justify-center gap-3 sm:gap-4"
                >
                  {ratingLabels.map((r, idx) => (
                    <motion.button
                      key={r.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={(e) => { e.stopPropagation(); handleRate(r.value); }}
                      className={`px-6 py-3 rounded-[16px] font-bold text-[0.95rem] ${r.color} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all border border-white/40`}
                    >
                      {r.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </motion.div>
      </main>
    </div>
  );
}
