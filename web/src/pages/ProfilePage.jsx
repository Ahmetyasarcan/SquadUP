// pages/ProfilePage.jsx

import { UI_TEXT } from '../constants/translations';
import ProfileForm from '../components/ProfileForm';

const styles = {
  container: { maxWidth: '600px', margin: '0 auto' },
  header: { marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: 0 },
  desc: { color: '#6b7280', marginTop: '0.35rem', fontSize: '0.9rem' },
  card: {
    background: '#fff', borderRadius: '12px',
    border: '1px solid #e5e7eb', padding: '1.75rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
};

export default function ProfilePage() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 {UI_TEXT.profile.pageTitle}</h1>
        <p style={styles.desc}>Profilini oluştur ve kişiselleştirilmiş aktivite önerileri al.</p>
      </div>
      <div style={styles.card}>
        <ProfileForm />
      </div>
    </div>
  );
}
