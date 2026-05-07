import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { getActivities, joinActivity, getParticipationStatus } from '../../services/api';
import { buildActivityPipeline } from '../../utils/filters';
import ActivityCard from '../../components/ActivityCard';
import { UI_TEXT } from '../../constants/translations';
import { COLORS } from '../../constants/colors';

export default function ActivitiesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [joiningIds, setJoiningIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    search: '',
    category: 'all' as any,
    sortField: 'datetime' as any,
    sortOrder: 'asc' as any,
  });

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    loadActivities();
  }, [user]);

  async function loadActivities() {
    setLoading(true);
    try {
      const [data, statRes] = await Promise.all([
        getActivities(),
        user ? getParticipationStatus() : Promise.resolve({ statuses: {} })
      ]);
      setActivities(data);
      if (statRes && statRes.statuses) {
        setStatuses(statRes.statuses);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleJoin = async (activityId: string) => {
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Giriş Gerekli',
        text2: 'Katılmak için önce giriş yapın',
      });
      return;
    }

    // Prevent double-tap
    if (joiningIds.has(activityId)) return;
    setJoiningIds(prev => new Set(prev).add(activityId));

    // --- Optimistic update: mark as pending ---
    const prevStatuses = { ...statuses };
    setStatuses(prev => ({ ...prev, [activityId]: 'pending' }));

    try {
      const res = await joinActivity(activityId, user.id);

      Toast.show({
        type: 'success',
        text1: 'İstek Gönderildi! ⏳',
        text2: res.activity_title
          ? `"${res.activity_title}" etkinliği için onay bekleniyor`
          : 'Katılım isteğiniz başarıyla iletildi',
      });
    } catch (err: any) {
      // Rollback optimistic update
      setStatuses(prevStatuses);

      const msg: string = err?.message ?? '';
      if (msg.includes('zaten var')) {
        Toast.show({ type: 'info', text1: 'Zaten Beklemede', text2: 'Onay bekleyen bir isteğiniz var' });
        setStatuses(prev => ({ ...prev, [activityId]: 'pending' }));
      } else if (msg.includes('already joined')) {
        Toast.show({ type: 'info', text1: 'Zaten Katıldınız', text2: 'Bu etkinliğe zaten kayıtlısınız' });
        setStatuses(prev => ({ ...prev, [activityId]: 'joined' }));
      } else if (msg.includes('full')) {
        Toast.show({ type: 'error', text1: 'Etkinlik Dolu', text2: 'Maks. katılımcı sayısına ulaşıldı' });
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: msg || 'İstek gönderilemedi' });
      }
    } finally {
      setJoiningIds(prev => {
        const next = new Set(prev);
        next.delete(activityId);
        return next;
      });
    }
  };

  const filteredActivities = useMemo(() => {
    const pipeline = buildActivityPipeline(
      filters.search,
      filters.category,
      filters.sortField,
      filters.sortOrder
    );
    return pipeline(activities);
  }, [activities, filters]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
        <Text style={styles.loadingText}>{UI_TEXT.activities.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient header */}
      <LinearGradient
        colors={['rgba(34,211,238,0.1)', 'transparent']}
        style={styles.headerGradient}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={UI_TEXT.activities.search}
            placeholderTextColor={COLORS.textTertiary}
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
          />
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={Object.keys(CATEGORIES)}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilters({ ...filters, category: item })}
              style={[
                styles.chip,
                filters.category === item && styles.chipActive,
                { borderColor: filters.category === item ? COLORS.primaryLight : COLORS.darkBorder }
              ]}
            >
              <Text 
                style={[
                  styles.chipText,
                  filters.category === item && styles.chipTextActive
                ]}
              >
                {CATEGORIES[item]}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.chipsContent}
        />
      </View>

      {/* Activity List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            userStatus={statuses[item.id]}
            onJoin={() => handleJoin(item.id)}
            onPress={() => router.push(`/activities/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="apps-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>{UI_TEXT.activities.noResults}</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* Results Count */}
      <View style={styles.footer}>
        <Text style={styles.count}>
          {filteredActivities.length} / {activities.length} aktivite
        </Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  headerGradient: {
    height: 150,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.darkCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  list: {
    padding: 16,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 12,
    backgroundColor: COLORS.darkCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
    alignItems: 'center',
  },
  count: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipsContainer: {
    backgroundColor: COLORS.darkCard,
    paddingBottom: 12,
  },
  chipsContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.darkBg,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: COLORS.primary + '20',
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.primaryLight,
  },
});
