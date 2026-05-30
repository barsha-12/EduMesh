import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bot, FileText, Brain, LogOut, Settings as SettingsIcon, Zap, Layers, Network, GitBranch } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const { user, signOut } = useAuthStore();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Bot, label: 'AI Chat', path: '/chat' },
    { icon: FileText, label: 'Notes', path: '/notes' },
    { icon: Brain, label: 'Quiz', path: '/quiz' },
    { icon: Zap, label: 'Feynman Mode', path: '/feynman' },
    { icon: Layers, label: 'Flashcards', path: '/flashcards' },
    { icon: Network, label: 'Knowledge graph', path: '/knowledge-graph' },
    { icon: GitBranch, label: 'Visual Mind Tree', path: '/mindtree' },
  ];

  return (
    <div className="hidden sm:flex flex-col fixed left-0 top-[64px] bottom-0 w-[240px] z-40 bg-[rgba(242,240,255,0.88)] backdrop-blur-[20px] border-r border-[rgba(208,170,255,0.25)]">
      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-[12px] w-full transition-all duration-200 relative overflow-hidden group ${
                isActive 
                  ? 'bg-gradient-to-br from-lavender to-periwinkle text-primary font-semibold' 
                  : 'bg-transparent text-secondary hover:bg-[rgba(208,170,255,0.1)] hover:text-primary font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-orchid"></div>
                )}
                <item.icon size={20} className={isActive ? 'text-primary' : 'text-inherit'} />
                <span className="font-body text-[0.95rem]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-[rgba(208,170,255,0.25)] flex flex-col gap-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-[12px] w-full transition-all duration-200 ${
              isActive 
                ? 'bg-[rgba(255,217,179,0.3)] text-primary font-semibold' 
                : 'bg-transparent text-secondary hover:bg-[rgba(208,170,255,0.1)] hover:text-primary font-medium'
            }`
          }
        >
          <SettingsIcon size={20} />
          <span className="font-body text-[0.95rem]">Settings</span>
        </NavLink>
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] w-full text-rose hover:bg-[rgba(255,176,176,0.15)] transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-body font-medium text-[0.95rem]">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
