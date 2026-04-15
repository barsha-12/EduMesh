import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, MessageSquare, FileText, Brain, LogOut, Sparkles, 
  Menu, ChevronLeft, ChevronRight, Settings, HelpCircle, Zap,
  Compass, History, Target, Network
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Study Chat', icon: MessageSquare },
  { path: '/notes', label: 'Study Notes', icon: FileText },
  { path: '/quiz', label: 'Practice Quiz', icon: Brain },
  { path: '/mindtree', label: 'AI Mind Tree', icon: Network },
];

const secondaryItems = [
  { path: '/explore', label: 'Explore Topics', icon: Compass },
  { path: '/history', label: 'Study History', icon: History },
  { path: '/goals', label: 'Learning Goals', icon: Target },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Student';

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen surface-high border-r border-gray-200 dark:border-white/5 z-50 flex flex-col transition-colors duration-300"
    >
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-[#E8A2A2] flex items-center justify-center shrink-0 shadow-lg shadow-[#E8A2A2]/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tight whitespace-nowrap"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Edu<span className="text-[#E8A2A2]">Mesh</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto chat-scrollbar">
        <div className="mb-4">
          {!isCollapsed && <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Main Menu</p>}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-[#E8A2A2] text-white shadow-md shadow-[#E8A2A2]/10' 
                    : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={isActive ? 'text-white' : 'group-hover:text-[#E8A2A2] transition-colors'} />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-white/5">
          {!isCollapsed && <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Learning</p>}
          {secondaryItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration- group relative"
            >
              <item.icon size={20} className="group-hover:text-[#E8A2A2] transition-colors" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-white/5 space-y-2">
        <div className={`p-2 rounded-2xl flex items-center gap-3 transition-colors ${isCollapsed ? 'justify-center' : 'bg-black/5 dark:bg-white/5'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8A2A2] to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {displayName[0].toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all duration-200 group relative ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-md hover:scale-110 transition-all"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  );
}
