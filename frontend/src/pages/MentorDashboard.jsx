import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

export default function MentorDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [matchRes, lbRes] = await Promise.all([
        api.get('/mentor/matches'),
        api.get('/mentor/leaderboard'),
      ]);
      setMatches(matchRes.data.data || []);
      setLeaderboard(lbRes.data.data || []);
    } catch (e) {
      console.error('Failed to load mentor data:', e);
    }
    setLoading(false);
  };

  const handleAccept = async (matchId) => {
    try {
      await api.post(`/mentor/matches/${matchId}/accept`);
      loadData();
    } catch (e) {
      console.error('Accept failed:', e);
    }
  };

  const handleComplete = async (matchId) => {
    try {
      await api.post(`/mentor/matches/${matchId}/complete`, { notes: 'Session completed' });
      loadData();
    } catch (e) {
      console.error('Complete failed:', e);
    }
  };

  const pending = matches.filter((m) => m.status === 'PENDING');
  const active = matches.filter((m) => m.status === 'ACTIVE');
  const completed = matches.filter((m) => m.status === 'COMPLETED');

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
              <span className="text-white font-bold">🧑‍🏫</span>
            </div>
            <h1 className="text-xl font-display font-bold">{t('app.name')} — Mentor</h1>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-surface-400 hover:text-red-500">
            {t('nav.logout')}
          </button>
        </div>
      </header>

      <main className="page-container animate-fade-in">
        <h2 className="text-3xl font-display font-bold mb-8">
          {t('dashboard.greeting', { name: user?.email?.split('@')[0] || 'Mentor' })} 🧑‍🏫
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-orange-500">{pending.length}</p>
            <p className="text-sm text-surface-500">{t('mentor.pendingRequests')}</p>
          </div>
          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-green-500">{active.length}</p>
            <p className="text-sm text-surface-500">{t('mentor.activeSessions')}</p>
          </div>
          <div className="glass-card text-center">
            <p className="text-3xl font-bold text-brand-500">{completed.length}</p>
            <p className="text-sm text-surface-500">{t('mentor.sessionHistory')}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <section className="mb-8">
          <h3 className="section-title mb-4">{t('mentor.pendingRequests')}</h3>
          {pending.length === 0 ? (
            <div className="glass-card text-center py-8">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-surface-500">{t('mentor.noMatches')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((match) => (
                <div key={match.id} className="glass-card flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{match.studentProfile?.displayName || 'Student'}</p>
                    <p className="text-sm text-surface-500">{match.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(match.id)} className="btn-primary text-sm py-2 px-4">
                      {t('mentor.accept')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Sessions */}
        {active.length > 0 && (
          <section className="mb-8">
            <h3 className="section-title mb-4">{t('mentor.activeSessions')}</h3>
            <div className="space-y-3">
              {active.map((match) => (
                <div key={match.id} className="glass-card flex items-center justify-between border-l-4 border-green-500">
                  <div>
                    <p className="font-semibold">{match.studentProfile?.displayName || 'Student'}</p>
                    <p className="text-sm text-surface-500">{match.subject} · Active</p>
                  </div>
                  <button onClick={() => handleComplete(match.id)} className="btn-accent text-sm py-2 px-4">
                    {t('mentor.complete')}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Leaderboard */}
        <section>
          <h3 className="section-title mb-4">{t('mentor.leaderboard')} 🏆</h3>
          <div className="glass-card">
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((mentor, i) => (
                  <div key={mentor.mentorId} className="flex items-center gap-4 p-2">
                    <span className="text-lg font-bold text-surface-400 w-8">{i + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center text-white font-bold">
                      {mentor.displayName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{mentor.displayName}</p>
                    </div>
                    <p className="font-bold text-brand-600">{mentor.completedSessions} sessions</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-surface-500 py-4">{t('common.noResults')}</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
