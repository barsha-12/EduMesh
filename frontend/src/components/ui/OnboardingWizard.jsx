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
      color: "text-v-primary"
    },
    {
      icon: Brain,
      title: "Battle Your Past Self",
      desc: "Our AI tracks your weak points and challenges you over time. Plus, you can easily export chats or trigger the Command Palette via Ctrl+K.",
      color: "text-v-secondary"
    },
    {
      icon: BookOpen,
      title: "Ready to scale up?",
      desc: "EduMesh is now supercharged on robust servers. Start by uploading a PDF lecture or jumping into the AI chat safely.",
      color: "text-v-accent"
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-v-primary/40 backdrop-blur-md">
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-v-bg rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-v-surface"
          >
            <div className="absolute top-4 right-4 flex gap-1">
               {slides.map((_, i) => (
                 <div key={i} className={`w-8 h-1.5 rounded-full transition-colors ${i === step ? 'bg-v-primary' : 'bg-v-surface'}`} />
               ))}
            </div>
            
            <div className="my-8 text-center flex flex-col items-center">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 h-20 rounded-3xl bg-v-surface flex items-center justify-center mb-6 shadow-inner"
              >
                {React.createElement(slides[step].icon, { className: `w-10 h-10 ${slides[step].color}` })}
              </motion.div>
              <h2 className="text-2xl font-black mb-3">{slides[step].title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-sm">{slides[step].desc}</p>
            </div>

            <div className="flex items-center justify-between mt-8">
              <button onClick={skip} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-800 transition-colors">
                Skip Primer
              </button>
              <button onClick={handleNext} className="px-6 py-3 bg-v-primary text-white rounded-2xl font-bold shadow-lg shadow-v-primary/30 flex items-center gap-2 hover:scale-105 transition-all">
                {step === 2 ? "Let's Learn" : "Next Part"} <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
