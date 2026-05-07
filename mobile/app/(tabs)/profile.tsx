import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import { getAvatarUrl } from '../../utils/avatars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  User as UserIcon,
  LogOut,
  Settings,
  Award,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Heart,
  Zap,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CATEGORIES } from '../../constants/translations';
import { COLORS } from '../../constants/colors';


// Profile stats from public.users table (may differ from auth user object)
interface ProfileStats {
  name?: string;
  joined_events: number;
  attended_events: number;
  reliability_score: number;
  interests: string[];
  badges: string[];
  avatar_seed?: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ProfileStats>({
    name: '',
    joined_events: 0,
    attended_events: 0,
    reliability_score: 0.5,
    interests: [],
    badges: [],
  });

  // Fetch extended profile from public.users table
  useFocusEffect(
    React.useCallback(() => {
    if (!user) {
      // Mock data for demo if no user is logged in
      setStats({
        name: 'Demo Kullanıcı',
        joined_events: 15,
        attended_events: 12,
        reliability_score: 0.95,
        interests: ['sports', 'esports', 'board_games'],
        badges: ['active_squadmate', 'verified', 'squad_legend'],
      });
      return;
    }
    
    supabase
      .from('users')
      .select('name, joined_events, attended_events, reliability_score, interests, badges, avatar_seed')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setStats({
            name:              data.name              || '',
            joined_events:     data.joined_events     ?? 0,
            attended_events:   data.attended_events   ?? 0,
            reliability_score: data.reliability_score ?? 0.5,
            interests:         data.interests         ?? [],
            badges:            data.badges            ?? [],
            avatar_seed:       data.avatar_seed,
          });
        } else {
          // Mock data for demo if DB is not synced
          setStats({
            name: '',
            joined_events: 15,
            attended_events: 12,
            reliability_score: 0.95,
            interests: ['sports', 'esports', 'board_games'],
            badges: ['active_squadmate', 'verified', 'squad_legend'],
          });
        }
      });
  }, [user]));

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Oturumunuzu kapatmak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (e) {
              console.error('Logout error', e);
            }
          },
        },
      ]
    );
  };

  // Derive display name for demo even if not logged in
  const displayName = stats?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Demo Kullanıcı';
  const displayEmail = user?.email || 'demo@squadup.com';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>

        {/* Profile Header */}
        <LinearGradient
          colors={[COLORS.darkCard, COLORS.darkBg]}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={{ uri: getAvatarUrl(stats.avatar_seed || user?.id || 'demo') }} 
                style={styles.avatarImage} 
              />
            </View>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>

          {/* Level & XP System */}
          <View style={styles.levelContainer}>
            <View style={styles.levelBadge}>
              <Zap size={14} color="#fff" fill="#fff" />
              <Text style={styles.levelText}>Lv. {Math.floor((stats.attended_events || 0) / 5) + 1}</Text>
            </View>
            <View style={styles.xpBarContainer}>
              <View 
                style={[
                  styles.xpBarFill, 
                  { width: `${((stats.attended_events || 0) % 5) * 20}%` }
                ]} 
              />
            </View>
            <Text style={styles.xpText}>{stats.attended_events % 5} / 5 XP</Text>
          </View>

          <TouchableOpacity style={styles.settingsBtn}>
            <Settings size={24} color={COLORS.textTertiary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.primary + '22' }]}>
                <Calendar size={20} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.statValue}>{stats.joined_events}</Text>
              <Text style={styles.statLabel}>Katıldı</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.secondary + '22' }]}>
                <Award size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.statValue}>{stats.attended_events}</Text>
              <Text style={styles.statLabel}>Tamamladı</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#10b98122' }]}>
                <ShieldCheck size={20} color="#10b981" />
              </View>
              <Text style={styles.statValue}>%{Math.round(stats.reliability_score * 100)}</Text>
              <Text style={styles.statLabel}>Güven</Text>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        {stats.badges && stats.badges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color={COLORS.primaryLight} />
              <Text style={styles.sectionTitle}>Kazanılan Rozetler</Text>
            </View>
            <View style={styles.badgesList}>
              {stats.badges.map((badge) => {
                const badgeData: Record<string, { label: string; color: string; icon: string }> = {
                  active_squadmate: { label: 'Aktif Oyuncu', color: COLORS.primaryLight, icon: '⚡' },
                  squad_legend:     { label: 'Efsane',       color: COLORS.secondary,    icon: '👑' },
                  verified:         { label: 'Onaylı',       color: '#3b82f6',           icon: '✔' },
                };
                const data = badgeData[badge] || { label: badge, color: COLORS.textTertiary, icon: '⭐' };
                return (
                  <View key={badge} style={[styles.badge, { backgroundColor: data.color + '33', borderColor: data.color }]}>
                    <Text style={[styles.badgeText, { color: data.color }]}>{data.icon} {data.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Interests */}
        {stats.interests && stats.interests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#e11d48" />
              <Text style={styles.sectionTitle}>İlgi Alanların</Text>
            </View>
            <View style={styles.interestsList}>
              {stats.interests.map((interest) => (
                <View key={interest} style={styles.interestTag}>
                  <Text style={styles.interestText}>
                    {CATEGORIES[interest as keyof typeof CATEGORIES] || interest}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/edit-profile')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <UserIcon size={20} color={COLORS.textPrimary} />
              </View>
              <Text style={styles.menuItemText}>Profil Düzenle</Text>
            </View>
            <ChevronRight size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            <LogOut size={20} color="#dc2626" />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
    backgroundColor: COLORS.darkBorder,
    marginBottom: 16,
  },
  avatarWrapper: {
    flex: 1,
    borderRadius: 46,
    overflow: 'hidden',
    backgroundColor: COLORS.darkBg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  settingsBtn: {
    position: 'absolute',
    top: 40,
    right: 24,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginTop: -30,
  },
  statsRow: {
    backgroundColor: COLORS.darkCard,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textTertiary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.darkBorder,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTag: {
    backgroundColor: COLORS.darkCard,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  interestText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  menuContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 40,
    gap: 12,
  },
  menuItem: {
    backgroundColor: COLORS.darkCard,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.darkBg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  logoutBtn: {
    backgroundColor: '#dc262611',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
    marginTop: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  levelContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 8,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  levelText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  xpBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.darkBorder,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 3,
  },
  xpText: {
    color: COLORS.textTertiary,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
