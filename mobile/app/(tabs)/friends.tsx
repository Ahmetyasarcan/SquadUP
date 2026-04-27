import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { searchUsers, sendFriendRequest, getFriends, respondToFriendRequest } from '../../services/api';
import { COLORS } from '../../constants/colors';

export default function FriendsScreen() {
  const [friendsData, setFriendsData] = useState<{
    friends: any[];
    pending_incoming: any[];
    pending_outgoing: any[];
  }>({ friends: [], pending_incoming: [], pending_outgoing: [] });
  
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    setLoading(true);
    try {
      const res = await getFriends();
      setFriendsData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await searchUsers(search);
      setSearchResults(res.users);
    } catch (e) {
      Alert.alert('Hata', 'Kullanıcı aranırken bir hata oluştu');
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest(friendId: string) {
    try {
      await sendFriendRequest(friendId);
      Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi');
      loadFriends();
    } catch (e: any) {
      Alert.alert('Hata', e.message || 'İstek gönderilemedi');
    }
  }

  async function handleRespond(requestId: string, status: 'accepted' | 'rejected') {
    try {
      await respondToFriendRequest(requestId, status);
      loadFriends();
    } catch (e) {
      Alert.alert('Hata', 'İşlem başarısız');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Arkadaşlar</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="İsim veya e-posta..."
              placeholderTextColor={COLORS.textTertiary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
            />
            {searching && <ActivityIndicator size="small" color={COLORS.primaryLight} />}
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsContainer}>
              {searchResults.map((item) => {
                const isFriend = friendsData.friends.some(f => f.id === item.id);
                const isPending = friendsData.pending_outgoing.some(f => f.id === item.id) || 
                                friendsData.pending_incoming.some(f => f.id === item.id);

                return (
                  <View key={item.id} style={styles.resultItem}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                    </View>
                    {isFriend ? (
                      <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    ) : isPending ? (
                      <Ionicons name="time" size={24} color="#f59e0b" />
                    ) : (
                      <TouchableOpacity 
                        style={styles.addBtn}
                        onPress={() => handleSendRequest(item.id)}
                      >
                        <Ionicons name="person-add" size={20} color={COLORS.primaryLight} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Incoming Requests */}
        {friendsData.pending_incoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gelen İstekler</Text>
            {friendsData.pending_incoming.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => handleRespond(item.request_id, 'accepted')}
                  >
                    <Text style={styles.actionBtnText}>Kabul Et</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleRespond(item.request_id, 'rejected')}
                  >
                    <Text style={styles.actionBtnText}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arkadaşlarım ({friendsData.friends.length})</Text>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primaryLight} />
          ) : friendsData.friends.length === 0 ? (
            <Text style={styles.emptyText}>Henüz arkadaşın yok.</Text>
          ) : (
            friendsData.friends.map((item) => (
              <View key={item.id} style={styles.friendItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                </View>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.textTertiary} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  header: {
    padding: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  resultsContainer: {
    marginTop: 12,
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    padding: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  avatarText: {
    color: COLORS.primaryLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  userEmail: {
    color: COLORS.textTertiary,
    fontSize: 12,
  },
  addBtn: {
    padding: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: COLORS.primaryLight,
  },
  rejectBtn: {
    backgroundColor: COLORS.darkBg,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    gap: 12,
  },
  emptyText: {
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 20,
  },
});
