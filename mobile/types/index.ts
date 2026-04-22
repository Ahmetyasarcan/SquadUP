// Shared types (same as web)
export type Category = 'sports' | 'esports' | 'board_games' | 'outdoor';
export type CompetitionLevel = 1 | 2 | 3 | 4 | 5;
export type SortField = 'datetime' | 'title' | 'match_score';
export type SortOrder = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  email: string;
  interests: Category[];
  competition_level: CompetitionLevel;
  attended_events: number;
  joined_events: number;
  reliability_score: number;
}

export interface Activity {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: Category;
  competition_level: CompetitionLevel;
  location: string;
  datetime: string;
  max_participants: number;
  current_participants: number;
  match_score?: number;
}

export interface FilterState {
  search: string;
  category: Category | 'all';
  sortField: SortField;
  sortOrder: SortOrder;
}
