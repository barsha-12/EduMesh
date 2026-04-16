import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { generateMindTree } from '../services/ai';
import { Sparkles, Loader2, Network } from 'lucide-react';

const initialNodes = [
  { 
    id: 'root', 
    position: { x: 400, y: 300 }, 
    data: { label: 'Enter a topic to plot your Mind Tree...' }, 
    style: { 
      background: 'var(--v-secondary)', 
      color: 'var(--v-text)', 
      borderRadius: '24px', 
      padding: '24px', 
      border: '1px solid var(--v-text-opacity-5)', 
      fontWeight: 'bold',
      fontFamily: 'Outfit',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
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
        background: 'var(--v-primary)', 
        color: 'white', 
        borderRadius: '32px', 
        padding: '28px', 
        border: 'none', 
        fontWeight: '900', 
        fontSize: '18px', 
        fontFamily: 'Outfit',
        boxShadow: '0 20px 50px -10px var(--v-primary-glow)',
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
          background: 'white', 
          color: 'var(--v-text)', 
          borderRadius: '20px', 
          padding: '16px 24px', 
          border: '1px solid var(--v-text-opacity-5)', 
          fontWeight: '700',
          fontSize: '14px',
          boxShadow: '0 10px 30px -5px rgba(0,0,0,0.03)',
          width: '180px',
          textAlign: 'center'
        }
      });

      mappedEdges.push({
        id: `e-${child.parentId || root.id}-${child.id}`,
        source: child.parentId || root.id,
        target: child.id,
        animated: true,
        style: { stroke: 'var(--v-primary)', strokeWidth: 2, opacity: 0.3 }
      });
    });

    return { mappedNodes, mappedEdges };
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    const data = await generateMindTree(input.trim());
    
    if (data && Array.isArray(data) && data.length > 0) {
      const { mappedNodes, mappedEdges } = calculateLayout(data);
      setNodes(mappedNodes);
      setEdges(mappedEdges);
    } else {
      setError("Synthesis failed. Neural patterns could not be mapped.");
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-140px)] relative bg-v-bg rounded-[48px] overflow-hidden border border-v-text/5 shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="w-full h-full"
      >
        <Background color="var(--v-primary)" gap={24} size={1} opacity={0.05} />
        <Controls className="!bg-white !border-v-text/5 !shadow-2xl !rounded-2xl overflow-hidden !m-6" />
        
        <Panel position="top-center" className="mt-8 w-full max-w-md pointer-events-auto px-4">
          <form onSubmit={handleGenerate} className="bg-white/80 backdrop-blur-2xl p-2 flex gap-2 w-full shadow-2xl shadow-v-primary/10 rounded-[28px] border border-v-text/5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Topic to synthesize..."
              className="flex-1 bg-transparent px-6 py-2 outline-none text-v-text placeholder-v-text/20 font-bold text-sm"
            />
            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className="px-6 py-3 bg-v-primary hover:scale-[1.02] active:scale-95 disabled:opacity-50 text-white rounded-[20px] font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-v-primary/20"
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
