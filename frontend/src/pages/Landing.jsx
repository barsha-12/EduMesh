import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, BookOpen, MessageSquare, ArrowRight, Zap, Target, Shield, Layout, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#F7F5E8] dark:bg-[#1c1a16] text-[#2c2c2c] dark:text-[#f7f5e8] selection:bg-[#EAC7C7]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 flex items-center justify-between backdrop-blur-md bg-[#F7F5E8]/60 dark:bg-[#1c1a16]/60 border-b border-black/[0.03] dark:border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#E8A2A2]/20">
            E
          </div>
          <span className="text-xl font-black tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }}>EduMesh</span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-sm font-bold hover:text-[#E8A2A2] transition-colors">Features</a>
          <a href="#philosophy" className="text-sm font-bold hover:text-[#E8A2A2] transition-colors">Philosophy</a>
          <Link to="/pricing" className="text-sm font-bold hover:text-[#E8A2A2] transition-colors">Plus</Link>
          <Link to="/dashboard" className="px-6 py-2.5 bg-[#E8A2A2] text-[#2c2c2c] rounded-full text-sm font-black hover:scale-105 transition-all shadow-xl shadow-[#E8A2A2]/30">
            Try EduMesh
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D5E3E8] dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#A0C2D2]"
        >
          <Sparkles size={14} /> Intelligence Synthesized
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter leading-tight" 
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Your AI Research & <br /> <span className="text-gradient">Thinking Partner.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-medium"
        >
          EduMesh is an AI-powered notebook that helps you bridge the gap between information and insight. Upload sources, converse with context, and generate studio-grade outputs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
        >
          <Link to="/dashboard" className="px-12 py-6 bg-[#E8A2A2] text-[#2c2c2c] rounded-3xl text-lg font-black hover:scale-105 transition-all shadow-2xl shadow-[#E8A2A2]/40 flex items-center gap-4">
            Create Your First Notebook <ArrowRight />
          </Link>
          <Link to="/dashboard" className="px-12 py-6 bg-white dark:bg-white/5 rounded-3xl text-lg font-black hover:bg-gray-50 transition-all border border-black/5 dark:border-white/5">
            Discover Library
          </Link>
        </motion.div>
      </header>

      {/* Philosophy / 3-Panel Preview Section */}
      <section id="features" className="py-32 px-6 md:px-12 bg-[#EAE0DA] dark:bg-[#2a2620]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Solving the fractured workspace.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              We built EduMesh to solve "tab overwhelm"—the scattered experience of jumping between tools while trying to synthesize ideas. Our 3-panel workspace brings inputs, conversation, and outputs into a single cohesive flow.
            </p>
            
            <div className="grid gap-6">
              {[
                { title: 'The Source Panel', desc: 'Centralized management for PDFs, YouTube transcripts, and URLs.', icon: BookOpen },
                { title: 'The Chat Engine', desc: 'Conversations powered by your specific sources with inline citations.', icon: MessageSquare },
                { title: 'The Studio Panel', desc: 'Transform synthesis into Podcasts, Mind Maps, and Briefs.', icon: Layout }
              ].map((f, i) => (
                <div key={i} className="flex gap-6 p-6 rounded-3xl bg-[#F7F5E8] dark:bg-[#1c1a16] border border-black/[0.03] dark:border-white/[0.03]">
                  <div className="w-12 h-12 rounded-2xl bg-[#D5E3E8] flex items-center justify-center shrink-0">
                    <f.icon className="text-[#A0C2D2]" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#E8A2A2] via-[#A0C2D2] to-[#EAC7C7] rounded-[48px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative m3-card !p-2 overflow-hidden aspect-video shadow-2xl">
              <div className="w-full h-full bg-[#1c1a16] rounded-[22px] flex items-center justify-center p-12">
                 <div className="grid grid-cols-12 gap-4 w-full h-full">
                    <div className="col-span-3 rounded-xl bg-white/5 border border-white/5 p-4 space-y-4">
                       <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                       <div className="h-4 w-full bg-white/10 rounded-full" />
                       <div className="h-20 w-full bg-white/5 rounded-xl" />
                    </div>
                    <div className="col-span-6 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-end">
                       <div className="h-10 w-full bg-white/10 rounded-full mb-2" />
                       <div className="h-2 w-1/4 bg-white/10 rounded-full self-end" />
                    </div>
                    <div className="col-span-3 rounded-xl bg-white/5 border border-white/5 p-4 space-y-4">
                       <div className="h-32 w-full bg-[#E8A2A2]/20 rounded-xl" />
                       <div className="h-12 w-full bg-white/10 rounded-xl" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Studio Outputs Section */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-6">
          <h2 className="text-5xl font-black tracking-tight font-['Outfit']">Studio-Grade Synthesis.</h2>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Conversation is just the start. Move from thinking to creating with specialized output generators.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Audio Overviews', desc: 'Podcast-style conversations between AI hosts to help you digest complex topics.', icon: Radio, accent: '#D5E3E8' },
            { title: 'Mind Maps', desc: 'Visual interactive concept maps that link ideas across all your sources.', icon: Brain, accent: '#EAC7C7' },
            { title: 'Reports & Briefs', desc: 'Professional study guides, FAQs, and briefing docs in seconds.', icon: Zap, accent: '#E8A2A2' }
          ].map((out, i) => (
            <div key={i} className="m3-card group hover:scale-105 cursor-default !p-10 space-y-8">
               <div className="w-20 h-20 rounded-[32px] mx-auto flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12" style={{ backgroundColor: out.accent }}>
                  <out.icon size={32} className="text-[#2c2c2c]" />
               </div>
               <div className="space-y-4">
                 <h3 className="text-2xl font-black">{out.title}</h3>
                 <p className="text-sm text-gray-400 font-medium leading-relaxed">{out.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 bg-[#EAE0DA] dark:bg-[#1c1a16] border-t border-black/[0.03] dark:border-white/[0.03]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] flex items-center justify-center text-white font-black text-sm">E</div>
            <span className="text-lg font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>EduMesh</span>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Free tier: up to 5 notebooks • 50 sources each • <Link to="/pricing" className="text-[#E8A2A2] hover:underline">Upgrade to Plus</Link>
          </p>
          <div className="flex gap-8 text-sm font-bold text-gray-500">
            <a href="#" className="hover:text-[#2c2c2c] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#2c2c2c] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#2c2c2c] transition-colors">Feedback</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
