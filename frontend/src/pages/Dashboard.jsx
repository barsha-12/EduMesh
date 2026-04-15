import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useStudyStore } from '../store/studyStore';
import Navbar from '../components/ui/Navbar';
import GlassCard from '../components/ui/GlassCard';
import { MessageSquare, FileText, Brain, Flame, Clock, Trophy, BookOpen, ArrowRight, Sparkles, Target } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { studyStats, savedNotes, quizHistory } = useStudyStore();

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';

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
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">
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
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <GlassCard key={i} className="!p-4 !rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] text-white/40 font-medium">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, i) => (
                <Link key={i} to={action.link}>
                  <GlassCard className="!p-0 !rounded-2xl overflow-hidden h-full group">
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        {action.badge && (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-white/40 mt-1">{action.desc}</p>
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-white/30 font-medium">Get started</span>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Notes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white/80" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Recent Notes
                </h2>
                <Link to="/notes" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  View All →
                </Link>
              </div>
              {savedNotes.length === 0 ? (
                <GlassCard className="!rounded-xl text-center !py-10">
                  <BookOpen className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">No notes yet. Generate your first study notes!</p>
                  <Link to="/notes" className="btn-primary inline-flex items-center gap-2 mt-4 !text-xs !px-4 !py-2">
                    <FileText size={14} /> Create Notes
                  </Link>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {savedNotes.slice(0, 3).map((note, i) => (
                    <GlassCard key={note.id || i} className="!p-4 !rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-white">{note.topic}</p>
                          <p className="text-xs text-white/40 mt-0.5">{note.subject} • {new Date(note.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Note
                        </span>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Quizzes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white/80" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Recent Quizzes
                </h2>
                <Link to="/quiz" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  View All →
                </Link>
              </div>
              {quizHistory.length === 0 ? (
                <GlassCard className="!rounded-xl text-center !py-10">
                  <Brain className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-sm text-white/30">No quizzes taken yet. Test your knowledge!</p>
                  <Link to="/quiz" className="btn-primary inline-flex items-center gap-2 mt-4 !text-xs !px-4 !py-2">
                    <Brain size={14} /> Start Quiz
                  </Link>
                </GlassCard>
              ) : (
                <div className="space-y-3">
                  {quizHistory.slice(0, 3).map((quiz, i) => (
                    <GlassCard key={quiz.id || i} className="!p-4 !rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-white">{quiz.topic}</p>
                          <p className="text-xs text-white/40 mt-0.5">{quiz.subject} • {new Date(quiz.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className={`text-lg font-bold ${quiz.score >= 70 ? 'text-emerald-400' : quiz.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                          {quiz.score}%
                        </div>
                      </div>
                    </GlassCard>
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
