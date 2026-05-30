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
      <div className="bg-[rgba(255,255,255,0.90)] backdrop-blur-[20px] border-t border-[rgba(204,204,204,0.35)] px-6 pb-8 pt-4 flex items-center justify-between shadow-[0_-4px_24px_rgba(110,116,136,0.08)]">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 group transition-all duration-300 ${
                isActive ? 'text-lavender scale-110' : 'text-pearl'
              }`}
            >
              <div className={`p-2 rounded-card transition-all ${isActive ? 'bg-[rgba(208,170,255,0.15)]' : 'group-hover:bg-[rgba(208,170,255,0.08)]'}`}>
                <Icon size={20} className={isActive ? 'text-lavender' : 'group-hover:text-lavender'} />
              </div>
              <span className="text-[10px] font-body font-bold uppercase tracking-tighter">{label}</span>
              {isActive && (
                <div className="w-[6px] h-[6px] bg-orchid rounded-full mt-0.5" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
