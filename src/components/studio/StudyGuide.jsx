import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Share2, Clipboard, HelpCircle, Target, List } from 'lucide-react';

const StudyGuide = ({ notebookTitle }) => {
  return (
    <div className="h-full flex flex-col p-6 space-y-8 chat-scrollbar overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div className="space-y-1">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <FileText size={14} className="text-[#E8A2A2]" /> Reading Guide
          </h3>
          <p className="text-sm font-bold">Synthesized Intelligence Repo</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-[#F7F5E8] dark:bg-white/5 rounded-xl border border-black/5 hover:text-[#E8A2A2] transition-all"><Clipboard size={16} /></button>
           <button className="p-2 bg-[#F7F5E8] dark:bg-white/5 rounded-xl border border-black/5 hover:text-[#E8A2A2] transition-all"><Download size={16} /></button>
        </div>
      </div>

      <div className="space-y-10">
        {/* Summary Card */}
        <section className="p-8 bg-white dark:bg-white/5 rounded-[40px] border border-black/5 space-y-4 shadow-sm">
           <div className="flex items-center gap-3 text-[#A0C2D2]">
              <Target size={20} />
              <h4 className="font-black text-xs uppercase tracking-widest">Executive Summary</h4>
           </div>
           <p className="text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
             This notebook synthesizes the core principles of {notebookTitle}. 
             The analysis reveals a paradigm shift in how we approach intellectual synthesis, 
             moving from linear consumption to recursive neural exploration.
           </p>
        </section>

        {/* Section: Key Themes */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-gray-400">
              <List size={20} />
              <h4 className="font-black text-xs uppercase tracking-widest">Key Structural Themes</h4>
           </div>
           
           <div className="space-y-3">
              {[
                { title: 'Information Density', desc: 'The concentration of key concepts per source page.', color: '#D5E3E8' },
                { title: 'Neural Linking', desc: 'Recursive cross-referencing between citations.', color: '#EAC7C7' },
                { title: 'Synthesized Extraction', desc: 'Converting raw data into actionable unit knowledge.', color: '#E8A2A2' }
              ].map((theme, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-[#F7F5E8] dark:bg-[#2a2620] border border-black/[0.02]">
                   <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: theme.color }}>
                      <span className="font-black text-[#2c2c2c] text-xs">0{i+1}</span>
                   </div>
                   <div>
                      <h5 className="font-bold text-sm tracking-tight">{theme.title}</h5>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{theme.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* Section: FAQ */}
        <section className="space-y-6">
           <div className="flex items-center gap-3 text-[#E8A2A2]">
              <HelpCircle size={20} />
              <h4 className="font-black text-xs uppercase tracking-widest">Frequently Asked Questions</h4>
           </div>

           <div className="grid gap-4">
              {[
                { q: "How does EduMesh handle multiple source formats?", a: "By first converting all inputs into a unified neural vector space before synthesis." },
                { q: "What is the primary thesis of this notebook?", a: "That intelligence is not stored but synthesized through active conversation with documents." }
              ].map((faq, i) => (
                <div key={i} className="space-y-3 p-6 bg-white dark:bg-white/5 rounded-[32px] border border-black/[0.03]">
                   <p className="text-sm font-black tracking-tight italic">"{faq.q}"</p>
                   <p className="text-xs font-medium text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </section>
      </div>

      <div className="pt-10 border-t border-black/[0.03] text-center">
         <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300">End of Synthesized Overview</p>
      </div>
    </div>
  );
};

export default StudyGuide;
