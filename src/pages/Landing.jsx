import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, ArrowRight, Sparkles, Send, Brain, BookOpen, Download, BarChart2, Star, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '../components/layout/AnimatedBackground';

const Typewriter = ({ text, startDelay }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let timeoutId;
    if (startDelay) {
      timeoutId = setTimeout(() => {
        let i = 0;
        const intervalId = setInterval(() => {
          setDisplayText((prev) => prev + text.charAt(i));
          i++;
          if (i === text.length) clearInterval(intervalId);
        }, 30);
        return () => clearInterval(intervalId);
      }, startDelay);
    }
    return () => clearTimeout(timeoutId);
  }, [text, startDelay]);

  return <span>{displayText}<span className="animate-pulse text-lavender ml-1">|</span></span>;
};

const Landing = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stats, setStats] = useState({ students: 0, notes: 0, questions: 0, rating: 0 });

  useEffect(() => {
    // Basic observer for stats count-up could go here
    // For simplicity, we just animate them on load
    const timer = setTimeout(() => {
      setStats({ students: 1200, notes: 50000, questions: 98000, rating: 4.9 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF5] text-[#3A3C4A] font-body relative overflow-x-hidden selection:bg-lavender/30 selection:text-[#3A3C4A]">
      <AnimatedBackground />

      {/* SECTION 1 — NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 md:px-12 bg-[#FAFAF5]/88 backdrop-blur-[20px] border-b border-[#CCCCCC]/30 transition-all">
        <div className="flex items-center gap-2">
          <span className="font-brand text-[1.4rem] text-[#3A3C4A]">EduMesh</span>
          <Sparkles className="w-4 h-4 text-orchid animate-pulse-soft" />
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'For Students'].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-[0.95rem] font-medium text-[#6E7488] hover:text-[#3A3C4A] hover:underline decoration-lavender decoration-2 underline-offset-4 transition-all">
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="px-5 py-2 rounded-full border-[1.5px] border-taupe text-[#6E7488] text-[0.95rem] font-medium hover:bg-white/60 transition-all">
            Log In
          </Link>
          <Link to="/signup" className="px-6 py-2 rounded-full text-[#3A3C4A] text-[0.95rem] font-bold shadow-[0_6px_24px_rgba(178,204,255,0.40)] hover:-translate-y-[2px] transition-all" style={{ background: 'linear-gradient(135deg, #B2CCFF 0%, #D0AAFF 100%)' }}>
            Get Started Free →
          </Link>
        </div>

        <button className="md:hidden text-[#3A3C4A]" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
          <Menu />
        </button>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="relative min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
        
        {/* Floating decorations */}
        <motion.div 
          animate={{ y: [-8, 8, -8] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-12 lg:right-auto lg:left-[50%] px-4 py-2 bg-lemon/60 backdrop-blur-md rounded-full border border-lemon/40 shadow-soft text-sm font-medium text-[#3A3C4A] hidden md:block"
        >
          📝 Notes generated: 1,247
        </motion.div>
        
        <motion.div 
          animate={{ y: [8, -8, 8] }} 
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-8 px-4 py-2 bg-coral/60 backdrop-blur-md rounded-full border border-coral/40 shadow-soft text-sm font-medium text-[#3A3C4A] hidden md:block"
        >
          🔥 12-day streak
        </motion.div>

        {/* Left Column (55%) */}
        <div className="w-full lg:w-[55%] flex flex-col items-start space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 bg-lemon/35 border border-lemon rounded-full text-[0.78rem] font-semibold text-[#6E7488]"
          >
            ✦ AI-Powered Study Tool
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-display font-[800] text-[#3A3C4A] leading-[1.15] text-[clamp(2.8rem,5.5vw,4.2rem)]"
          >
            Synthesize any subject. <br />
            <span className="relative">
              Master
              <svg className="absolute w-full h-[12px] bottom-1 left-0 -z-10" viewBox="0 0 100 12" preserveAspectRatio="none">
                <motion.path 
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8, duration: 0.6 }}
                  d="M0,8 C30,2 70,2 100,8" fill="none" stroke="#FFBBAA" strokeWidth="3" strokeLinecap="round" 
                />
              </svg>
            </span> every exam.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-[1.1rem] text-[#6E7488] leading-[1.7] max-w-[480px] mt-5"
          >
            EduMesh is your AI study partner — instant explanations, smart notes, and practice quizzes. All in one place.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="flex flex-wrap items-center gap-[14px] mt-9"
          >
            <Link to="/signup" className="px-8 py-[14px] rounded-full text-[#3A3C4A] text-[1rem] font-bold shadow-[0_6px_24px_rgba(178,204,255,0.40)] hover:-translate-y-[2px] transition-all" style={{ background: 'linear-gradient(135deg, #B2CCFF 0%, #D0AAFF 100%)' }}>
              Start Studying Free →
            </Link>
            <a href="#how-it-works" className="px-7 py-[14px] rounded-full border-[1.5px] border-taupe text-[#6E7488] text-[1rem] font-medium hover:bg-white/60 transition-all">
              See how it works ↓
            </a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex items-center gap-3 mt-4"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#CCCCCC] border-2 border-white" style={{ background: `linear-gradient(135deg, #FFAAF0, #B2CCFF)` }}></div>
              ))}
            </div>
            <span className="text-[0.85rem] font-medium text-[#BBBBCC]">Joined by 1,200+ students this month</span>
          </motion.div>
        </div>

        {/* Right Column (45%) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="w-full lg:w-[45%] max-w-[500px]"
        >
          <motion.div 
            animate={{ y: [-8, 0, -8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="glass-base rounded-[20px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.72)', borderColor: 'rgba(255,255,255,0.55)' }}
          >
            <div className="h-[42px] bg-periwinkle/18 flex items-center justify-between px-4 border-b border-white/40">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose"></div>
                <div className="w-2 h-2 rounded-full bg-lemon"></div>
                <div className="w-2 h-2 rounded-full bg-lime"></div>
              </div>
              <span className="text-[0.82rem] font-medium text-[#BBBBCC]">AI Study Chat</span>
            </div>
            
            <div className="p-4 h-[260px] flex flex-col gap-4 overflow-hidden relative">
              {/* User Bubble */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                className="self-end max-w-[85%] px-4 py-2.5 rounded-[20px] rounded-br-[6px] text-[#3A3C4A] text-[0.9rem] shadow-sm"
                style={{ background: 'linear-gradient(135deg, #B2CCFF, #D0AAFF)' }}
              >
                Explain Newton's Third Law with a real-world example
              </motion.div>

              {/* AI Bubble */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}
                className="self-start max-w-[90%] px-4 py-2.5 rounded-[20px] rounded-bl-[6px] text-[#3A3C4A] text-[0.9rem] bg-white/80 border-[1.5px] border-seafoam/40 shadow-sm"
              >
                <Typewriter text="Newton's Third Law states that for every action, there is an equal and opposite reaction. 🚀 When you push off the ground while jumping, the ground pushes back on you with the same force..." startDelay={1800} />
              </motion.div>
            </div>

            <div className="p-3 bg-white/40 border-t border-white/40">
              <div className="flex items-center justify-between px-4 py-2 bg-white/75 border border-lavender/30 rounded-full">
                <span className="text-[#BBBBCC] text-[0.9rem]">Ask anything...</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #B2CCFF, #D0AAFF)' }}>
                  <Send size={14} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3 — SOCIAL PROOF TICKER */}
      <section className="h-[40px] bg-lavender/12 border-y border-lavender/20 flex items-center overflow-hidden whitespace-nowrap z-10 relative">
        <div className="flex animate-[marquee_28s_linear_infinite]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 text-[0.85rem] font-medium text-[#6E7488]">
              <span>🤖 AI-powered explanations</span> <span className="text-orchid">✦</span>
              <span>📝 Smart notes in seconds</span> <span className="text-orchid">✦</span>
              <span>🧠 Adaptive MCQ quizzes</span> <span className="text-orchid">✦</span>
              <span>📊 Study streak tracker</span> <span className="text-orchid">✦</span>
              <span>📥 PDF export</span> <span className="text-orchid">✦</span>
              <span>🎓 Built for college students</span> <span className="text-orchid">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — FEATURES BENTO GRID */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto z-10 relative">
        <div className="text-center mb-16 flex flex-col items-center">
          <div className="px-4 py-1.5 bg-lemon/35 border border-lemon rounded-full text-[0.85rem] font-semibold text-[#3A3C4A] mb-4">
            Everything You Need
          </div>
          <h2 className="font-display font-[700] text-[2.2rem] text-[#3A3C4A] mb-3">Your entire study toolkit, reimagined.</h2>
          <p className="text-[#6E7488] max-w-[480px]">Five tools that work together so you can focus on learning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
          {/* AI Chat (Large) */}
          <div className="md:col-span-7 md:row-span-2 glass-base rounded-[24px] p-8 flex flex-col hover:-translate-y-1.5 transition-all duration-300" style={{ background: 'rgba(255,255,255,0.72)' }}>
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-sm" style={{ background: 'linear-gradient(135deg, #D0AAFF, #B2CCFF)' }}>🤖</div>
              <span className="px-3 py-1 bg-orchid/20 text-[#3A3C4A] text-xs font-bold rounded-full">Most Used</span>
            </div>
            <h3 className="font-display font-[700] text-[1.5rem] text-[#3A3C4A] mb-2">AI Study Chat</h3>
            <p className="text-[#6E7488]">Ask any doubt and get instant, detailed explanations. No more waiting — just answers.</p>
          </div>

          {/* Smart Notes (Medium) */}
          <div className="md:col-span-5 glass-base rounded-[24px] p-6 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #FFD9B3, #FFBBAA)' }}>📝</div>
            <h3 className="font-display font-[700] text-[1.25rem] text-[#3A3C4A] mb-2">Smart Notes</h3>
            <p className="text-[#6E7488] text-[0.95rem]">AI generates structured study notes with definitions, examples, and key formulas.</p>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-peach/20 rounded-xl rotate-12"></div>
          </div>

          {/* Practice Quiz (Medium) */}
          <div className="md:col-span-5 glass-base rounded-[24px] p-6 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #A8FFEC, #B2FFD4)' }}>🧠</div>
            <h3 className="font-display font-[700] text-[1.25rem] text-[#3A3C4A] mb-2">Practice Quiz</h3>
            <p className="text-[#6E7488] text-[0.95rem]">MCQ quizzes generated by AI for any topic. Instant feedback on every answer.</p>
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-6 h-6 rounded-full bg-white border border-taupe/40 flex items-center justify-center text-[10px] font-bold">A</div>
              <div className="w-6 h-6 rounded-full bg-mint/30 border border-mint flex items-center justify-center text-[10px] font-bold text-mint">B</div>
            </div>
          </div>

          {/* PDF Export (Small) */}
          <div className="md:col-span-4 glass-base rounded-[24px] p-6 hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #FFBBC8, #FFB0B0)' }}>📥</div>
            <h3 className="font-display font-[700] text-[1.1rem] text-[#3A3C4A] mb-2">PDF Export</h3>
            <p className="text-[#6E7488] text-[0.9rem]">Download your generated notes as a formatted PDF for offline study.</p>
          </div>

          {/* Dashboard (Small) */}
          <div className="md:col-span-4 glass-base rounded-[24px] p-6 hover:-translate-y-1.5 transition-all duration-300">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #B2CCFF, #D0AAFF)' }}>📊</div>
            <h3 className="font-display font-[700] text-[1.1rem] text-[#3A3C4A] mb-2">Dashboard</h3>
            <p className="text-[#6E7488] text-[0.9rem]">Track your streak, notes count, quiz history, and average score.</p>
          </div>

          {/* Free to Start (Small) */}
          <div className="md:col-span-4 glass-base rounded-[24px] p-6 flex flex-col items-center justify-center text-center hover:-translate-y-1.5 transition-all duration-300 bg-lime/10">
            <h3 className="font-display font-[800] text-[2.5rem] bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #7DD4A8, #5AB88A)' }}>Free</h3>
            <p className="text-[#BBBBCC] text-[0.9rem] mb-4">No credit card. No catch.</p>
            <Link to="/signup" className="px-5 py-2 rounded-full text-[#3A3C4A] text-sm font-bold bg-periwinkle hover:brightness-105 transition-all">
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto z-10 relative">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-periwinkle/30 border border-periwinkle rounded-full text-[0.85rem] font-semibold text-[#3A3C4A] mb-4">
            How It Works
          </div>
          <h2 className="font-display font-[700] text-[2.2rem] text-[#3A3C4A]">From confused to confident in 3 steps.</h2>
        </div>

        <div className="relative flex flex-col md:flex-row gap-12 md:gap-8 justify-between">
          <div className="absolute top-8 left-8 md:left-8 md:right-8 bottom-8 md:bottom-auto w-[2px] md:w-auto md:h-[2px] border-l-2 md:border-l-0 md:border-t-2 border-dashed border-taupe/50 -z-10"></div>
          
          {[
            { num: '1', title: 'Ask anything', body: 'Type your question in plain English. EduMesh understands context, subject, and difficulty level.', gradient: '#B2CCFF, #D0AAFF' },
            { num: '2', title: 'Get instant clarity', body: 'Our AI breaks down complex topics into clear explanations with examples, formulas, and analogies.', gradient: '#D0AAFF, #FFAAF0' },
            { num: '3', title: 'Test & track progress', body: 'Take AI-generated MCQ quizzes. Review your scores. Watch your study streak grow day by day.', gradient: '#A8FFEC, #B2FFD4' }
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-start md:items-center text-left md:text-center relative pl-16 md:pl-0">
              <div className="absolute left-0 top-0 md:relative md:mb-6 w-16 h-16 rounded-full flex items-center justify-center font-display font-[800] text-2xl text-[#3A3C4A] shadow-sm" style={{ background: `linear-gradient(135deg, ${step.gradient})` }}>
                {step.num}
              </div>
              <h3 className="font-bold text-[1.1rem] text-[#3A3C4A] mb-2">{step.title}</h3>
              <p className="text-[#6E7488] text-[0.95rem] leading-relaxed max-w-[280px]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — SUBJECT SHOWCASE */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto z-10 relative">
        <div className="bg-lilac/10 rounded-[24px] p-10 md:p-16 text-center border border-lilac/20">
          <h2 className="font-display font-[700] text-[1.8rem] text-[#3A3C4A] mb-10">Works for every subject you study.</h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Literature', 'Computer Science', 'Economics', 'Psychology', 'Statistics', 'Engineering', 'Geography', 'Political Science', 'Philosophy', 'Accounting', 'Law'].map((subject, i) => {
              const colors = ['bg-periwinkle', 'bg-seafoam', 'bg-peach', 'bg-lime', 'bg-lemon', 'bg-orchid', 'bg-lavender', 'bg-mint', 'bg-blush', 'bg-coral', 'bg-lilac'];
              const bg = colors[i % colors.length];
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  key={subject} 
                  className={`px-5 py-2.5 rounded-full ${bg}/40 border border-${bg}/60 text-[#3A3C4A] text-[0.95rem] font-medium shadow-sm hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all`}
                >
                  {subject}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7 — SOCIAL PROOF / TESTIMONIALS */}
      <section className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto z-10 relative">
        <h2 className="font-display font-[700] text-[2rem] text-[#3A3C4A] text-center mb-16">Students love it 💜</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 group/list">
          {/* Card 1 */}
          <div className="glass-base bg-lavender/10 rounded-[20px] p-8 -rotate-[1.5deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-300 hover:z-10 group-hover/list:opacity-75 hover:!opacity-100">
            <div className="flex text-[#3A3C4A] mb-4 text-lemon drop-shadow-sm">
              {[...Array(5)].map((_,i) => <Star key={i} size={16} fill="currentColor" className="text-lemon" />)}
            </div>
            <p className="text-[#3A3C4A] font-medium leading-relaxed mb-6">"I used to spend 2 hours making notes for one chapter. EduMesh does it in 30 seconds. It's genuinely saved my semester."</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lavender to-periwinkle border-2 border-lavender/50"></div>
              <span className="text-[0.8rem] font-medium text-[#6E7488]">Priya M. — 2nd Year Engineering</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-base bg-peach/10 rounded-[20px] p-8 hover:-translate-y-2 transition-all duration-300 hover:z-10 group-hover/list:opacity-75 hover:!opacity-100">
            <div className="flex text-[#3A3C4A] mb-4 text-lemon drop-shadow-sm">
              {[...Array(5)].map((_,i) => <Star key={i} size={16} fill="currentColor" className="text-lemon" />)}
            </div>
            <p className="text-[#3A3C4A] font-medium leading-relaxed mb-6">"The quiz feature is insanely good. It actually asks tricky questions, not just surface-level stuff. My exam scores improved by 15%."</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-peach to-coral border-2 border-peach/50"></div>
              <span className="text-[0.8rem] font-medium text-[#6E7488]">Arjun K. — 3rd Year Commerce</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-base bg-mint/10 rounded-[20px] p-8 rotate-[1.5deg] hover:rotate-0 hover:-translate-y-2 transition-all duration-300 hover:z-10 group-hover/list:opacity-75 hover:!opacity-100">
            <div className="flex text-[#3A3C4A] mb-4 drop-shadow-sm">
              {[...Array(4)].map((_,i) => <Star key={i} size={16} fill="currentColor" className="text-lemon" />)}<Star size={16} className="text-taupe" fill="currentColor" />
            </div>
            <p className="text-[#3A3C4A] font-medium leading-relaxed mb-6">"Love how it explains things in simple language. Finally understand organic chemistry after failing twice. The PDF notes are 🔥"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-mint to-seafoam border-2 border-mint/50"></div>
              <span className="text-[0.8rem] font-medium text-[#6E7488]">Sneha R. — 1st Year Pre-Med</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — STATS BAND */}
      <section className="py-12 px-6 md:px-12 max-w-[1200px] mx-auto z-10 relative">
        <div className="glass-base bg-periwinkle/15 border-[1.5px] border-periwinkle/25 rounded-[24px] p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x border-dashed divide-dashed divide-taupe/60">
            
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-periwinkle/30 flex items-center justify-center mb-3">🎓</div>
              <div className="font-display font-[800] text-[2.5rem] text-[#6E8BB5]">1,200+</div>
              <div className="text-[0.9rem] font-medium text-[#6E7488]">Active Students</div>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-orchid/30 flex items-center justify-center mb-3">📝</div>
              <div className="font-display font-[800] text-[2.5rem] text-[#CC66CC]">50,000+</div>
              <div className="text-[0.9rem] font-medium text-[#6E7488]">Notes Generated</div>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-mint/30 flex items-center justify-center mb-3">🧠</div>
              <div className="font-display font-[800] text-[2.5rem] text-[#5AB88A]">98,000+</div>
              <div className="text-[0.9rem] font-medium text-[#6E7488]">Questions Served</div>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-lemon/30 flex items-center justify-center mb-3">⭐</div>
              <div className="font-display font-[800] text-[2.5rem] text-[#B8B84D]">4.9★</div>
              <div className="text-[0.9rem] font-medium text-[#6E7488]">Avg. Rating</div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section className="py-24 px-6 md:px-12 max-w-[1000px] mx-auto z-10 relative">
        <div className="rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(208, 170, 255, 0.12) 0%, rgba(178, 204, 255, 0.08) 100%)' }}>
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-lavender/20 blur-[60px] rounded-full"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-periwinkle/20 blur-[60px] rounded-full"></div>
          
          <Sparkles className="w-8 h-8 text-orchid mx-auto mb-6 animate-[spin_4s_linear_infinite]" />
          <h2 className="font-display font-[800] text-[clamp(2rem,4vw,3rem)] text-[#3A3C4A] mb-4 relative z-10">Your smartest study session starts now.</h2>
          <p className="text-[1.1rem] text-[#BBBBCC] mb-10 relative z-10">Free forever. No credit card. No confusion.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/signup" className="glass-base px-8 py-[14px] rounded-full text-[#3A3C4A] text-[1rem] font-bold hover:-translate-y-[2px] transition-all w-full sm:w-auto" style={{ background: 'linear-gradient(135deg, #B2CCFF, #D0AAFF)' }}>
              Create Free Account →
            </Link>
            <Link to="/demo" className="px-8 py-[14px] rounded-full text-[#6E7488] font-medium hover:bg-black/5 transition-all w-full sm:w-auto border-[1.5px] border-transparent">
              Try the demo first
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="bg-[#3A3C4A]/[0.04] border-t border-[#CCCCCC]/25 pt-16 pb-8 px-6 md:px-12 z-10 relative">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between gap-12 mb-16">
          
          <div className="w-full md:w-1/3 space-y-4">
            <div className="font-brand text-[1.3rem] text-[#3A3C4A]">EduMesh</div>
            <p className="text-[0.9rem] text-[#BBBBCC]">Your AI study partner for college.</p>
            <a href="https://github.com" className="inline-block mt-2 text-taupe hover:text-[#3A3C4A] transition-colors"><Code size={20} /></a>
          </div>

          <div className="w-full md:w-1/3 flex flex-col space-y-3">
            <span className="font-semibold text-[0.85rem] text-[#6E7488] mb-2">Product</span>
            {['Features', 'Dashboard', 'AI Chat', 'Smart Notes', 'Practice Quiz'].map(link => (
              <a key={link} href="#" className="text-[0.85rem] text-[#BBBBCC] hover:text-[#3A3C4A] hover:translate-x-1 transition-all w-max">{link}</a>
            ))}
          </div>

          <div className="w-full md:w-1/3 flex flex-col space-y-3">
            <span className="font-semibold text-[0.85rem] text-[#6E7488] mb-2">Get Started</span>
            <Link to="/signup" className="text-[0.85rem] text-[#BBBBCC] hover:text-[#3A3C4A] hover:translate-x-1 transition-all w-max">Sign Up</Link>
            <Link to="/login" className="text-[0.85rem] text-[#BBBBCC] hover:text-[#3A3C4A] hover:translate-x-1 transition-all w-max">Log In</Link>
            <Link to="/demo" className="text-[0.85rem] text-[#BBBBCC] hover:text-[#3A3C4A] hover:translate-x-1 transition-all w-max">Demo Access</Link>
            <span className="text-[0.8rem] text-taupe mt-4 inline-block">Built with ☕ and Groq AI</span>
          </div>

        </div>

        <div className="max-w-[1200px] mx-auto pt-6 border-t border-[#CCCCCC]/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[0.78rem] text-[#BBBBCC]">© 2026 EduMesh. MIT License.</span>
          <div className="flex items-center gap-4 text-[0.78rem] text-[#BBBBCC]">
            <a href="#" className="hover:text-[#3A3C4A] transition-colors">Privacy</a>
            <span>|</span>
            <a href="#" className="hover:text-[#3A3C4A] transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
};

export default Landing;
