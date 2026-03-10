// pages/HomePage.jsx
// ===================
// Landing page — explains the app and links to main sections.

import { Link } from 'react-router-dom';

const styles = {
  hero: {
    textAlign: 'center', padding: '4rem 2rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    borderRadius: '16px', color: '#fff', marginBottom: '2rem',
  },
  title: { fontSize: '2.5rem', fontWeight: '800', margin: 0 },
  subtitle: { fontSize: '1.1rem', opacity: 0.9, marginTop: '0.75rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' },
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
    padding: '1.5rem', textDecoration: 'none', color: 'inherit',
    display: 'block', transition: 'box-shadow 0.2s',
  },
  icon: { fontSize: '2rem', marginBottom: '0.5rem' },
  cardTitle: { fontWeight: '700', fontSize: '1rem', color: '#111827' },
  cardDesc: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' },
};

const cards = [
  { to: '/profile', icon: '👤', title: 'Profil Oluştur', desc: 'İlgi alanlarını ve seviyeni belirle' },
  { to: '/activities', icon: '🎯', title: 'Aktiviteler', desc: 'Tüm aktivitelere göz at ve katıl' },
  { to: '/activities/create', icon: '➕', title: 'Aktivite Ekle', desc: 'Kendi aktiviteni oluştur' },
  { to: '/recommendations', icon: '⭐', title: 'Öneriler', desc: 'Sana özel aktivite önerileri al' },
];

export default function HomePage() {
  return (
    <div>
      <div style={styles.hero}>
        <h1 style={styles.title}>SquadUp 🎮</h1>
        <p style={styles.subtitle}>
          Sana en uygun aktiviteleri bul — Fonksiyonel eşleştirme algoritmasıyla.
        </p>
      </div>
      <div style={styles.grid}>
        {cards.map(c => (
          <Link key={c.to} to={c.to} style={styles.card}>
            <div style={styles.icon}>{c.icon}</div>
            <div style={styles.cardTitle}>{c.title}</div>
            <div style={styles.cardDesc}>{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
