// Type definitions for SquadUp

export type Category = 'sports' | 'esports' | 'board_games' | 'outdoor';
export type CompetitionLevel = 1 | 2 | 3 | 4 | 5;
export type SortField = 'datetime' | 'title' | 'match_score';
export type SortOrder = 'asc' | 'desc';

export interface User {
  id: string;
  name: string;
  email: string;
  interests: string[];
  competition_level: CompetitionLevel;
  attended_events: number;
  joined_events: number;
  reliability_score: number;
  badges?: string[];
  squads?: string[];
  created_at: string;
}

export interface Activity {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  category: Category;
  competition_level: CompetitionLevel;
  location: string;
  datetime: string;
  max_participants: number;
  current_participants: number;
  participant_count?: number;
  participants?: User[];
  image_url?: string;
  created_at: string;
  match_score?: number;
  // Added by recommendations endpoint
  score?: number;
  match_result?: {
    final_score: number;
    label: 'perfect_match' | 'good_match' | 'low_match';
    breakdown: {
      interest: { score: number; weight: number; contribution: number };
      competition: { score: number; weight: number; contribution: number };
      reliability: { score: number; weight: number; contribution: number };
    };
  };
}

export interface Squad {
  id: string;
  name: string;
  description: string;
  category: Category;
  creator_id: string;
  member_count: number;
  created_at: string;
}

export interface FilterState {
  search: string;
  category: Category | 'all';
  sortField: SortField;
  sortOrder: SortOrder;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
