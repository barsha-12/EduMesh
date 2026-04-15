import React from 'react';
import { LayoutDashboard, MessageCircle, FileText, BookOpen, Settings, Network } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';

const BottomNav = () => {
  const location = useLocation();
  const isDark = useThemeStore((state) => state.isDark);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/mindtree', icon: Network, label: 'Mind Map' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/quiz', icon: BookOpen, label: 'Quiz' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 md:hidden z-40
        border-t transition-colors duration-200
        ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
      `}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`
              flex flex-col items-center justify-center gap-1 py-2 px-3 w-full
              rounded-lg transition-all duration-200
              ${isActive(path)
                ? 'text-[#E8A2A2] dark:text-[#E8A2A2] bg-[#E8A2A2]/10 dark:bg-[#E8A2A2]/10'
                : `text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200`
              }
            `}
            title={label}
          >
            <Icon size={24} />
            <span className="text-xs font-medium text-center hidden xs:block">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
