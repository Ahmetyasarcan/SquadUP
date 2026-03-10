// mobile/src/screens/RecommendationsScreen.js
// ==============================================
// Personalized recommendations using the functional pipeline from utils/pipeline.js
// Demonstrates the required filter→map→filter→sort chain.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useActivityStore } from '../store/activityStore';
import { buildRecommendations, computeRecommendationStats } from '../utils/pipeline';
import ActivityCard from '../components/ActivityCard';
import { UI_TEXT } from '../constants/translations';

export default function RecommendationsScreen() {
  const t = UI_TEXT.recommendations;
  const activities = useActivityStore(s => s.activities);
  const joinedIds  = useActivityStore(s => s.joinedIds);
  const user       = useActivityStore(s => s.user);

  const [loading, setLoading]               = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats]                   = useState(null);
  const [fetched, setFetched]               = useState(false);

  const handleGetRecommendations = () => {
    if (!user) return;
    setLoading(true);

    // Run the functional pipeline (filter→map→filter→sort→slice)
    // This is the core FP demonstration for the mobile app.
    const results = buildRecommendations({
      user,
      activities,
      joinedActivityIds: joinedIds,
      minScore: 0.3,
      topN: 10,
    });

    setRecommendations(results);
    setStats(computeRecommendationStats(results));
    setFetched(true);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recommendations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ActivityCard activity={item} matchResult={item.match_result} />
        )}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.title}>⭐ {t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>

            {!user ? (
              <View style={styles.noProfileBox}>
                <Text style={styles.noProfile}>Öneri almak için önce "Profilim" sekmesinden profil oluşturun.</Text>
              </View>
            ) : (
              <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>👤 {user.name}</Text>
                <TouchableOpacity style={styles.button} onPress={handleGetRecommendations} disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.buttonText}>{t.get_button}</Text>
                  }
                </TouchableOpacity>
              </View>
            )}

            {/* Stats row */}
            {stats && (
              <View style={styles.statsRow}>
                {[
                  { label: 'Toplam', value: stats.count },
                  { label: 'Mükemmel', value: stats.perfect, color: '#10b981' },
                  { label: 'İyi', value: stats.good, color: '#3b82f6' },
                  { label: 'Ort. Skor', value: `${stats.avgScore}%`, color: '#6366f1' },
                ].map(s => (
                  <View key={s.label} style={styles.statCard}>
                    <Text style={[styles.statValue, s.color && { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={fetched ? (
          <Text style={styles.empty}>{t.noResults}</Text>
        ) : null}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  list: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  noProfileBox: { backgroundColor: '#fef9c3', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#fde047', marginBottom: 16 },
  noProfile: { color: '#854d0e', fontSize: 13, textAlign: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  userInfoText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  button: { backgroundColor: '#6366f1', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 70, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', padding: 10, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#4338ca' },
  statLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 32 },
});
