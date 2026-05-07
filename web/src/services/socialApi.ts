/**
 * socialApi.ts
 * Direct Supabase calls for the social layer:
 *   - Friend system (friendships table)
 *   - Notifications (notifications table)
 *   - 1-on-1 Messaging (messages table)
 *   - Realtime subscriptions
 */

import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

function displayName(user: any): string {
  return user?.user_metadata?.name || user?.email || 'Kullanıcı';
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS / SEARCH
// ─────────────────────────────────────────────────────────────────────────────

export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, interests, competition_level, reliability_score')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function getRealUserSuggestions() {
  // Fetch up to 10 random users (excluding current user) for suggestions
  const user = await getCurrentUser().catch(() => null);
  let query = supabase
    .from('users')
    .select('id, name, email, interests, competition_level, reliability_score')
    .limit(10);

  if (user) query = query.neq('id', user.id);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// FRIENDS
// ─────────────────────────────────────────────────────────────────────────────

export async function sendFriendRequest(friendId: string) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // Create notification for the recipient
  await supabase.from('notifications').insert({
    user_id: friendId,
    type: 'friend_request',
    title: 'Yeni Arkadaşlık İsteği',
    message: `${displayName(user)} sana arkadaşlık isteği gönderdi`,
    related_id: user.id,
  });

  return data;
}

export async function acceptFriendRequest(requestId: string) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  // Notify the original requester
  if (data?.user_id) {
    await supabase.from('notifications').insert({
      user_id: data.user_id,
      type: 'friend_accepted',
      title: 'Arkadaşlık İsteği Kabul Edildi',
      message: `${displayName(user)} arkadaşlık isteğini kabul etti`,
      related_id: user.id,
    });
  }

  return data;
}

export async function rejectFriendRequest(requestId: string) {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
}

/** Returns accepted friends where the current user is the requester */
export async function getFriends() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('friendships')
    .select(
      `id, status, created_at,
       friend:friend_id ( id, name, email, interests, competition_level, reliability_score )`
    )
    .eq('user_id', user.id)
    .eq('status', 'accepted');

  if (error) throw error;
  return data ?? [];
}

/** Returns pending friend requests directed at the current user */
export async function getFriendRequests() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('friendships')
    .select(
      `id, created_at,
       requester:user_id ( id, name, email, interests, reliability_score )`
    )
    .eq('friend_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export async function getNotifications() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllNotificationsAsRead() {
  const user = await getCurrentUser();

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);

  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

export async function sendMessage(receiverId: string, message: string) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      message,
    })
    .select()
    .single();

  if (error) throw error;

  // Notify the receiver
  await supabase.from('notifications').insert({
    user_id: receiverId,
    type: 'message',
    title: 'Yeni Mesaj',
    message: `${displayName(user)} sana mesaj gönderdi`,
    related_id: user.id,
  });

  return data;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOwn: boolean;
}

export async function getConversations(): Promise<Conversation[]> {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Group by partner, keeping only the latest message per conversation
  const map = new Map<string, Conversation>();
  for (const msg of data ?? []) {
    const partnerId =
      msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    if (!map.has(partnerId)) {
      map.set(partnerId, {
        partnerId,
        partnerName: '',
        partnerEmail: '',
        lastMessage: msg.message,
        lastMessageAt: msg.created_at,
        unreadCount: 0,
        isOwn: msg.sender_id === user.id,
      });
    }
    if (!msg.read && msg.receiver_id === user.id) {
      map.get(partnerId)!.unreadCount++;
    }
  }

  // Resolve partner names from users table
  const conversations = Array.from(map.values());
  if (conversations.length > 0) {
    const ids = conversations.map((c) => c.partnerId);
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email')
      .in('id', ids);

    const userMap = new Map((users ?? []).map((u: any) => [u.id, u]));
    conversations.forEach((c) => {
      const u = userMap.get(c.partnerId) as any;
      if (u) {
        c.partnerName = u.name;
        c.partnerEmail = u.email;
      }
    });
  }

  return conversations;
}

export async function getMessages(partnerId: string) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),` +
        `and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Mark incoming messages as read
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('sender_id', partnerId)
    .eq('receiver_id', user.id)
    .eq('read', false);

  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// REALTIME SUBSCRIPTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeToNotifications(
  userId: string,
  callback: (notification: any) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

export function subscribeToMessages(
  userId: string,
  callback: (message: any) => void
) {
  return supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      (payload) => callback(payload.new)
    )
    .subscribe();
}
