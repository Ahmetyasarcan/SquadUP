import type { User } from '../types';

const STORAGE_KEY = 'squadup_user';

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    interests: ['sports', 'esports'],
    competition_level: 4,
    attended_events: 8,
    joined_events: 10,
    reliability_score: 0.8,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ayşe Demir',
    email: 'ayse@example.com',
    interests: ['board_games', 'outdoor'],
    competition_level: 2,
    attended_events: 5,
    joined_events: 6,
    reliability_score: 0.83,
    created_at: new Date().toISOString(),
  },
];

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function loginByEmail(email: string): User | null {
  const user = MOCK_USERS.find((u) => u.email === email);
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function persistUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getMockUsers(): User[] {
  return MOCK_USERS;
}
