import type { Activity, Category, SortField, SortOrder } from '../types';

// ========== PURE FILTER FUNCTIONS ==========
// Same input → same output. No side effects. No state mutation.

export function filterBySearch(activities: Activity[], query: string): Activity[] {
  if (!query.trim()) return activities;
  const lower = query.toLowerCase();
  return activities.filter(
    (a) =>
      (a.title || '').toLowerCase().includes(lower) ||
      (a.description || '').toLowerCase().includes(lower) ||
      (a.location || '').toLowerCase().includes(lower)
  );
}

export function filterByCategory(
  activities: Activity[],
  category: Category | 'all'
): Activity[] {
  if (category === 'all') return activities;
  return activities.filter((a) => a.category === category);
}

export function filterAvailable(activities: Activity[]): Activity[] {
  return activities.filter(
    (a) => (a.participant_count ?? a.current_participants) < a.max_participants
  );
}

// ========== PURE SORT FUNCTION ==========

export function sortActivities(
  activities: Activity[],
  field: SortField,
  order: SortOrder
): Activity[] {
  // sorted() creates new array — immutable pattern
  const sorted = [...activities].sort((a, b) => {
    if (field === 'datetime') {
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    }
    if (field === 'title') {
      return a.title.localeCompare(b.title, 'tr');
    }
    if (field === 'match_score') {
      return (a.score ?? 0) - (b.score ?? 0);
    }
    return 0;
  });
  return order === 'desc' ? sorted.reverse() : sorted;
}

// ========== FUNCTIONAL COMPOSITION ==========
// Pipeline: filter → filter → sort → return

export function applyFilters(
  activities: Activity[],
  search: string,
  category: Category | 'all',
  sortField: SortField,
  sortOrder: SortOrder
): Activity[] {
  const bySearch = filterBySearch(activities, search);
  const byCategory = filterByCategory(bySearch, category);
  return sortActivities(byCategory, sortField, sortOrder);
}
