import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NGODashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [overview, setOverview] = useState(null);
  const [regionData, setRegionData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ovRes, regRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/region'),
      ]);
      setOverview(ovRes.data.data);
      setRegionData(regRes.data.data || []);
    } catch (e) {
      console.error('NGO data load failed:', e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <span className="text-white text-lg">🌍</span>
            </div>
            <h1 className="text-xl font-display font-bold">{t('app.name')} — NGO</h1>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-sm text-surface-400 hover:text-red-500">
            {t('nav.logout')}
          </button>
        </div>
      </header>

      <main className="page-container animate-fade-in">
        <h2 className="text-3xl font-display font-bold mb-8">Impact Dashboard 🌍</h2>

        {/* Impact Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Students Reached', value: overview?.totalStudents || 0, icon: '🎓' },
            { label: 'Mentors Active', value: overview?.totalMentors || 0, icon: '🧑‍🏫' },
            { label: 'Learning Hours', value: overview?.totalLearningHours || 0, icon: '⏱️' },
            { label: 'Credentials Issued', value: overview?.totalCredentials || 0, icon: '🏆' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card text-center">
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* DAU Chart */}
        <div className="glass-card mb-8">
          <h3 className="font-display font-semibold text-lg mb-4">Student Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview?.dailyActiveUsers || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Region Breakdown */}
        <div className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-4">{t('admin.regionMap')}</h3>
          {regionData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-surface-500 border-b border-surface-200 dark:border-surface-700">
                    <th className="pb-3 font-medium">Country</th>
                    <th className="pb-3 font-medium">Region</th>
                    <th className="pb-3 font-medium text-right">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {regionData.map((r, i) => (
                    <tr key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0">
                      <td className="py-3 font-medium">{r.country}</td>
                      <td className="py-3 text-surface-500">{r.region}</td>
                      <td className="py-3 text-right font-bold text-brand-600">{r.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-surface-500 py-8">No region data yet. Students will appear once they set their location.</p>
          )}
        </div>
      </main>
    </div>
  );
}
