import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../../store/useStore';
import { getActivities } from '../../services/api';
import { buildActivityPipeline } from '../../utils/filters';
import ActivityCard from '../../components/ActivityCard';
import { UI_TEXT } from '../../constants/translations';

export default function ActivitiesScreen() {
  const {
    activities,
    filters,
    loading,
    setActivities,
    updateFilters,
    setLoading,
  } = useStore();

  // Fetch activities
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

  // FUNCTIONAL PIPELINE - Pure function composition
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
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>{UI_TEXT.activities.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={UI_TEXT.activities.search}
          value={filters.search}
          onChangeText={(text) => updateFilters({ search: text })}
        />
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
            <Text style={styles.emptyText}>{UI_TEXT.activities.noResults}</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />

      {/* Results Count */}
      <Text style={styles.count}>
        {filteredActivities.length} / {activities.length} aktivite
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  count: {
    textAlign: 'center',
    padding: 12,
    fontSize: 14,
    color: '#6b7280',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
});
