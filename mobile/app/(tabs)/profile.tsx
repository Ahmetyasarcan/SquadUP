import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import { UI_TEXT, CATEGORIES } from '../../constants/translations';

export default function ProfileScreen() {
  const { user } = useStore();

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
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{UI_TEXT.profile.interests}</Text>
        <View style={styles.tags}>
          {user.interests.map((interest) => (
            <View key={interest} style={styles.tag}>
              <Text style={styles.tagText}>{CATEGORIES[interest]}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İstatistikler</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.joined_events}</Text>
            <Text style={styles.statLabel}>Katıldı</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.attended_events}</Text>
            <Text style={styles.statLabel}>Tamamladı</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {Math.round(user.reliability_score * 100)}%
            </Text>
            <Text style={styles.statLabel}>Güvenilirlik</Text>
          </View>
        </View>
      </View>
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
  message: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});
