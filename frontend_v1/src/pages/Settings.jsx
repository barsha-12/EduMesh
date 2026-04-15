import React, { useState } from 'react';
import { Save, LogOut, Moon, Type } from 'lucide-react';
import { TopBar, Sidebar, BottomNav, MobileDrawer } from '../components/layout';
import { Card, Button, Input, Select } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useStudyStore } from '../store/studyStore';

const Settings = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, signOut, changePassword } = useAuthStore();
  const { isDark, toggleTheme, fontSize, setFontSize } = useThemeStore();
  const { defaultExplanationStyle, defaultQuizDifficulty, setPreferences } = useStudyStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [explanationStyle, setExplanationStyle] = useState(defaultExplanationStyle);
  const [quizDifficulty, setQuizDifficulty] = useState(defaultQuizDifficulty);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      setPreferences({
        explanationStyle,
        quizDifficulty,
      });
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const result = await changePassword(newPassword);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-60">
        <TopBar title="Settings" onMenuClick={() => setDrawerOpen(true)} showMenuButton />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto w-full">
            {message && (
              <Card padding="sm" className="mb-6 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                {message}
              </Card>
            )}

            {/* Profile Section */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
              <div className="space-y-4">
                <Input label="Email" type="email" value={user?.email || ''} disabled />
                <Input label="Name" value={user?.user_metadata?.display_name || ''} disabled />
              </div>
            </Card>

            {/* Appearance */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Moon size={24} /> Appearance
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={toggleTheme}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        !isDark
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      onClick={toggleTheme}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        isDark ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Type size={20} /> Font Size
                  </h3>
                  <Select
                    options={[
                      { label: 'Small (14px)', value: 'small' },
                      { label: 'Medium (16px)', value: 'medium' },
                      { label: 'Large (18px)', value: 'large' },
                    ]}
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Learning Preferences */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Learning Preferences</h2>
              <div className="space-y-4 mb-6">
                <Select
                  label="Explanation Style"
                  options={[
                    { label: 'Detailed (comprehensive)', value: 'detailed' },
                    { label: 'Concise (short)', value: 'concise' },
                    { label: 'ELI5 (simple)', value: 'eli5' },
                  ]}
                  value={explanationStyle}
                  onChange={(e) => setExplanationStyle(e.target.value)}
                />
                <Select
                  label="Default Quiz Difficulty"
                  options={[
                    { label: 'Easy', value: 'easy' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Hard', value: 'hard' },
                  ]}
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                />
              </div>
              <Button onClick={handleSavePreferences} disabled={saving} className="gap-2">
                <Save size={20} /> Save Preferences
              </Button>
            </Card>

            {/* Security */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security</h2>
              <div className="space-y-4 mb-6">
                <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleChangePassword} disabled={saving} className="gap-2">
                <Save size={20} /> Change Password
              </Button>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 dark:bg-opacity-20">
              <h2 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">Danger Zone</h2>
              <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                Logging out will end your current session. You'll need to sign in again to access your account.
              </p>
              <Button
                onClick={signOut}
                variant="outlined"
                className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 gap-2"
              >
                <LogOut size={20} /> Logout
              </Button>
            </Card>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
