// mobile/src/components/ActivityCard.js
// =======================================
// Reusable activity card for the mobile feed and recommendations screens.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getCategoryLabel, getMatchLabelInfo, UI_TEXT } from '../constants/translations';
import { useActivityStore } from '../store/activityStore';

const CATEGORY_COLORS = {
  sports:      { bg: '#ecfdf5', accent: '#059669' },
  esports:     { bg: '#eff6ff', accent: '#2563eb' },
  board_games: { bg: '#fdf4ff', accent: '#9333ea' },
  outdoor:     { bg: '#fff7ed', accent: '#ea580c' },
};

export default function ActivityCard({ activity, matchResult = null }) {
  const joinActivity = useActivityStore(s => s.joinActivity);
  const joinedIds = useActivityStore(s => s.joinedIds);
  const [loading, setLoading] = useState(false);

  const t = UI_TEXT.feed;
  const catColors = CATEGORY_COLORS[activity.category] || { bg: '#f3f4f6', accent: '#6366f1' };
  const isJoined = joinedIds.includes(activity.id);
  const isFull = (activity.participant_count || 0) >= activity.max_participants;

  const handleJoin = async () => {
    if (isJoined || isFull) return;
    setLoading(true);
    const success = await joinActivity(activity.id);
    if (success) Alert.alert('✓', t.joinSuccess);
    else Alert.alert('Hata', t.joinError);
    setLoading(false);
  };

  const scoreInfo = matchResult ? getMatchLabelInfo(matchResult.label) : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{activity.title}</Text>
        <View style={[styles.badge, { backgroundColor: catColors.bg }]}>
          <Text style={[styles.badgeText, { color: catColors.accent }]}>
            {getCategoryLabel(activity.category)}
          </Text>
        </View>
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>📍 {activity.location}</Text>
        <Text style={styles.meta}>👥 {activity.participant_count || 0}/{activity.max_participants}</Text>
        <Text style={styles.meta}>⚔️ {t.level} {activity.competition_level}</Text>
      </View>

      {/* Match score (recommendations only) */}
      {matchResult && (
        <View style={styles.scoreBox}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>{UI_TEXT.recommendations.score}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.scoreValue}>
                {Math.round(matchResult.final_score * 100)}%
              </Text>
              <View style={[styles.matchBadge, { backgroundColor: scoreInfo.color + '22' }]}>
                <Text style={[styles.matchBadgeText, { color: scoreInfo.color }]}>
                  {scoreInfo.text}
                </Text>
              </View>
            </View>
          </View>

          {/* Score bar */}
          <View style={styles.barBg}>
            <View style={[
              styles.barFill,
              { width: `${Math.round(matchResult.final_score * 100)}%`, backgroundColor: scoreInfo.color }
            ]} />
          </View>

          {/* Breakdown */}
          <View style={styles.breakdown}>
            {[
              { key: 'interest', label: 'İlgi' },
              { key: 'competition', label: 'Rekabet' },
              { key: 'reliability', label: 'Güvenilirlik' },
            ].map(({ key, label }) => (
              <View key={key} style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>{label}</Text>
                <Text style={styles.breakdownValue}>
                  {Math.round(matchResult.breakdown[key].score * 100)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Join button */}
      <TouchableOpacity
        style={[
          styles.joinBtn,
          isJoined && styles.joinBtnJoined,
          isFull && styles.joinBtnFull,
        ]}
        onPress={handleJoin}
        disabled={isJoined || isFull || loading}
      >
        <Text style={[
          styles.joinBtnText,
          isJoined && { color: '#166534' },
          isFull && { color: '#9ca3af' },
        ]}>
          {loading ? '...' : isJoined ? t.joined : isFull ? t.full : t.join}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  meta: { fontSize: 12, color: '#6b7280' },
  scoreBox: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  scoreValue: { fontSize: 15, fontWeight: '800', color: '#1e293b' },
  matchBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  matchBadgeText: { fontSize: 10, fontWeight: '700' },
  barBg: { height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  breakdown: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  breakdownItem: { alignItems: 'center' },
  breakdownLabel: { fontSize: 10, color: '#9ca3af' },
  breakdownValue: { fontSize: 12, fontWeight: '700', color: '#475569' },
  joinBtn: {
    backgroundColor: '#6366f1', borderRadius: 8, paddingVertical: 10,
    alignItems: 'center', marginTop: 4,
  },
  joinBtnJoined: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#86efac' },
  joinBtnFull: { backgroundColor: '#f3f4f6' },
  joinBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
