import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Brain, ShieldCheck } from 'lucide-react';

const models = [
  { id: 'gemini', label: 'Gemini 1.5 Pro (High)', badge: 'New', icon: Brain, color: 'text-v-primary' },
  { id: 'gemini-flash', label: 'Gemini 1.5 Flash (Fast)', badge: 'New', icon: Zap, color: 'text-amber-400' },
  { id: 'groq', label: 'Llama 3.3 70b (Ultra)', badge: 'Fast', icon: Sparkles, color: 'text-v-accent' },
];

export default function ModelPicker({ isOpen, onClose, activeModel, onSelect }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full left-0 mb-4 w-72 bg-[#1c1a16] border border-white/10 rounded-3xl shadow-2xl z-[70] overflow-hidden p-2"
          >
            <div className="px-4 py-3 border-b border-white/5 bg-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Model Engine</span>
            </div>

            <div className="py-2 space-y-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelect(m.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
                    activeModel === m.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <m.icon size={16} className={m.color} />
                    <span className="text-sm font-bold tracking-tight">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.badge && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white/10 rounded-full opacity-60">
                        {m.badge}
                      </span>
                    )}
                    {activeModel === m.id && <Check size={14} className="text-v-primary" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-white/5 bg-white/5 flex items-center gap-2">
               <ShieldCheck size={12} className="text-v-primary/60" />
               <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Enterprise Privacy Enabled</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
