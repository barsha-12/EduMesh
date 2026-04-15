import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Brain, Flame, Clock, Trophy, BookOpen, ArrowRight, Sparkles, Target, BarChart2, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { studyStats, savedNotes, quizHistory, syncFromSupabase } = useStudyStore();

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    syncFromSupabase();
  }, []);

  const quickActions = [
    {
      title: 'AI Study Chat',
      desc: 'Ask any doubt and get instant explanations',
      icon: MessageSquare,
      color: 'from-indigo-500 to-blue-600',
      link: '/chat',
      badge: 'Most Used',
    },
    {
      title: 'Generate Notes',
      desc: 'AI creates structured notes on any topic',
      icon: FileText,
      color: 'from-purple-500 to-pink-600',
      link: '/notes',
      badge: null,
    },
    {
      title: 'Practice Quiz',
      desc: 'Test yourself with AI-generated MCQs',
      icon: Brain,
      color: 'from-amber-500 to-orange-600',
      link: '/quiz',
      badge: null,
    },
  ];

  const stats = [
    { label: 'Study Streak', value: `${studyStats.streak || 0} days`, icon: Flame, color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    { label: 'Notes Created', value: savedNotes.length, icon: FileText, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { label: 'Quizzes Taken', value: quizHistory.length, icon: Brain, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { label: 'Avg Score', value: quizHistory.length > 0 ? `${Math.round(quizHistory.reduce((a, q) => a + q.score, 0) / quizHistory.length)}%` : '—', icon: Target, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Greeting */}
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              <Sparkles size={12} /> Welcome back
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Hey, <span className="text-gradient">{displayName}</span> 👋
            </h1>
            <p className="text-white/40 max-w-lg">
              Ready to learn something new today? Pick an action below to get started.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="m3-card !p-5 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl ${stat.bgColor} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Study Command Center
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, i) => (
                <Link key={i} to={action.link} className="flex flex-col">
                  <div className="m3-card !p-0 overflow-hidden h-full group flex flex-col">
                    <div className="p-8 flex-1 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-xl shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500`}>
                          <action.icon className="w-7 h-7 text-white" />
                        </div>
                        {action.badge && (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 uppercase tracking-widest border border-indigo-500/10">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-indigo-500 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{action.desc}</p>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Launch Module</span>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Notes */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Material</h2>
                <Link to="/notes" className="text-sm text-indigo-500 hover:text-indigo-600 font-bold">View Library →</Link>
              </div>
              {savedNotes.length === 0 ? (
                <div className="m3-card text-center !py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No study material generated yet.</p>
                  <Link to="/notes" className="btn-primary mt-6 inline-flex mx-auto">
                    <Plus size={18} /> Create Notes
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedNotes.slice(0, 3).map((note) => (
                    <div key={note.id} className="m3-card !p-5 flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{note.topic}</p>
                        <p className="text-xs text-gray-400 mt-1">{note.subject} • {new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-200 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Quiz History</h2>
                <Link to="/quiz" className="text-sm text-indigo-500 hover:text-indigo-600 font-bold">Analytics →</Link>
              </div>
              {quizHistory.length === 0 ? (
                <div className="m3-card text-center !py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Take a quiz to see your performance stats.</p>
                  <Link to="/quiz" className="btn-primary mt-6 inline-flex mx-auto">
                    Take Quiz
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {quizHistory.slice(0, 3).map((quiz) => (
                    <div key={quiz.id} className="m3-card !p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 text-xl font-bold text-indigo-500">
                        {quiz.score}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{quiz.topic}</p>
                        <p className="text-xs text-gray-400 mt-1">{quiz.subject} • {quiz.correct}/{quiz.total} correct</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
