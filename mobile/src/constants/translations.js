// mobile/src/constants/translations.js
// =======================================
// Turkish UI text for the React Native mobile app.
// Mirrors the structure of the web constants/translations.js.

export const UI_TEXT = {
  nav: {
    home: 'Ana Sayfa',
    recommendations: 'Öneriler',
    profile: 'Profilim',
  },

  feed: {
    title: 'Aktiviteler',
    noActivities: 'Henüz aktivite yok.',
    participants: 'Katılımcı',
    competitionLevel: 'Rekabet Seviyesi',
    reliability: 'Güvenilirlik',
    join: 'Katıl',
    full: 'Dolu',
    joined: 'Katıldınız ✓',
    joinSuccess: 'Aktiviteye başarıyla katıldınız!',
    joinError: 'Katılım hatası oluştu.',
    level: 'Seviye',
  },

  recommendations: {
    title: 'Sizin İçin Öneriler',
    subtitle: 'Kişiselleştirilmiş aktivite önerileri',
    enter_id: 'Kullanıcı ID girin',
    get_button: 'Önerileri Getir',
    noResults: 'Eşleşen aktivite bulunamadı.',
    perfectMatch: 'Mükemmel Eşleşme',
    goodMatch: 'İyi Eşleşme',
    lowMatch: 'Düşük Eşleşme',
    score: 'Eşleşme Skoru',
  },

  profile: {
    title: 'Profilim',
    name: 'İsim',
    interests: 'İlgi Alanları',
    competitionLevel: 'Rekabet Seviyesi',
    save: 'Kaydet',
    saved: 'Profil kaydedildi!',
    noProfile: 'Henüz profil oluşturmadınız.',
    competitionLabels: {
      1: 'Yeni Başlayan',
      2: 'Geliştirici',
      3: 'Orta Seviye',
      4: 'İleri Seviye',
      5: 'Profesyonel',
    },
  },

  common: {
    loading: 'Yükleniyor...',
    error: 'Bir hata oluştu.',
    fillAll: 'Lütfen tüm alanları doldurun.',
    retry: 'Tekrar Dene',
  },
};

// English DB keys → Turkish display labels
export const CATEGORIES = {
  sports: 'Spor',
  esports: 'E-Spor',
  board_games: 'Kutu Oyunları',
  outdoor: 'Açık Hava',
};

export const getCategoryLabel = (key) => CATEGORIES[key] || key;

export const getMatchLabelInfo = (label) => {
  const map = {
    perfect_match: { text: UI_TEXT.recommendations.perfectMatch, color: '#10b981' },
    good_match:    { text: UI_TEXT.recommendations.goodMatch,    color: '#3b82f6' },
    low_match:     { text: UI_TEXT.recommendations.lowMatch,     color: '#9ca3af' },
  };
  return map[label] || { text: label, color: '#9ca3af' };
};
