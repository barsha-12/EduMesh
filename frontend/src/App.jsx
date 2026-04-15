import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Pages
import Landing from './pages/Landing';
import NotebookHub from './pages/NotebookHub';
import NotebookWorkspace from './pages/NotebookWorkspace';
import AIChat from './pages/AIChat';
import StudyNotes from './pages/StudyNotes';
import Quiz from './pages/Quiz';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import MindTree from './pages/MindTree';

// Components
import MainLayout from './components/layout/MainLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F5E8] dark:bg-[#1c1a16]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E8A2A2] to-[#A0C2D2] rounded-full animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-bold tracking-widest uppercase text-xs">Initializing EduMesh...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { initializeAuth } = useAuthStore();
  const isDark = useThemeStore((state) => state.isDark);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Apply dark mode to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
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
            <NotebookWorkspace />
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
                    <h1 className="text-2xl font-black tracking-tight font-outfit text-[#2c2c2c] dark:text-[#F7F5E8]">Visual Mind Tree</h1>
                 </div>
                 <MindTree />
              </div>
            </MainLayout>
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
