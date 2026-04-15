import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, LogOut, Moon, Type, Shield, User, Sliders, Bell, Sparkles, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useStudyStore } from '../store/studyStore';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSavePreferences = async () => {
    setSaving(true);
    setTimeout(() => {
      setMessage('Neural configuration successfully synced.');
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }, 800);
  };

  const menuItems = [
    { id: 'profile', label: 'Neural Identity', icon: User },
    { id: 'appearance', label: 'Visual Interface', icon: Moon },
    { id: 'learning', label: 'Inference Tuning', icon: Sparkles },
    { id: 'security', label: 'Access Control', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5E8] dark:bg-[#1c1a16] text-[#2c2c2c] dark:text-[#f7f5e8] transition-colors duration-300">
      {/* Navbar */}
      <nav className="h-16 border-b border-black/[0.03] dark:border-white/[0.03] px-6 flex items-center justify-between sticky top-0 z-40 bg-[#F7F5E8]/80 dark:bg-[#1c1a16]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] flex items-center justify-center text-white font-black text-sm">E</div>
            <span className="font-black tracking-tight" style={{ fontFamily: 'Outfit' }}>EduMesh</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#A0C2D2] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-white/10">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight font-['Outfit']">System Config</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Fine-tune your personal intelligence workspace parameters.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Sidebar-lite Navigation */}
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:bg-white dark:hover:bg-white/5 text-gray-400 hover:text-[#E8A2A2] group"
                >
                  <item.icon size={16} className="group-hover:scale-110 transition-transform" />
                  {item.label}
                </button>
              ))}
              <div className="pt-8 border-t border-black/[0.03] dark:border-white/[0.03] mt-8">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-400 hover:bg-rose-400/5 transition-all"
                >
                  <LogOut size={16} /> End Session
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-[#D5E3E8] border border-[#A0C2D2]/20 text-[#A0C2D2] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-[#D5E3E8]/20"
                >
                  <Sparkles size={14} /> {message}
                </motion.div>
              )}

              {/* Profile Card */}
              <div className="m3-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#EAC7C7]/20 rounded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-[#E8A2A2] flex items-center justify-center text-[#2c2c2c] text-xl font-black shadow-lg shadow-[#E8A2A2]/30">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-black text-xl font-['Outfit']">{user?.email?.split('@')[0] || 'Researcher'}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Ref: {user?.id?.slice(0, 12)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#A0C2D2] ml-1">Identity Access Point</label>
                    <input type="text" value={user?.email || ''} disabled className="input-field !bg-[#f1f0e4] dark:!bg-white/[0.02] opacity-60 font-bold" />
                  </div>
                </div>
              </div>

              {/* Preferences Section */}
              <div className="m3-card space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E8A2A2]">Aesthetic Interface</h3>
                   <div className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${isDark ? 'bg-[#E8A2A2]' : 'bg-gray-200'}`} onClick={toggleTheme}>
                      <motion.div 
                        animate={{ x: isDark ? 26 : 4 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="p-6 bg-[#f1f0e4] dark:bg-white/[0.02] rounded-3xl border border-black/[0.02] flex items-center gap-4 relative group cursor-pointer hover:border-[#EAC7C7]/30 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#EAC7C7] flex items-center justify-center text-[#2c2c2c]">
                         <Type size={20} />
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold">Display Font Units</p>
                         <p className="text-[10px] text-gray-400 font-medium">Calibrate visual scale for reading focus</p>
                      </div>
                      <span className="text-xs font-black text-[#A0C2D2]">v1.0.2</span>
                   </div>

                   <button onClick={handleSavePreferences} disabled={saving} className="btn-primary w-full !py-5 font-black uppercase tracking-widest">
                     {saving ? 'Processing Neural Handshake...' : 'Synchronize Parameters'}
                   </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="text-center space-y-4 pt-10">
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Neural session strictly encrypted • EduMesh V2.0.1</p>
                 <button className="text-[10px] font-black text-rose-400 hover:scale-105 transition-transform uppercase tracking-widest">Wipe Memory Hub</button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
