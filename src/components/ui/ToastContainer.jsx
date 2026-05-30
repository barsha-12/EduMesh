import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colorMap = {
  success: {
    bg: 'bg-[rgba(178,255,212,0.25)] border-[1.5px] border-[rgba(178,255,212,0.5)]', // mint
    icon: 'text-mint drop-shadow-[0_0_8px_rgba(178,255,212,0.8)]',
    text: 'text-primary',
  },
  info: {
    bg: 'bg-[rgba(178,204,255,0.25)] border-[1.5px] border-[rgba(178,204,255,0.5)]', // periwinkle
    icon: 'text-periwinkle drop-shadow-[0_0_8px_rgba(178,204,255,0.8)]',
    text: 'text-primary',
  },
  warning: {
    bg: 'bg-[rgba(245,245,168,0.40)] border-[1.5px] border-[rgba(245,245,168,0.6)]', // lemon
    icon: 'text-sand',
    text: 'text-primary',
  },
  error: {
    bg: 'bg-[rgba(255,176,176,0.30)] border-[1.5px] border-[rgba(255,176,176,0.5)]', // rose
    icon: 'text-rose drop-shadow-[0_0_8px_rgba(255,176,176,0.8)]',
    text: 'text-primary',
  },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info;
          const colors = colorMap[toast.type] || colorMap.info;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-card backdrop-blur-[16px] shadow-soft ${colors.bg}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${colors.icon}`} />
              <p className={`text-sm font-body font-medium flex-1 ${colors.text}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-secondary" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
