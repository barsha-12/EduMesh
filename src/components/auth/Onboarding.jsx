import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Rocket } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';

const steps = [
  {
    title: "Welcome to EduMesh Elite",
    desc: "Your AI-powered research studio is ready. Let's take a quick look at what's new.",
    icon: Sparkles,
    color: "bg-lavender/30 text-lavender",
    gradient: "from-lavender to-periwinkle"
  },
  {
    title: "Dual AI Engines",
    desc: "Switch between Gemini Pro for deep research and Llama 3 for rapid analysis instantly.",
    icon: Brain,
    color: "bg-seafoam/30 text-seafoam",
    gradient: "from-seafoam to-mint"
  },
  {
    title: "Synthesized Learning",
    desc: "Chat with your documents, generate mind maps, and create flashcards with one click.",
    icon: Zap,
    color: "bg-peach/30 text-peach",
    gradient: "from-peach to-lemon"
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 font-body">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-page/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md z-10"
      >
        <GlassCard className="text-center overflow-hidden pt-10">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[rgba(204,204,204,0.25)]">
             <motion.div 
              className={`h-full bg-gradient-to-r ${steps[currentStep].gradient}`} 
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
             />
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 mb-8"
            >
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-sm border border-white/40 ${steps[currentStep].color}`}>
                 <StepIcon size={36} className="text-primary" />
              </div>
              
              <div className="space-y-3 px-4">
                <h2 className="font-display font-bold text-2xl text-primary">
                  {steps[currentStep].title}
                </h2>
                <p className="font-body text-sm font-medium text-secondary leading-relaxed">
                  {steps[currentStep].desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            <Button 
              size="lg"
              onClick={handleNext}
              className={`w-full bg-gradient-to-r ${steps[currentStep].gradient} flex items-center justify-center gap-2`}
            >
              <span className="text-primary">{currentStep === steps.length - 1 ? "Get Started" : "Continue"}</span>
              <Rocket size={16} className="text-primary" />
            </Button>
            
            <div className="flex justify-center gap-2 mt-2">
               {steps.map((_, i) => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentStep ? `w-4 bg-gradient-to-r ${steps[currentStep].gradient}` : 'bg-[rgba(204,204,204,0.4)]'}`} />
               ))}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
