import React from 'react';

const AnimatedBackground = () => {
  const blobs = [
    { bg: 'bg-lavender', size: 420, top: '-5%', left: '-8%', duration: 18, delay: 0 },
    { bg: 'bg-periwinkle', size: 380, top: '15%', right: '-6%', duration: 22, delay: 2 },
    { bg: 'bg-seafoam', size: 340, top: '55%', left: '10%', duration: 16, delay: 1 },
    { bg: 'bg-peach', size: 300, top: '70%', right: '5%', duration: 20, delay: 4 },
    { bg: 'bg-lemon', size: 260, top: '35%', left: '40%', duration: 14, delay: 3 },
    { bg: 'bg-blush', size: 320, top: '-10%', right: '25%', duration: 24, delay: 5 },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {blobs.map((blob, idx) => (
        <div
          key={idx}
          className={`absolute rounded-full ${blob.bg} opacity-[0.32] animate-blob blur-[80px]`}
          style={{
            width: `${blob.size}px`,
            height: `${blob.size}px`,
            top: blob.top,
            ...(blob.left ? { left: blob.left } : {}),
            ...(blob.right ? { right: blob.right } : {}),
            animationDuration: `${blob.duration}s`,
            animationDelay: `${blob.delay}s`,
            animationDirection: idx % 2 === 0 ? 'normal' : 'alternate-reverse'
          }}
        ></div>
      ))}
    </div>
  );
};

export default AnimatedBackground;

