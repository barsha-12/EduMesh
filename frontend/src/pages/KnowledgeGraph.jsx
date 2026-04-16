import React, { useEffect, useRef, useState } from 'react';
import { useStudyStore } from '../store/studyStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Network, Info } from 'lucide-react';

export default function KnowledgeGraph() {
  const { savedNotes, quizHistory, syncFromSupabase } = useStudyStore();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    syncFromSupabase().then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading || !containerRef.current) return;

    // Build graph data
    const topicMap = new Map();
    const subjectMap = new Map();

    // Collect topics from notes
    savedNotes.forEach((note) => {
      const key = `${note.subject}::${note.topic}`;
      if (!topicMap.has(key)) {
        topicMap.set(key, { subject: note.subject, topic: note.topic, noteCount: 0, scores: [] });
      }
      topicMap.get(key).noteCount++;
    });

    // Collect scores from quizzes
    quizHistory.forEach((quiz) => {
      const key = `${quiz.subject}::${quiz.topic}`;
      if (!topicMap.has(key)) {
        topicMap.set(key, { subject: quiz.subject, topic: quiz.topic, noteCount: 0, scores: [] });
      }
      topicMap.get(key).scores.push(quiz.score);
    });

    if (topicMap.size === 0) return;

    // Create nodes
    const nodes = [];
    const links = [];
    let idx = 0;

    topicMap.forEach((data, key) => {
      const avgScore = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : -1;

      const color = avgScore < 0 ? '#94a3b8' : avgScore >= 70 ? '#22c55e' : avgScore >= 40 ? '#f59e0b' : '#ef4444';

      nodes.push({
        id: key,
        topic: data.topic,
        subject: data.subject,
        noteCount: data.noteCount,
        avgScore,
        color,
        val: Math.max(2, data.noteCount * 3),
      });

      // Track subjects for linking
      if (!subjectMap.has(data.subject)) subjectMap.set(data.subject, []);
      subjectMap.get(data.subject).push(key);
      idx++;
    });

    // Link topics in same subject
    subjectMap.forEach((topicKeys) => {
      for (let i = 0; i < topicKeys.length; i++) {
        for (let j = i + 1; j < topicKeys.length; j++) {
          links.push({ source: topicKeys[i], target: topicKeys[j] });
        }
      }
    });

    // Dynamically import 3d-force-graph
    import('3d-force-graph').then(({ default: ForceGraph3D }) => {
      if (graphRef.current) {
        // Clean up previous instance
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
      }

      const graph = ForceGraph3D()(containerRef.current)
        .graphData({ nodes, links })
        .backgroundColor('rgba(0,0,0,0)')
        .nodeLabel((node) => `${node.topic} (${node.subject})${node.avgScore >= 0 ? ` · ${node.avgScore}%` : ''}`)
        .nodeColor((node) => node.color)
        .nodeVal((node) => node.val)
        .nodeResolution(16)
        .linkColor(() => 'rgba(160,194,210,0.15)')
        .linkWidth(0.5)
        .onNodeClick((node) => {
          navigate(`/notes?subject=${encodeURIComponent(node.subject)}&topic=${encodeURIComponent(node.topic)}`);
        })
        .onNodeHover((node) => {
          if (node) {
            setTooltip({
              topic: node.topic,
              subject: node.subject,
              noteCount: node.noteCount,
              avgScore: node.avgScore,
            });
          } else {
            setTooltip(null);
          }
          containerRef.current.style.cursor = node ? 'pointer' : 'default';
        })
        .width(containerRef.current.clientWidth)
        .height(containerRef.current.clientHeight);

      graphRef.current = graph;

      // Handle resize
      const handleResize = () => {
        if (containerRef.current && graphRef.current) {
          graphRef.current.width(containerRef.current.clientWidth);
          graphRef.current.height(containerRef.current.clientHeight);
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return () => {
      if (graphRef.current) {
        graphRef.current._destructor?.();
      }
    };
  }, [isLoading, savedNotes, quizHistory]);

  const hasData = savedNotes.length > 0 || quizHistory.length > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050510]">
      <main className="h-screen flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A0C2D2] to-[#D5E3E8] flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Knowledge Graph</h1>
              <p className="text-xs text-gray-400">3D visualization of your learning</p>
            </div>
          </div>

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-v-secondary" />
              <span className="text-gray-400">≥70%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-v-primary" />
              <span className="text-gray-400">40-70%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-v-primary" />
              <span className="text-gray-400">&lt;40%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-gray-400">Not quizzed</span>
            </div>
          </div>
        </div>

        {/* Graph Container */}
        <div className="flex-1 relative">
          {!hasData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto">
                  <Network className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500">Create notes and take quizzes to see your knowledge graph.</p>
              </div>
            </div>
          ) : (
            <>
              <div ref={containerRef} className="w-full h-full" />
              {/* Tooltip */}
              {tooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 right-4 m3-card !p-4 shadow-xl max-w-xs"
                >
                  <p className="font-bold text-sm">{tooltip.topic}</p>
                  <p className="text-xs text-gray-400 mt-1">{tooltip.subject}</p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span>Notes: {tooltip.noteCount}</span>
                    <span>Score: {tooltip.avgScore >= 0 ? `${tooltip.avgScore}%` : 'N/A'}</span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
