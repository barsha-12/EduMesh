import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const variants = {
  base: 'bg-[rgba(255,255,255,0.72)]',
  peach: 'bg-[rgba(255,217,179,0.15)]',
  lavender: 'bg-[rgba(208,170,255,0.15)]',
  seafoam: 'bg-[rgba(168,255,236,0.15)]',
  periwinkle: 'bg-[rgba(178,204,255,0.15)]',
};

const GlassCard = ({ children, variant = 'base', className, interactive = true, ...props }) => {
  return (
    <div
      className={cn(
        'glass-base p-6 transition-all duration-250 ease-out',
        interactive && 'hover:-translate-y-[3px] hover:shadow-[0_16px_48px_rgba(176,200,255,0.25)]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
