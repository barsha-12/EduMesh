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
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    icon: 'text-emerald-500',
    text: 'text-emerald-900 dark:text-emerald-200',
  },
  info: {
    bg: 'bg-[#A0C2D2]/10 border-[#A0C2D2]/20',
    icon: 'text-[#A0C2D2]',
    text: 'text-[#2c2c2c] dark:text-[#A0C2D2]',
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: 'text-amber-500',
    text: 'text-amber-900 dark:text-amber-200',
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/20',
    icon: 'text-red-500',
    text: 'text-red-900 dark:text-red-200',
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
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-xl ${colors.bg}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${colors.icon}`} />
              <p className={`text-sm font-medium flex-1 ${colors.text}`}>
                {toast.message}
              </p>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
