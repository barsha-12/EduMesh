import React from 'react';

const Badge = ({ children, variant = 'filled', color = 'blue', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const colors = {
    blue: {
      filled: 'bg-blue-600 text-white dark:bg-blue-500',
      outlined: 'border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400',
      tonal: 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-200',
    },
    green: {
      filled: 'bg-green-600 text-white dark:bg-green-500',
      outlined: 'border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400',
      tonal: 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-200',
    },
    red: {
      filled: 'bg-red-600 text-white dark:bg-red-500',
      outlined: 'border border-red-600 text-red-600 dark:border-red-400 dark:text-red-400',
      tonal: 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200',
    },
    yellow: {
      filled: 'bg-yellow-600 text-white dark:bg-yellow-500',
      outlined: 'border border-yellow-600 text-yellow-600 dark:border-yellow-400 dark:text-yellow-400',
      tonal: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200',
    },
    purple: {
      filled: 'bg-purple-600 text-white dark:bg-purple-500',
      outlined: 'border border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400',
      tonal: 'bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-200',
    },
  };

  return (
    <span className={`inline-block rounded-full font-medium ${sizes[size]} ${colors[color][variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
