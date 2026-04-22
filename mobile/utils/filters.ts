import type { Activity, Category, SortField, SortOrder } from '../types';

// ========== PURE FILTER FUNCTIONS ==========

export function filterBySearch(
  activities: Activity[],
  query: string
): Activity[] {
  if (!query.trim()) return activities;
  
  const lower = query.toLowerCase();
  return activities.filter(
    (a) =>
      a.title.toLowerCase().includes(lower) ||
      a.description.toLowerCase().includes(lower) ||
      a.location.toLowerCase().includes(lower)
  );
}

export function filterByCategory(
  activities: Activity[],
  category: Category | 'all'
): Activity[] {
  if (category === 'all') return activities;
  return activities.filter((a) => a.category === category);
}

// ========== PURE SORT FUNCTION ==========

export function sortActivities(
  activities: Activity[],
  field: SortField,
  order: SortOrder
): Activity[] {
  const sorted = [...activities].sort((a, b) => {
    if (field === 'datetime') {
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    }
    if (field === 'title') {
      return a.title.localeCompare(b.title, 'tr');
    }
    if (field === 'match_score' && a.match_score && b.match_score) {
      return a.match_score - b.match_score;
    }
    return 0;
  });

  return order === 'desc' ? sorted.reverse() : sorted;
}

// ========== FUNCTIONAL COMPOSITION ==========

export function buildActivityPipeline(
  search: string,
  category: Category | 'all',
  sortField: SortField,
  sortOrder: SortOrder
) {
  return (activities: Activity[]) => {
    let result = filterBySearch(activities, search);
    result = filterByCategory(result, category);
    result = sortActivities(result, sortField, sortOrder);
    return result;
  };
}
