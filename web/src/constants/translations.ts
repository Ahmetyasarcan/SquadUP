// Turkish UI text and category mappings

export const CATEGORIES: Record<string, string> = {
  all: 'Tümü',
  sports: 'Spor',
  esports: 'E-Spor',
  board_games: 'Kutu Oyunları',
  outdoor: 'Açık Hava',
};

export const CATEGORY_ICONS: Record<string, string> = {
  sports: '⚽',
  esports: '🎮',
  board_games: '♟️',
  outdoor: '🏔️',
  all: '✨',
};

export const COMPETITION_LEVELS: Record<number, string> = {
  1: 'Başlangıç',
  2: 'Temel',
  3: 'Orta',
  4: 'İleri',
  5: 'Profesyonel',
};

export const COMPETITION_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  2: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  3: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  5: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export const UI_TEXT = {
  navbar: {
    title: 'SquadUp',
    activities: 'Aktiviteler',
    recommendations: 'Öneriler',
    create: 'Oluştur',
    profile: 'Profil',
  },
  home: {
    hero: 'Aktivite Bul, Takım Kur',
    heroHighlight: 'Takım Kur',
    subtitle: 'Sana uygun aktiviteleri keşfet, yeni insanlarla tanış ve birlikte eğlen',
    cta: 'Aktiviteleri Keşfet',
    ctaSecondary: 'Nasıl Çalışır?',
  },
  activities: {
    title: 'Tüm Aktiviteler',
    search: 'Aktivite, konum veya açıklama ara...',
    noResults: 'Eşleşen aktivite bulunamadı',
    loading: 'Aktiviteler yükleniyor...',
    join: 'Katıl',
    full: 'Dolu',
    participants: 'Katılımcı',
    spots: 'yer açık',
  },
  recommendations: {
    title: 'Sizin İçin',
    subtitle: 'İlgi alanlarınıza ve seviyenize göre kişiselleştirilmiş öneriler',
    perfectMatch: '🎯 Mükemmel Eşleşme',
    goodMatch: '✨ İyi Eşleşme',
    lowMatch: '👍 Potansiyel',
    noUser: 'Önerileri görmek için profil oluşturun',
    createProfile: 'Profil Oluştur',
    breakdown: 'Eşleşme Detayı',
    interest: 'İlgi Alanı',
    competition: 'Rekabet Uyumu',
    reliability: 'Güvenilirlik',
  },
  create: {
    title: 'Yeni Aktivite',
    subtitle: 'Etkinlik oluştur ve katılımcı bul',
    activityTitle: 'Aktivite Başlığı',
    description: 'Açıklama',
    category: 'Kategori',
    location: 'Konum',
    datetime: 'Tarih ve Saat',
    maxParticipants: 'Maksimum Katılımcı',
    competitionLevel: 'Seviye',
    submit: 'Aktivite Oluştur',
    success: 'Aktivite başarıyla oluşturuldu!',
  },
  profile: {
    title: 'Profilim',
    create: 'Profil Oluştur',
    subtitle: 'Bilgilerini gir, kişiselleştirilmiş öneriler al',
    interests: 'İlgi Alanları',
    stats: 'İstatistikler',
    joined: 'Katıldığım',
    attended: 'Tamamladığım',
    reliability: 'Güvenilirlik',
    save: 'Kaydet',
    saved: 'Kaydedildi ✓',
  },
};
