import { create } from 'zustand';
import type { User, Activity, FilterState } from '../types';

interface AppStore {
  // State
  user: User | null;
  activities: Activity[];
  recommendations: Activity[];
  filters: FilterState;
  loading: boolean;
  error: string | null;

  // Actions (all immutable)
  setUser: (user: User | null) => void;
  setActivities: (activities: Activity[]) => void;
  setRecommendations: (recommendations: Activity[]) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppStore>((set) => ({
  user: null,
  activities: [],
  recommendations: [],
  filters: {
    search: '',
    category: 'all',
    sortField: 'datetime',
    sortOrder: 'asc',
  },
  loading: false,
  error: null,

  // IMMUTABLE UPDATES
  setUser: (user) => set({ user }),
  
  setActivities: (activities) => set({ activities }),
  
  setRecommendations: (recommendations) => set({ recommendations }),
  
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}));
