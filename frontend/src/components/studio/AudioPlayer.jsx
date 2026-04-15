import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Radio, Download, Share2, Volume2, Mic } from 'lucide-react';

const AudioPlayer = ({ notebookTitle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    let interval;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => prev + 0.5);
      }, 1000);
    } else if (progress >= 100) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setHasGenerated(true);
    }, 3000);
  };

  if (!hasGenerated) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-8 p-12">
        <div className="w-24 h-24 rounded-[32px] bg-[#E8A2A2]/20 shadow-inner flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-[32px] border-2 border-[#E8A2A2] animate-ping opacity-20" />
          <Radio size={40} className="text-[#E8A2A2]" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-black font-['Outfit']">Audio Overview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
            Generate a deep-dive podcast conversation between AI hosts based on your notebook's sources.
          </p>
        </div>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-10 py-4 bg-[#E8A2A2] text-[#2c2c2c] rounded-3xl font-black text-sm shadow-xl shadow-[#E8A2A2]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Mic size={18} />
              </motion.div>
              Recording Script...
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" /> Generate Overview
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 p-6 h-full flex flex-col justify-center"
    >
      {/* Waveform Visualization */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E8A2A2]">Now Playing</span>
              <span className="text-sm font-bold truncate max-w-[150px]">{notebookTitle} Overview</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">10:42</span>
        </div>

        <div className="h-24 flex items-end justify-center gap-1.5 px-2 overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: isPlaying ? [10, 40 + Math.random() * 40, 10] : 10,
                backgroundColor: isPlaying ? ['#E8A2A2', '#A0C2D2', '#E8A2A2'] : '#EAE0DA' 
              }}
              transition={{ repeat: Infinity, duration: 0.8 + Math.random(), ease: 'easeInOut' }}
              className="w-1.5 rounded-full"
            />
          ))}
        </div>

        <div className="relative h-1.5 w-full bg-[#EAE0DA] dark:bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             className="absolute inset-y-0 left-0 bg-[#E8A2A2]"
             style={{ width: `${progress}%` }}
           />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-10">
          <button className="text-gray-400 hover:text-[#2c2c2c] transition-colors"><SkipBack size={24} /></button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-[32px] bg-[#E8A2A2] text-[#2c2c2c] flex items-center justify-center shadow-2xl shadow-[#E8A2A2]/40 hover:scale-110 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button className="text-gray-400 hover:text-[#2c2c2c] transition-colors"><SkipForward size={24} /></button>
        </div>

        <div className="flex items-center gap-6 w-full justify-between px-4">
           <button className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-black/5 hover:border-[#E8A2A2]/20 transition-all text-gray-500">
             <Volume2 size={18} />
           </button>
           <div className="flex gap-2">
              <button className="px-5 py-3 bg-[#D5E3E8] text-[#A0C2D2] rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Download size={14} /> Offline
              </button>
              <button className="px-5 py-3 bg-[#EAE0DA] dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Share2 size={14} /> Share
              </button>
           </div>
        </div>
      </div>

      <div className="p-4 bg-[#F7F5E8] dark:bg-white/5 rounded-3xl border border-black/[0.03] flex items-center gap-4">
         <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] p-[2px]">
            <div className="w-full h-full bg-white dark:bg-[#1c1a16] rounded-[10px] flex items-center justify-center font-black text-xs">V</div>
         </div>
         <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Host Insights</p>
            <p className="text-[11px] font-medium leading-tight line-clamp-1 truncate">Highlighting the correlation between sources [1] and [3].</p>
         </div>
         <span className="text-[10px] font-bold text-[#E8A2A2]">LIVE</span>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
