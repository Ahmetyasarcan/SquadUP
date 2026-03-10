// services/api.js
// ================
// Centralized API client for the SquadUp Flask backend.
// All requests go through this module — easy to swap backend URL.

import axios from 'axios';

// Base URL — in development, Vite proxy handles /api → localhost:5000
const BASE_URL = '/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ---------------------------------------------------------------------------
// User API
// ---------------------------------------------------------------------------
export const userApi = {
  /** Create a new user profile */
  createUser: (userData) => client.post('/users', userData).then(r => r.data),

  /** Fetch all users (dev/testing) */
  listUsers: () => client.get('/users').then(r => r.data),

  /** Fetch personalized recommendations for a user */
  getRecommendations: (userId, options = {}) => {
    const params = new URLSearchParams();
    if (options.minScore)    params.set('min_score', options.minScore);
    if (options.topN)        params.set('top_n', options.topN);
    return client
      .get(`/users/${userId}/recommendations`, { params })
      .then(r => r.data);
  },
};

// ---------------------------------------------------------------------------
// Activity API
// ---------------------------------------------------------------------------
export const activityApi = {
  /** Fetch all activities */
  listActivities: () => client.get('/activities').then(r => r.data),

  /** Create a new activity */
  createActivity: (activityData) =>
    client.post('/activities', activityData).then(r => r.data),

  /** Score a specific activity for a user */
  scoreActivity: (activityId, userId) =>
    client.post(`/activities/${activityId}/score`, { user_id: userId }).then(r => r.data),

  /** Join an activity */
  joinActivity: (activityId, userId) =>
    client.post(`/activities/${activityId}/join`, { user_id: userId }).then(r => r.data),
};

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
export const checkHealth = () =>
  client.get('/health').then(r => r.data);
