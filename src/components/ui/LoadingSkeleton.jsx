import React from 'react';

const variants = {
  card: 'h-40 rounded-3xl',
  text: 'h-4 rounded-lg',
  'text-sm': 'h-3 rounded-md',
  title: 'h-6 rounded-xl',
  stat: 'h-28 rounded-3xl',
  avatar: 'h-12 w-12 rounded-2xl',
  chart: 'h-48 rounded-3xl',
};

export function Skeleton({ variant = 'text', className = '', width = 'w-full' }) {
  return (
    <div
      className={`animate-pulse bg-gray-200/60 dark:bg-white/5 ${variants[variant] || variants.text} ${width} ${className}`}
    />
  );
}

export function CardSkeleton({ className = '' }) {
  return (
    <div className={`m3-card animate-pulse space-y-4 ${className}`}>
      <Skeleton variant="title" width="w-1/3" />
      <div className="space-y-2">
        <Skeleton variant="text" width="w-full" />
        <Skeleton variant="text" width="w-5/6" />
        <Skeleton variant="text" width="w-4/6" />
      </div>
    </div>
  );
}

export function StatsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="m3-card !p-5 animate-pulse space-y-4">
          <Skeleton variant="avatar" width="w-12" />
          <div className="space-y-2">
            <Skeleton variant="title" width="w-20" />
            <Skeleton variant="text-sm" width="w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-6 p-8">
      {[false, true, false].map((isUser, i) => (
        <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`flex items-start gap-4 max-w-[70%] ${isUser ? 'flex-row-reverse' : ''}`}>
            <Skeleton variant="avatar" width="w-9" className="!h-9 !rounded-xl shrink-0" />
            <div className={`space-y-2 ${isUser ? 'items-end' : ''}`}>
              <Skeleton variant="text" width="w-48" />
              <Skeleton variant="text" width="w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
