// mobile/src/store/activityStore.js
// ===================================
// Zustand store with IMMUTABLE state updates.
// 
// FP Principle — Immutability:
//   Every state update creates a new object using spread operator.
//   State is NEVER mutated directly.
//   Zustand's set() enforces this pattern naturally.
//
// State shape:
//   activities:    list of all fetched activities
//   user:          currently active user profile (or null)
//   joinedIds:     set of activity IDs the user has joined

import { create } from 'zustand';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api'; // Update to your backend URL

// ---------------------------------------------------------------------------
// Pure helper: safely add to joined IDs without duplication (immutable)
// ---------------------------------------------------------------------------
const addJoinedId = (currentIds, newId) =>
  currentIds.includes(newId) ? currentIds : [...currentIds, newId];

// ---------------------------------------------------------------------------
// Zustand store definition
// ---------------------------------------------------------------------------
export const useActivityStore = create((set, get) => ({
  // ---- State (immutable: never mutate directly) ----
  activities: [],
  user: null,
  joinedIds: [],
  loading: false,
  error: null,

  // ---- Actions ----

  /**
   * Fetch all activities from the API.
   * Immutable update: creates new state object via spread.
   */
  fetchActivities: async () => {
    set(state => ({ ...state, loading: true, error: null }));
    try {
      const res = await axios.get(`${API_BASE}/activities`);
      // Immutable update: new state object with updated activities
      set(state => ({
        ...state,
        activities: res.data.activities || [],
        loading: false,
      }));
    } catch (err) {
      set(state => ({
        ...state,
        error: err.response?.data?.error || 'Aktiviteler yüklenemedi.',
        loading: false,
      }));
    }
  },

  /**
   * Set the active user profile (immutable update).
   */
  setUser: (userProfile) =>
    set(state => ({ ...state, user: userProfile })),

  /**
   * Join an activity — updates participations and joinedIds (immutable).
   */
  joinActivity: async (activityId) => {
    const { user } = get();
    if (!user?.id) {
      set(state => ({ ...state, error: 'Katılmak için profil gerekli.' }));
      return false;
    }

    try {
      await axios.post(`${API_BASE}/activities/${activityId}/join`, {
        user_id: user.id,
      });

      // Immutable update: spread existing state, add to joinedIds
      set(state => ({
        ...state,
        joinedIds: addJoinedId(state.joinedIds, activityId),
        // Also increment local user stats (immutable nested update)
        user: {
          ...state.user,
          joined_events: (state.user.joined_events || 0) + 1,
        },
      }));
      return true;
    } catch (err) {
      set(state => ({
        ...state,
        error: err.response?.data?.error || 'Katılım başarısız.',
      }));
      return false;
    }
  },

  /**
   * Create a new user profile via the API and store it.
   */
  createUser: async (userData) => {
    set(state => ({ ...state, loading: true }));
    try {
      const res = await axios.post(`${API_BASE}/users`, userData);
      const newUser = res.data.user;
      // Immutable update
      set(state => ({ ...state, user: newUser, loading: false }));
      return newUser;
    } catch (err) {
      set(state => ({
        ...state,
        error: err.response?.data?.error || 'Profil oluşturulamadı.',
        loading: false,
      }));
      return null;
    }
  },

  /**
   * Clear error state (pure reset).
   */
  clearError: () =>
    set(state => ({ ...state, error: null })),
}));
