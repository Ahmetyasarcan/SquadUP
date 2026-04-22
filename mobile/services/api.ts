import type { User, Activity } from '../types';

// Change this to your computer's local IP when testing on physical device
const API_BASE = 'http://10.196.76.77:5000/api';
// For physical device: 'http://192.168.1.XXX:5000/api'

// ========== ERROR HANDLING ==========

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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

export async function joinActivity(
  activityId: string,
  userId: string
): Promise<{ message: string }> {
  return fetchAPI(`${API_BASE}/activities/${activityId}/join`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}
