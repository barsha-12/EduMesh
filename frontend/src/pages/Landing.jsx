import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, BookOpen, MessageSquare, ArrowRight, Zap, Target, Shield, Layout, Radio, Mic, ChevronRight, Globe, ShieldCheck, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2429] selection:bg-[#F29BB2]/20 relative font-sans antialiased transition-colors duration-1000">
      
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-8 md:px-16 flex items-center justify-between backdrop-blur-xl bg-[#FDFBF7]/40 border-b border-[#2D2429]/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FCE3EA] flex items-center justify-center shadow-xl shadow-[#2D2429]/5">
            <Sparkles className="text-[#E8A2A2] w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter" style={{ fontFamily: 'Outfit' }}>EduMesh</span>
        </div>
        
        <div className="hidden md:flex items-center gap-12">
          <a href="#features" className="text-[11px] font-bold uppercase tracking-widest text-[#2D2429]/40 hover:text-[#2D2429] transition-colors">Features</a>
          <a href="#philosophy" className="text-[11px] font-bold uppercase tracking-widest text-[#2D2429]/40 hover:text-[#2D2429] transition-colors">Philosophy</a>
          <div className="flex items-center gap-6">
            <Link to="/pricing" className="text-[11px] font-bold uppercase tracking-widest text-white bg-[#E8A2A2] px-6 py-3 rounded-full shadow-lg shadow-[#E8A2A2]/20 hover:scale-105 transition-all">Elite Plus</Link>
            <Link to="/login" className="px-8 py-3 bg-[#2D2429] text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#2D2429]/20">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-48 pb-32 px-8 md:px-16 max-w-7xl mx-auto text-center space-y-16">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-3 px-6 py-2 bg-[#FCE3EA]/50 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] text-[#E8A2A2]"
        >
          <Zap size={14} className="animate-pulse" /> Intelligence Synthesized
        </motion.div>
        
        <div className="space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-[100px] font-black tracking-tighter leading-[0.9] text-[#2D2429]" 
            style={{ fontFamily: 'Outfit' }}
          >
            Your AI <br /> <span className="text-[#E8A2A2]">thinking partner.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#2D2429]/40 max-w-2xl mx-auto font-bold leading-relaxed"
          >
            EduMesh is an Elite-grade AI notebook that bridges the gap between raw research and deep synthesis. Featuring voice-to-text and multi-model intelligence.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <Link to="/login" className="px-12 py-7 bg-[#E8A2A2] text-white rounded-full text-lg font-black hover:scale-105 transition-all shadow-2xl shadow-[#E8A2A2]/30 flex items-center gap-4">
            Try EduMesh Free <ArrowRight />
          </Link>
          <Link to="/pricing" className="px-12 py-7 bg-white text-[#2D2429] border border-[#2D2429]/5 rounded-full text-lg font-black hover:bg-[#FCE3EA]/30 transition-all flex items-center gap-4">
            View Plans
          </Link>
        </motion.div>
      </header>

      {/* Hero Image / Screenshot */}
      <section className="px-8 md:px-16 pb-32 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative group p-4 bg-white/50 rounded-[60px] shadow-3xl border border-[#2D2429]/5"
        >
          <div className="absolute -inset-4 bg-gradient-to-br from-[#E8A2A2]/20 via-transparent to-[#FCE3EA]/20 rounded-[70px] blur-[100px] opacity-20 -z-10" />
          <img 
            src="/vercel_hero.png" 
            alt="EduMesh AI Interface" 
            className="w-full rounded-[48px] shadow-2xl border border-[#2D2429]/5 object-cover aspect-[16/9]"
          />
        </motion.div>
      </section>

      {/* Feature Grids (Unified & Balanced) */}
      <section id="features" className="py-32 px-8 md:px-16 bg-white/30">
        <div className="max-w-7xl mx-auto space-y-32">
          
          <div className="grid lg:grid-cols-2 gap-32 items-center">
             <div className="space-y-12">
                <div className="space-y-6">
                  <h2 className="text-5xl font-black tracking-tight leading-[1.1]" style={{ fontFamily: 'Outfit' }}>
                    Conversations with <br /> <span className="text-[#E8A2A2]">total context.</span>
                  </h2>
                  <p className="text-lg font-bold text-[#2D2429]/40 leading-relaxed">
                    Stop jumping between tabs. EduMesh reads your PDFs, notes, and transcripts to provide answers that are both fast and accurate.
                  </p>
                </div>

                <div className="grid gap-6">
                   {[
                     { title: 'Dual-AI Choice', desc: 'Toggle between Groq (Fast) and Gemini (Deep) in real-time.', icon: Zap },
                     { title: 'Voice Synthesis', desc: 'Speak your thoughts. Let the AI transcribe and synthesize.', icon: Mic },
                     { title: 'Knowledge Pinning', desc: 'Bookmark key insights directly to your research notes.', icon: BookOpen },
                   ].map((f, i) => (
                     <div key={i} className="flex gap-6 items-center p-6 bg-white rounded-[40px] border border-[#2D2429]/5 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-[#FDFBF7] flex items-center justify-center shrink-0 shadow-lg border border-[#2D2429]/5">
                          <f.icon className="text-[#E8A2A2]" size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-sm">{f.title}</h3>
                          <p className="text-[11px] font-bold opacity-30">{f.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

              <div className="relative group">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   whileInView={{ opacity: 1, scale: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                   className="w-full aspect-[4/3] bg-white rounded-[60px] border border-[#2D2429]/5 shadow-2xl overflow-hidden relative"
                 >
                    <img 
                      src="/vercel_features.png" 
                      alt="EduMesh Elite Studio Preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
                 </motion.div>
                 
                 {/* Floating accents */}
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E8A2A2]/5 rounded-full blur-3xl -z-10" />
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FCE3EA]/5 rounded-full blur-3xl -z-10" />
              </div>
          </div>

          <div className="text-center space-y-20">
             <div className="space-y-6">
                <h2 className="text-5xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>Built for the future of learning.</h2>
                <p className="text-lg font-bold opacity-30 max-w-xl mx-auto">Your research studio, perfectly balanced.</p>
             </div>
             <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: 'Mind Maps', desc: 'Visual connections between all your sources.', color: 'bg-[#C9F2E1]' },
                  { title: 'Audio Feed', desc: 'Convert your research into audio briefs.', color: 'bg-[#FCE3EA]' },
                  { title: 'Smart Study', desc: 'AI-generated quizzes based on your notes.', color: 'bg-[#A0C2D2]' }
                ].map((s, i) => (
                  <div key={i} className="p-12 bg-white rounded-[48px] border border-[#594A52]/5 shadow-sm space-y-6 hover:-translate-y-2 transition-all">
                     <div className={`w-16 h-16 ${s.color} rounded-[24px] mx-auto shadow-inner`} />
                     <h3 className="text-xl font-black leading-none">{s.title}</h3>
                     <p className="text-xs font-bold opacity-30">{s.desc}</p>
                  </div>
                ))}
             </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-16 border-t border-[#594A52]/5 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
           <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D5E3E8] flex items-center justify-center">
                  <Sparkles className="text-[#A0C2D2] w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter" style={{ fontFamily: 'Outfit' }}>EduMesh</span>
              </div>
              <p className="text-xs font-bold opacity-30 uppercase tracking-[0.3em]">Built for the curious.</p>
           </div>
           
           <div className="flex items-center gap-12 font-black text-[10px] uppercase tracking-widest opacity-40">
              <a href="#" className="hover:text-[#A0C2D2] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#A0C2D2] transition-colors">Terms</a>
              <a href="#" className="hover:text-[#A0C2D2] transition-colors">Feedback</a>
           </div>

           <div className="flex items-center gap-4 py-4 px-8 bg-[#F2F0E6] rounded-full">
              <ShieldCheck size={16} className="text-[#A0C2D2]" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Research Environment</span>
           </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .shadow-soft {
          box-shadow: 0 10px 40px -10px rgba(89, 74, 82, 0.08);
        }
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(to right, #A0C2D2, #594A52);
        }
      `}} />
    </div>
  );
};

export default Landing;
