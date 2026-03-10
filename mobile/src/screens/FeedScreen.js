// mobile/src/screens/FeedScreen.js
// ===================================
// Home feed — shows all activities.
// Fetches from API on mount (useEffect), displays in ActivityCard list.

import React, { useEffect } from 'react';
import {
  View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useActivityStore } from '../store/activityStore';
import ActivityCard from '../components/ActivityCard';
import { UI_TEXT } from '../constants/translations';

export default function FeedScreen() {
  const activities    = useActivityStore(s => s.activities);
  const loading       = useActivityStore(s => s.loading);
  const error         = useActivityStore(s => s.error);
  const fetchActivities = useActivityStore(s => s.fetchActivities);

  // Fetch on mount
  useEffect(() => { fetchActivities(); }, []);

  if (loading && activities.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>{UI_TEXT.common.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ActivityCard activity={item} />}
        ListHeaderComponent={
          <Text style={styles.header}>🎯 {UI_TEXT.feed.title}</Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{UI_TEXT.feed.noActivities}</Text>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchActivities} tintColor="#6366f1" />
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#6b7280', fontSize: 14 },
  header:    { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
  empty:     { textAlign: 'center', color: '#9ca3af', fontSize: 15, marginTop: 40 },
  list:      { padding: 16 },
});
