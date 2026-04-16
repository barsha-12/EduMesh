import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, MessageCircle, BookOpen, 
  Brain, Layers, Network, ChevronLeft, ChevronRight, 
  Settings, Zap, Share2, LogOut 
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/chat',      label: 'AI Chat',   Icon: MessageCircle },
  { path: '/notes',     label: 'Notes',     Icon: BookOpen },
  { path: '/quiz',      label: 'Quiz',      Icon: Brain },
  { path: '/feynman',   label: 'Feynman Mode', Icon: Zap },
  { path: '/flashcards',label: 'Flashcards',Icon: Layers },
  { path: '/knowledge-graph', label: 'Knowledge graph', Icon: Network },
  { path: '/mindtree',  label: 'Visual Mind Tree', Icon: Share2 },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside style={{
      width: collapsed ? '64px' : '220px',
      transition: 'width 0.25s ease',
      background: 'var(--v-bg)',
      borderRight: '0.5px solid rgba(0,0,0,0.1)',
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      padding: '12px 8px',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
    }}>
      {/* Top: Logo + collapse toggle */}
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '4px 8px', 
        marginBottom: '16px'
      }}>
        {!collapsed && (
          <span style={{ 
            fontSize: '15px', 
            fontWeight: '600', 
            color: 'var(--v-primary)',
            fontFamily: 'Outfit' 
          }}>
            EduMesh
          </span>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--v-text)',
            opacity: 0.5
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Nav Items */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => (
          <NavLink 
            key={item.path} 
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '10px 12px', 
              borderRadius: '8px', 
              marginBottom: '2px',
              background: isActive ? 'var(--v-accent)' : 'transparent',
              color: isActive ? 'var(--v-primary)' : 'var(--v-text)',
              fontSize: '13px', 
              fontWeight: isActive ? '500' : '400',
              textDecoration: 'none', 
              transition: 'all .15s',
              opacity: isActive ? 1 : 0.7,
            })}
          >
            <item.Icon size={16} strokeWidth={1.75} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Bottom: Settings & Logout */}
      <div style={{ 
        paddingTop: '12px', 
        borderTop: '0.5px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <NavLink 
          to="/settings"
          style={({ isActive }) => ({
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px 12px', 
            borderRadius: '8px', 
            background: isActive ? 'var(--v-accent)' : 'transparent',
            color: isActive ? 'var(--v-primary)' : 'var(--v-text)',
            fontSize: '13px', 
            fontWeight: '400',
            textDecoration: 'none', 
            transition: 'all .15s',
            opacity: 0.7,
          })}
        >
          <Settings size={16} strokeWidth={1.75} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button 
          onClick={handleLogout}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px 12px', 
            borderRadius: '8px', 
            background: 'transparent',
            border: 'none',
            color: '#ef4444', // Red for logout
            fontSize: '13px', 
            fontWeight: '400',
            cursor: 'pointer',
            transition: 'all .15s',
            opacity: 0.8,
            width: '100%',
            textAlign: 'left'
          }}
        >
          <LogOut size={16} strokeWidth={1.75} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
