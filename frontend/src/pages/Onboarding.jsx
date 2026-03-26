import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '../store/onboardingStore';
import { useAuthStore } from '../store/authStore';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' },
];

const ROLES = [
  { value: 'STUDENT', icon: '🎓', color: 'from-brand-400 to-brand-600' },
  { value: 'MENTOR', icon: '🧑‍🏫', color: 'from-accent-400 to-accent-600' },
  { value: 'NGO', icon: '🌍', color: 'from-green-400 to-green-600' },
];

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Civic Education',
  'History', 'Geography', 'Computer Science', 'Arts',
];

export default function Onboarding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const store = useOnboardingStore();
  const { user } = useAuthStore();

  const handleFinish = () => {
    // Apply language to i18n
    i18n.changeLanguage(store.language);
    localStorage.setItem('edumesh-lang', store.language);

    const role = user?.role || store.role;
    navigate(role === 'MENTOR' ? '/mentor-dashboard' : role === 'ADMIN' ? '/admin-dashboard' : '/dashboard');
  };

  const steps = [
    // Step 0: Language Selection
    <div key="lang" className="space-y-6 animate-fade-in">
      <h2 className="section-title text-center">{t('onboarding.selectLanguage')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => { store.setLanguage(lang.code); i18n.changeLanguage(lang.code); }}
            className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 text-lg font-medium
              ${store.language === lang.code
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md'
                : 'border-surface-200 dark:border-surface-700 hover:border-brand-300'}`}
          >
            <span className="text-3xl">{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Role Selection
    <div key="role" className="space-y-6 animate-fade-in">
      <h2 className="section-title text-center">{t('onboarding.selectRole')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ROLES.map((role) => (
          <button
            key={role.value}
            onClick={() => store.setRole(role.value)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3
              ${store.role === role.value
                ? 'border-brand-500 shadow-lg scale-105'
                : 'border-surface-200 dark:border-surface-700 hover:scale-102'}`}
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-3xl shadow-lg`}>
              {role.icon}
            </div>
            <span className="font-semibold">{t(`onboarding.${role.value.toLowerCase()}`)}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Subject Interests
    <div key="subjects" className="space-y-6 animate-fade-in">
      <h2 className="section-title text-center">{t('onboarding.selectSubjects')}</h2>
      <div className="flex flex-wrap gap-3 justify-center">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => store.toggleSubject(subject)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
              ${store.subjects.includes(subject)
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md scale-105'
                : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-brand-400'}`}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Grade Level
    <div key="grade" className="space-y-6 animate-fade-in">
      <h2 className="section-title text-center">{t('onboarding.selectGrade')}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-w-md mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
          <button
            key={grade}
            onClick={() => store.setGradeLevel(grade)}
            className={`w-14 h-14 rounded-xl text-lg font-bold transition-all duration-200 mx-auto
              ${store.gradeLevel === grade
                ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-lg scale-110'
                : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-brand-400'}`}
          >
            {grade}
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Connection Quality
    <div key="connection" className="space-y-6 animate-fade-in">
      <h2 className="section-title text-center">{t('onboarding.connectionCheck')}</h2>
      <div className="space-y-3 max-w-sm mx-auto">
        {[
          { value: 'good', icon: '📶', label: t('onboarding.goodWifi'), desc: 'Stream videos, real-time features' },
          { value: 'slow', icon: '📡', label: t('onboarding.slowWifi'), desc: 'Text content, compressed media' },
          { value: 'offline', icon: '📴', label: t('onboarding.offlineFirst'), desc: 'Download content for offline use' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => store.setConnectionQuality(opt.value)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left flex items-center gap-4
              ${store.connectionQuality === opt.value
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-surface-200 dark:border-surface-700'}`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <div>
              <p className="font-semibold">{opt.label}</p>
              <p className="text-sm text-surface-500">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-surface-500">{t('onboarding.step', { current: store.step + 1, total: 5 })}</span>
          </div>
          <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${((store.step + 1) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card min-h-[320px] flex flex-col justify-between">
          <div>{steps[store.step]}</div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={store.prevStep}
              className={`btn-secondary ${store.step === 0 ? 'invisible' : ''}`}
            >
              {t('onboarding.back')}
            </button>

            {store.step < 4 ? (
              <button onClick={store.nextStep} className="btn-primary">
                {t('onboarding.next')}
              </button>
            ) : (
              <button onClick={handleFinish} className="btn-accent">
                {t('onboarding.finish')} 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
