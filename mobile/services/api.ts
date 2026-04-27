import type { User, Activity } from '../types';
import * as SecureStore from 'expo-secure-store';

// Change this to your computer's local IP when testing on physical device
const API_BASE = 'http://10.196.76.77:5000/api';

// ========== ERROR HANDLING ==========

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const token = await SecureStore.getItemAsync('squadup-token');
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
    console.error('API Error:', error);
    throw error;
  }
}

// ========== ENDPOINTS ==========

export async function getActivities(category?: string): Promise<Activity[]> {
  const params = category && category !== 'all' ? `?category=${category}` : '';
  const data = await fetchAPI<{activities: Activity[]}>(`${API_BASE}/activities${params}`);
  return data.activities || [];
}

export async function getActivity(id: string): Promise<Activity> {
  return fetchAPI<Activity>(`${API_BASE}/activities/${id}`);
}

export async function getUser(id: string): Promise<User> {
  return fetchAPI<User>(`${API_BASE}/users/${id}`);
}

export async function getRecommendations(userId: string): Promise<{
  recommendations: Activity[];
  total: number;
}> {
  return fetchAPI(`${API_BASE}/users/${userId}/recommendations`);
}

// ========== AUTH ==========

export async function login(credentials: any): Promise<any> {
  const data = await fetchAPI<any>(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  if (data.session?.access_token) {
    await SecureStore.setItemAsync('squadup-token', data.session.access_token);
  }
  return data;
}

export async function registerStep1(userData: any): Promise<any> {
  return fetchAPI<any>(`${API_BASE}/auth/register/step1`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function checkVerification(credentials: any): Promise<any> {
  return fetchAPI<any>(`${API_BASE}/auth/verify-check`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function registerStep2(userData: any): Promise<any> {
  return fetchAPI<any>(`${API_BASE}/auth/register/step2`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getMe(): Promise<any> {
  return fetchAPI(`${API_BASE}/auth/me`);
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync('squadup-token');
}

export async function joinActivity(
  activityId: string,
  userId: string
): Promise<{ message: string }> {
  return fetchAPI(`${API_BASE}/activities/${activityId}/join`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

// ========== SQUADS ==========

export async function getSquads(): Promise<{ squads: any[], count: number }> {
  return fetchAPI(`${API_BASE}/squads`);
}

    body: JSON.stringify({ user_id: userId }),
  });
}

// ========== FRIENDS ==========

export async function searchUsers(query: string): Promise<{ users: User[] }> {
  return fetchAPI(`${API_BASE}/users/search?q=${encodeURIComponent(query)}`);
}

export async function sendFriendRequest(friendId: string): Promise<any> {
  return fetchAPI(`${API_BASE}/friends/request`, {
    method: 'POST',
    body: JSON.stringify({ friend_id: friendId }),
  });
}

export async function getFriends(): Promise<{
  friends: User[];
  pending_incoming: (User & { request_id: string })[];
  pending_outgoing: User[];
}> {
  return fetchAPI(`${API_BASE}/friends`);
}

export async function respondToFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<any> {
  return fetchAPI(`${API_BASE}/friends/respond`, {
    method: 'POST',
    body: JSON.stringify({ request_id: requestId, status }),
  });
}
