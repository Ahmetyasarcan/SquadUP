import type { User, Activity, ApiResponse } from '../types';

const API_BASE = '/api'; // Proxied through Vite to localhost:5000

// ========== ERROR HANDLING WRAPPER ==========

import { supabase } from '../lib/supabase';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: error instanceof Error ? error.message : 'Bilinmeyen hata' };
  }
}

// ========== USER ENDPOINTS ==========

export async function createUser(userData: {
  name: string;
  email: string;
  interests: string[];
  competition_level: number;
}): Promise<ApiResponse<{ user: User }>> {
  return fetchJSON<{ user: User }>(`${API_BASE}/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getUsers(): Promise<ApiResponse<{ users: User[] }>> {
  return fetchJSON<{ users: User[] }>(`${API_BASE}/users`);
}

export async function getUser(userId: string): Promise<ApiResponse<User>> {
  return fetchJSON<User>(`${API_BASE}/users/${userId}`);
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
  return fetchJSON<User>(`${API_BASE}/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

// ========== AUTH ENDPOINTS ==========

export async function login(credentials: { email: string; password: string }): Promise<ApiResponse<{ 
  user: User; 
  session: { access_token: string; expires_in: number; refresh_token: string } 
}>> {
  return fetchJSON<{ 
    user: User; 
    session: { access_token: string; expires_in: number; refresh_token: string } 
  }>(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerStep1(userData: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ user: User; user_id: string }>> {
  return fetchJSON<{ user: User; user_id: string }>(`${API_BASE}/auth/register/step1`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function checkVerification(credentials: {
  email: string;
  password: string;
}): Promise<ApiResponse<{ verified: boolean; error?: string }>> {
  return fetchJSON<{ verified: boolean; error?: string }>(`${API_BASE}/auth/verify-check`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerStep2(userData: {
  user_id: string;
  name: string;
  interests: string[];
  competition_level: number;
}): Promise<ApiResponse<{ user: User }>> {
  return fetchJSON<{ user: User }>(`${API_BASE}/auth/register/step2`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getMe(): Promise<ApiResponse<{ user: User }>> {
  return fetchJSON<{ user: User }>(`${API_BASE}/auth/me`);
}

// ========== ACTIVITY ENDPOINTS ==========

export async function getActivities(): Promise<ApiResponse<{ activities: Activity[]; count: number }>> {
  return fetchJSON<{ activities: Activity[]; count: number }>(`${API_BASE}/activities`);
}

export async function createActivity(activityData: {
  creator_id: string;
  title: string;
  description?: string;
  category: string;
  competition_level: number;
  location: string;
  datetime: string;
  max_participants: number;
}): Promise<ApiResponse<{ activity: Activity }>> {
  return fetchJSON<{ activity: Activity }>(`${API_BASE}/activities`, {
    method: 'POST',
    body: JSON.stringify(activityData),
  });
}

export async function joinActivity(
  activityId: string,
  userId: string
): Promise<ApiResponse<{ message: string; participant_count?: number; activity_title?: string }>> {
  return fetchJSON<{ message: string; participant_count?: number; activity_title?: string }>(`${API_BASE}/activities/${activityId}/join`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function getParticipationStatus(): Promise<ApiResponse<{ statuses: Record<string, string> }>> {
  return fetchJSON<{ statuses: Record<string, string> }>(`${API_BASE}/participations/status`);
}

export async function getActivityParticipants(activityId: string): Promise<ApiResponse<{ pending: any[], approved: any[] }>> {
  return fetchJSON<{ pending: any[], approved: any[] }>(`${API_BASE}/activities/${activityId}/participants`);
}

export async function respondActivityRequest(activityId: string, participationId: string, status: 'joined' | 'rejected'): Promise<ApiResponse<{ message: string }>> {
  return fetchJSON<{ message: string }>(`${API_BASE}/activities/${activityId}/respond_request`, {
    method: 'POST',
    body: JSON.stringify({ participation_id: participationId, status }),
  });
}

// ========== RECOMMENDATIONS ENDPOINT ==========

export async function getRecommendations(userId: string): Promise<ApiResponse<{
  user_id: string;
  recommendations: Activity[];
  stats: { count: number; avg_score: number; perfect: number; good: number; low: number };
}>> {
  return fetchJSON(`${API_BASE}/users/${userId}/recommendations`);
}

// ========== SCORING ENDPOINT ==========

export async function calculateScore(
  activityId: string,
  userId: string
): Promise<ApiResponse<{ user_id: string; activity_id: string; match_result: Activity['match_result'] }>> {
  return fetchJSON(`${API_BASE}/activities/${activityId}/score`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}
// ========== SQUAD ENDPOINTS ==========

export async function getSquads(): Promise<ApiResponse<{ squads: any[]; count: number }>> {
  return fetchJSON<{ squads: any[]; count: number }>(`${API_BASE}/squads`);
}

export async function createSquad(squadData: {
  name: string;
  description: string;
  category: string;
  creator_id: string;
}): Promise<ApiResponse<{ squad: any }>> {
  return fetchJSON<{ squad: any }>(`${API_BASE}/squads`, {
    method: 'POST',
    body: JSON.stringify(squadData),
  });
}

export async function joinSquad(squadId: string, userId: string): Promise<ApiResponse<{ membership: any }>> {
  return fetchJSON<{ membership: any }>(`${API_BASE}/squads/${squadId}/join`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

// ========== FRIEND ENDPOINTS ==========

export async function searchUsers(query: string): Promise<ApiResponse<{ users: User[] }>> {
  return fetchJSON<{ users: User[] }>(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`);
}

export async function sendFriendRequest(friendId: string): Promise<ApiResponse<{ message: string }>> {
  return fetchJSON<{ message: string }>(`${API_BASE}/friends/request`, {
    method: 'POST',
    body: JSON.stringify({ friend_id: friendId }),
  });
}

export async function getFriends(): Promise<ApiResponse<{
  friends: User[];
  pending_incoming: (User & { request_id: string })[];
  pending_outgoing: User[];
}>> {
  return fetchJSON(`${API_BASE}/friends`);
}

export async function respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<ApiResponse<{ message: string }>> {
  return fetchJSON<{ message: string }>(`${API_BASE}/friends/respond`, {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId, status }),
  });
}
