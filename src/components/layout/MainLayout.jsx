import React from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from './Sidebar';
import PomodoroTimer from '../ui/PomodoroTimer';
import CommandPalette from '../ui/CommandPalette';
import OnboardingWizard from '../ui/OnboardingWizard';
import { Home, MessageSquare, Brain, BookOpen } from 'lucide-react';

export default function MainLayout({ children }) {
  const navItems = [
    { icon: Home, label: 'Dash', path: '/dashboard' },
    { icon: MessageSquare, label: 'Chat', path: '/chat' },
    { icon: BookOpen, label: 'Notes', path: '/notes' },
    { icon: Brain, label: 'Quiz', path: '/quiz' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF3] text-[#2D2429] transition-colors duration-300 relative">
      <CommandPalette />
      <OnboardingWizard />
      <Sidebar />
      <main style={{ 
        marginLeft: 'var(--sidebar-width, 200px)', 
        transition: 'margin-left 0.25s ease',
        padding: '0 var(--space-page-x)',
        minHeight: '100vh'
      }}>
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
      <PomodoroTimer />
      
      {/* Mobile Bottom Navigation - Minty Style */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/60 backdrop-blur-xl border-t border-[#594A52]/5 flex items-center justify-around z-50 px-4 pb-safe shadow-2xl">
        {navItems.map((item, i) => (
          <NavLink key={i} to={item.path} className={({ isActive }) => `flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all ${isActive ? 'bg-[#FCE3EA] text-[#594A52] shadow-sm' : 'text-[#594A52]/30 hover:text-[#594A52]'}`}>
             {({ isActive }) => (
               <>
                 <item.icon size={20} className={isActive ? 'scale-110' : ''} />
                 <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">{item.label}</span>
               </>
             )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
