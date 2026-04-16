import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, MessageSquare, Rocket, Check } from 'lucide-react';

const steps = [
  {
    title: "Welcome to EduMesh Elite",
    desc: "Your AI-powered research studio is ready. Let's take a quick look at what's new.",
    icon: Sparkles,
    color: "bg-v-primary/20 text-v-primary"
  },
  {
    title: "Dual AI Engines",
    desc: "Switch between Gemini Pro for deep research and Llama 3 for rapid analysis instantly.",
    icon: Brain,
    color: "bg-v-accent/20 text-v-accent"
  },
  {
    title: "Synthesized Learning",
    desc: "Chat with your documents, generate mind maps, and create flashcards with one click.",
    icon: Zap,
    color: "bg-amber-100 text-amber-500"
  }
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-v-bg/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-[48px] shadow-2xl border border-v-text/5 p-12 overflow-hidden text-center space-y-8"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-v-text/5">
           <motion.div 
            className="h-full bg-v-primary" 
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
           />
        </div>

        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <div className={`w-20 h-20 mx-auto rounded-[32px] ${steps[currentStep].color} flex items-center justify-center shadow-inner`}>
             <StepIcon size={40} />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>
              {steps[currentStep].title}
            </h2>
            <p className="text-sm font-medium opacity-40 leading-relaxed">
              {steps[currentStep].desc}
            </p>
          </div>
        </motion.div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleNext}
            className="w-full py-4 bg-v-primary text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-v-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
            <Rocket size={16} />
          </button>
          
          <div className="flex justify-center gap-2 mt-4">
             {steps.map((_, i) => (
               <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? 'w-4 bg-v-primary' : 'bg-v-text/10'}`} />
             ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
