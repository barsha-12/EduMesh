import React from 'react';

const Textarea = ({ label, error, disabled = false, helperText, rows = 4, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}

      <textarea
        rows={rows}
        className={`
          w-full px-4 py-2.5 rounded-lg border-2 transition-colors resize-none
          bg-white dark:bg-gray-800 text-gray-900 dark:text-white
          placeholder-gray-500 dark:placeholder-gray-400
          ${error
            ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}
          focus:outline-none
        `}
        disabled={disabled}
        {...props}
      />

      {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
      {helperText && !error && <span className="text-xs text-gray-500 dark:text-gray-400">{helperText}</span>}
    </div>
  );
};

export default Textarea;
