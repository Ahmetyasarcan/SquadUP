/**
 * DiceBear Avatar API helper for SquadUp Mobile.
 */

const STYLE = 'lorelei';
const API_URL = 'https://api.dicebear.com/7.x';

export const AVATAR_SEEDS = [
  'Midnight', 'Felix', 'Aneka', 'Caleb', 'Buddy', 'Jasper', 'Lucky', 'Cookie', 
  'Misty', 'Smokey', 'Oscar', 'Luna', 'Peanut', 'Zoe', 'Buster'
];

export function getAvatarUrl(seed: string): string {
  const finalSeed = seed || 'default';
  return `${API_URL}/${STYLE}/png?seed=${encodeURIComponent(finalSeed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
