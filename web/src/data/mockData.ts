import type { Activity, User, Squad } from '../types';

// ─── MOCK USERS ──────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@squadup.app',
    interests: ['sports', 'outdoor'],
    competition_level: 4,
    attended_events: 23,
    joined_events: 27,
    reliability_score: 0.91,
    badges: ['active_squadmate', 'verified'],
    squads: ['s1', 's3'],
    created_at: '2025-09-15T10:00:00Z',
  },
  {
    id: 'u2',
    name: 'Elif Kaya',
    email: 'elif@squadup.app',
    interests: ['esports', 'board_games'],
    competition_level: 3,
    attended_events: 15,
    joined_events: 18,
    reliability_score: 0.84,
    badges: ['verified'],
    squads: ['s2'],
    created_at: '2025-10-02T14:00:00Z',
  },
  {
    id: 'u3',
    name: 'Burak Şahin',
    email: 'burak@squadup.app',
    interests: ['esports', 'sports'],
    competition_level: 5,
    attended_events: 41,
    joined_events: 44,
    reliability_score: 0.96,
    badges: ['squad_legend', 'active_squadmate', 'verified'],
    squads: ['s1', 's2'],
    created_at: '2025-08-20T09:00:00Z',
  },
  {
    id: 'u4',
    name: 'Zeynep Arslan',
    email: 'zeynep@squadup.app',
    interests: ['board_games', 'outdoor'],
    competition_level: 2,
    attended_events: 8,
    joined_events: 10,
    reliability_score: 0.78,
    badges: ['verified'],
    squads: [],
    created_at: '2026-01-10T11:00:00Z',
  },
  {
    id: 'u5',
    name: 'Can Öztürk',
    email: 'can@squadup.app',
    interests: ['sports', 'esports'],
    competition_level: 3,
    attended_events: 12,
    joined_events: 14,
    reliability_score: 0.88,
    badges: ['active_squadmate'],
    squads: ['s3'],
    created_at: '2025-11-05T16:00:00Z',
  },
  {
    id: 'u6',
    name: 'Mert Demir',
    email: 'mert@squadup.app',
    interests: ['outdoor', 'sports'],
    competition_level: 4,
    attended_events: 19,
    joined_events: 21,
    reliability_score: 0.93,
    badges: ['active_squadmate', 'verified'],
    squads: ['s1'],
    created_at: '2025-10-18T08:00:00Z',
  },
];

// ─── MOCK ACTIVITIES ──────────────────────────────────────────────────────────
// Dates relative to "tomorrow" so they always appear upcoming
function futureDate(daysAhead: number, hour = 18, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    creator_id: 'u3',
    title: 'Kadıköy Halı Saha Turnuvası',
    description:
      '5v5 format halı saha maçı. Takımlar dört kişiyle geliyor, eksikleri biz tamamlıyoruz. Maç sonrası çay-simit keyfi var!',
    category: 'sports',
    competition_level: 3,
    location: 'Kadıköy Spor Kompleksi, İstanbul',
    datetime: futureDate(1, 19, 0),
    max_participants: 10,
    current_participants: 7,
    created_at: new Date().toISOString(),
    match_score: 0.95,
  },
  {
    id: 'a2',
    creator_id: 'u2',
    title: 'Valorant 5-Stack Ranked',
    description:
      'Diamond+ seviye Valorant ranked oyunu. Full communicate, igl rotasyonlu. Mikrofon zorunlu, tilt yasak.',
    category: 'esports',
    competition_level: 4,
    location: 'Online (Discord: SquadUp)',
    datetime: futureDate(1, 21, 0),
    max_participants: 5,
    current_participants: 3,
    created_at: new Date().toISOString(),
    match_score: 0.88,
  },
  {
    id: 'a3',
    creator_id: 'u1',
    title: 'Catan & Wingspan Hafta Sonu',
    description:
      'Kutu oyunu severler bir araya geliyor! Catan, Wingspan ve Pandemic başta olmak üzere 4-5 oyun oynayacağız. Snack ortaklığı.',
    category: 'board_games',
    competition_level: 2,
    location: 'Moda Kültür Merkezi, Kadıköy',
    datetime: futureDate(2, 15, 0),
    max_participants: 8,
    current_participants: 5,
    created_at: new Date().toISOString(),
    match_score: 0.72,
  },
  {
    id: 'a4',
    creator_id: 'u6',
    title: 'Uludağ Sabah Yürüyüşü',
    description:
      'Uludağ\'ın kuzey yamaçlarında 12 km\'lik orta zorlukta doğa yürüyüşü. Kahvaltı molası dahil. Lütfen uygun ayakkabı giyin.',
    category: 'outdoor',
    competition_level: 2,
    location: 'Uludağ Milli Parkı, Bursa',
    datetime: futureDate(3, 7, 30),
    max_participants: 12,
    current_participants: 9,
    created_at: new Date().toISOString(),
    match_score: 0.81,
  },
  {
    id: 'a5',
    creator_id: 'u2',
    title: 'CS2 Premier 5-Stack',
    description:
      'CS2 Premier modunda 25.000+ rating takım arıyor. Haftada 3 gün pratik. Ciddi oyuncular için.',
    category: 'esports',
    competition_level: 5,
    location: 'Online (FACEIT)',
    datetime: futureDate(2, 20, 0),
    max_participants: 5,
    current_participants: 4,
    created_at: new Date().toISOString(),
    match_score: 0.91,
  },
  {
    id: 'a6',
    creator_id: 'u5',
    title: 'Boğaz Koşusu - Sabah Turu',
    description:
      '15 km\'lik Boğaz kıyısı koşusu. Tempo 5:30/km civarı, sosyal koşu atmosferi. Koşu sonrası kahvaltı organize ediyoruz.',
    category: 'sports',
    competition_level: 3,
    location: 'Ortaköy Sahili, İstanbul',
    datetime: futureDate(4, 7, 0),
    max_participants: 20,
    current_participants: 13,
    created_at: new Date().toISOString(),
    match_score: 0.76,
  },
  {
    id: 'a7',
    creator_id: 'u4',
    title: 'Dungeons & Dragons - Yeni Kampanya',
    description:
      'Forgotten Realms\'te yeni kampanya başlıyor. DM deneyimli, 4 oyuncu arıyoruz. Başlangıç seviyesi için de uygun.',
    category: 'board_games',
    competition_level: 1,
    location: 'Online (Roll20 + Discord)',
    datetime: futureDate(5, 19, 30),
    max_participants: 5,
    current_participants: 2,
    created_at: new Date().toISOString(),
    match_score: 0.65,
  },
  {
    id: 'a8',
    creator_id: 'u3',
    title: 'Bağcılar Basketbol Maçı',
    description:
      '3v3 sokak basketbolu. Yeni başlayanlar dahil herkes beklenyor. Gece aydınlatmalı saha, atmosfer muhteşem.',
    category: 'sports',
    competition_level: 2,
    location: 'Bağcılar Belediyesi Spor Alanı',
    datetime: futureDate(2, 17, 0),
    max_participants: 6,
    current_participants: 4,
    created_at: new Date().toISOString(),
    match_score: 0.68,
  },
  {
    id: 'a9',
    creator_id: 'u1',
    title: 'League of Legends Flex Queue',
    description:
      'Gold-Platinum arası Flex queue push. Fun ama tryhard, tillanmayız, iletişim şart. Rol tercihi paylaşılır.',
    category: 'esports',
    competition_level: 3,
    location: 'Online (TR Server)',
    datetime: futureDate(1, 22, 0),
    max_participants: 5,
    current_participants: 3,
    created_at: new Date().toISOString(),
    match_score: 0.83,
  },
  {
    id: 'a10',
    creator_id: 'u6',
    title: 'Belgrad Ormanı Bisiklet Turu',
    description:
      'MTB rotası, 25 km, orta zorluk. Bisiklet kiralama noktaları mevcut. Kask zorunlu, süre yaklaşık 3 saat.',
    category: 'outdoor',
    competition_level: 3,
    location: 'Belgrad Ormanı, İstanbul',
    datetime: futureDate(6, 9, 0),
    max_participants: 15,
    current_participants: 8,
    created_at: new Date().toISOString(),
    match_score: 0.79,
  },
  {
    id: 'a11',
    creator_id: 'u4',
    title: 'Tekken 8 Turnuvası',
    description:
      'Çift eleme turnuvası, 16 kişi kapasiteli. Ödüllü. Tüm seviyelere açık, bracket rastgele çekilecek.',
    category: 'esports',
    competition_level: 4,
    location: 'GameZone İstanbul, Beşiktaş',
    datetime: futureDate(7, 14, 0),
    max_participants: 16,
    current_participants: 12,
    created_at: new Date().toISOString(),
    match_score: 0.74,
  },
  {
    id: 'a12',
    creator_id: 'u5',
    title: 'Padel Tenis - Karma Turnuva',
    description:
      'Karma çiftler turnuvası, 16 takım. 2 saat ısınma maçları sonrası eleme sistemi. Raket kiralama ücretsiz.',
    category: 'sports',
    competition_level: 3,
    location: 'İstanbul Padel Club, Ataşehir',
    datetime: futureDate(8, 10, 0),
    max_participants: 16,
    current_participants: 10,
    created_at: new Date().toISOString(),
    match_score: 0.86,
  },
];

// ─── MOCK SQUADS ──────────────────────────────────────────────────────────────
export const MOCK_SQUADS: Squad[] = [
  {
    id: 's1',
    name: 'Istanbul Wolves',
    description:
      'İstanbul\'un en aktif spor squad\'ı. Futbol, basketbol, koşu — her hafta en az iki etkinlik organize ediyoruz.',
    category: 'sports',
    creator_id: 'u3',
    member_count: 24,
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 's2',
    name: 'GG Wolves TR',
    description:
      'Valorant, CS2, LoL — rekabetçi FPS/MOBA oyuncuları için organize squad. Haftanın her günü aktif.',
    category: 'esports',
    creator_id: 'u2',
    member_count: 38,
    created_at: '2025-10-15T00:00:00Z',
  },
  {
    id: 's3',
    name: 'Bosphorus Trekkers',
    description:
      'Doğa yürüyüşü, kamp ve bisiklet severler. Her ay uzun, kısa ve gece yürüyüşleri planlıyoruz.',
    category: 'outdoor',
    creator_id: 'u6',
    member_count: 17,
    created_at: '2025-11-20T00:00:00Z',
  },
  {
    id: 's4',
    name: 'Meeple Collective',
    description:
      'Kutu oyunu tutkunları. Catan, Wingspan, Gloomhaven ve daha fazlası. Haftalık oyun geceleri organize ediliyor.',
    category: 'board_games',
    creator_id: 'u4',
    member_count: 12,
    created_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 's5',
    name: 'Kadıköy FC',
    description:
      'Kadıköy ve çevresinde haftalık halı saha maçları. 5v5 ve 7v7 formatlar, her seviyeye açık.',
    category: 'sports',
    creator_id: 'u1',
    member_count: 31,
    created_at: '2025-08-10T00:00:00Z',
  },
  {
    id: 's6',
    name: 'FACEIT Balkan Stack',
    description:
      'Level 8+ FACEIT oyuncular için. CS2 odaklı, haftada 4 gün stack sistemi. Disiplinli ve analitik yaklaşım.',
    category: 'esports',
    creator_id: 'u3',
    member_count: 9,
    created_at: '2026-02-01T00:00:00Z',
  },
];

// ─── MOCK FRIENDS DATA ────────────────────────────────────────────────────────
export const MOCK_FRIENDS = {
  friends: [MOCK_USERS[2], MOCK_USERS[4], MOCK_USERS[5]], // Burak, Can, Mert
  pending_incoming: [
    { ...MOCK_USERS[1], request_id: 'req1' }, // Elif
    { ...MOCK_USERS[3], request_id: 'req2' }, // Zeynep
  ],
  pending_outgoing: [],
};

// ─── MOCK RECOMMENDATIONS ──────────────────────────────────────────────────────
export const MOCK_RECOMMENDATIONS: Activity[] = MOCK_ACTIVITIES.map((a, i) => ({
  ...a,
  score: a.match_score,
  match_result: {
    final_score: a.match_score ?? 0.7,
    label: (
      (a.match_score ?? 0) >= 0.9
        ? 'perfect_match'
        : (a.match_score ?? 0) >= 0.75
        ? 'good_match'
        : 'low_match'
    ) as 'perfect_match' | 'good_match' | 'low_match',
    breakdown: {
      interest: {
        score: Math.min(1, (a.match_score ?? 0.7) + 0.05),
        weight: 0.5,
        contribution: Math.min(1, (a.match_score ?? 0.7) + 0.05) * 0.5,
      },
      competition: {
        score: Math.max(0.5, (a.match_score ?? 0.7) - 0.1),
        weight: 0.3,
        contribution: Math.max(0.5, (a.match_score ?? 0.7) - 0.1) * 0.3,
      },
      reliability: {
        score: 0.91,
        weight: 0.2,
        contribution: 0.91 * 0.2,
      },
    },
  },
})).sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));

// ─── PLATFORM STATS ──────────────────────────────────────────────────────────
export const PLATFORM_STATS = {
  totalUsers: 1847,
  totalActivities: 312,
  totalSquads: 94,
  activeToday: 213,
};
