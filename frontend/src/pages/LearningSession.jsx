import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStudentStore } from '../store/studentStore';
import api from '../services/api';

export default function LearningSession() {
  const { contentId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { startSession, endSession } = useStudentStore();

  const [content, setContent] = useState(null);
  const [session, setSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    loadContent();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [contentId]);

  const loadContent = async () => {
    try {
      const res = await api.get(`/content/${contentId}`);
      setContent(res.data.data);
      const sess = await startSession(contentId);
      setSession(sess);
      // Start timer
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } catch {
      // Try loading from offline store
      setContent({ title: 'Loading Error', body: 'Content could not be loaded. You may be offline.', type: 'ARTICLE', subject: 'Unknown', topic: 'Unknown' });
    }
    setLoading(false);
  };

  const handleEndSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      if (session?.id) {
        await endSession({
          sessionId: session.id,
          durationSecs: elapsed,
          completionPct: completion,
        });
      }
    } catch (e) {
      console.error('Failed to end session:', e);
    }
    navigate('/dashboard');
  };

  const handleAIExplain = async () => {
    setShowAI(true);
    if (aiExplanation) return;
    try {
      const res = await api.post('/student/feed'); // Use AI service via proxy
      // Direct AI call for explanation
      const aiRes = await fetch(`${import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'}/generate/explanation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: content?.topic || content?.title || 'General',
          gradeLevel: 5,
          language: 'en',
          learningStyle: 'visual',
        }),
      });
      const data = await aiRes.json();
      setAiExplanation(data);
    } catch {
      setAiExplanation({
        summary: 'AI explanation unavailable',
        mainExplanation: 'The AI service is currently unavailable. Please try again later.',
        example: '',
        checkQuestion: '',
      });
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-brand-400 to-accent-400 animate-pulse-soft" />
          <p className="text-surface-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="glass sticky top-0 z-50 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={handleEndSession} className="text-surface-500 hover:text-surface-700 transition-colors flex items-center gap-2">
            <span>←</span> <span className="hidden sm:inline">{t('learning.endSession')}</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="chip-brand">{content?.subject}</span>
            <span className="text-sm font-mono text-surface-500">{formatTime(elapsed)}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="glass-card animate-fade-in">
          <h1 className="text-2xl font-display font-bold mb-2">{content?.title}</h1>
          <div className="flex gap-2 mb-6">
            <span className="chip-brand text-xs">{content?.type}</span>
            <span className="chip text-xs bg-surface-100 dark:bg-surface-800 text-surface-600">{content?.topic}</span>
          </div>

          {/* Content Body */}
          {content?.type === 'VIDEO' ? (
            <div className="aspect-video bg-surface-900 rounded-xl mb-6 flex items-center justify-center">
              <p className="text-surface-400">▶ Video Player</p>
            </div>
          ) : content?.type === 'QUIZ' ? (
            <div className="space-y-4 mb-6">
              <p className="text-surface-600 dark:text-surface-300 whitespace-pre-wrap">{content?.body}</p>
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
              <p className="text-surface-600 dark:text-surface-300 leading-relaxed whitespace-pre-wrap">{content?.body}</p>
            </div>
          )}

          {/* Progress Input */}
          <div className="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('learning.progress')}</label>
              <span className="text-sm font-bold text-brand-600">{completion}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={completion}
              onChange={(e) => setCompletion(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        </div>

        {/* AI Explanation */}
        {showAI && aiExplanation && (
          <div className="glass-card mt-6 animate-slide-up border-l-4 border-accent-500">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              ✨ {t('learning.aiExplain')}
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 mb-3">{aiExplanation.summary}</p>
            <p className="text-surface-700 dark:text-surface-200 mb-4">{aiExplanation.mainExplanation}</p>
            {aiExplanation.example && (
              <div className="p-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 mb-4">
                <p className="text-sm font-medium text-brand-700 dark:text-brand-300">💡 Example: {aiExplanation.example}</p>
              </div>
            )}
            {aiExplanation.checkQuestion && (
              <p className="text-sm italic text-surface-500">❓ {aiExplanation.checkQuestion}</p>
            )}
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <footer className="glass sticky bottom-0 px-4 py-3 border-t border-surface-200 dark:border-surface-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs text-surface-500">{completion}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAIExplain} className="btn-secondary text-sm py-2 px-4">
              ✨ {t('learning.aiExplain')}
            </button>
            <button onClick={handleEndSession} className="btn-primary text-sm py-2 px-4">
              {completion >= 100 ? t('learning.complete') : t('learning.endSession')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
