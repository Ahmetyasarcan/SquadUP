// pages/ActivityListPage.jsx
// ===========================
// Lists all activities with join buttons. Optional userId for join actions.

import { useEffect, useState } from 'react';
import { UI_TEXT } from '../constants/translations';
import { activityApi } from '../services/api';
import ActivityCard from '../components/ActivityCard';

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: 0 },
  userIdRow: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  input: {
    padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1.5px solid #e5e7eb',
    fontSize: '0.9rem', outline: 'none', minWidth: '280px',
  },
  grid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '3rem', fontSize: '1rem' },
  hint: { fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' },
};

export default function ActivityListPage() {
  const t = UI_TEXT.activities;
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    activityApi.listActivities()
      .then(data => setActivities(data.activities || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#6b7280' }}>{UI_TEXT.common.loading}</p>;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>🎯 {t.pageTitle}</h1>
        <div>
          <div style={styles.userIdRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="Kullanıcı ID'niz (katılmak için)"
              value={userId}
              onChange={e => setUserId(e.target.value)}
            />
          </div>
          <p style={styles.hint}>Katıl butonunu kullanmak için profilinizin ID'sini girin.</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div style={styles.empty}>{t.noActivities}</div>
      ) : (
        <div style={styles.grid}>
          {activities.map(activity => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              userId={userId || null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
