import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getAvatarUrl, AVATAR_SEEDS } from '../utils/avatars';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface AvatarPickerProps {
  currentSeed: string;
  onSelect: (seed: string) => void;
}

export default function AvatarPicker({ currentSeed, onSelect }: AvatarPickerProps) {
  const currentIndex = AVATAR_SEEDS.indexOf(currentSeed);
  
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % AVATAR_SEEDS.length;
    onSelect(AVATAR_SEEDS[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + AVATAR_SEEDS.length) % AVATAR_SEEDS.length;
    onSelect(AVATAR_SEEDS[prevIndex]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        <TouchableOpacity onPress={handlePrev} style={styles.arrowButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primaryLight} />
        </TouchableOpacity>

        <View style={styles.avatarLarge}>
          <Image 
            source={{ uri: getAvatarUrl(currentSeed) }} 
            style={styles.avatarImage} 
          />
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primaryLight} />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Karakterini Seç</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.list}
      >
        {AVATAR_SEEDS.map(seed => (
          <TouchableOpacity
            key={seed}
            onPress={() => onSelect(seed)}
            style={[
              styles.avatarSmall,
              currentSeed === seed && styles.avatarSmallSelected
            ]}
          >
            <Image 
              source={{ uri: getAvatarUrl(seed) }} 
              style={styles.avatarImageSmall} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 10,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.darkCard,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: COLORS.primaryLight,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 15,
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.darkCard,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.6,
  },
  avatarSmallSelected: {
    borderColor: COLORS.primaryLight,
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  avatarImageSmall: {
    width: '100%',
    height: '100%',
  },
});
