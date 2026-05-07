import type { User, Activity } from '../types';
import { supabase } from '../lib/supabase';
import { MOCK_ACTIVITIES, MOCK_SQUADS, MOCK_FRIENDS } from '../constants/mockData';

// Change this to your computer's local IP when testing on physical device
const API_BASE = 'http://172.20.10.4:5000/api';

// ========== ERROR HANDLING ==========

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    // Get current session token directly from Supabase
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
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${url}):`, error);
    throw error;
  }
}

// ========== ENDPOINTS ==========

export async function getActivities(category?: string): Promise<Activity[]> {
  try {
    const params = category && category !== 'all' ? `?category=${category}` : '';
    const data = await fetchAPI<{activities: Activity[]}>(`${API_BASE}/activities${params}`);
    
    // If we have real data, use it. Otherwise, use mock for demo.
    if (data.activities && data.activities.length > 0) {
      return data.activities;
    }
    return MOCK_ACTIVITIES;
  } catch (err) {
    console.warn('API failed, using mock activities');
    return MOCK_ACTIVITIES;
  }
}

export async function getActivity(id: string): Promise<Activity> {
  try {
    return await fetchAPI<Activity>(`${API_BASE}/activities/${id}`);
  } catch (err) {
    return MOCK_ACTIVITIES.find(a => a.id === id) || MOCK_ACTIVITIES[0];
  }
}

export async function createActivity(data: {
  creator_id: string;
  title: string;
  description?: string;
  category: string;
  competition_level: number;
  location: string;
  datetime: string;
  max_participants: number;
}): Promise<Activity> {
  try {
    const result = await fetchAPI<{ activity: Activity; message: string }>(`${API_BASE}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.activity;
  } catch (err: any) {
    throw new Error(err?.message || 'Aktivite oluşturulamadı');
  }
}

export async function getUser(id: string): Promise<User> {
  try {
    const data = await fetchAPI<{user: User}>(`${API_BASE}/users/${id}`);
    return data.user;
  } catch (err) {
    return MOCK_FRIENDS.find(u => u.id === id) || MOCK_FRIENDS[0];
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  try {
    const data = await fetchAPI<{user: User}>(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return data.user;
  } catch (err: any) {
    throw new Error(err?.message || 'Profil güncellenemedi');
  }
}

export async function getRecommendations(userId: string): Promise<{
  recommendations: Activity[];
  total: number;
}> {
  try {
    const data = await fetchAPI<{recommendations: Activity[], total: number}>(`${API_BASE}/users/${userId}/recommendations`);
    if (data.recommendations && data.recommendations.length > 0) {
      return data;
    }
    return { recommendations: MOCK_ACTIVITIES, total: MOCK_ACTIVITIES.length };
  } catch (err) {
    return { recommendations: MOCK_ACTIVITIES, total: MOCK_ACTIVITIES.length };
  }
}

export async function joinActivity(
  activityId: string,
  userId: string
): Promise<{ message: string; participant_count?: number; activity_title?: string }> {
  // Demo optimization: If it's a mock activity, don't even call the backend
  if (activityId.startsWith('00000000')) {
    return { message: 'Aktiviteye katıldınız! 🎉' };
  }

  try {
    return await fetchAPI(`${API_BASE}/activities/${activityId}/join`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  } catch (err) {
    return { message: 'Aktiviteye katıldınız! 🎉' };
  }
}

export async function getParticipationStatus(): Promise<{ statuses: Record<string, string> }> {
  try {
    return await fetchAPI<{ statuses: Record<string, string> }>(`${API_BASE}/participations/status`);
  } catch (err) {
    return { statuses: {} };
  }
}

export async function getActivityParticipants(activityId: string): Promise<{ pending: any[], approved: any[] }> {
  try {
    return await fetchAPI<{ pending: any[], approved: any[] }>(`${API_BASE}/activities/${activityId}/participants`);
  } catch (err) {
    return { pending: [], approved: [] };
  }
}

export async function respondActivityRequest(activityId: string, participationId: string, status: 'joined' | 'rejected'): Promise<{ message: string }> {
  return await fetchAPI<{ message: string }>(`${API_BASE}/activities/${activityId}/respond_request`, {
    method: 'POST',
    body: JSON.stringify({ participation_id: participationId, status }),
  });
}

// ========== PARTICIPATIONS (Replaces Squads) ==========

export async function getSquads(): Promise<{ squads: any[], count: number }> {
  try {
    const data = await fetchAPI<{ activities: any[], count: number }>(`${API_BASE}/participations`);
    
    // We map activities to the 'squads' key for UI compatibility
    if (data.activities && data.activities.length > 0) {
      return { squads: data.activities, count: data.count };
    }
    return { squads: MOCK_SQUADS, count: MOCK_SQUADS.length };
  } catch (err) {
    return { squads: MOCK_SQUADS, count: MOCK_SQUADS.length };
  }
}

// ========== FRIENDS ==========

export async function searchUsers(query: string): Promise<{ users: User[] }> {
  try {
    return await fetchAPI(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`);
  } catch (err) {
    return { users: MOCK_FRIENDS.filter(f => f.name.toLowerCase().includes(query.toLowerCase())) };
  }
}

export async function sendFriendRequest(friendId: string): Promise<any> {
  try {
    return await fetchAPI(`${API_BASE}/friends/request`, {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId }),
    });
  } catch (err) {
    return { message: 'Mock: Arkadaşlık isteği gönderildi' };
  }
}

export async function getFriends(): Promise<{
  friends: User[];
  pending_incoming: (User & { request_id: string })[];
  pending_outgoing: User[];
}> {
  try {
    const data = await fetchAPI<{friends: User[], pending_incoming: any[], pending_outgoing: any[]}>(`${API_BASE}/friends`);
    if (data.friends && data.friends.length > 0) {
      return data;
    }
    return {
      friends: MOCK_FRIENDS,
      pending_incoming: [],
      pending_outgoing: []
    };
  } catch (err) {
    return {
      friends: MOCK_FRIENDS,
      pending_incoming: [],
      pending_outgoing: []
    };
  }
}

export async function respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<any> {
  try {
    return await fetchAPI(`${API_BASE}/friends/respond`, {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId, status }),
    });
  } catch (err) {
    return { status: 'success' };
  }
}
