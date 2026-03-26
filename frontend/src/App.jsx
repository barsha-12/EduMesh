import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Lazy-load pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const LearningSession = lazy(() => import('./pages/LearningSession'));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NGODashboard = lazy(() => import('./pages/NGODashboard'));
const Credentials = lazy(() => import('./pages/Credentials'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-brand-400 to-accent-400 animate-pulse-soft" />
        <p className="text-surface-500 font-medium">Loading EduMesh...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { user, isAuthenticated } = useAuthStore();

  const getDashboardRedirect = () => {
    if (!isAuthenticated) return '/login';
    switch (user?.role) {
      case 'MENTOR': return '/mentor-dashboard';
      case 'ADMIN': return '/admin-dashboard';
      case 'NGO': return '/ngo-dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />

        <Route path="/learn/:contentId" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <LearningSession />
          </ProtectedRoute>
        } />

        <Route path="/mentor-dashboard" element={
          <ProtectedRoute allowedRoles={['MENTOR']}>
            <MentorDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/ngo-dashboard" element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NGODashboard />
          </ProtectedRoute>
        } />

        <Route path="/credentials/:studentId" element={<Credentials />} />

        <Route path="/" element={<Navigate to={getDashboardRedirect()} replace />} />
        <Route path="*" element={<Navigate to={getDashboardRedirect()} replace />} />
      </Routes>
    </Suspense>
  );
}
