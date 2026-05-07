import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  searchUsers, sendFriendRequest, getFriends, 
  getFriendRequests, acceptFriendRequest, 
  rejectFriendRequest, getRealUserSuggestions 
} from '../../services/socialApi';
import { mixRealAndMockUsers, normalizeRealUser } from '../../utils/mockData';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

type Tab = 'suggestions' | 'friends' | 'requests' | 'search';

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('suggestions');
  
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [user])
  );

  async function loadAll() {
    await Promise.all([loadFriends(), loadRequests(), loadSuggestions()]);
  }

  async function loadFriends() {
    if (!user) return;
    try {
      const data = await getFriends();
      setFriends(data);
    } catch { /* fail silently */ }
  }

  async function loadRequests() {
    if (!user) return;
    try {
      const data = await getFriendRequests();
      setRequests(data);
    } catch { /* fail silently */ }
  }

  async function loadSuggestions() {
    setLoadingSuggestions(true);
    try {
      const realUsers = await getRealUserSuggestions();
      const normalized = realUsers.map(normalizeRealUser);
      setSuggestions(mixRealAndMockUsers(normalized, 0.5));
    } catch {
      const { MOCK_SOCIAL_USERS } = require('../../utils/mockData');
      setSuggestions(MOCK_SOCIAL_USERS);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setTab('search');
    try {
      const data = await searchUsers(searchQuery);
      if (data.length > 0) {
        setSearchResults(data);
      } else {
        const { MOCK_SOCIAL_USERS } = require('../../utils/mockData');
        const q = searchQuery.toLowerCase();
        setSearchResults(MOCK_SOCIAL_USERS.filter((u: any) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        ));
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Arama yapılamadı' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(userId: string, userName: string) {
    if (userId.startsWith('mock-')) {
      Toast.show({ type: 'info', text1: 'Bu kullanıcı demo verisidir 😊' });
      return;
    }
    try {
      await sendFriendRequest(userId);
      setSentRequests(prev => new Set([...prev, userId]));
      Toast.show({ type: 'success', text1: `${userName} kişisine istek gönderildi!` });
    } catch (e: any) {
      if (e?.message?.includes('duplicate') || e?.code === '23505') {
        Toast.show({ type: 'error', text1: 'Zaten istek gönderilmiş' });
      } else {
        console.error('Send request error:', e);
        Toast.show({ type: 'error', text1: 'Hata: ' + (e?.message || 'İstek gönderilemedi') });
      }
    }
  }

  async function handleAccept(requestId: string, name: string) {
    try {
      await acceptFriendRequest(requestId);
      Toast.show({ type: 'success', text1: `${name} artık arkadaşın! 🎉` });
      await loadAll();
    } catch { 
      Toast.show({ type: 'error', text1: 'İstek kabul edilemedi' }); 
    }
  }

  async function handleReject(requestId: string) {
    try {
      await rejectFriendRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      Toast.show({ type: 'info', text1: 'İstek reddedildi' });
    } catch { 
      Toast.show({ type: 'error', text1: 'İşlem başarısız' }); 
    }
  }

  const isAlreadyFriend = (id: string) => friends.some((f: any) => f.friend?.id === id);
  const hasSentRequest = (id: string) => sentRequests.has(id);

  function getReliabilityColor(score: number) {
    if (score >= 0.9) return '#34d399';
    if (score >= 0.75) return COLORS.primaryLight;
    return '#fbbf24';
  }

  const renderUserCard = (userItem: any, actionView: React.ReactNode, isMock: boolean = false) => {
    const initial = (userItem?.name || '?').charAt(0).toUpperCase();
    return (
      <View style={styles.card} key={userItem.id}>
        <View style={styles.cardHeader}>
          {userItem.avatar ? (
            <Image source={{ uri: userItem.avatar }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarTextContainer}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>{userItem.name}</Text>
              {isMock && <Text style={styles.mockBadge}>✨ Öneri</Text>}
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>{userItem.email}</Text>
            
            {userItem.reliability_score != null && (
              <View style={styles.scoreRow}>
                <Ionicons name="shield-checkmark" size={12} color={getReliabilityColor(userItem.reliability_score)} />
                <Text style={[styles.scoreText, { color: getReliabilityColor(userItem.reliability_score) }]}>
                  %{Math.round(userItem.reliability_score * 100)} Güvenilirlik
                </Text>
              </View>
            )}
            
            {userItem.common_activities?.length > 0 && (
              <Text style={styles.commonActivitiesText}>
                🎮 {userItem.common_activities.join(', ')}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.cardAction}>
          {actionView}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={24} color="#fff" />
          </View>
          <Text style={styles.title}>Arkadaşlar</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={COLORS.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Kullanıcı ara..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {loading && <ActivityIndicator size="small" color={COLORS.primaryLight} />}
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer} contentContainerStyle={styles.tabsContent}>
          {[
            { id: 'suggestions', label: 'Öneriler' },
            { id: 'friends', label: `Arkadaşlar (${friends.length})` },
            { id: 'requests', label: `İstekler (${requests.length})` },
            { id: 'search', label: 'Arama' }
          ].map((t) => (
            <TouchableOpacity 
              key={t.id} 
              style={[styles.tabButton, tab === t.id && styles.tabButtonActive]}
              onPress={() => setTab(t.id as Tab)}
            >
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.tabContent}>
          {/* Suggestions Tab */}
          {tab === 'suggestions' && (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionSubtitle}>GERÇEK + ÖNERİ KULLANICILAR</Text>
                <TouchableOpacity onPress={loadSuggestions} disabled={loadingSuggestions}>
                  <Ionicons name="refresh" size={18} color={COLORS.primaryLight} />
                </TouchableOpacity>
              </View>
              {loadingSuggestions && <ActivityIndicator style={{marginTop: 20}} color={COLORS.primaryLight} />}
              {!loadingSuggestions && suggestions.map(u => renderUserCard(
                u,
                isAlreadyFriend(u.id) ? (
                  <Text style={styles.statusText}><Ionicons name="checkmark" /> Arkadaşsınız</Text>
                ) : hasSentRequest(u.id) ? (
                  <Text style={styles.statusTextWarn}><Ionicons name="time" /> İstek Gönderildi</Text>
                ) : (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => handleSendRequest(u.id, u.name)}>
                    <Text style={styles.primaryBtnText}>{u.isMock ? 'Demo Kullanıcı' : 'Arkadaş Ekle'}</Text>
                  </TouchableOpacity>
                ),
                !!u.isMock
              ))}
            </>
          )}

          {/* Friends Tab */}
          {tab === 'friends' && (
            <>
              {friends.length === 0 && <Text style={styles.emptyText}>Henüz arkadaşın yok.</Text>}
              {friends.map(f => renderUserCard(
                f.friend,
                <TouchableOpacity 
                  style={styles.secondaryBtn}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs)/messages',
                      params: {
                        userId: f.friend.id,
                        userName: f.friend.name,
                        userEmail: f.friend.email
                      }
                    });
                  }}
                >
                  <Text style={styles.secondaryBtnText}>Mesaj Gönder</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Requests Tab */}
          {tab === 'requests' && (
            <>
              {requests.length === 0 && <Text style={styles.emptyText}>Bekleyen istek yok.</Text>}
              {requests.map(r => renderUserCard(
                r.requester,
                <View style={{flexDirection: 'row', gap: 8}}>
                  <TouchableOpacity style={[styles.primaryBtn, {flex: 1}]} onPress={() => handleAccept(r.id, r.requester?.name)}>
                    <Text style={styles.primaryBtnText}>Kabul Et</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryBtn, {flex: 1}]} onPress={() => handleReject(r.id)}>
                    <Text style={styles.secondaryBtnText}>Reddet</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Search Tab */}
          {tab === 'search' && (
            <>
              {searchResults.length === 0 && <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>}
              {searchResults.map(u => renderUserCard(
                u,
                isAlreadyFriend(u.id) ? (
                  <Text style={styles.statusText}><Ionicons name="checkmark" /> Arkadaşsınız</Text>
                ) : hasSentRequest(u.id) ? (
                  <Text style={styles.statusTextWarn}><Ionicons name="time" /> İstek Gönderildi</Text>
                ) : (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => handleSendRequest(u.id, u.name)}>
                    <Text style={styles.primaryBtnText}>Arkadaş Ekle</Text>
                  </TouchableOpacity>
                ),
                !!u.isMock
              ))}
            </>
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
    padding: 20,
    paddingTop: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryLight,
  },
  tabText: {
    color: COLORS.textTertiary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: 30,
  },
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primaryLight + '50',
  },
  avatarTextContainer: {
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
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
    flexShrink: 1,
  },
  mockBadge: {
    fontSize: 10,
    color: '#fbbf24',
    backgroundColor: '#fbbf2420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: '600',
  },
  userEmail: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  commonActivitiesText: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  cardAction: {
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  statusText: {
    color: '#34d399',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  statusTextWarn: {
    color: '#fbbf24',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  }
});
