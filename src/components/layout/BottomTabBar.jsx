import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bot, FileText, Brain, User } from 'lucide-react';

const BottomTabBar = () => {
  const tabs = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Bot, label: 'Chat', path: '/chat' },
    { icon: FileText, label: 'Notes', path: '/notes' },
    { icon: Brain, label: 'Quiz', path: '/quiz' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 h-[64px] z-50 bg-[rgba(255,255,255,0.90)] backdrop-blur-[20px] border-t border-[rgba(204,204,204,0.35)] flex items-center justify-around px-2">
      {tabs.map((tab, i) => (
        <NavLink 
          key={i} 
          to={tab.path} 
          className={({ isActive }) => 
            `flex flex-col items-center justify-center w-full h-full relative transition-colors duration-200 ${isActive ? 'text-lavender' : 'text-pearl'}`
          }
        >
          {({ isActive }) => (
            <>
              <tab.icon size={24} className={isActive ? 'text-lavender' : 'text-pearl'} />
              <span className={`text-[10px] mt-1 font-body font-medium transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-1 right-[calc(50%-14px)] w-[6px] h-[6px] rounded-full bg-orchid"></div>
              )}
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomTabBar;
