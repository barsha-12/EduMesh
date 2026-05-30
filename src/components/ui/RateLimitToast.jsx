import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertCircle, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

/**
 * RateLimitToast component
 * Monitors the global toast store for rate-limit specific warnings
 * and displays a premium, attention-grabbing notice.
 */
export default function RateLimitToast() {
  const { toasts, removeToast } = useToastStore();
  
  // Find if there's an active rate limit toast
  const rateLimitToast = toasts.find(t => t.message.toLowerCase().includes('rate limit'));

  if (!rateLimitToast) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-md px-6 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="pointer-events-auto bg-gradient-to-r from-peach to-coral text-primary rounded-[24px] p-1 shadow-[0_8px_32px_rgba(255,187,170,0.4)] border-[1.5px] border-[rgba(255,255,255,0.6)] overflow-hidden"
        >
          <div className="bg-[rgba(255,255,255,0.4)] backdrop-blur-md px-6 py-4 flex items-center gap-4 rounded-[20px]">
            <div className="w-10 h-10 bg-white/50 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/40">
               <Zap size={20} className="fill-coral text-coral" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-black font-display uppercase tracking-widest leading-none mb-1 text-primary">Elite Limit reached</h4>
              <p className="text-[10px] font-body font-bold opacity-80 leading-tight text-secondary">Groq is cooling down. We've switched to Gemini Pro for your next request automatically.</p>
            </div>

            <button 
              onClick={() => removeToast(rateLimitToast.id)}
              className="p-2 hover:bg-white/40 rounded-lg transition-colors text-secondary hover:text-primary"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="h-1 bg-[rgba(255,255,255,0.3)] w-full overflow-hidden absolute bottom-0 left-0 rounded-b-[24px]">
             <motion.div 
               initial={{ width: "100%" }}
               animate={{ width: "0%" }}
               transition={{ duration: 5, ease: "linear" }}
               className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
             />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
