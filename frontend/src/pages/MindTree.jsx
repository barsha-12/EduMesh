import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState, addEdge, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { generateMindTree } from '../services/ai';
import { Sparkles, Loader2, Network } from 'lucide-react';

const initialNodes = [
  { id: 'root', position: { x: 400, y: 300 }, data: { label: 'Enter a topic to generate a Mind Tree...' }, style: { background: '#F7F5E8', color: '#2c2c2c', borderRadius: '12px', padding: '15px', border: '2px solid #E8A2A2', fontWeight: 'bold' } }
];

export default function MindTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const calculateLayout = (dataNodes) => {
    // A simple radial layout around a central root
    const mappedNodes = [];
    const mappedEdges = [];
    
    // Find root
    const root = dataNodes.find(n => n.parentId === null) || dataNodes[0];
    mappedNodes.push({
      id: root.id,
      position: { x: 400, y: 300 },
      data: { label: root.label },
      style: { background: '#A0C2D2', color: 'white', borderRadius: '16px', padding: '20px', border: 'none', fontWeight: '800', fontSize: '18px', boxShadow: '0 10px 25px -5px rgba(160, 194, 210, 0.4)' }
    });

    const children = dataNodes.filter(n => n.id !== root.id);
    const radius = 250;
    const angleStep = (2 * Math.PI) / children.length;

    children.forEach((child, index) => {
      const angle = index * angleStep;
      mappedNodes.push({
        id: child.id,
        position: { x: 400 + radius * Math.cos(angle), y: 300 + radius * Math.sin(angle) },
        data: { label: child.label },
        style: { background: '#F7F5E8', color: '#2c2c2c', borderRadius: '10px', padding: '12px', border: '2px solid #E8A2A2', fontWeight: '600' }
      });

      mappedEdges.push({
        id: `e-${child.parentId || root.id}-${child.id}`,
        source: child.parentId || root.id,
        target: child.id,
        animated: true,
        style: { stroke: '#E8A2A2', strokeWidth: 2 }
      });
    });

    return { mappedNodes, mappedEdges };
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    const data = await generateMindTree(input.trim());
    
    if (data && Array.isArray(data) && data.length > 0) {
      const { mappedNodes, mappedEdges } = calculateLayout(data);
      setNodes(mappedNodes);
      setEdges(mappedEdges);
    } else {
      setError("Failed to assemble the graph from the AI context. Please try again.");
    }
    
    setIsGenerating(false);
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-100px)] relative bg-[#F7F5E8] dark:bg-[#1c1a16] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="w-full h-full"
      >
        <Background color="#A0C2D2" gap={20} size={1} />
        <Controls className="!bg-white dark:!bg-gray-800 !border-none !shadow-xl !rounded-xl overflow-hidden" />
        
        <Panel position="top-center" className="mt-6 w-full max-w-md pointer-events-auto">
          <form onSubmit={handleGenerate} className="m3-card !p-2 flex gap-2 w-full shadow-2xl shadow-[#A0C2D2]/10 !rounded-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., Quantum Physics, Cellular Respiration..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 dark:text-gray-100 placeholder-gray-400 font-medium"
            />
            <button
              type="submit"
              disabled={isGenerating || !input.trim()}
              className="px-6 py-2 bg-[#E8A2A2] hover:bg-[#d88f8f] disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Network className="w-4 h-4" />}
              Plot
            </button>
          </form>
          {error && <div className="mt-2 text-center text-xs font-bold text-red-500 bg-red-100 py-1 px-3 rounded-full">{error}</div>}
        </Panel>
      </ReactFlow>
    </div>
  );
}
