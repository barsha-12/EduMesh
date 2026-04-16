import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Brain, Flame, Clock, Trophy, BookOpen, ArrowRight, Sparkles, Target, BarChart2, Plus, Layers, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import KnowledgeOrb from '../components/three/KnowledgeOrb';
import ExamCountdown from '../components/ui/ExamCountdown';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { studyStats, savedNotes, quizHistory, syncFromSupabase, getDueFlashcards, flashcards, loadFlashcards } = useStudyStore();

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    syncFromSupabase();
    loadFlashcards();
  }, []);

  const dueCards = getDueFlashcards();

  // Per-subject analytics
  const subjectScores = {};
  quizHistory.forEach((q) => {
    if (!subjectScores[q.subject]) subjectScores[q.subject] = [];
    subjectScores[q.subject].push(q.score);
  });

  const chartData = Object.entries(subjectScores).map(([subject, scores]) => ({
    subject: subject.length > 12 ? subject.slice(0, 12) + '…' : subject,
    fullSubject: subject,
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  const lowestSubject = chartData.length > 0
    ? chartData.reduce((a, b) => a.avgScore < b.avgScore ? a : b)
    : null;

  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((a, q) => a + q.score, 0) / quizHistory.length)
    : 0;

  const quickActions = [
    { title: 'AI Study Chat', desc: 'Ask any doubt and get instant explanations', icon: MessageSquare, color: 'from-v-secondary to-[#87a5b3]', link: '/chat', badge: 'Most Used' },
    { title: 'Generate Notes', desc: 'AI creates structured notes on any topic', icon: FileText, color: 'from-v-primary to-v-accent', link: '/notes', badge: null },
    { title: 'Practice Quiz', desc: 'Test yourself with AI-generated MCQs', icon: Brain, color: 'from-v-accent to-v-primary', link: '/quiz', badge: null },
    { title: 'Feynman Mode', desc: 'Teach the AI to find your knowledge gaps', icon: GraduationCap, color: 'from-[#A0C2D2] to-[#D5E3E8]', link: '/feynman', badge: 'New' },
  ];

  const stats = [
    { label: 'Study Streak', value: `${studyStats.streak || 0} days`, icon: Flame, color: 'text-v-accent', bgColor: 'bg-v-accent/10' },
    { label: 'Notes Created', value: savedNotes.length, icon: FileText, color: 'text-v-primary', bgColor: 'bg-v-primary/10' },
    { label: 'Quizzes Taken', value: quizHistory.length, icon: Brain, color: 'text-v-secondary', bgColor: 'bg-v-secondary/10' },
    { label: 'Avg Score', value: quizHistory.length > 0 ? `${avgScore}%` : '—', icon: Target, color: 'text-v-secondary', bgColor: 'bg-v-secondary/10' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  const barColors = ['#E8A2A2', '#A0C2D2', '#EAC7C7', '#D5E3E8', '#a78bfa', '#f59e0b', '#10b981', '#f472b6'];

  return (
    <div className="min-h-screen bg-v-bg text-v-text transition-all duration-500">
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12 pb-24 lg:pb-12">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
          
          {/* Greeting + Orb */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-v-primary/10 border border-v-primary/10 text-v-primary text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={12} className="fill-current" /> Studio Session Active
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Hey, <span className="text-v-primary">{displayName}</span> 👋
              </h1>
              <p className="text-v-text/40 max-w-lg font-bold text-sm leading-relaxed">
                Your neural studio is calibrated. What shall we synthesize today?
              </p>
            </div>
            <div className="shrink-0">
               <div className="w-48 h-48 bg-v-secondary/20 rounded-full blur-3xl absolute -z-10 animate-pulse" />
               <KnowledgeOrb avgScore={avgScore} />
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl p-6 sm:p-8 rounded-[40px] border border-v-text/5 flex flex-col gap-6 hover:shadow-2xl hover:shadow-v-primary/5 transition-all group">
                <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter" style={{ fontFamily: 'Outfit' }}>{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-v-text/30">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-v-primary rounded-full" />
               <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Command Hub</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, i) => (
                <Link key={i} to={action.link} className="flex flex-col group">
                  <div className="bg-white/60 backdrop-blur-2xl rounded-[48px] border border-v-text/5 overflow-hidden h-full flex flex-col hover:shadow-2xl hover:shadow-v-primary/10 transition-all hover:-translate-y-2">
                    <div className="p-8 flex-1 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-xl shadow-v-primary/20 group-hover:rotate-12 transition-all`}>
                          <action.icon className="w-7 h-7 text-white" />
                        </div>
                        {action.badge && (
                          <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-v-accent text-v-text uppercase tracking-widest shadow-sm">
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>{action.title}</h3>
                        <p className="text-xs text-v-text/40 font-bold leading-relaxed">{action.desc}</p>
                      </div>
                    </div>
                    <div className="px-8 py-4 bg-v-text/[0.03] border-t border-v-text/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-v-text/20">Initialize</span>
                      <ArrowRight className="w-4 h-4 text-v-text/20 group-hover:text-v-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Notes */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Material</h2>
                <Link to="/notes" className="text-[10px] font-black uppercase tracking-widest text-v-primary hover:scale-105 transition-all">Library →</Link>
              </div>
              {savedNotes.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-xl rounded-[48px] text-center border border-v-text/5 py-16 px-8 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-[32px] bg-v-surface flex items-center justify-center shadow-inner">
                    <BookOpen className="w-10 h-10 text-v-text/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-v-text/40 uppercase tracking-widest">Vault Empty</p>
                    <p className="text-xs font-medium text-v-text/20">Your synthesized notes will appear here.</p>
                  </div>
                  <Link to="/notes" className="px-8 py-4 bg-v-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-v-primary/20 hover:scale-105 transition-all">
                    Generate First Notes
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedNotes.slice(0, 3).map((note) => (
                    <div key={note.id} className="bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-v-text/5 flex items-center gap-6 group cursor-pointer hover:shadow-xl transition-all hover:bg-white">
                      <div className="w-14 h-14 rounded-2xl bg-v-primary/10 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-all">
                        <FileText className="w-7 h-7 text-v-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-lg tracking-tight truncate">{note.topic}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-v-text/20 mt-1">{note.subject} • {new Date(note.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-v-text/10 group-hover:text-v-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Analytics Snapshot */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>Neural Progress</h2>
                <Link to="/quiz" className="text-[10px] font-black uppercase tracking-widest text-v-primary hover:scale-105 transition-all">Analytics →</Link>
              </div>
              
              <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[48px] border border-v-text/5 shadow-lg">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="subject" tick={{ fontSize: 9, fill: 'var(--v-text)', opacity: 0.3, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--v-text)', opacity: 0.3, fontWeight: 900 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--v-text)', border: 'none', borderRadius: '24px', color: '#fff', fontSize: '10px', padding: '12px' }}
                      formatter={(value, name, props) => [`${value}%`, props.payload.fullSubject]}
                    />
                    <Bar dataKey="avgScore" radius={[12, 12, 0, 0]} maxBarSize={32}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={barColors[i % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {lowestSubject && (
                  <div className="mt-8 flex items-center gap-3 px-4 py-3 rounded-2xl bg-v-primary/10 border border-v-primary/10 w-full animate-pulse">
                    <Target size={16} className="text-v-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-v-primary">
                      Expansion required: {lowestSubject.fullSubject} ({lowestSubject.avgScore}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
