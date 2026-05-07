import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getActivities, 
  joinActivity, 
  getActivityParticipants, 
  respondActivityRequest, 
  getParticipationStatus 
} from '../../services/api';
import { COLORS, SHADOWS } from '../../constants/colors';
import { CATEGORIES, COMPETITION_LEVELS } from '../../constants/translations';
import { formatDateTime } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import { getAvatarUrl } from '../../utils/avatars';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [activity, setActivity] = useState<any>(null);
  const [participants, setParticipants] = useState<{ pending: any[], approved: any[] }>({ pending: [], approved: [] });
  const [userStatus, setUserStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id, user]);

  async function loadData() {
    if (!id) return;
    setLoading(true);
    try {
      const [allActivities, statRes] = await Promise.all([
        getActivities(),
        user ? getParticipationStatus() : Promise.resolve({ statuses: {} })
      ]);

      const found = allActivities.find((a: any) => a.id === id);
      if (found) {
        setActivity(found);
        
        // If user is creator, fetch full participants list including pending
        if (user && found.creator_id === user.id) {
          const partRes = await getActivityParticipants(id as string);
          setParticipants(partRes);
        } else if (found.participants) {
          // If not creator, just show approved ones from activity object if available
          setParticipants({ pending: [], approved: found.participants });
        }
      }

      if (statRes && statRes.statuses) {
        setUserStatus(statRes.statuses[id as string]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!activity) return;

    setJoining(true);
    try {
      const res = await joinActivity(activity.id, user.id);
      Toast.show({
        type: 'success',
        text1: 'İstek Gönderildi! ⏳',
        text2: 'Aktivite sahibi onayladığında bildirim alacaksınız.'
      });
      setUserStatus('pending');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: err.message || 'İstek gönderilemedi'
      });
    } finally {
      setJoining(false);
    }
  }

  async function handleRespond(participationId: string, status: 'joined' | 'rejected') {
    if (!id || respondingId) return;
    setRespondingId(participationId);
    
    try {
      await respondActivityRequest(id as string, participationId, status);
      Toast.show({
        type: 'success',
        text1: status === 'joined' ? 'Onaylandı! ✅' : 'Reddedildi'
      });
      
      // Refresh
      const partRes = await getActivityParticipants(id as string);
      setParticipants(partRes);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: err.message || 'İşlem başarısız'
      });
    } finally {
      setRespondingId(null);
    }
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${activity.title} etkinliğine beraber katılalım mı? SquadUp ile sporun tadını çıkar!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </View>
    );
  }

  if (!activity) return null;

  const isCreator = user && activity.creator_id === user.id;
  const isFull = activity.current_participants >= activity.max_participants;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: activity.title,
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '800' },
        }} 
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero Section */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.hero}
        >
          <View style={styles.heroContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {CATEGORIES[activity.category as keyof typeof CATEGORIES] || activity.category}
              </Text>
            </View>
            <Text style={styles.heroTitle}>{activity.title}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Info Card */}
          <View style={[styles.infoCard, SHADOWS.card]}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={24} color={COLORS.primaryLight} />
              <View>
                <Text style={styles.infoLabel}>Tarih & Saat</Text>
                <Text style={styles.infoValue}>{formatDateTime(activity.datetime)}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={24} color={COLORS.primaryLight} />
              <View>
                <Text style={styles.infoLabel}>Konum</Text>
                <Text style={styles.infoValue}>{activity.location}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={24} color={COLORS.primaryLight} />
              <View>
                <Text style={styles.infoLabel}>Katılımcılar</Text>
                <Text style={styles.infoValue}>{activity.current_participants} / {activity.max_participants}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="stats-chart" size={24} color={COLORS.primaryLight} />
              <View>
                <Text style={styles.infoLabel}>Seviye</Text>
                <Text style={styles.infoValue}>
                  {COMPETITION_LEVELS[activity.competition_level as keyof typeof COMPETITION_LEVELS]}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {activity.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Text style={styles.description}>{activity.description}</Text>
            </View>
          )}

          {/* Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Katılımcılar</Text>
            <View style={styles.avatarGrid}>
              {participants.approved.map((p) => (
                <View key={p.id} style={styles.avatarItem}>
                  <View style={styles.avatarLarge}>
                    <Image 
                      source={{ uri: getAvatarUrl(p.avatar_seed || p.id) }} 
                      style={styles.avatarImage} 
                    />
                  </View>
                  <Text style={styles.avatarName} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Pending Requests for Creator */}
          {isCreator && participants.pending.length > 0 && (
            <View style={styles.pendingSection}>
              <Text style={[styles.sectionTitle, { color: COLORS.warning }]}>
                Onay Bekleyen İstekler ({participants.pending.length})
              </Text>
              {participants.pending.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.requestInfo}>
                    <View style={styles.avatarSmall}>
                      <Image 
                        source={{ uri: getAvatarUrl(req.avatar_seed || req.user_id || req.id) }} 
                        style={styles.avatarImageSmall} 
                      />
                    </View>
                    <Text style={styles.requestName}>{req.name}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleRespond(req.participation_id, 'joined')}
                    >
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRespond(req.participation_id, 'rejected')}
                    >
                      <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        {(isCreator || userStatus === 'joined') && (
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => router.push({
              pathname: `/activities/${id}/chat`,
              params: { title: activity.title }
            })}
          >
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.chatButtonText}>Sohbete Katıl</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          {isCreator ? (
            <View style={styles.creatorBanner}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.primaryLight} />
              <Text style={styles.creatorBannerText}>Bu etkinliği sen yönetiyorsun</Text>
            </View>
          ) : (
            <Button
              title={
                userStatus === 'joined' || userStatus === 'attended' ? 'Katıldın ✅' :
                userStatus === 'pending' ? 'İstek Gönderildi ⏳' :
                isFull ? 'Dolu' : '🎉 Aktiviteye Katıl'
              }
              onPress={handleJoin}
              variant={userStatus === 'joined' ? 'ghost' : 'neon'}
              disabled={isFull || userStatus === 'pending' || userStatus === 'joined'}
              loading={joining}
            />
          )}
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
  },
  scroll: {
    paddingBottom: 100,
  },
  hero: {
    height: 250,
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroContent: {
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  content: {
    padding: 20,
    marginTop: -30,
  },
  infoCard: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 20,
    padding: 20,
    gap: 20,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoLabel: {
    color: COLORS.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  avatarItem: {
    alignItems: 'center',
    width: 60,
  },
  avatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.darkBg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  pendingSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.darkCard,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.darkBg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
  },
  avatarImageSmall: {
    width: '100%',
    height: '100%',
  },
  requestName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.darkCard,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
  },
  shareButton: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: COLORS.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  creatorBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderRadius: 12,
  },
  creatorBannerText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: 14,
  },
  chatButton: {
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
