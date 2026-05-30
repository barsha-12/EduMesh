import React, { useEffect, useRef, useState } from 'react';
import { useStudyStore } from '../store/studyStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Network } from 'lucide-react';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import GlassCard from '../components/ui/GlassCard';

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

      // Pastel Design System mapping
      const color = avgScore < 0 ? '#CCCCCC' : avgScore >= 70 ? '#7DD4A8' : avgScore >= 40 ? '#EBEB62' : '#FFBBAA';

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
        .nodeResolution(24)
        .linkColor(() => 'rgba(208, 170, 255, 0.25)') // Pastel lavender link
        .linkWidth(0.8)
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
    <div className="min-h-screen bg-[#FAFAF5] text-[#3A3C4A] font-body relative">
      <AnimatedBackground />
      <main className="h-[calc(100vh-64px)] flex flex-col relative z-10 -m-4 sm:-m-8">
        
        {/* Header */}
        <GlassCard interactive={false} className="rounded-none border-x-0 border-t-0 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 px-6 md:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lavender to-periwinkle flex items-center justify-center shadow-soft">
              <Network className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-primary">Knowledge Graph</h1>
              <p className="text-sm font-body text-secondary">3D visualization of your connected notes and mastery</p>
            </div>
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center gap-5 text-sm font-medium mt-4 sm:mt-0 bg-white/40 px-4 py-2 rounded-pill border border-pearl">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-mint shadow-sm" />
              <span className="text-slate">≥70% Mastery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-lemon shadow-sm" />
              <span className="text-slate">40-70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-peach shadow-sm" />
              <span className="text-slate">&lt;40%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-taupe shadow-sm" />
              <span className="text-slate">No Quizzes</span>
            </div>
          </div>
        </GlassCard>

        {/* Graph Container */}
        <div className="flex-1 relative">
          {!hasData ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-lavender/40 to-periwinkle/40 flex items-center justify-center mx-auto shadow-sm">
                  <Network className="w-12 h-12 text-periwinkle" />
                </div>
                <h2 className="font-display font-bold text-xl text-primary">Nothing to visualize yet</h2>
                <p className="text-secondary text-sm">Your Knowledge Graph will build itself automatically as you create smart notes and complete practice quizzes.</p>
              </div>
            </div>
          ) : (
            <>
              <div ref={containerRef} className="w-full h-full" />
              {/* Tooltip */}
              {tooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-6 right-6 glass-base !p-5 shadow-lg max-w-[280px] pointer-events-none"
                >
                  <p className="font-display font-bold text-lg text-primary">{tooltip.topic}</p>
                  <p className="text-sm font-medium text-periwinkle mt-1 border-b border-pearl/60 pb-2">{tooltip.subject}</p>
                  <div className="flex justify-between items-center gap-4 mt-3 text-sm font-body">
                    <span className="text-secondary flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-lavender"></span> {tooltip.noteCount} Notes</span>
                    <span className={`font-bold px-2 py-0.5 rounded-md ${tooltip.avgScore >= 70 ? 'bg-mint/20 text-mint' : tooltip.avgScore >= 40 ? 'bg-lemon/40 text-slate' : tooltip.avgScore >= 0 ? 'bg-peach/30 text-rose' : 'bg-taupe/20 text-slate'}`}>
                      {tooltip.avgScore >= 0 ? `${tooltip.avgScore}% Score` : 'Not Quizzed'}
                    </span>
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
