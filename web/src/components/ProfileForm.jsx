// components/ProfileForm.jsx
// ==========================
// Turkish-labeled form for creating a user profile.
// Demonstrates: controlled components, interest tag chips, slider.

import { useState } from 'react';
import { UI_TEXT, ALL_INTEREST_TAGS } from '../constants/translations';
import { userApi } from '../services/api';

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  label: { fontWeight: '600', fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem', display: 'block' },
  input: {
    width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', fontSize: '1rem', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  },
  hint: { fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.25rem' },
  tagsContainer: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' },
  tag: (selected) => ({
    padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer',
    border: `1.5px solid ${selected ? '#6366f1' : '#e5e7eb'}`,
    background: selected ? '#eef2ff' : '#f9fafb',
    color: selected ? '#4338ca' : '#374151',
    fontWeight: selected ? '600' : '400',
    transition: 'all 0.15s',
  }),
  sliderContainer: { display: 'flex', alignItems: 'center', gap: '1rem' },
  slider: { flex: 1, accentColor: '#6366f1' },
  sliderValue: {
    minWidth: '120px', textAlign: 'center', padding: '0.35rem 0.75rem',
    background: '#eef2ff', color: '#4338ca', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem',
  },
  button: {
    padding: '0.75rem 1.5rem', background: '#6366f1', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600',
    cursor: 'pointer', transition: 'background 0.2s',
  },
  success: {
    background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px',
    padding: '1rem', color: '#166534',
  },
  error: {
    background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
    padding: '1rem', color: '#991b1b',
  },
  idBox: {
    background: '#f3f4f6', borderRadius: '8px', padding: '0.75rem 1rem',
    fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all',
    marginTop: '0.5rem',
  },
};

export default function ProfileForm() {
  const t = UI_TEXT.profile;

  // Controlled form state (immutable update pattern: spread + override)
  const [form, setForm] = useState({ name: '', interests: [], competition_level: 3 });
  const [status, setStatus] = useState(null); // null | {type: 'success'|'error', message, userId}
  const [loading, setLoading] = useState(false);

  // Pure update helper: creates new state object (no mutation)
  const updateField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Toggle an interest tag on/off (immutable array update)
  const toggleInterest = (interestKey) => {
    const current = form.interests;
    const updated = current.includes(interestKey)
      ? current.filter(i => i !== interestKey)           // remove
      : [...current, interestKey];                        // add (spread = new array)
    updateField('interests', updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    setStatus(null);
    try {
      const result = await userApi.createUser(form);
      setStatus({ type: 'success', userId: result.user.id });
      setForm({ name: '', interests: [], competition_level: 3 });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || t.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      {/* Name field */}
      <div>
        <label style={styles.label}>{t.name}</label>
        <input
          style={styles.input}
          type="text"
          placeholder={t.namePlaceholder}
          value={form.name}
          onChange={e => updateField('name', e.target.value)}
          required
        />
      </div>

      {/* Interest tags */}
      <div>
        <label style={styles.label}>{t.interests}</label>
        <p style={styles.hint}>{t.interestsHint}</p>
        <div style={styles.tagsContainer}>
          {ALL_INTEREST_TAGS.map(tag => (
            <button
              key={tag.key}
              type="button"
              style={styles.tag(form.interests.includes(tag.key))}
              onClick={() => toggleInterest(tag.key)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Competition level slider */}
      <div>
        <label style={styles.label}>{t.competitionLevel}</label>
        <p style={styles.hint}>{t.competitionHint}</p>
        <div style={styles.sliderContainer}>
          <input
            type="range" min="1" max="5" step="1"
            style={styles.slider}
            value={form.competition_level}
            onChange={e => updateField('competition_level', Number(e.target.value))}
          />
          <span style={styles.sliderValue}>
            {form.competition_level} — {t.competitionLabels[form.competition_level]}
          </span>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" style={styles.button} disabled={loading}>
        {loading ? UI_TEXT.common.loading : t.submit}
      </button>

      {/* Status messages */}
      {status?.type === 'success' && (
        <div style={styles.success}>
          <strong>{t.success}</strong>
          <p style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.85rem' }}>{t.idLabel}</p>
          <div style={styles.idBox}>{status.userId}</div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem' }}>{t.idHint}</p>
        </div>
      )}
      {status?.type === 'error' && (
        <div style={styles.error}>{status.message || t.error}</div>
      )}
    </form>
  );
}
