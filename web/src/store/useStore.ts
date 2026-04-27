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
  token: string | null;
  darkMode: boolean;

  // Actions (all immutable updates)
  setUser: (user: User | null, token?: string | null) => void;
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  setRecommendations: (recommendations: Activity[]) => void;
  updateFilters: (filters: Partial<FilterState>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleDarkMode: () => void;
  logout: () => void;
  reset: () => void;
}

const initialState = {
  user: null,
  activities: [],
  recommendations: [],
  filters: {
    search: '',
    category: 'all' as const,
    sortField: 'datetime' as const,
    sortOrder: 'asc' as const,
  },
  loading: false,
  error: null,
  token: localStorage.getItem('squadup-token'),
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
};

export const useStore = create<AppStore>((set) => ({
  ...initialState,

  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('squadup-token', token);
    } else if (token === null || token === '') {
      localStorage.removeItem('squadup-token');
    }
    
    // Determine the next token value: 
    // - Use the passed token if provided
    // - Otherwise use what's in state/localStorage
    const nextToken = token !== undefined ? token : localStorage.getItem('squadup-token');
    set({ user, token: nextToken });
  },

  setActivities: (activities) => set({ activities }),

  // Immutable: creates new array with activity appended
  addActivity: (activity) =>
    set((state) => ({ activities: [...state.activities, activity] })),

  setRecommendations: (recommendations) => set({ recommendations }),

  // Immutable: spreads existing filters, merges new values
  updateFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      // Sync with DOM
      document.documentElement.classList.toggle('dark', next);
      return { darkMode: next };
    }),

  logout: () => {
    localStorage.removeItem('squadup-token');
    set({ user: null, token: null });
  },

  reset: () => {
    localStorage.removeItem('squadup-token');
    set(initialState);
  },
}));
