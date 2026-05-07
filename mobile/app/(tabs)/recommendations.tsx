import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StatusBar,
  Dimensions,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getRecommendations, joinActivity } from '../../services/api';
import ActivityCard from '../../components/ActivityCard';
import { Sparkles, BarChart3, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function RecommendationsScreen() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [user?.id]);

  async function loadRecommendations() {
    setLoading(true);
    try {
      // If user exists, fetch real recs. If not, API will fallback to mock.
      const userId = user?.id || 'mock_user_id';
      const data = await getRecommendations(userId);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleJoin = async (id: string) => {
    try {
      const userId = user?.id || 'mock_user_id';
      const res = await joinActivity(id, userId);
      Alert.alert('Başarılı', res.message);
    } catch (e) {
      Alert.alert('Hata', 'Aktiviteye katılamadınız');
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Sana özel aktiviteler hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Background Gradient */}
      <View style={styles.header}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.darkBg]}
          style={styles.headerGradient}
        >
          <View style={styles.headerTitleRow}>
            <Sparkles size={28} color={COLORS.primaryLight} />
            <Text style={styles.title}>Sana Özel</Text>
          </View>
          <Text style={styles.subtitle}>
            Profiline ve tercihlerine en uygun {recommendations.length} aktivite bulundu.
          </Text>
        </LinearGradient>

        {/* Stats Card (Floating) */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mükemmel</Text>
            <Text style={[styles.statValue, { color: COLORS.primaryLight }]}>
              {recommendations.filter(r => (r.match_result?.score || 0) >= 0.8).length}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>İyi Eşleşme</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              {recommendations.filter(r => (r.match_result?.score || 0) >= 0.5 && (r.match_result?.score || 0) < 0.8).length}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ortalama</Text>
            <Text style={[styles.statValue, { color: COLORS.warning }]}>
              {recommendations.filter(r => (r.match_result?.score || 0) < 0.5).length}
            </Text>
          </View>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ActivityCard 
            activity={item} 
            showMatchScore={true} 
            onJoin={() => handleJoin(item.id)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.infoBanner}>
            <Info size={16} color={COLORS.primaryLight} />
            <Text style={styles.infoText}>
              Eşleşme puanı, ilgi alanların ve rekabet seviyen dikkate alınarak hesaplanmıştır.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <BarChart3 size={32} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>Öneri Bulunamadı</Text>
            <Text style={styles.emptySubtitle}>Daha fazla aktivite keşfetmeyi dene!</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    position: 'relative',
    marginBottom: 60,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 80,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  statsCard: {
    position: 'absolute',
    bottom: -40,
    left: 24,
    right: 24,
    backgroundColor: COLORS.darkCard,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    ...SHADOWS.card,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.darkBorder,
  },
  list: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    backgroundColor: COLORS.primaryDark + '22',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryDark + '44',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.darkCard,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: COLORS.textTertiary,
    fontSize: 14,
    marginTop: 4,
  },
});
