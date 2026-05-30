import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import GlassCard from '../components/ui/GlassCard';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import AnimatedBackground from '../components/layout/AnimatedBackground';

export default function Login() {
  const navigate = useNavigate();
  const { signInAsDemo: demoLogin, signInWithGoogle, isAuthenticated } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4 relative overflow-hidden font-body text-primary">
      <AnimatedBackground />

      {/* Giant soft-glow orb behind the card */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, var(--color-lavender) 0%, transparent 70%)',
          opacity: 0.4,
          zIndex: 0
        }}
      ></div>

      {/* Main Card */}
      <div className="w-full max-w-[440px] z-10 animate-fade-in relative group" style={{ perspective: '800px' }}>
        <GlassCard 
          className="transition-transform duration-500 hover:rotate-x-[1.5deg]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="font-brand text-[2.2rem] bg-clip-text text-transparent bg-gradient-to-r from-lavender via-periwinkle to-orchid animate-pulse-soft">
              EduMesh
            </h1>
            <p className="font-body font-medium text-secondary text-sm mt-1">
              Synthesize Without Limits
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-[rgba(255,255,255,0.5)] p-1 rounded-pill mb-6">
            <button 
              className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-periwinkle to-lavender text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-2 rounded-pill text-sm font-semibold transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-periwinkle to-lavender text-primary shadow-sm' : 'text-secondary hover:text-primary'}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            <InputField 
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <InputField 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isLogin && (
              <InputField 
                type="password"
                placeholder="Confirm Password"
              />
            )}
          </div>

          {/* Primary CTA */}
          <Button 
            className="w-full relative overflow-hidden group/btn mb-6" 
            size="lg"
            onClick={() => {}}
          >
            {/* Shimmer sweep animation */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.3)] to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10">{isLogin ? 'Sign In →' : 'Sign Up →'}</span>
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2 mb-6">
            <div className="flex-1 h-px bg-[rgba(204,204,204,0.3)]" />
            <span className="text-[0.65rem] uppercase font-bold tracking-widest text-muted">or continue with</span>
            <div className="flex-1 h-px bg-[rgba(204,204,204,0.3)]" />
          </div>

          {/* Alternative Logins */}
          <div className="space-y-3">
            <Button 
              variant="ghost"
              className="w-full border-[1.5px] border-taupe bg-[rgba(255,255,255,0.5)] flex items-center justify-center gap-3 shadow-sm hover:bg-white"
              onClick={() => signInWithGoogle()}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            
            <Button 
              variant="ghost"
              className="w-full bg-[rgba(255,217,179,0.3)] hover:bg-[rgba(255,217,179,0.5)] border border-[rgba(255,217,179,0.5)] text-primary shadow-sm"
              onClick={async () => { 
                const res = await demoLogin(); 
                if (!res.error) navigate('/dashboard'); 
              }}
            >
              ⚡ Quick Demo Login
            </Button>
          </div>
        </GlassCard>
      </div>

      {/* Floating Bottom Decorations */}
      <div className="absolute bottom-10 left-10 w-8 h-8 rounded-full bg-lemon opacity-60 animate-[float_6s_ease-in-out_infinite_alternate]"></div>
      <div className="absolute bottom-20 right-20 w-12 h-12 rounded-full bg-mint opacity-50 animate-[float_8s_ease-in-out_infinite_alternate_reverse]"></div>
      <div className="absolute bottom-8 right-1/4 w-6 h-6 rounded-full bg-peach opacity-70 animate-[float_5s_ease-in-out_infinite_alternate]"></div>
    </div>
  );
}
