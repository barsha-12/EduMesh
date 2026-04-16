import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { 
  Sparkles, MessageSquare, BookOpen, Brain, 
  Zap, LogIn, Mail, Lock
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { signInWithGoogle: loginWithGoogle, signInAsDemo: demoLogin, isAuthenticated, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const features = [
    { 
      icon: MessageSquare, 
      label: 'AI Study Chat', 
      desc: 'Ask doubts instantly',
      color: 'bg-white text-indigo-400'
    },
    { 
      icon: BookOpen, 
      label: 'Smart Notes', 
      desc: 'AI-generated notes',
      color: 'bg-white text-rose-400'
    },
    { 
      icon: Brain, 
      label: 'Quiz Practice', 
      desc: 'Test your knowledge',
      color: 'bg-white text-amber-500'
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF3] font-sans text-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Brand & Feature Showcase */}
        <div className="space-y-10 px-4 md:px-12">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F2F0E6] to-[#A0C2D2] rounded-[28%] flex items-center justify-center shadow-xl shadow-indigo-100 p-4">
              <div className="w-full h-full bg-white/40 rounded-2xl flex items-center justify-center">
                <Sparkles className="text-white w-10 h-10" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>
                <span className="bg-gradient-to-r from-rose-300 via-v-primary to-indigo-300 bg-clip-text text-transparent">EduMesh</span>
              </h1>
              <h2 className="text-6xl font-black tracking-tight text-slate-900" style={{ fontFamily: 'Outfit' }}>
                Study Buddy.
              </h2>
            </div>
            
            <p className="text-lg font-medium text-slate-500 max-w-md leading-relaxed">
              Your AI-powered study companion. Get instant explanations, generate smart notes, and practice with quizzes — all in one place.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-6 p-5 bg-[#EFECE1]/40 rounded-[32px] border border-white/50 w-full max-w-sm">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{f.label}</h3>
                  <p className="text-xs font-medium text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="bg-[#EFECE1]/50 rounded-[40px] p-10 md:p-16 border border-white/30 space-y-10 shadow-sm w-full max-w-lg mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-800" style={{ fontFamily: 'Outfit' }}>Welcome Back</h2>
            <p className="text-sm font-medium text-slate-400">Sign in to continue studying</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Email</label>
              <input 
                type="email" 
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-8 py-5 rounded-[24px] bg-white border-none focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium placeholder-slate-300 shadow-sm transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-4">Password</label>
              <input 
                type="password" 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-8 py-5 rounded-[24px] bg-white border-none focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium placeholder-slate-300 shadow-sm transition-all"
              />
            </div>

            <button 
              className="w-full py-5 bg-[#E6A0A0] hover:bg-rose-400 text-slate-800 font-bold rounded-[24px] shadow-lg shadow-rose-100 transition-all flex items-center justify-center gap-2"
              onClick={() => {}}
            >
              <LogIn size={18} />
              Sign In
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-200">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-4">
              <button 
                onClick={async () => { const res = await demoLogin(); if (!res.error) navigate('/dashboard'); }}
                className="w-full py-5 bg-[#E9E4D6] hover:bg-[#E2DCC9] text-slate-600 font-bold rounded-[24px] shadow-inner transition-all flex items-center justify-center gap-3"
              >
                <Zap size={18} className="text-amber-500" /> Quick Demo Login (Bypass Auth)
              </button>

              <button 
                onClick={() => loginWithGoogle()}
                className="w-full py-5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-[24px] shadow-sm border border-slate-100 transition-all flex items-center justify-center gap-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            <p className="text-center text-sm font-semibold text-slate-400">
              Don't have an account? <span className="text-rose-400 cursor-pointer hover:underline">Sign Up</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
