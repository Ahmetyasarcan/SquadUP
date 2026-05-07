import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../store/useStore';
import { updateUser, getUser } from '../services/api';
import { COLORS } from '../constants/colors';
import { CATEGORIES, COMPETITION_LEVELS } from '../constants/translations';
import AvatarPicker from '../components/AvatarPicker';
import { AVATAR_SEEDS } from '../utils/avatars';
import Button from '../components/ui/Button';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const storeUser = useStore(state => state.user);
  const setStoreUser = useStore(state => state.setUser);

  const [form, setForm] = useState({
    name: storeUser?.name || '',
    interests: storeUser?.interests || [],
    competition_level: storeUser?.competition_level || 3,
    avatar_seed: storeUser?.avatar_seed || AVATAR_SEEDS[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !storeUser) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    if (!user) return;
    try {
      const data = await getUser(user.id);
      setForm({
        name: data.name || '',
        interests: data.interests || [],
        competition_level: data.competition_level || 3,
        avatar_seed: data.avatar_seed || AVATAR_SEEDS[0],
      });
      setStoreUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  const toggleInterest = (cat: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(cat)
        ? prev.interests.filter(i => i !== cat)
        : [...prev.interests, cat]
    }));
  };

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    try {
      const updated = await updateUser(user.id, form);
      setStoreUser(updated);
      Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Profil güncellendi' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Hata', text2: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Profili Düzenle', headerTintColor: '#fff', headerStyle: { backgroundColor: COLORS.darkBg } }} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <AvatarPicker 
          currentSeed={form.avatar_seed}
          onSelect={(seed) => setForm({ ...form, avatar_seed: seed })}
        />

        <View style={styles.card}>
          <Text style={styles.label}>Ad Soyad</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              placeholder="Adınız"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>İlgi Alanların</Text>
          <View style={styles.interestsGrid}>
            {Object.keys(CATEGORIES).filter(k => k !== 'all').map(cat => (
              <TouchableOpacity
                key={cat}
                onPress={() => toggleInterest(cat)}
                style={[
                  styles.interestTag,
                  form.interests.includes(cat) && styles.interestTagSelected
                ]}
              >
                <Text style={[
                  styles.interestText,
                  form.interests.includes(cat) && styles.interestTextSelected
                ]}>
                  {CATEGORIES[cat as keyof typeof CATEGORIES]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>
            Rekabet Seviyesi: {COMPETITION_LEVELS[form.competition_level as keyof typeof COMPETITION_LEVELS]}
          </Text>
          <View style={styles.levelContainer}>
            {[1, 2, 3, 4, 5].map(lvl => (
              <TouchableOpacity
                key={lvl}
                onPress={() => setForm({ ...form, competition_level: lvl as any })}
                style={[
                  styles.levelBtn,
                  form.competition_level === lvl && styles.levelBtnSelected
                ]}
              >
                <Text style={[
                  styles.levelBtnText,
                  form.competition_level === lvl && styles.levelBtnTextSelected
                ]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button 
            title="Değişiklikleri Kaydet"
            onPress={handleSave}
            loading={loading}
            style={{ marginTop: 30 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkBg,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.darkCard,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.darkBg,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  interestTagSelected: {
    backgroundColor: COLORS.primary + '22',
    borderColor: COLORS.primaryLight,
  },
  interestText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  interestTextSelected: {
    color: COLORS.primaryLight,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  levelBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.darkBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  levelBtnSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  levelBtnText: {
    color: COLORS.textTertiary,
    fontWeight: 'bold',
  },
  levelBtnTextSelected: {
    color: '#fff',
  },
});
