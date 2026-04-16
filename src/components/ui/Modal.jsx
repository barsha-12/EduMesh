import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md', closeButton = true, className = '' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-60" onClick={onClose} />

      <div
        className={`
          relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
          ${sizes[size]} w-full mx-4 max-h-[90vh] overflow-y-auto ${className}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <div className="p-6">{children}</div>

        {footer && <div className="border-t border-gray-200 dark:border-gray-800 p-6 flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
