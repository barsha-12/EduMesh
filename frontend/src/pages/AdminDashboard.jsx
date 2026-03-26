import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [overview, setOverview] = useState(null);
  const [subjectData, setSubjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [ovRes, subRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/subject'),
      ]);
      setOverview(ovRes.data.data);
      setSubjectData(subRes.data.data || []);
    } catch (e) {
      console.error('Analytics load failed:', e);
    }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/analytics/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `edumesh-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const stats = [
    { label: t('admin.totalUsers'), value: overview?.totalUsers || 0, icon: '👥', color: 'from-blue-400 to-blue-600' },
    { label: t('admin.totalStudents'), value: overview?.totalStudents || 0, icon: '🎓', color: 'from-brand-400 to-brand-600' },
    { label: t('admin.totalMentors'), value: overview?.totalMentors || 0, icon: '🧑‍🏫', color: 'from-accent-400 to-accent-600' },
    { label: t('admin.totalContent'), value: overview?.totalContent || 0, icon: '📚', color: 'from-green-400 to-green-600' },
    { label: t('admin.activeLast7'), value: overview?.activeUsersLast7Days || 0, icon: '📊', color: 'from-orange-400 to-orange-600' },
    { label: t('admin.learningHours'), value: overview?.totalLearningHours || 0, icon: '⏱️', color: 'from-purple-400 to-purple-600' },
  ];

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚙️</span>
            </div>
            <h1 className="text-xl font-display font-bold">{t('app.name')} — Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="btn-secondary text-sm py-2 px-4">
              📥 {t('admin.exportCsv')}
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-surface-400 hover:text-red-500">
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      <main className="page-container animate-fade-in">
        <h2 className="text-3xl font-display font-bold mb-8">{t('admin.overview')} 📊</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* DAU Chart */}
          <div className="glass-card">
            <h3 className="font-display font-semibold text-lg mb-4">Daily Active Users (30 days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={overview?.dailyActiveUsers || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#0f87e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Engagement */}
          <div className="glass-card">
            <h3 className="font-display font-semibold text-lg mb-4">{t('admin.subjectEngagement')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="totalSessions" fill="#0f87e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credential Issuance */}
        <section className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-4">{t('admin.issueCredential')} 🏆</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium text-surface-600 block mb-1">Student ID</label>
              <input id="cred-student-id" type="text" className="input-field" placeholder="Student CUID" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-medium text-surface-600 block mb-1">{t('credential.subject')}</label>
              <input id="cred-subject" type="text" className="input-field" placeholder="Mathematics" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="text-sm font-medium text-surface-600 block mb-1">{t('credential.level')}</label>
              <input id="cred-level" type="text" className="input-field" placeholder="Intermediate" />
            </div>
            <button className="btn-primary">
              {t('admin.issueCredential')}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
