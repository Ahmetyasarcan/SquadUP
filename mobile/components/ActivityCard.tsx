import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Activity } from '../types';
import { CATEGORIES, COMPETITION_LEVELS } from '../constants/translations';
import { formatDateTime } from '../utils/formatters';
import Button from './ui/Button';

interface ActivityCardProps {
  activity: Activity;
  onPress?: () => void;
  onJoin?: () => void;
  showMatchScore?: boolean;
}

export default function ActivityCard({
  activity,
  onPress,
  onJoin,
  showMatchScore = false,
}: ActivityCardProps) {
  const isFull = activity.current_participants >= activity.max_participants;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Match Score Badge */}
      {showMatchScore && activity.match_score && (
        <View
          style={[
            styles.badge,
            activity.match_score > 0.8 ? styles.perfectMatch : styles.goodMatch,
          ]}
        >
          <Text style={styles.badgeText}>
            {activity.match_score > 0.8 ? '🎯 Mükemmel' : '✨ İyi'} 
            {' '}({Math.round(activity.match_score * 100)}%)
          </Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>{activity.title}</Text>

      {/* Category & Level */}
      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{CATEGORIES[activity.category]}</Text>
        </View>
        <View style={[styles.tag, styles.levelTag]}>
          <Text style={styles.tagText}>
            {COMPETITION_LEVELS[activity.competition_level]}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {activity.description}
      </Text>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{formatDateTime(activity.datetime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>{activity.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={16} color="#6b7280" />
          <Text style={styles.infoText}>
            {activity.current_participants} / {activity.max_participants}
          </Text>
        </View>
      </View>

      {/* Join Button */}
      {onJoin && (
        <Button
          title={isFull ? 'Dolu' : 'Katıl'}
          onPress={onJoin}
          disabled={isFull}
          variant="primary"
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  perfectMatch: {
    backgroundColor: '#d1fae5',
  },
  goodMatch: {
    backgroundColor: '#dbeafe',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelTag: {
    backgroundColor: '#f3f4f6',
  },
  tagText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  info: {
    gap: 6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
