import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { createActivity } from '../../services/api';
import { COLORS } from '../../constants/colors';
import { CATEGORIES, COMPETITION_LEVELS } from '../../constants/translations';

type Category = 'sports' | 'esports' | 'board_games' | 'outdoor';

const CATEGORY_OPTIONS: { key: Category; icon: string }[] = [
  { key: 'sports',      icon: '⚽' },
  { key: 'esports',     icon: '🎮' },
  { key: 'board_games', icon: '♟️' },
  { key: 'outdoor',     icon: '🏕️' },
];

interface FormState {
  title: string;
  description: string;
  category: Category;
  competition_level: number;
  location: string;
  datetime: string;
  max_participants: number;
}

export default function CreateActivityScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: 'sports',
    competition_level: 3,
    location: '',
    datetime: '',
    max_participants: 10,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.title.trim() || form.title.length < 5)
      return 'Başlık en az 5 karakter olmalı';
    if (!form.description.trim())
      return 'Açıklama giriniz';
    if (!form.location.trim())
      return 'Konum giriniz';
    if (!form.datetime.trim())
      return 'Tarih ve saat giriniz';
    if (form.max_participants < 2)
      return 'En az 2 katılımcı olmalı';
    return null;
  }

  async function handleSubmit() {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Aktivite oluşturmak için giriş yapmanız gerekiyor.');
      return;
    }

    const error = validate();
    if (error) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: error });
      return;
    }

    setLoading(true);
    try {
      const activity = await createActivity({
        ...form,
        creator_id: user.id,
      });

      Toast.show({
        type: 'success',
        text1: 'Aktivite Oluşturuldu! 🎉',
        text2: `"${activity.title}" başarıyla eklendi`,
        visibilityTime: 3000,
      });

      // Go back to activities list
      setTimeout(() => router.replace('/(tabs)'), 1500);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: err?.message || 'Aktivite oluşturulamadı',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Aktivite</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Başlık *</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Kadıköy Halı Saha Maçı"
              placeholderTextColor={COLORS.textTertiary}
              value={form.title}
              onChangeText={v => update('title', v)}
              maxLength={100}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Açıklama *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Aktivite hakkında kısa bir açıklama..."
              placeholderTextColor={COLORS.textTertiary}
              value={form.description}
              onChangeText={v => update('description', v)}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
            <Text style={styles.charCount}>{form.description.length}/500</Text>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={styles.label}>Kategori *</Text>
            <View style={styles.categoryGrid}>
              {CATEGORY_OPTIONS.map(({ key, icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryBtn,
                    form.category === key && styles.categoryBtnActive,
                  ]}
                  onPress={() => update('category', key)}
                >
                  <Text style={styles.categoryIcon}>{icon}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    form.category === key && styles.categoryLabelActive,
                  ]}>
                    {CATEGORIES[key]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Competition Level */}
          <View style={styles.field}>
            <View style={styles.levelHeader}>
              <Text style={styles.label}>Seviye</Text>
              <Text style={styles.levelValue}>{COMPETITION_LEVELS[form.competition_level]}</Text>
            </View>
            <View style={styles.levelBtns}>
              {[1, 2, 3, 4, 5].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelBtn,
                    form.competition_level === level && styles.levelBtnActive,
                  ]}
                  onPress={() => update('competition_level', level)}
                >
                  <Text style={[
                    styles.levelBtnText,
                    form.competition_level === level && styles.levelBtnTextActive,
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Konum *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="Örn: Kadıköy Halı Saha, Online (Discord)"
                placeholderTextColor={COLORS.textTertiary}
                value={form.location}
                onChangeText={v => update('location', v)}
              />
            </View>
          </View>

          {/* Date/Time */}
          <View style={styles.field}>
            <Text style={styles.label}>Tarih ve Saat *</Text>
            <View style={styles.inputRow}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputFlex}
                placeholder="YYYY-AA-GG SS:DD"
                placeholderTextColor={COLORS.textTertiary}
                value={form.datetime}
                onChangeText={v => update('datetime', v)}
              />
            </View>
            <Text style={styles.hint}>Format: 2026-06-15 18:30</Text>
          </View>

          {/* Max Participants */}
          <View style={styles.field}>
            <Text style={styles.label}>Maks. Katılımcı: {form.max_participants}</Text>
            <View style={styles.participantRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => update('max_participants', Math.max(2, form.max_participants - 1))}
              >
                <Ionicons name="remove" size={20} color={COLORS.primaryLight} />
              </TouchableOpacity>
              <Text style={styles.counterValue}>{form.max_participants}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => update('max_participants', Math.min(100, form.max_participants + 1))}
              >
                <Ionicons name="add" size={20} color={COLORS.primaryLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={22} color="#fff" />
                  <Text style={styles.submitText}>Aktivite Oluştur</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkBorder,
    backgroundColor: COLORS.darkCard,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputFlex: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
  },

  // Category
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryBtn: {
    flex: 1,
    minWidth: '44%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  categoryBtnActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryLight + '18',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryLabelActive: {
    color: COLORS.primaryLight,
  },

  // Competition level
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  levelBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  levelBtnActive: {
    backgroundColor: COLORS.primaryLight + '28',
    borderColor: COLORS.primaryLight,
  },
  levelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    fontSize: 16,
  },
  levelBtnTextActive: {
    color: COLORS.primaryLight,
  },

  // Participants counter
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },

  // Buttons
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cancelBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
