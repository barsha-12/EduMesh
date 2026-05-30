import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, ChevronDown, ChevronUp, Coffee } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';
import { supabase } from '../../lib/supabase';

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;

export default function PomodoroTimer() {
  const addToast = useToastStore((s) => s.addToast);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WORK_MINUTES * 60);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef(null);

  const totalTime = isBreak ? BREAK_MINUTES * 60 : WORK_MINUTES * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const logSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('study_sessions').insert([{
        user_id: session.user.id,
        duration_minutes: WORK_MINUTES,
        session_type: 'pomodoro',
      }]);

      // Check if first session today to update streak
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySessions } = await supabase
        .from('study_sessions')
        .select('id')
        .eq('user_id', session.user.id)
        .gte('created_at', today + 'T00:00:00')
        .lte('created_at', today + 'T23:59:59');

      if (todaySessions && todaySessions.length === 1) {
        // First session today — update streak
        const { data: stats } = await supabase
          .from('user_stats')
          .select('streak, last_study_date')
          .eq('user_id', session.user.id)
          .single();

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = stats?.last_study_date === yesterday ? (stats.streak || 0) + 1 : 1;

        await supabase.from('user_stats').upsert({
          user_id: session.user.id,
          streak: newStreak,
          last_study_date: today,
          updated_at: new Date().toISOString(),
        });

        addToast(`🔥 Streak updated: ${newStreak} day${newStreak > 1 ? 's' : ''}!`, 'success');
      }
    }
  }, [addToast]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      if (!isBreak) {
        // Work session complete
        setSessions((s) => s + 1);
        logSession();
        addToast('⏰ Work session complete! Take a break.', 'success');
        setIsBreak(true);
        setTimeLeft(BREAK_MINUTES * 60);
        setIsRunning(false);
      } else {
        // Break complete
        addToast('☕ Break over! Ready for another round?', 'info');
        setIsBreak(false);
        setTimeLeft(WORK_MINUTES * 60);
        setIsRunning(false);
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, isBreak, logSession, addToast]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_MINUTES * 60);
    clearInterval(intervalRef.current);
  };

  // Circular progress SVG
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 right-4 z-[100]"
    >
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="glass-base !p-6 shadow-2xl mb-3 w-[220px]"
          >
            <div className="text-center space-y-4">
              <p className="text-[10px] font-body font-bold uppercase tracking-widest text-secondary">
                {isBreak ? '☕ Break Time' : '📚 Focus Time'}
              </p>

              {/* Circular Progress */}
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r={radius} fill="none" stroke="currentColor" strokeWidth="4"
                    className="text-[rgba(204,204,204,0.3)]" />
                  <motion.circle
                    cx="48" cy="48" r={radius} fill="none"
                    strokeWidth="4" strokeLinecap="round"
                    stroke={isBreak ? 'url(#periGrad)' : 'url(#coralGrad)'}
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5 }}
                  />
                  <defs>
                    <linearGradient id="periGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-periwinkle)" />
                      <stop offset="100%" stopColor="var(--color-lavender)" />
                    </linearGradient>
                    <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-coral)" />
                      <stop offset="100%" stopColor="var(--color-peach)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <span className="text-lg font-bold font-display tabular-nums">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3">
                <button onClick={toggleTimer}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isRunning 
                      ? 'bg-[rgba(255,187,170,0.2)] text-coral' 
                      : 'bg-[rgba(208,170,255,0.15)] text-lavender hover:bg-[rgba(208,170,255,0.25)]'
                  }`}>
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button onClick={resetTimer}
                  className="w-10 h-10 rounded-2xl bg-[rgba(204,204,204,0.2)] flex items-center justify-center text-secondary hover:text-primary transition-colors">
                  <RotateCcw size={16} />
                </button>
              </div>

              <p className="text-[10px] font-body text-muted">{sessions} session{sessions !== 1 ? 's' : ''} today</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 ${
          isRunning
            ? 'bg-gradient-to-br from-coral to-peach text-primary shadow-[0_4px_16px_rgba(255,187,170,0.4)] animate-pulse-soft'
            : 'bg-[rgba(255,255,255,0.9)] backdrop-blur-md text-secondary border-[1.5px] border-[rgba(204,204,204,0.5)] shadow-sm'
        }`}
      >
        {isRunning ? (
          <span className="text-xs font-bold font-display tabular-nums text-primary">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        ) : (
          <Timer size={22} className={!isCollapsed ? 'text-lavender' : ''} />
        )}
      </button>
    </motion.div>
  );
}
