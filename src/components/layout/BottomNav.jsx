import React from 'react';
import { LayoutDashboard, MessageCircle, Network, FileText, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'AI Chat' },
    { path: '/notebooks', icon: Network, label: 'Studios' },
    { path: '/notes', icon: FileText, label: 'Library' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 transition-all duration-500">
      <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border-t border-v-text/5 px-6 pb-8 pt-4 flex items-center justify-between shadow-2xl">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 group transition-all duration-300 ${
                isActive ? 'text-v-primary scale-110' : 'text-v-text/30'
              }`}
            >
              <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-v-primary/10' : 'group-hover:bg-v-surface'}`}>
                <Icon size={20} className={isActive ? 'text-v-primary' : 'group-hover:text-v-primary'} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-v-primary rounded-full mt-0.5" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
