import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'neon';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: ButtonProps) {
  
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.button, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, SHADOWS.glowCyan]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textPrimary}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.button, disabled && styles.disabled]}
      >
        <LinearGradient
          colors={[COLORS.secondary, COLORS.secondaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, SHADOWS.glowPurple]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textPrimary}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  if (variant === 'neon') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.button, disabled && styles.disabled]}
      >
        <View style={[styles.neonButton, SHADOWS.glowCyan]}>
          {loading ? (
            <ActivityIndicator color={COLORS.primaryLight} />
          ) : (
            <Text style={styles.textNeon}>{title}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[styles.button, styles.ghostButton, disabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.textSecondary} />
      ) : (
        <Text style={styles.textGhost}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  neonButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  ghostButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: COLORS.darkCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  disabled: {
    opacity: 0.5,
  },
  textPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  textNeon: {
    color: COLORS.primaryLight,
    fontSize: 16,
    fontWeight: '700',
  },
  textGhost: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});
