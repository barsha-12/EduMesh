import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Star, Share2, Download, Maximize2 } from 'lucide-react';

const MindMap = ({ notebookTitle }) => {
  // Mock data for the mind map
  const nodes = [
    { id: 'root', label: notebookTitle, x: 200, y: 150, type: 'primary' },
    { id: 'n1', label: 'Primary Thesis', x: 50, y: 50, type: 'secondary' },
    { id: 'n2', label: 'Key Evidence [1]', x: 350, y: 50, type: 'secondary' },
    { id: 'n3', label: 'Counter-Arguments', x: 50, y: 250, type: 'secondary' },
    { id: 'n4', label: 'Future Outlook', x: 350, y: 250, type: 'secondary' },
  ];

  const connections = [
    { from: 'root', to: 'n1' },
    { from: 'root', to: 'n2' },
    { from: 'root', to: 'n3' },
    { from: 'root', to: 'n4' },
  ];

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
            <Brain size={14} className="text-[#E8A2A2]" /> Concept Mapping
          </h3>
          <p className="text-sm font-bold">Visualizing Synthesis relationships.</p>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-[#F7F5E8] dark:bg-white/5 rounded-xl border border-black/5 hover:text-[#E8A2A2] transition-all"><Maximize2 size={16} /></button>
           <button className="p-2 bg-[#F7F5E8] dark:bg-white/5 rounded-xl border border-black/5 hover:text-[#E8A2A2] transition-all"><Download size={16} /></button>
        </div>
      </div>

      <div className="flex-1 bg-[#F7F5E8] dark:bg-white/5 rounded-3xl border border-black/5 relative overflow-hidden group">
        <svg viewBox="0 0 400 300" className="w-full h-full p-4">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#EAE0DA" />
            </marker>
          </defs>

          {/* Connections */}
          {connections.map((conn, i) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            return (
              <motion.line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x} y2={to.y}
                stroke="#EAE0DA"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: i * 0.2 }}
                markerEnd="url(#arrow)"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="cursor-pointer"
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.type === 'primary' ? 40 : 25}
                fill={node.type === 'primary' ? '#E8A2A2' : '#F7F5E8'}
                stroke={node.type === 'primary' ? 'transparent' : '#E8A2A2'}
                strokeWidth="1"
                className="shadow-sm"
              />
              <text
                x={node.x}
                y={node.y + (node.type === 'primary' ? 60 : 45)}
                textAnchor="middle"
                className="text-[10px] font-black uppercase tracking-widest fill-[#2c2c2c] dark:fill-white"
                style={{ fontSize: '7px' }}
              >
                {node.label}
              </text>
            </motion.g>
          ))}
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F5E8] dark:from-[#1c1a16] via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
        
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
           <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#E8A2A2]" />
              <span className="w-2 h-2 rounded-full bg-[#A0C2D2]" />
              <span className="w-2 h-2 rounded-full bg-[#D5E3E8]" />
           </div>
           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">Interactive Neural Web</p>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-white/5 rounded-3xl border border-black/5 space-y-4">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#EAC7C7] flex items-center justify-center">
               <Star size={16} className="text-[#2c2c2c]" />
            </div>
            <div className="flex-1">
               <h4 className="text-xs font-bold">Semantic Grouping</h4>
               <p className="text-[10px] text-gray-400 font-medium">Nodes clustered by information density.</p>
            </div>
            <Share2 size={16} className="text-gray-400 hover:text-[#E8A2A2] cursor-pointer" />
         </div>
      </div>
    </div>
  );
};

export default MindMap;
