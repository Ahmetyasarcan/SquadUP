/**
 * DiceBear Avatar API helper for SquadUp.
 * Generates high-quality, unique avatars based on seed strings.
 */

const STYLE = 'lorelei'; // Lorelei is a clean, modern illustration style
const API_URL = 'https://api.dicebear.com/7.x';

export const AVATAR_SEEDS = [
  'Midnight', 'Felix', 'Aneka', 'Caleb', 'Buddy', 'Jasper', 'Lucky', 'Cookie', 
  'Misty', 'Smokey', 'Oscar', 'Luna', 'Peanut', 'Zoe', 'Buster'
];

export function getAvatarUrl(seed: string): string {
  // If seed is empty, use a default
  const finalSeed = seed || 'default';
  return `${API_URL}/${STYLE}/svg?seed=${encodeURIComponent(finalSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
