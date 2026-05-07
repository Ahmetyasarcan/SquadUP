import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { 
  getNotifications, 
  markAllNotificationsAsRead 
} from '../services/socialApi';
import { COLORS } from '../constants/colors';
import Toast from 'react-native-toast-message';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins}dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

function getIcon(type: string) {
  if (type === 'friend_request' || type === 'friend_accepted') return 'person-add';
  if (type === 'message') return 'chatbubble';
  return 'notifications';
}

function getIconColor(type: string) {
  if (type === 'friend_request' || type === 'friend_accepted') return '#f472b6'; // pink
  if (type === 'message') return COLORS.primaryLight;
  return '#fbbf24'; // amber
}

export default function NotificationsModal() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifs();
  }, [user]);

  async function loadNotifs() {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      Toast.show({ type: 'success', text1: 'Okundu işaretlendi' });
    } catch {
      Toast.show({ type: 'error', text1: 'İşlem başarısız' });
    }
  }

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bildirimler</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkRead}>
            <Text style={styles.markReadBtn}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{marginTop: 20}} color={COLORS.primaryLight} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={48} color={COLORS.textTertiary} style={{opacity: 0.5}} />
          <Text style={styles.emptyText}>Bildiriminiz yok</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.item, !item.read && styles.itemUnread]}>
              <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '20' }]}>
                <Ionicons name={getIcon(item.type) as any} size={20} color={getIconColor(item.type)} />
              </View>
              <View style={styles.content}>
                <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>{item.title}</Text>
                <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.itemTime}>{timeAgo(item.created_at)}</Text>
              </View>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
          )}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  markReadBtn: {
    color: COLORS.primaryLight,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: COLORS.textTertiary,
    fontSize: 16,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    alignItems: 'center',
  },
  itemUnread: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '40',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  itemTitleUnread: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  itemMessage: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginBottom: 6,
  },
  itemTime: {
    fontSize: 11,
    color: COLORS.textTertiary,
    opacity: 0.8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryLight,
    marginLeft: 12,
  }
});
