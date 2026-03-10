// src/App.jsx
// ============
// Main app with routing and persistent navigation.

import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { UI_TEXT } from './constants/translations';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ActivityListPage from './pages/ActivityListPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ActivityForm from './components/ActivityForm';

const navLinks = [
  { to: '/',               label: UI_TEXT.nav.home },
  { to: '/activities',     label: UI_TEXT.nav.activities },
  { to: '/activities/create', label: '+ Aktivite Oluştur' },
  { to: '/recommendations',label: UI_TEXT.nav.recommendations },
  { to: '/profile',        label: UI_TEXT.nav.profile },
];

function CreateActivityPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '1.5rem' }}>
        ➕ Aktivite Oluştur
      </h1>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.75rem' }}>
        <ActivityForm />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Navigation */}
        <nav style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '0 1.5rem', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: '1100px', margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            height: '60px', overflowX: 'auto',
          }}>
            <span style={{ fontWeight: '800', fontSize: '1.15rem', color: '#6366f1', marginRight: '1rem', whiteSpace: 'nowrap' }}>
              SquadUp
            </span>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                style={({ isActive }) => ({
                  padding: '0.45rem 0.85rem', borderRadius: '8px', textDecoration: 'none',
                  fontSize: '0.88rem', fontWeight: '500', whiteSpace: 'nowrap',
                  background: isActive ? '#eef2ff' : 'transparent',
                  color: isActive ? '#4338ca' : '#6b7280',
                  transition: 'all 0.15s',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Page content */}
        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          <Routes>
            <Route path="/"                    element={<HomePage />} />
            <Route path="/profile"             element={<ProfilePage />} />
            <Route path="/activities"          element={<ActivityListPage />} />
            <Route path="/activities/create"   element={<CreateActivityPage />} />
            <Route path="/recommendations"     element={<RecommendationsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
