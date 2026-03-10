// pages/RecommendationsPage.jsx
// ===============================
// Shows personalized activity recommendations for a user.
// Displays match scores with Turkish labels and score breakdowns.

import { useState } from 'react';
import { UI_TEXT } from '../constants/translations';
import { userApi } from '../services/api';
import ActivityCard from '../components/ActivityCard';

const styles = {
  header: { marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: 0 },
  subtitle: { color: '#6b7280', marginTop: '0.35rem', fontSize: '0.9rem' },
  searchRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  inputGroup: { flex: 1 },
  label: { fontWeight: '600', fontSize: '0.85rem', color: '#374151', display: 'block', marginBottom: '0.35rem' },
  input: {
    width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    padding: '0.65rem 1.5rem', background: '#6366f1', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600',
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '0.75rem', marginBottom: '1.5rem',
  },
  statCard: {
    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
    padding: '0.9rem 1rem', textAlign: 'center',
  },
  statValue: { fontWeight: '800', fontSize: '1.5rem', color: '#4338ca' },
  statLabel: { fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.1rem' },
  grid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '3rem' },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1rem', color: '#991b1b' },
};

export default function RecommendationsPage() {
  const t = UI_TEXT.recommendations;
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.getRecommendations(userId.trim());
      setRecommendations(data.recommendations || []);
      setStats(data.stats || null);
      setFetched(true);
    } catch (err) {
      setError(err.response?.data?.error || UI_TEXT.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>⭐ {t.pageTitle}</h1>
        <p style={styles.subtitle}>{t.subtitle}</p>
      </div>

      {/* Search row */}
      <div style={styles.searchRow}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>{t.userIdLabel}</label>
          <input
            style={styles.input}
            type="text"
            placeholder={t.userIdPlaceholder}
            value={userId}
            onChange={e => setUserId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchRecommendations()}
          />
        </div>
        <button style={styles.button} onClick={fetchRecommendations} disabled={loading}>
          {loading ? UI_TEXT.common.loading : t.getButton}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Stats summary */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.count}</div>
            <div style={styles.statLabel}>{t.stats.total}</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.perfect}</div>
            <div style={styles.statLabel}>{t.stats.perfect}</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#3b82f6' }}>{stats.good}</div>
            <div style={styles.statLabel}>{t.stats.good}</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#6366f1' }}>
              {stats.avg_score ? Math.round(stats.avg_score * 100) + '%' : '—'}
            </div>
            <div style={styles.statLabel}>{t.stats.average}</div>
          </div>
        </div>
      )}

      {/* Recommendations list */}
      {fetched && recommendations.length === 0 && (
        <div style={styles.empty}>{t.noResults}</div>
      )}

      <div style={styles.grid}>
        {recommendations.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            matchResult={activity.match_result}
            userId={userId}
          />
        ))}
      </div>
    </div>
  );
}
