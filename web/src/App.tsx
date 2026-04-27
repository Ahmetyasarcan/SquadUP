import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { useStore } from './store/useStore';
import { getMe } from './services/api';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ActivitiesPage from './pages/ActivitiesPage';
import RecommendationsPage from './pages/RecommendationsPage';
import CreateActivityPage from './pages/CreateActivityPage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import SquadsPage from './pages/SquadsPage';
import ActivityDetailPage from './pages/ActivityDetailPage';

function AppRoutes() {
  const { user, session, loading: authLoading } = useAuth();
  const { setUser, user: storeUser } = useStore();

  useEffect(() => {
    async function syncUser() {
      if (session?.access_token) {
        // Fetch full profile from our backend
        const res = await getMe();
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          // If profile fetch fails but auth is valid, fallback to basic user for demo
          console.warn("Profile sync failed, using fallback from auth session.");
          setUser({
            id: user?.id || '',
            name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
            email: user?.email || '',
            interests: [],
            reliability_score: 1.0,
            competition_level: 3
          } as any);
        }
      } else {
        setUser(null);
      }
    }
    
    if (!authLoading) {
      syncUser();
    }
  }, [session?.access_token, authLoading, setUser]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  // Use the session to determine basic auth routing, but wait for storeUser to be populated if needed?
  // Actually, ProtectedRoute uses useAuth (Supabase user), which is fine for auth checks.
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/activities" /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/activities" /> : <SignupPage />} />
      
      {/* Demo-accessible routes (no login required for presentation) */}
      <Route path="/activities" element={<ActivitiesPage />} />
      <Route path="/activities/:id" element={<ActivityDetailPage />} />
      <Route path="/recommendations" element={<RecommendationsPage />} />
      <Route path="/squads" element={<SquadsPage />} />
      <Route path="/friends" element={<FriendsPage />} />

      {/* Protected routes (require login) */}
      <Route path="/create" element={
        <ProtectedRoute><CreateActivityPage /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#F1F5F9',
              border: '1px solid #334155',
            },
          }}
        />
        <div className="min-h-screen bg-dark-bg">
          <Navbar />
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
