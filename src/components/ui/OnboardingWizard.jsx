import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Brain, BookOpen } from 'lucide-react';

export default function OnboardingWizard() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if new user
    const hasSeen = localStorage.getItem('edumesh-onboarding');
    if (!hasSeen) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsVisible(false);
      localStorage.setItem('edumesh-onboarding', 'true');
    }
  };

  const skip = () => {
    setIsVisible(false);
    localStorage.setItem('edumesh-onboarding', 'true');
  };

  const slides = [
    {
      icon: Sparkles,
      title: "Welcome to EduMesh",
      desc: "Your new safe space for learning. We've redesigned everything into a soothing pastel aesthetic so you can study without eye strain.",
      color: "text-lavender",
      bg: "bg-[rgba(208,170,255,0.15)]"
    },
    {
      icon: Brain,
      title: "Battle Your Past Self",
      desc: "Our AI tracks your weak points and challenges you over time. Plus, you can easily export chats or trigger the Command Palette via Ctrl+K.",
      color: "text-seafoam",
      bg: "bg-[rgba(168,255,236,0.15)]"
    },
    {
      icon: BookOpen,
      title: "Ready to scale up?",
      desc: "EduMesh is now supercharged on robust servers. Start by uploading a PDF lecture or jumping into the AI chat safely.",
      color: "text-coral",
      bg: "bg-[rgba(255,187,170,0.15)]"
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[rgba(250,250,245,0.6)] backdrop-blur-[8px]">
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg glass-base p-8 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 flex gap-1">
               {slides.map((_, i) => (
                 <div key={i} className={`w-8 h-1.5 rounded-full transition-colors ${i === step ? 'bg-lavender' : 'bg-[rgba(204,204,204,0.3)]'}`} />
               ))}
            </div>
            
            <div className="my-8 text-center flex flex-col items-center">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-20 h-20 rounded-[24px] ${slides[step].bg} flex items-center justify-center mb-6 shadow-sm border-[1.5px] border-white/50`}
              >
                {React.createElement(slides[step].icon, { className: `w-10 h-10 ${slides[step].color}` })}
              </motion.div>
              <h2 className="text-2xl font-display font-bold text-primary mb-3">{slides[step].title}</h2>
              <p className="text-secondary font-body text-sm leading-relaxed max-w-sm">{slides[step].desc}</p>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={skip} className="px-4 py-2 font-body text-sm font-medium text-muted hover:text-secondary transition-colors">
                Skip Primer
              </button>
              <button onClick={handleNext} className="px-6 py-3 bg-gradient-to-br from-periwinkle to-lavender text-primary rounded-pill font-body font-bold shadow-[0_4px_16px_rgba(178,204,255,0.45)] hover:shadow-[0_8px_24px_rgba(178,204,255,0.60)] hover:scale-[1.03] active:scale-[0.97] flex items-center gap-2 transition-all">
                {step === 2 ? "Let's Learn" : "Next Part"} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
