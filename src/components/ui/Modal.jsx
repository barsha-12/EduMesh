import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', closeButton = true, className = '' }) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgba(58,60,74,0.40)] backdrop-blur-[4px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`
              relative glass-base
              ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto chat-scroll ${className}
            `}
          >
            <div className="flex items-center justify-between p-6 border-b border-[rgba(204,204,204,0.30)]">
              <h2 className="text-xl font-semibold font-display text-primary">{title}</h2>
              {closeButton && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(208,170,255,0.10)] transition-colors text-slate"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="p-6">{children}</div>

            {footer && <div className="border-t border-[rgba(204,204,204,0.30)] p-6 flex gap-3 justify-end">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
