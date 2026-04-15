import React from 'react';
import Sidebar from './Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F5E8] dark:bg-[#1c1a16] text-[#2c2c2c] dark:text-[#f7f5e8] transition-colors duration-300">
      <Sidebar />
      <div className="pl-0 sm:pl-[80px] transition-all duration-300">
        <div className="max-w-[1600px] mx-auto min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
