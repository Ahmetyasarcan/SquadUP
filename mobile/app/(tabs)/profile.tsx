import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';
import { useStore } from '../../store/useStore';
import { logout as apiLogout } from '../../services/api';
import { UI_TEXT, CATEGORIES } from '../../constants/translations';
import { COLORS } from '../../constants/colors';
import { 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Award, 
  Calendar, 
  ShieldCheck,
  ChevronRight,
  Heart,
  Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, setUser } = useStore();
  const router = useRouter();

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
            await apiLogout();
            setUser(null);
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  if (!user) return null;

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
            <LinearGradient
              colors={[COLORS.primaryLight, COLORS.secondary]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
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
              <Text style={styles.statValue}>{user.joined_events}</Text>
              <Text style={styles.statLabel}>Katıldı</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: COLORS.secondary + '22' }]}>
                <Award size={20} color={COLORS.secondary} />
              </View>
              <Text style={styles.statValue}>{user.attended_events}</Text>
              <Text style={styles.statLabel}>Tamamladı</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: '#10b98122' }]}>
                <ShieldCheck size={20} color="#10b981" />
              </View>
              <Text style={styles.statValue}>%{Math.round((user.reliability_score || 0.5) * 100)}</Text>
              <Text style={styles.statLabel}>Güven</Text>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        {user.badges && user.badges.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color={COLORS.primaryLight} />
              <Text style={styles.sectionTitle}>Kazanılan Rozetler</Text>
            </View>
            <View style={styles.badgesList}>
              {user.badges.map((badge) => {
                const badgeData: Record<string, { label: string, color: string, icon: string }> = {
                  active_squadmate: { label: 'Aktif Oyuncu', color: COLORS.primaryLight, icon: '⚡' },
                  squad_legend: { label: 'Efsane', color: COLORS.secondary, icon: '👑' },
                  verified: { label: 'Onaylı', color: '#3b82f6', icon: '✔' },
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color="#e11d48" />
            <Text style={styles.sectionTitle}>İlgi Alanların</Text>
          </View>
          <View style={styles.interestsList}>
            {user.interests.map((interest) => (
              <View key={interest} style={styles.interestTag}>
                <Text style={styles.interestText}>
                  {CATEGORIES[interest as keyof typeof CATEGORIES] || interest}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
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
  avatarGradient: {
    flex: 1,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
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
});
