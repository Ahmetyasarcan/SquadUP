// constants/translations.js
// ============================
// Central source of truth for all Turkish UI text.
// Code logic always uses English keys; UI always displays Turkish values.
// Import this file in any component that needs Turkish text.

// ---------------------------------------------------------------------------
// UI Text — All user-facing strings in Turkish
// ---------------------------------------------------------------------------
export const UI_TEXT = {
  nav: {
    home: 'Ana Sayfa',
    activities: 'Aktiviteler',
    recommendations: 'Öneriler',
    profile: 'Profil Oluştur',
    appName: 'SquadUp',
  },

  profile: {
    pageTitle: 'Profil Oluştur',
    name: 'İsim',
    namePlaceholder: 'Adınızı girin',
    interests: 'İlgi Alanları',
    interestsHint: 'İlgi alanlarınızı seçin (birden fazla seçebilirsiniz)',
    competitionLevel: 'Rekabet Seviyesi',
    competitionHint: '1 = Yeni Başlayan · 5 = Profesyonel',
    submit: 'Profil Oluştur',
    success: 'Profil başarıyla oluşturuldu!',
    error: 'Profil oluşturulurken hata oluştu.',
    idLabel: 'Kullanıcı ID:',
    idHint: 'Bu ID\'yi kopyalayın ve öneriler için kullanın.',
    competitionLabels: {
      1: 'Yeni Başlayan',
      2: 'Geliştirici',
      3: 'Orta Seviye',
      4: 'İleri Seviye',
      5: 'Profesyonel',
    },
  },

  activities: {
    pageTitle: 'Tüm Aktiviteler',
    createTitle: 'Aktivite Oluştur',
    titleField: 'Aktivite Başlığı',
    titlePlaceholder: "Örnek: Kadıköy'de Futbol Maçı",
    category: 'Kategori',
    categoryPlaceholder: 'Kategori seçin',
    competitionLevel: 'Rekabet Seviyesi',
    location: 'Konum',
    locationPlaceholder: 'Örnek: Kadıköy Halı Saha',
    datetime: 'Tarih ve Saat',
    maxParticipants: 'Maksimum Katılımcı',
    creatorId: 'Kullanıcı ID (oluşturan)',
    creatorPlaceholder: 'Profil oluştururken aldığınız ID',
    submit: 'Aktivite Oluştur',
    join: 'Katıl',
    full: 'Dolu',
    matchScore: 'Eşleşme Skoru',
    participants: 'Katılımcı',
    noActivities: 'Henüz aktivite yok. İlk aktiviteyi siz oluşturun!',
    joinSuccess: 'Aktiviteye başarıyla katıldınız!',
    joinError: 'Katılım sırasında hata oluştu.',
    createSuccess: 'Aktivite başarıyla oluşturuldu!',
    createError: 'Aktivite oluşturulurken hata oluştu.',
    level: 'Seviye',
  },

  recommendations: {
    pageTitle: 'Sizin İçin Öneriler',
    subtitle: 'Profilinize göre kişiselleştirilmiş aktivite önerileri',
    userIdLabel: 'Kullanıcı ID',
    userIdPlaceholder: 'Profil ID\'nizi girin',
    getButton: 'Önerileri Getir',
    noResults: 'Eşleşen aktivite bulunamadı. Daha fazla aktivite eklendiğinde tekrar deneyin.',
    perfectMatch: 'Mükemmel Eşleşme',
    goodMatch: 'İyi Eşleşme',
    lowMatch: 'Düşük Eşleşme',
    scoreLabel: 'Eşleşme Skoru',
    breakdown: {
      title: 'Skor Dağılımı',
      interest: 'İlgi Alanı',
      competition: 'Rekabet Uyumu',
      reliability: 'Güvenilirlik',
      weight: 'Ağırlık',
      score: 'Skor',
      contribution: 'Katkı',
    },
    stats: {
      total: 'Toplam Öneri',
      perfect: 'Mükemmel',
      good: 'İyi',
      average: 'Ortalama Skor',
    },
  },

  common: {
    loading: 'Yükleniyor...',
    error: 'Bir hata oluştu.',
    retry: 'Tekrar Dene',
    cancel: 'İptal',
    save: 'Kaydet',
    back: 'Geri',
    fillAll: 'Lütfen tüm alanları doldurun.',
  },
};

// ---------------------------------------------------------------------------
// Category Mappings — English DB keys → Turkish display names
// ---------------------------------------------------------------------------
export const CATEGORIES = {
  sports: 'Spor',
  esports: 'E-Spor',
  board_games: 'Kutu Oyunları',
  outdoor: 'Açık Hava',
};

// ---------------------------------------------------------------------------
// Interest Tags — organized by category
// These are the Turkish values stored in the DB (sqlusers.interests[])
// ---------------------------------------------------------------------------
export const INTEREST_TAGS = {
  sports: [
    { key: 'futbol',      label: 'Futbol' },
    { key: 'basketbol',   label: 'Basketbol' },
    { key: 'voleybol',    label: 'Voleybol' },
    { key: 'tenis',       label: 'Tenis' },
    { key: 'yüzme',       label: 'Yüzme' },
    { key: 'koşu',        label: 'Koşu' },
    { key: 'fitness',     label: 'Fitness' },
  ],
  esports: [
    { key: 'valorant',    label: 'Valorant' },
    { key: 'lol',         label: 'League of Legends' },
    { key: 'cs2',         label: 'CS2' },
    { key: 'dota2',       label: 'Dota 2' },
    { key: 'fifa',        label: 'FIFA' },
    { key: 'gaming',      label: 'Genel Gaming' },
  ],
  board_games: [
    { key: 'satranç',     label: 'Satranç' },
    { key: 'risk',        label: 'Risk' },
    { key: 'catan',       label: 'Catan' },
    { key: 'uno',         label: 'Uno' },
    { key: 'monopoly',    label: 'Monopoly' },
    { key: 'kutu oyunu',  label: 'Genel Kutu Oyunu' },
  ],
  outdoor: [
    { key: 'doğa yürüyüşü', label: 'Doğa Yürüyüşü' },
    { key: 'kamp',           label: 'Kamp' },
    { key: 'bisiklet',       label: 'Bisiklet' },
    { key: 'tırmanma',       label: 'Tırmanma' },
    { key: 'açık hava',      label: 'Genel Açık Hava' },
  ],
};

// Flat list of all interest tags (for profile form chips)
export const ALL_INTEREST_TAGS = Object.values(INTEREST_TAGS).flat();

// ---------------------------------------------------------------------------
// Helper: map category key to Turkish label
// Pure function — always same output for same input
// ---------------------------------------------------------------------------
export const getCategoryLabel = (categoryKey) =>
  CATEGORIES[categoryKey] || categoryKey;

// ---------------------------------------------------------------------------
// Helper: map match label (English) to Turkish display string + color
// ---------------------------------------------------------------------------
export const getMatchLabelInfo = (label) => {
  const map = {
    perfect_match: { text: UI_TEXT.recommendations.perfectMatch, color: '#10b981' },
    good_match:    { text: UI_TEXT.recommendations.goodMatch,    color: '#3b82f6' },
    low_match:     { text: UI_TEXT.recommendations.lowMatch,     color: '#6b7280' },
  };
  return map[label] || { text: label, color: '#6b7280' };
};
