import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { generateMindTree } from '../services/ai';
import { Sparkles, Loader2, Network } from 'lucide-react';

const initialNodes = [
  { 
    id: 'root', 
    position: { x: 400, y: 300 }, 
    data: { label: 'Enter a topic to plot your Mind Tree...' }, 
    style: { 
      background: 'white', 
      color: '#3A3C4A', 
      borderRadius: '24px', 
      padding: '24px', 
      border: '1.5px solid rgba(208, 170, 255, 0.4)', 
      fontWeight: 'bold',
      fontFamily: 'Sora, sans-serif',
      boxShadow: '0 20px 40px -10px rgba(178,204,255,0.2)'
    } 
  }
];

export default function MindTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const calculateLayout = (dataNodes) => {
    const mappedNodes = [];
    const mappedEdges = [];
    
    const root = dataNodes.find(n => n.parentId === null) || dataNodes[0];
    mappedNodes.push({
      id: root.id,
      position: { x: 400, y: 300 },
      data: { label: root.label },
      style: { 
        background: 'linear-gradient(135deg, #B2CCFF, #D0AAFF)', 
        color: 'white', 
        borderRadius: '32px', 
        padding: '28px', 
        border: 'none', 
        fontWeight: '800', 
        fontSize: '18px', 
        fontFamily: 'Sora, sans-serif',
        boxShadow: '0 16px 32px -8px rgba(208,170,255,0.4)',
        textAlign: 'center'
      }
    });

    const children = dataNodes.filter(n => n.id !== root.id);
    const radius = 280;
    const angleStep = (2 * Math.PI) / children.length;

    children.forEach((child, index) => {
      const angle = index * angleStep;
      mappedNodes.push({
        id: child.id,
        position: { x: 400 + radius * Math.cos(angle), y: 300 + radius * Math.sin(angle) },
        data: { label: child.label },
        style: { 
          background: 'rgba(255,255,255,0.9)', 
          color: '#3A3C4A', 
          borderRadius: '20px', 
          padding: '16px 24px', 
          border: '1.5px solid rgba(178,204,255,0.3)', 
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 10px 30px -5px rgba(178,204,255,0.15)',
          width: '180px',
          textAlign: 'center',
          fontFamily: 'Plus Jakarta Sans, sans-serif'
        }
      });

      mappedEdges.push({
        id: `e-${child.parentId || root.id}-${child.id}`,
        source: child.parentId || root.id,
        target: child.id,
        animated: true,
        style: { stroke: '#B2CCFF', strokeWidth: 3, opacity: 0.6 }
      });
    });

    return { mappedNodes, mappedEdges };
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const data = await generateMindTree(input.trim());
      
      if (data && Array.isArray(data) && data.length > 0) {
        const { mappedNodes, mappedEdges } = calculateLayout(data);
        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } else {
        setError("Synthesis failed. Neural patterns could not be mapped.");
      }
    } catch (err) {
      console.error('MindTree error:', err);
      setError("AI Service error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] relative glass-base overflow-hidden border-none shadow-[0_8px_32px_rgba(208,170,255,0.15)] bg-gradient-to-br from-[rgba(255,255,255,0.9)] to-[rgba(242,240,255,0.9)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="w-full h-full"
      >
        <Background color="#D0AAFF" gap={24} size={1} opacity={0.15} />
        <Controls className="!bg-[rgba(255,255,255,0.9)] !border-[rgba(208,170,255,0.3)] !shadow-sm !rounded-2xl overflow-hidden !m-6" />
        
        <Panel position="top-center" className="mt-8 w-full max-w-md pointer-events-auto px-4">
          <form onSubmit={handleGenerate} className="bg-[rgba(255,255,255,0.95)] backdrop-blur-md p-2 flex gap-2 w-full shadow-[0_8px_24px_rgba(208,170,255,0.2)] rounded-[28px] border-[1.5px] border-[rgba(208,170,255,0.3)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Topic to synthesize..."
              className="flex-1 bg-transparent px-6 py-2 outline-none text-primary placeholder:text-muted font-body font-semibold text-sm"
            />
            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-periwinkle to-lavender hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-white rounded-[20px] font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
              Plot
            </button>
          </form>
          {error && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="mt-4 text-center text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 py-2 px-4 rounded-full border border-rose-100"
             >
               {error}
             </motion.div>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}
