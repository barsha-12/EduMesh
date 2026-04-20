import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Pages
import Landing from './pages/Landing';
import NotebookHub from './pages/NotebookHub';
import AIChat from './pages/AIChat';
import StudyNotes from './pages/StudyNotes';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import MindTree from './pages/MindTree';
import AuthCallback from './pages/AuthCallback';
import Flashcards from './pages/Flashcards';
import Feynman from './pages/Feynman';
import KnowledgeGraph from './pages/KnowledgeGraph';
import SynthesizeWorkspace from './pages/SynthesizeWorkspace';
import Dashboard from './pages/Dashboard';

// Components
import MainLayout from './components/layout/MainLayout';
import ToastContainer from './components/ui/ToastContainer';
import RateLimitToast from './components/ui/RateLimitToast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Onboarding from './components/auth/Onboarding';

const AppContent = () => {
  const { initializeAuth, isAuthenticated, isInitializing } = useAuthStore();
  const theme = useThemeStore((state) => state.theme);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('edumesh-onboarded');
    if (!hasOnboarded && isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('edumesh-onboarded', 'true');
    setShowOnboarding(false);
  };

  // Apply dark mode to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-v-bg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-v-primary to-v-accent rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-v-text/40 font-bold tracking-widest uppercase text-[10px]">Initializing Elite Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RateLimitToast />
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout><Dashboard /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <MainLayout><AIChat /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notebooks"
          element={
            <ProtectedRoute>
              <MainLayout><NotebookHub /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notebook/:id"
          element={
            <ProtectedRoute>
               <SynthesizeWorkspace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <MainLayout><StudyNotes /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <MainLayout><Quiz /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mindtree"
          element={
            <ProtectedRoute>
              <MainLayout>
                <div className="p-6 h-[calc(100vh-64px)] overflow-hidden">
                   <div className="flex items-center gap-3 mb-4">
                      <h1 className="text-2xl font-black tracking-tight font-outfit text-v-text">Visual Mind Tree</h1>
                   </div>
                   <MindTree />
                </div>
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <MainLayout><Flashcards /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/feynman"
          element={
            <ProtectedRoute>
              <MainLayout><Feynman /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge-graph"
          element={
            <ProtectedRoute>
              <MainLayout><KnowledgeGraph /></MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout><Settings /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;
