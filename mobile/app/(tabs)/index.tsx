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
import { useStore } from '../../store/useStore';
import { getActivities } from '../../services/api';
import { buildActivityPipeline } from '../../utils/filters';
import ActivityCard from '../../components/ActivityCard';
import { UI_TEXT } from '../../constants/translations';
import { COLORS } from '../../constants/colors';

export default function ActivitiesScreen() {
  const {
    activities,
    filters,
    loading,
    setActivities,
    updateFilters,
    setLoading,
  } = useStore();

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getActivities();
        setActivities(data);
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
            onChangeText={(text) => updateFilters({ search: text })}
          />
        </View>
      </View>

      {/* Activity List */}
      <FlatList
        data={filteredActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard activity={item} />
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
});
