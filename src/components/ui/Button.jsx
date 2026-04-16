import React from 'react';

const Button = ({
  children,
  variant = 'filled',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon: Icon = null,
  onClick,
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variants = {
    filled: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    outlined: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800',
    text: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-800',
    elevated: 'bg-blue-100 text-blue-900 hover:bg-blue-200 dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-gray-700',
  };

  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        focus:ring-blue-500 dark:focus:ring-offset-gray-950
        ${sizes[size]} ${variants[variant]} ${disabledClass}
        ${fullWidth ? 'w-full' : ''} ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export default Button;
