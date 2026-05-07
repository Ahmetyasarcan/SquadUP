import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getFriends } from '../services/socialApi';
import { useAuth } from '../contexts/AuthContext';

export default function NewChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getFriends()
        .then(setFriends)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  function handleSelectFriend(friend: any) {
    router.replace({
      pathname: '/(tabs)/messages',
      params: {
        userId: friend.id,
        userName: friend.name,
        userEmail: friend.email,
      }
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Sohbet</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primaryLight} />
      ) : friends.length === 0 ? (
        <Text style={styles.emptyText}>Henüz hiç arkadaşın yok.</Text>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friend.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.friendItem}
              onPress={() => handleSelectFriend(item.friend)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.friend.name || 'K').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{item.friend.name}</Text>
                <Text style={styles.friendEmail}>{item.friend.email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptyText: {
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 30,
  },
  listContainer: {
    padding: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  avatarText: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
    fontSize: 18,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 16,
  },
  friendName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  friendEmail: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
});
