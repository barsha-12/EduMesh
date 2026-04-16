import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Palette, Zap, Shield, 
  LogOut, Save, Check, ChevronRight, 
  Moon, Sun, Type, Layout, Info
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
      active 
        ? 'bg-[#E8A2A2] text-white shadow-lg shadow-[#E8A2A2]/20' 
        : 'hover:bg-v-surface text-v-text/40'
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const { theme, setTheme, palette, setPalette, fontSize, setFontSize } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState('account');
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setError(null);
    try {
      const res = await fetch('/api/auth/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setError('Failed to fetch elite profile. Ensure backend is running.');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Connection refused. Please check your local server.');
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          display_name: profile.display_name,
          preferred_model: profile.preferred_model
        })
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <Info className="text-red-500" size={32} />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-black text-v-text">Settings Unreachable</p>
          <p className="text-sm font-bold text-v-text/30 max-w-xs">{error}</p>
        </div>
        <button 
          onClick={fetchProfile}
          className="px-8 py-3 bg-[#E8A2A2] text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-[#E8A2A2]/20 hover:scale-105 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#E8A2A2]/20 border-t-[#E8A2A2] rounded-full animate-spin" />
        <p className="text-sm font-bold text-v-text/30 uppercase tracking-widest">Synchronizing Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight font-outfit text-v-text">Settings Studio</h1>
        <p className="text-sm font-bold text-v-text/30 uppercase tracking-widest">Configure your Elite research environment</p>
      </header>

      <div className="grid lg:grid-cols-4 gap-12">
        {/* Sidebar Nav */}
        <div className="flex flex-col gap-2">
          <TabButton active={activeTab === 'account'} icon={User} label="Account" onClick={() => setActiveTab('account')} />
          <TabButton active={activeTab === 'appearance'} icon={Palette} label="Appearance" onClick={() => setActiveTab('appearance')} />
          <TabButton active={activeTab === 'ai'} icon={Zap} label="AI & Limits" onClick={() => setActiveTab('ai')} />
          <TabButton active={activeTab === 'security'} icon={Shield} label="Security" onClick={() => setActiveTab('security')} />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'account' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="p-8 bg-white dark:bg-v-surface rounded-[32px] border border-v-text/5 shadow-sm space-y-8">
                  <div className="flex items-center gap-6">
                    <img src={user?.avatar_url || 'https://via.placeholder.com/100'} className="w-20 h-20 rounded-[28%] shadow-xl" />
                    <div>
                      <h2 className="text-xl font-black text-v-text">{user?.display_name}</h2>
                      <p className="text-sm font-bold text-v-text/30">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-v-text/40 ml-4">Display Name</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl bg-v-bg border-none outline-none focus:ring-2 focus:ring-[#E8A2A2]/20 font-bold"
                        value={profile.display_name}
                        onChange={e => setProfile({...profile, display_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="px-8 py-4 bg-[#E8A2A2] text-white rounded-full text-sm font-bold shadow-lg shadow-[#E8A2A2]/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      {showSaved ? <Check size={18} /> : isSaving ? 'Saving...' : <><Save size={18}/> Save Changes</>}
                    </button>
                    <button 
                      onClick={signOut}
                      className="px-8 py-4 bg-red-500/5 text-red-500 rounded-full text-sm font-bold hover:bg-red-500/10 transition-all flex items-center gap-2"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="p-8 bg-white dark:bg-v-surface rounded-[32px] border border-v-text/5 shadow-sm space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-v-text opacity-40 uppercase tracking-widest flex items-center gap-2">
                       <Moon size={16} /> Theme Mode
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                       <button onClick={() => setTheme('light')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-[#E8A2A2] bg-[#FDFBF7]' : 'border-black/5 hover:border-black/10'}`}>
                          <Sun className={theme === 'light' ? 'text-[#E8A2A2]' : 'text-v-text/20'} size={24} />
                          <span className="text-xs font-black">Light Studio</span>
                       </button>
                       <button onClick={() => setTheme('dark')} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-[#E8A2A2] bg-v-bg' : 'border-black/5 hover:border-black/10'}`}>
                          <Moon className={theme === 'dark' ? 'text-[#E8A2A2]' : 'text-v-text/20'} size={24} />
                          <span className="text-xs font-black">Dark Elite</span>
                       </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-v-text opacity-40 uppercase tracking-widest flex items-center gap-2">
                       <Palette size={16} /> Color Palette
                    </h3>
                    <div className="grid grid-cols-4 gap-4">
                      {['mint', 'lavender', 'cyber', 'latte'].map(p => (
                        <button key={p} onClick={() => setPalette(p)} className={`p-4 rounded-2xl border-2 transition-all text-xs font-bold capitalize ${palette === p ? 'border-[#E8A2A2] bg-white' : 'border-black/5 hover:bg-white'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-v-text opacity-40 uppercase tracking-widest flex items-center gap-2">
                       <Type size={16} /> Font Size
                    </h3>
                    <div className="flex items-center gap-4 bg-v-bg p-2 rounded-2xl">
                      {['small', 'medium', 'large'].map(s => (
                        <button key={s} onClick={() => setFontSize(s)} className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${fontSize === s ? 'bg-white text-v-primary shadow-sm' : 'text-v-text/30 hover:text-v-text'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="p-8 bg-white dark:bg-v-surface rounded-[32px] border border-v-text/5 shadow-sm space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-v-text opacity-40 uppercase tracking-widest flex items-center gap-2">
                       <Info size={16} /> API Limit (Daily Usage)
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-3xl font-black text-v-text">{profile.usage_count} <span className="text-sm text-v-text/30">/ 100</span></span>
                          <span className="text-[10px] font-black text-[#E8A2A2] bg-[#FCE3EA] px-2 py-1 rounded-md uppercase">Elite Free Tier</span>
                       </div>
                       <div className="h-4 w-full bg-v-bg rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(profile.usage_count / profile.usage_limit) * 100}%` }}
                            className="h-full bg-gradient-to-r from-[#E8A2A2] to-[#A0C2D2] shadow-lg shadow-[#E8A2A2]/20"
                          />
                       </div>
                       <p className="text-[11px] font-bold text-v-text/30">Resets daily at midnight UTC.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-v-text opacity-40 uppercase tracking-widest flex items-center gap-2">
                       <Zap size={16} /> Default AI Model
                    </h3>
                    <div className="grid gap-3">
                       {[
                         { id: 'llama-3.1-8b-instant', name: 'Groq 3.1 (Lighting Fast)', desc: 'Best for chat & synthesis' },
                         { id: 'gemini-1.5-flash', name: 'Gemini 1.5 (Multimodal)', desc: 'Best for complex research & vision' }
                       ].map(m => (
                          <button 
                            key={m.id}
                            onClick={() => setProfile({...profile, preferred_model: m.id})}
                            className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${profile.preferred_model === m.id ? 'border-[#E8A2A2] bg-[#FDFBF7]' : 'border-black/5 hover:border-black/10'}`}
                          >
                             <div className="text-left">
                                <h4 className="text-sm font-black text-v-text">{m.name}</h4>
                                <p className="text-xs font-bold text-v-text/30">{m.desc}</p>
                             </div>
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${profile.preferred_model === m.id ? 'border-[#E8A2A2] bg-[#E8A2A2]' : 'border-black/10'}`}>
                                {profile.preferred_model === m.id && <Check size={14} className="text-white" />}
                             </div>
                          </button>
                       ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="p-8 bg-white dark:bg-v-surface rounded-[32px] border border-v-text/5 shadow-sm space-y-8">
                   <div className="space-y-2">
                      <h3 className="text-lg font-black text-v-text">Data & Privacy</h3>
                      <p className="text-sm font-bold text-v-text/30">Manage how EduMesh stores your intelligence.</p>
                   </div>
                   
                   <div className="grid gap-4">
                      <button className="w-full p-6 bg-v-bg rounded-3xl flex items-center justify-between group hover:bg-v-bg/50 transition-all">
                         <div className="text-left">
                            <span className="text-sm font-black text-v-text">Export Intelligence Graph</span>
                            <p className="text-[10px] font-bold text-v-text/30 uppercase tracking-widest mt-1">Download as JSON/PDF</p>
                         </div>
                         <ChevronRight size={18} className="text-v-text/20 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="w-full p-6 border-2 border-red-500/10 rounded-3xl flex items-center justify-between group hover:border-red-500/30 transition-all">
                         <div className="text-left">
                            <span className="text-sm font-black text-red-500">Purge All Memory</span>
                            <p className="text-[10px] font-bold text-red-500/30 uppercase tracking-widest mt-1">Permanently delete all chats</p>
                         </div>
                         <LogOut size={18} className="text-red-500/20 group-hover:rotate-12 transition-transform" />
                      </button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
