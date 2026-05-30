import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Lavender Blob */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-lavender mix-blend-multiply opacity-30 animate-blob blur-[80px]"
        style={{ animationDuration: '22s', animationDelay: '0s' }}
      ></div>
      
      {/* Periwinkle Blob */}
      <div 
        className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-periwinkle mix-blend-multiply opacity-25 animate-blob blur-[80px]"
        style={{ animationDuration: '18s', animationDelay: '2s', animationDirection: 'alternate-reverse' }}
      ></div>
      
      {/* Mint Blob */}
      <div 
        className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-mint mix-blend-multiply opacity-30 animate-blob blur-[80px]"
        style={{ animationDuration: '24s', animationDelay: '4s' }}
      ></div>

      {/* Peach Blob */}
      <div 
        className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-peach mix-blend-multiply opacity-35 animate-blob blur-[80px]"
        style={{ animationDuration: '20s', animationDelay: '6s', animationDirection: 'alternate-reverse' }}
      ></div>
      
      {/* Seafoam Blob */}
      <div 
        className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-seafoam mix-blend-multiply opacity-25 animate-blob blur-[80px]"
        style={{ animationDuration: '26s', animationDelay: '1s' }}
      ></div>
    </div>
  );
};

export default AnimatedBackground;
