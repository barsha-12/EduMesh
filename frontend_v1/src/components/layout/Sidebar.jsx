import React from 'react';
import { LayoutDashboard, MessageCircle, FileText, BookOpen, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { signOut } = useAuthStore();
  const location = useLocation();
  const isDark = useThemeStore((state) => state.isDark);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chat', label: 'AI Chat', icon: MessageCircle },
    { path: '/notes', label: 'Study Notes', icon: FileText },
    { path: '/quiz', label: 'Quiz', icon: BookOpen },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen w-60 transition-colors duration-200
        ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
        border-r hidden md:flex flex-col z-40
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          EduMesh
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <Link
                to={path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive(path)
                    ? 'bg-blue-600 text-white'
                    : `text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={signOut}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
            transition-all duration-200
            ${isDark
              ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-20'
              : 'text-red-600 hover:bg-red-50'
            }
          `}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
