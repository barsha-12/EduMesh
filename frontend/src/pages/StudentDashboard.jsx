import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useStudentStore } from '../store/studentStore';

export default function StudentDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { profile, learnerProfile, feed, streak, fetchProfile, fetchFeed, fetchStreak, isLoading } = useStudentStore();

  useEffect(() => {
    fetchProfile();
    fetchFeed();
    fetchStreak();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goalProgress = streak?.goalProgress || 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-500 hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-surface-400 hover:text-red-500 transition-colors">
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="page-container animate-fade-in">
        {/* Greeting */}
        <h2 className="text-3xl font-display font-bold mb-8">
          {t('dashboard.greeting', { name: profile?.displayName || user?.email?.split('@')[0] || 'Student' })} 👋
        </h2>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Streak */}
          <div className="glass-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl shadow-lg">
              🔥
            </div>
            <div>
              <p className="text-2xl font-bold">{streak?.streakDays || 0}</p>
              <p className="text-sm text-surface-500">{t('dashboard.streak')}</p>
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="glass-card flex items-center gap-4">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle cx="28" cy="28" r="24" fill="none" stroke="url(#goalGrad)" strokeWidth="4"
                  strokeDasharray={`${(goalProgress / 100) * 150.8} 150.8`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f87e9" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {Math.round(goalProgress)}%
              </span>
            </div>
            <div>
              <p className="text-lg font-bold">{streak?.weekMinutes || 0} / {streak?.weeklyGoalMins || 60} {t('dashboard.minutes')}</p>
              <p className="text-sm text-surface-500">{t('dashboard.weeklyGoal')}</p>
            </div>
          </div>

          {/* XP Level */}
          <div className="glass-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-2xl shadow-lg">
              ⭐
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.floor((streak?.totalMinutes || 0) / 60)}</p>
              <p className="text-sm text-surface-500">{t('dashboard.xpLevel')}</p>
            </div>
          </div>
        </div>

        {/* AI Feed */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">{t('dashboard.aiFeed')} ✨</h3>
            <button className="text-sm text-brand-600 font-semibold hover:text-brand-700">{t('dashboard.viewAll')}</button>
          </div>

          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="min-w-[280px] h-48 skeleton rounded-2xl" />
              ))}
            </div>
          ) : feed.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
              {feed.map((item, i) => (
                <Link
                  key={item.contentId || i}
                  to={`/learn/${item.contentId || i}`}
                  className="min-w-[280px] glass-card snap-start group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="chip-brand">{item.subject}</span>
                    <span className="text-xs text-surface-400">{item.durationMins || 15} {t('dashboard.minutes')}</span>
                  </div>
                  <h4 className="font-semibold mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-surface-500 line-clamp-2">{item.explanation}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="chip text-xs bg-surface-100 dark:bg-surface-800 text-surface-600">{item.type}</span>
                    {item.offlineBlob && <span className="text-xs text-green-600">📥 {t('dashboard.offlineBadge')}</span>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-card text-center py-12">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-surface-500">{t('dashboard.noContent')}</p>
            </div>
          )}
        </section>

        {/* Continue Learning + Mentor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="glass-card">
            <h3 className="font-display font-semibold text-lg mb-4">{t('dashboard.continueLeaning')} 📖</h3>
            <div className="space-y-3">
              {(feed || []).slice(0, 3).map((item, i) => (
                <Link key={i} to={`/learn/${item.contentId || i}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold shadow">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.title}</p>
                    <p className="text-xs text-surface-500">{item.subject} · {item.durationMins || 15} {t('dashboard.minutes')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="glass-card">
            <h3 className="font-display font-semibold text-lg mb-4">{t('dashboard.credentials')} 🏆</h3>
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🎖️</p>
              <p className="text-surface-500 text-sm">Complete more courses to earn credentials</p>
              <Link to={`/credentials/${user?.id}`} className="btn-secondary mt-4 inline-block text-sm">
                {t('dashboard.viewAll')}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
