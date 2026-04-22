import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { getCurrentUser } from './utils/auth';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ActivitiesPage from './pages/ActivitiesPage';
import RecommendationsPage from './pages/RecommendationsPage';
import CreateActivityPage from './pages/CreateActivityPage';
import ProfilePage from './pages/ProfilePage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { getMe } from './services/api';

export default function App() {
  const darkMode = useStore((state) => state.darkMode);
  const setUser = useStore((state) => state.setUser);

  // Sync dark mode class on html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Restore user session on mount
  useEffect(() => {
    const token = localStorage.getItem('squadup-token');
    if (token) {
      getMe().then(({ data }) => {
        if (data) {
          setUser(data.user, token);
        } else {
          // Token invalid or expired
          localStorage.removeItem('squadup-token');
        }
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-primary-500/30">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityDetailPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/create" element={<CreateActivityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
