// components/ActivityCard.jsx
// ============================
// Reusable card for displaying an activity.
// Accepts optional match score data for recommendations view.

import { useState } from 'react';
import { UI_TEXT, getCategoryLabel, getMatchLabelInfo } from '../constants/translations';
import { activityApi } from '../services/api';

const categoryColors = {
  sports:      { bg: '#ecfdf5', accent: '#059669', label: '#065f46' },
  esports:     { bg: '#eff6ff', accent: '#2563eb', label: '#1e40af' },
  board_games: { bg: '#fdf4ff', accent: '#9333ea', label: '#6b21a8' },
  outdoor:     { bg: '#fff7ed', accent: '#ea580c', label: '#9a3412' },
};

const styles = {
  card: {
    background: '#fff', borderRadius: '12px',
    border: '1px solid #e5e7eb', padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s, transform 0.2s',
    display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontWeight: '700', fontSize: '1rem', color: '#111827', margin: 0 },
  categoryBadge: (cat) => ({
    padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600',
    background: categoryColors[cat]?.bg || '#f3f4f6',
    color: categoryColors[cat]?.label || '#374151',
    whiteSpace: 'nowrap',
  }),
  meta: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  metaItem: { fontSize: '0.82rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  scoreSection: {
    background: '#f8fafc', borderRadius: '8px', padding: '0.75rem',
    border: '1px solid #e2e8f0',
  },
  scoreHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  scoreValue: { fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' },
  matchBadge: (color) => ({
    padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700',
    background: color + '22', color,
  }),
  scoreBar: (pct, color) => ({
    height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden',
    marginTop: '0.5rem',
  }),
  scoreBarFill: (pct, color) => ({
    height: '100%', width: `${Math.round(pct * 100)}%`,
    background: color, borderRadius: '3px', transition: 'width 0.5s ease',
  }),
  breakdown: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' },
  breakdownItem: { textAlign: 'center', fontSize: '0.75rem' },
  breakdownLabel: { color: '#9ca3af' },
  breakdownValue: { fontWeight: '600', color: '#475569' },
  joinBtn: (full, joined) => ({
    padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem',
    border: 'none', cursor: full || joined ? 'not-allowed' : 'pointer',
    background: joined ? '#f0fdf4' : full ? '#f3f4f6' : '#6366f1',
    color: joined ? '#166534' : full ? '#9ca3af' : '#fff',
    transition: 'background 0.2s',
    alignSelf: 'flex-start',
  }),
};

export default function ActivityCard({ activity, matchResult = null, userId = null }) {
  const t = UI_TEXT.activities;
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  const isFull = activity.participant_count >= activity.max_participants;

  const handleJoin = async () => {
    if (!userId) { setError('Katılmak için kullanıcı ID gerekli.'); return; }
    setJoining(true);
    setError(null);
    try {
      await activityApi.joinActivity(activity.id, userId);
      setJoined(true);
    } catch (err) {
      setError(err.response?.data?.error || t.joinError);
    } finally {
      setJoining(false);
    }
  };

  const scoreColor = matchResult
    ? getMatchLabelInfo(matchResult.label).color
    : '#6366f1';

  const dateStr = new Date(activity.datetime).toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>{activity.title}</h3>
        <span style={styles.categoryBadge(activity.category)}>
          {getCategoryLabel(activity.category)}
        </span>
      </div>

      {/* Meta */}
      <div style={styles.meta}>
        <span style={styles.metaItem}>📍 {activity.location}</span>
        <span style={styles.metaItem}>📅 {dateStr}</span>
        <span style={styles.metaItem}>
          👥 {activity.participant_count ?? 0}/{activity.max_participants} {t.participants}
        </span>
        <span style={styles.metaItem}>⚔️ Seviye {activity.competition_level}</span>
      </div>

      {/* Match score section (only in recommendations view) */}
      {matchResult && (
        <div style={styles.scoreSection}>
          <div style={styles.scoreHeader}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500' }}>
              {t.matchScore}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={styles.scoreValue}>
                {Math.round(matchResult.final_score * 100)}%
              </span>
              <span style={styles.matchBadge(scoreColor)}>
                {getMatchLabelInfo(matchResult.label).text}
              </span>
            </div>
          </div>

          {/* Score bar */}
          <div style={styles.scoreBar()}>
            <div style={styles.scoreBarFill(matchResult.final_score, scoreColor)} />
          </div>

          {/* Breakdown grid */}
          <div style={styles.breakdown}>
            {Object.entries(matchResult.breakdown).map(([key, val]) => {
              const labels = { interest: 'İlgi', competition: 'Rekabet', reliability: 'Güvenilirlik' };
              return (
                <div key={key} style={styles.breakdownItem}>
                  <div style={styles.breakdownLabel}>{labels[key]}</div>
                  <div style={styles.breakdownValue}>{Math.round(val.score * 100)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Join button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          style={styles.joinBtn(isFull, joined)}
          onClick={handleJoin}
          disabled={isFull || joined || joining}
        >
          {joining ? '...' : joined ? '✓ Katıldınız' : isFull ? t.full : t.join}
        </button>
        {error && <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>}
      </div>
    </div>
  );
}
