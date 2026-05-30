import React, { forwardRef } from 'react';
import { cn } from './GlassCard';

const InputField = forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        'bg-[rgba(255,255,255,0.80)] border-[1.5px] border-[rgba(204,204,204,0.50)]',
        'rounded-[14px] px-4 py-3',
        'font-body font-normal text-base text-primary placeholder:text-muted',
        'transition-all duration-300 outline-none',
        'focus:border-lavender focus:shadow-[0_0_0_4px_rgba(208,170,255,0.20)] focus:bg-[rgba(255,255,255,0.95)]',
        className
      )}
      {...props}
    />
  );
});

InputField.displayName = 'InputField';

export default InputField;
