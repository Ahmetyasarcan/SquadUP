// components/ActivityForm.jsx
// ============================
// Turkish-labeled form for creating a new activity.

import { useState } from 'react';
import { UI_TEXT, CATEGORIES } from '../constants/translations';
import { activityApi } from '../services/api';

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  label: { fontWeight: '600', fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' },
  input: {
    width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none',
    background: '#fff', boxSizing: 'border-box',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  sliderContainer: { display: 'flex', alignItems: 'center', gap: '1rem' },
  slider: { flex: 1, accentColor: '#6366f1' },
  sliderValue: {
    minWidth: '40px', textAlign: 'center', padding: '0.35rem 0.65rem',
    background: '#eef2ff', color: '#4338ca', borderRadius: '8px', fontWeight: '700', fontSize: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem', background: '#6366f1', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600',
    cursor: 'pointer',
  },
  success: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem', color: '#166534' },
  error: { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '1rem', color: '#991b1b' },
};

const COMPETITION_LABELS = {
  1: 'Yeni Başlayan', 2: 'Geliştirici', 3: 'Orta', 4: 'İleri', 5: 'Profesyonel',
};

const defaultForm = {
  creator_id: '',
  title: '',
  category: '',
  competition_level: 3,
  location: '',
  datetime: '',
  max_participants: 10,
};

export default function ActivityForm() {
  const t = UI_TEXT.activities;
  const [form, setForm] = useState(defaultForm);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Immutable field update
  const updateField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ['creator_id', 'title', 'category', 'location', 'datetime'];
    if (required.some(f => !form[f])) {
      setStatus({ type: 'error', message: UI_TEXT.common.fillAll });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      await activityApi.createActivity({
        ...form,
        competition_level: Number(form.competition_level),
        max_participants: Number(form.max_participants),
      });
      setStatus({ type: 'success' });
      setForm(defaultForm);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || t.createError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      {/* Creator ID */}
      <div>
        <label style={styles.label}>{t.creatorId}</label>
        <input
          style={styles.input} type="text"
          placeholder={t.creatorPlaceholder}
          value={form.creator_id}
          onChange={e => updateField('creator_id', e.target.value)}
          required
        />
      </div>

      {/* Title */}
      <div>
        <label style={styles.label}>{t.titleField}</label>
        <input
          style={styles.input} type="text"
          placeholder={t.titlePlaceholder}
          value={form.title}
          onChange={e => updateField('title', e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label style={styles.label}>{t.category}</label>
        <select
          style={styles.select}
          value={form.category}
          onChange={e => updateField('category', e.target.value)}
          required
        >
          <option value="">{t.categoryPlaceholder}</option>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Competition Level */}
      <div>
        <label style={styles.label}>{t.competitionLevel}</label>
        <div style={styles.sliderContainer}>
          <input
            type="range" min="1" max="5" step="1"
            style={styles.slider}
            value={form.competition_level}
            onChange={e => updateField('competition_level', e.target.value)}
          />
          <span style={styles.sliderValue}>
            {form.competition_level} — {COMPETITION_LABELS[form.competition_level]}
          </span>
        </div>
      </div>

      {/* Location + Datetime */}
      <div style={styles.row}>
        <div>
          <label style={styles.label}>{t.location}</label>
          <input
            style={styles.input} type="text"
            placeholder={t.locationPlaceholder}
            value={form.location}
            onChange={e => updateField('location', e.target.value)}
            required
          />
        </div>
        <div>
          <label style={styles.label}>{t.datetime}</label>
          <input
            style={styles.input} type="datetime-local"
            value={form.datetime}
            onChange={e => updateField('datetime', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Max Participants */}
      <div>
        <label style={styles.label}>{t.maxParticipants}</label>
        <input
          style={styles.input} type="number" min="2" max="100"
          value={form.max_participants}
          onChange={e => updateField('max_participants', e.target.value)}
          required
        />
      </div>

      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? UI_TEXT.common.loading : t.submit}
      </button>

      {status?.type === 'success' && (
        <div style={styles.success}>✓ {t.createSuccess}</div>
      )}
      {status?.type === 'error' && (
        <div style={styles.error}>{status.message}</div>
      )}
    </form>
  );
}
