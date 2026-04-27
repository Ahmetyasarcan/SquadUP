import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Activity } from '../types';
import { CATEGORIES, COMPETITION_LEVELS } from '../constants/translations';
import { formatDateTime } from '../utils/formatters';
import { COLORS, SHADOWS } from '../constants/colors';
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
  const spotsLeft = activity.max_participants - activity.current_participants;
  const matchScore = activity.match_result?.score || activity.match_score || 0;

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.card]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Gradient overlay */}
      <LinearGradient
        colors={COLORS.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />

      <View style={styles.content}>
        {/* Match Score Badge */}
        {showMatchScore && matchScore > 0 && (
          <View style={styles.badgeContainer}>
            {matchScore > 0.8 ? (
              <LinearGradient
                colors={COLORS.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.badge, SHADOWS.glowCyan]}
              >
                <Text style={styles.badgeTextWhite}>
                  🎯 Mükemmel {Math.round(matchScore * 100)}%
                </Text>
              </LinearGradient>
            ) : (
              <View style={[styles.badgeOutline, { borderColor: COLORS.primaryLight }]}>
                <Text style={[styles.badgeTextOutline, { color: COLORS.primaryLight }]}>
                  ✨ İyi {Math.round(matchScore * 100)}%
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        {/* Tags */}
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary + '66' }]}>
            <Text style={[styles.tagText, { color: COLORS.primaryLight }]}>
              {CATEGORIES[activity.category as keyof typeof CATEGORIES] || activity.category}
            </Text>
          </View>
          <View style={[styles.tag, { backgroundColor: COLORS.secondary + '33', borderColor: COLORS.secondary + '66' }]}>
            <Ionicons name="trophy" size={12} color={COLORS.secondaryLight} />
            <Text style={[styles.tagText, { color: COLORS.secondaryLight }]}>
              {COMPETITION_LEVELS[activity.competition_level as keyof typeof COMPETITION_LEVELS] || activity.competition_level}
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
            <Ionicons name="calendar-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.infoText}>{formatDateTime(activity.datetime)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.infoText} numberOfLines={1}>
              {activity.location}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color={COLORS.primaryLight} />
            <Text style={styles.infoText}>
              {activity.current_participants} / {activity.max_participants}
              {!isFull && spotsLeft <= 3 && (
                <Text style={styles.spotsWarning}> (Son {spotsLeft} kişi!)</Text>
              )}
            </Text>
          </View>

          {/* Participants Avatars */}
          {activity.participants && activity.participants.length > 0 && (
            <View style={styles.participantsContainer}>
              <View style={styles.avatarStack}>
                {activity.participants.slice(0, 4).map((p, i) => (
                  <View 
                    key={p.id} 
                    style={[
                      styles.avatarSmall, 
                      { marginLeft: i === 0 ? 0 : -10, zIndex: 10 - i }
                    ]}
                  >
                    <Text style={styles.avatarSmallText}>{p.name.charAt(0).toUpperCase()}</Text>
                  </View>
                ))}
              </View>
              {activity.participants.length > 0 && (
                <Text style={styles.socialProofText}>
                   Daha şimdiden {activity.participants.length} kişi katıldı!
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Join Button */}
        {onJoin && (
          <Button
            title={isFull ? 'Dolu' : 'Katıl'}
            onPress={onJoin}
            variant={isFull ? 'ghost' : 'neon'}
            disabled={isFull}
          />
        )}
      </View>

      {/* Border glow on top */}
      <View style={[styles.topBorder, { backgroundColor: COLORS.primaryLight }]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.darkCard,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: {
    padding: 16,
    position: 'relative',
    zIndex: 1,
  },
  badgeContainer: {
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeOutline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.darkCard,
  },
  badgeTextWhite: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextOutline: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  info: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  spotsWarning: {
    color: COLORS.warning,
    fontWeight: '700',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.secondary,
    borderWidth: 1.5,
    borderColor: COLORS.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  socialProofText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
