import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

const TopBar = ({ title = 'Dashboard', onMenuClick, showMenuButton = false }) => {
  const isDark = useThemeStore((state) => state.isDark);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { user } = useAuthStore();

  return (
    <div
      className={`
        sticky top-0 z-30 px-6 py-4 border-b transition-colors duration-200
        ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
      `}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Side - Title and Menu */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className={`
                md:hidden p-2 rounded-lg transition-colors
                ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
              `}
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
        </div>

        {/* Right Side - User and Theme */}
        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="hidden sm:flex flex-col items-end">
            <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {user?.email}
            </p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`
              p-2.5 rounded-lg transition-colors
              ${isDark
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Avatar */}
          <div
            className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
              ${isDark ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-600 to-purple-700'}
            `}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
