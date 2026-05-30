import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import BottomTabBar from './BottomTabBar';
import AnimatedBackground from './AnimatedBackground';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-body bg-page text-primary relative">
      <AnimatedBackground />
      
      {/* 64px fixed Navbar */}
      <Navbar />
      
      <div className="flex flex-1 pt-[64px] relative z-10">
        {/* 240px fixed Sidebar for desktop */}
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 sm:ml-[240px] pb-[64px] sm:pb-0">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-8 min-h-[calc(100vh-64px)]">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav for mobile */}
      <BottomTabBar />
    </div>
  );
}
