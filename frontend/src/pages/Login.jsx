import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: 'STUDENT' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      if (isRegister) {
        await register(form);
        navigate('/onboarding');
      } else {
        const res = await login({ email: form.email, password: form.password });
        const role = res.data.user.role;
        navigate(role === 'MENTOR' ? '/mentor-dashboard' : role === 'ADMIN' ? '/admin-dashboard' : role === 'NGO' ? '/ngo-dashboard' : '/dashboard');
      }
    } catch { /* error handled in store */ }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-xl">
            <span className="text-3xl font-display font-bold text-white">E</span>
          </div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            {t('app.name')}
          </h1>
          <p className="text-surface-500 mt-1">{t('app.tagline')}</p>
        </div>

        {/* Form Card */}
        <div className="glass-card animate-slide-up">
          <h2 className="text-xl font-semibold text-center mb-6">
            {isRegister ? t('auth.register') : t('auth.login')}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                  {t('auth.displayName')}
                </label>
                <input
                  id="displayName"
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                  {t('onboarding.selectRole')}
                </label>
                <select
                  id="role"
                  className="input-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="STUDENT">{t('onboarding.student')}</option>
                  <option value="MENTOR">{t('onboarding.mentor')}</option>
                  <option value="NGO">{t('onboarding.ngo')}</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : isRegister ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-surface-500">
            {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); clearError(); }}
              className="text-brand-600 font-semibold hover:text-brand-700 transition-colors"
            >
              {isRegister ? t('auth.signIn') : t('auth.signUp')}
            </button>
          </div>

          {!isRegister && (
            <div className="mt-3 text-center">
              <button className="text-sm text-surface-400 hover:text-brand-500 transition-colors">
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
