import React from 'react';
import { cn } from './GlassCard'; // Reusing cn utility

const variants = {
  primary: 'bg-gradient-to-br from-periwinkle to-lavender text-primary shadow-[0_4px_16px_rgba(178,204,255,0.45)] hover:shadow-[0_8px_24px_rgba(178,204,255,0.60)]',
  secondary: 'bg-[rgba(255,255,255,0.6)] border-[1.5px] border-taupe text-primary',
  danger: 'bg-gradient-to-br from-rose to-coral text-primary',
  success: 'bg-gradient-to-br from-mint to-lime text-primary',
  ghost: 'bg-transparent text-secondary hover:bg-[rgba(0,0,0,0.05)]',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3 text-[0.9rem]',
  lg: 'px-8 py-4 text-base w-full',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        'font-body font-semibold rounded-pill transition-all duration-300 flex items-center justify-center gap-2',
        'hover:scale-[1.03] active:scale-[0.97]',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100 active:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
