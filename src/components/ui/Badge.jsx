import React from 'react';

const Badge = ({ children, variant = 'filled', color = 'lavender', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const colors = {
    lavender: {
      filled: 'bg-gradient-to-br from-lavender to-periwinkle text-primary',
      outlined: 'border-[1.5px] border-lavender text-lavender',
      tonal: 'bg-[rgba(208,170,255,0.20)] text-primary',
    },
    mint: {
      filled: 'bg-gradient-to-br from-mint to-seafoam text-primary',
      outlined: 'border-[1.5px] border-mint text-primary',
      tonal: 'bg-[rgba(178,255,212,0.25)] text-primary',
    },
    rose: {
      filled: 'bg-gradient-to-br from-rose to-coral text-primary',
      outlined: 'border-[1.5px] border-rose text-rose',
      tonal: 'bg-[rgba(255,176,176,0.25)] text-primary',
    },
    lemon: {
      filled: 'bg-lemon text-primary',
      outlined: 'border-[1.5px] border-lemon text-primary',
      tonal: 'bg-[rgba(245,245,168,0.30)] text-primary',
    },
    orchid: {
      filled: 'bg-gradient-to-br from-orchid to-lilac text-primary',
      outlined: 'border-[1.5px] border-orchid text-orchid',
      tonal: 'bg-[rgba(255,170,240,0.20)] text-primary',
    },
  };

  const colorStyles = colors[color] || colors.lavender;

  return (
    <span className={`inline-block rounded-pill font-body font-medium ${sizes[size]} ${colorStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
