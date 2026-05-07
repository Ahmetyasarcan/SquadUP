// ─── MOCK USERS FOR FRIEND SUGGESTIONS ───────────────────────────────────────
// These are used in the "Önerilen Arkadaşlar" tab mixed with real DB users.
// Pravatar.cc images are free & stable.

export interface MockSocialUser {
  id: string;
  name: string;
  email: string;
  interests: string[];
  competition_level: number;
  avatar: string;
  reliability_score: number;
  mutual_friends: number;
  common_activities: string[];
  isMock: true;
}

export const MOCK_SOCIAL_USERS: MockSocialUser[] = [
  {
    id: 'mock-1',
    name: 'Zeynep Kaya',
    email: 'zeynep@mock.com',
    interests: ['sports', 'outdoor'],
    competition_level: 3,
    avatar: 'https://i.pravatar.cc/150?img=1',
    reliability_score: 0.92,
    mutual_friends: 3,
    common_activities: ['Halı Saha', 'Koşu'],
    isMock: true,
  },
  {
    id: 'mock-2',
    name: 'Burak Özdemir',
    email: 'burak@mock.com',
    interests: ['esports', 'board_games'],
    competition_level: 4,
    avatar: 'https://i.pravatar.cc/150?img=12',
    reliability_score: 0.88,
    mutual_friends: 5,
    common_activities: ['Valorant', 'LoL'],
    isMock: true,
  },
  {
    id: 'mock-3',
    name: 'Elif Yıldız',
    email: 'elif@mock.com',
    interests: ['board_games', 'outdoor'],
    competition_level: 2,
    avatar: 'https://i.pravatar.cc/150?img=45',
    reliability_score: 0.95,
    mutual_friends: 2,
    common_activities: ['Catan', 'Yürüyüş'],
    isMock: true,
  },
  {
    id: 'mock-4',
    name: 'Can Demir',
    email: 'can@mock.com',
    interests: ['sports', 'esports'],
    competition_level: 5,
    avatar: 'https://i.pravatar.cc/150?img=33',
    reliability_score: 0.85,
    mutual_friends: 1,
    common_activities: ['Futbol', 'CS2'],
    isMock: true,
  },
  {
    id: 'mock-5',
    name: 'Selin Acar',
    email: 'selin@mock.com',
    interests: ['outdoor', 'sports'],
    competition_level: 3,
    avatar: 'https://i.pravatar.cc/150?img=20',
    reliability_score: 0.90,
    mutual_friends: 4,
    common_activities: ['Trekking', 'Voleybol'],
    isMock: true,
  },
  {
    id: 'mock-6',
    name: 'Oğuz Çelik',
    email: 'oguz@mock.com',
    interests: ['esports', 'sports'],
    competition_level: 4,
    avatar: 'https://i.pravatar.cc/150?img=57',
    reliability_score: 0.87,
    mutual_friends: 2,
    common_activities: ['CS2', 'Basketbol'],
    isMock: true,
  },
  {
    id: 'mock-7',
    name: 'Ayşe Koç',
    email: 'ayse@mock.com',
    interests: ['board_games', 'outdoor'],
    competition_level: 2,
    avatar: 'https://i.pravatar.cc/150?img=25',
    reliability_score: 0.93,
    mutual_friends: 6,
    common_activities: ['Catan', 'Kamp'],
    isMock: true,
  },
  {
    id: 'mock-8',
    name: 'Tarık Şahin',
    email: 'tarik@mock.com',
    interests: ['sports', 'outdoor'],
    competition_level: 3,
    avatar: 'https://i.pravatar.cc/150?img=68',
    reliability_score: 0.89,
    mutual_friends: 3,
    common_activities: ['Tenis', 'Koşu'],
    isMock: true,
  },
];

/**
 * Mixes real DB users with mock suggestion users.
 * @param realUsers - Array of real users from Supabase
 * @param mockRatio - Fraction of total slots to fill with mocks (default 0.5)
 * @returns Shuffled combined array
 */
export function mixRealAndMockUsers(
  realUsers: any[],
  mockRatio: number = 0.5
): any[] {
  // Number of mock users to add relative to real users count
  const mockCount = Math.max(
    3, // Always show at least 3 mock suggestions
    Math.floor(realUsers.length * mockRatio)
  );
  const selectedMocks = MOCK_SOCIAL_USERS.slice(
    0,
    Math.min(mockCount, MOCK_SOCIAL_USERS.length)
  );

  const combined = [...realUsers, ...selectedMocks];
  // Fisher-Yates shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined;
}

/**
 * Converts a real DB user row to the common display shape.
 */
export function normalizeRealUser(dbUser: any) {
  return {
    ...dbUser,
    isMock: false,
    avatar: null,
    mutual_friends: 0,
    common_activities: [],
  };
}
