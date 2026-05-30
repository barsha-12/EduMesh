import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Brain, ShieldCheck } from 'lucide-react';

const models = [
  { id: 'gemini', label: 'Gemini 1.5 Pro (High)', badge: 'New', icon: Brain, color: 'text-lavender' },
  { id: 'gemini-flash', label: 'Gemini 1.5 Flash (Fast)', badge: 'New', icon: Zap, color: 'text-mint' },
  { id: 'groq', label: 'Llama 3.3 70b (Ultra)', badge: 'Fast', icon: Sparkles, color: 'text-coral' },
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
            className="absolute bottom-full left-0 mb-4 w-72 glass-base rounded-[24px] shadow-2xl z-[70] overflow-hidden p-2 !bg-[rgba(255,255,255,0.95)]"
          >
            <div className="px-4 py-3 border-b border-[rgba(204,204,204,0.3)]">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Model Engine</span>
            </div>

            <div className="py-2 space-y-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelect(m.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] transition-all ${
                    activeModel === m.id ? 'bg-[rgba(208,170,255,0.15)] text-primary' : 'text-secondary hover:bg-[rgba(204,204,204,0.2)] hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <m.icon size={16} className={m.color} />
                    <span className="text-sm font-bold tracking-tight font-body">{m.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.badge && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[rgba(204,204,204,0.3)] rounded-pill text-secondary">
                        {m.badge}
                      </span>
                    )}
                    {activeModel === m.id && <Check size={14} className="text-lavender" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="px-4 py-3 border-t border-[rgba(204,204,204,0.3)] flex items-center gap-2">
               <ShieldCheck size={12} className="text-lavender" />
               <span className="text-[9px] font-bold text-secondary uppercase tracking-widest">Enterprise Privacy Enabled</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
