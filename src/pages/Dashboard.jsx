import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudyStore } from '../store/studyStore';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { Bot, FileText, Brain, Flame, ArrowRight, Sparkles, Target, Clock } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { studyStats, savedNotes, quizHistory, syncFromSupabase } = useStudyStore();

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    syncFromSupabase();
  }, []);

  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((a, q) => a + q.score, 0) / quizHistory.length)
    : 0;

  const streak = studyStats.streak || 0;

  // Get current day of week
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateString = `${dayNames[today.getDay()]} ${today.getDate()} ${monthNames[today.getMonth()]}`;

  const getGreeting = () => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  // Score donut SVG
  const ScoreDonut = ({ value }) => {
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;
    return (
      <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(204,204,204,0.25)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke="url(#mintGrad)" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B2FFD4" />
            <stop offset="100%" stopColor="#A8FFEC" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Recent activity items
  const recentActivity = [];
  savedNotes.slice(0, 3).forEach(note => {
    recentActivity.push({
      icon: '📝',
      title: `${note.subject} Notes — ${note.topic}`,
      timestamp: note.createdAt,
      subject: note.subject,
      type: 'note',
    });
  });
  quizHistory.slice(0, 3).forEach(q => {
    recentActivity.push({
      icon: '🧠',
      title: `${q.subject} Quiz — ${q.topic || 'General'}`,
      timestamp: q.createdAt,
      subject: q.subject,
      type: 'quiz',
    });
  });
  recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getTimeAgo = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-[2rem] text-primary">
            {getGreeting()}, {displayName} ✦
          </h1>
          <p className="font-body text-secondary mt-1">Ready to synthesize?</p>
        </div>
        <Pill variant="badge" className="bg-lemon text-primary font-body font-medium px-4 py-2 text-sm">
          {dateString}
        </Pill>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <GlassCard variant="periwinkle" className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral rounded-l-card"></div>
          <div className="pl-3">
            <p className="font-display font-[800] text-[3rem] leading-none text-coral">{streak}</p>
            <p className="font-body text-secondary text-sm mt-1">Day Streak</p>
            <p className="font-body text-muted text-[0.75rem] mt-1">🔥 Keep going!</p>
          </div>
          <div className="mt-3 h-1.5 bg-[rgba(204,204,204,0.25)] rounded-pill overflow-hidden">
            <div
              className="h-full rounded-pill bg-gradient-to-r from-lemon to-coral transition-all duration-700"
              style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
            ></div>
          </div>
        </GlassCard>

        {/* Notes */}
        <GlassCard variant="periwinkle" className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-periwinkle rounded-l-card"></div>
          <div className="pl-3">
            <p className="font-display font-[800] text-[3rem] leading-none text-periwinkle">{savedNotes.length}</p>
            <p className="font-body text-secondary text-sm mt-1">Notes Created</p>
            <p className="font-body text-muted text-[0.75rem] mt-1">📝 +{Math.min(savedNotes.length, 3)} this week</p>
          </div>
        </GlassCard>

        {/* Quizzes */}
        <GlassCard variant="periwinkle" className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orchid rounded-l-card"></div>
          <div className="pl-3">
            <p className="font-display font-[800] text-[3rem] leading-none text-orchid">{quizHistory.length}</p>
            <p className="font-body text-secondary text-sm mt-1">Quizzes Taken</p>
            <p className="font-body text-muted text-[0.75rem] mt-1">
              Last: {quizHistory[0]?.subject || 'None yet'}
            </p>
          </div>
        </GlassCard>

        {/* Avg Score */}
        <GlassCard variant="periwinkle" className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime rounded-l-card"></div>
          <div className="pl-3 flex items-center gap-3">
            <div>
              <p className="font-display font-[800] text-[3rem] leading-none" style={{ color: '#7DC9A0' }}>{avgScore}%</p>
              <p className="font-body text-secondary text-sm mt-1">Avg. Score</p>
              <p className="font-body text-muted text-[0.75rem] mt-1">↑ Keep improving!</p>
            </div>
            <ScoreDonut value={avgScore} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Study Chat */}
        <GlassCard variant="lavender" className="flex flex-col group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender to-periwinkle flex items-center justify-center shadow-lg">
              <Bot size={28} className="text-white" />
            </div>
            <Pill variant="badge" className="bg-lemon text-primary">Powered by Groq</Pill>
          </div>
          <h3 className="font-body font-semibold text-lg text-primary">AI Study Chat</h3>
          <p className="font-body text-secondary text-sm mt-1 flex-1">Ask any question and get instant AI explanations.</p>
          <Link to="/chat" className="mt-4">
            <Button variant="primary" size="sm" className="bg-gradient-to-br from-periwinkle to-lavender">
              Ask Now →
            </Button>
          </Link>
        </GlassCard>

        {/* Smart Notes */}
        <GlassCard variant="peach" className="flex flex-col group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-peach to-coral flex items-center justify-center shadow-lg mb-4">
            <FileText size={28} className="text-white" />
          </div>
          <h3 className="font-body font-semibold text-lg text-primary">Smart Notes</h3>
          <p className="font-body text-secondary text-sm mt-1 flex-1">Generate AI study notes for any subject and topic.</p>
          <Link to="/notes" className="mt-4">
            <Button variant="primary" size="sm" className="bg-gradient-to-br from-coral to-peach">
              Generate →
            </Button>
          </Link>
        </GlassCard>

        {/* Practice Quiz */}
        <GlassCard variant="seafoam" className="flex flex-col group">
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-seafoam to-mint flex items-center justify-center shadow-lg">
              <Brain size={28} className="text-white" />
            </div>
            <Pill variant="badge" className="bg-blush text-primary">MCQ</Pill>
          </div>
          <h3 className="font-body font-semibold text-lg text-primary">Practice Quiz</h3>
          <p className="font-body text-secondary text-sm mt-1 flex-1">Test your knowledge with AI-generated MCQ quizzes.</p>
          <Link to="/quiz" className="mt-4">
            <Button variant="primary" size="sm" className="bg-gradient-to-br from-mint to-seafoam">
              Start Quiz →
            </Button>
          </Link>
        </GlassCard>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display font-bold text-[1.5rem] text-primary mb-6">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <GlassCard variant="base" className="text-center py-12">
            <Sparkles className="mx-auto text-lavender mb-3" size={32} />
            <p className="font-body text-secondary">No activity yet. Start chatting, generating notes, or taking quizzes!</p>
          </GlassCard>
        ) : (
          <div className="relative border-l-2 border-dashed border-[rgba(192,178,160,0.4)] ml-4 space-y-4 pl-6">
            {recentActivity.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                {/* Timeline dot */}
                <div className="absolute -left-[5px] w-[10px] h-[10px] rounded-full bg-lavender border-2 border-white shadow-sm" style={{ marginTop: i === 0 ? 0 : undefined }}></div>
                <GlassCard variant="base" interactive={false} className="flex-1 flex items-center gap-4 py-3 px-5">
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-primary text-sm truncate">{item.title}</p>
                  </div>
                  <Pill variant="custom" className="bg-[rgba(204,204,204,0.2)] text-muted text-[0.7rem] whitespace-nowrap">
                    <Clock size={12} className="mr-1" />
                    {getTimeAgo(item.timestamp)}
                  </Pill>
                  <Pill variant="subject">{item.subject}</Pill>
                </GlassCard>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
