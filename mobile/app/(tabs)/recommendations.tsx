import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useStore } from '../../store/useStore';
import { getRecommendations } from '../../services/api';
import ActivityCard from '../../components/ActivityCard';
import { UI_TEXT } from '../../constants/translations';

export default function RecommendationsScreen() {
  const { recommendations, user, loading, setRecommendations, setLoading } =
    useStore();

  useEffect(() => {
    async function load() {
      if (!user) return;

      setLoading(true);
      try {
        const data = await getRecommendations(user.id);
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Lütfen giriş yapın</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{UI_TEXT.recommendations.title}</Text>
      </View>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ActivityCard activity={item} showMatchScore={true} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Öneri bulunamadı</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
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
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
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
  message: {
    fontSize: 16,
    color: '#6b7280',
  },
});
