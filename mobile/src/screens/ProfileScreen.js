// mobile/src/screens/ProfileScreen.js
// =====================================
// Profile screen — create a local profile and store it in Zustand.
// Demonstrates immutable state management.

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, Switch,
} from 'react-native';
import { useActivityStore } from '../store/activityStore';
import { UI_TEXT, ALL_INTEREST_TAGS } from '../constants/translations';

// Re-export ALL_INTEREST_TAGS (same content as web, for mobile)
const INTEREST_TAGS = [
  { key: 'futbol', label: 'Futbol' }, { key: 'basketbol', label: 'Basketbol' },
  { key: 'voleybol', label: 'Voleybol' }, { key: 'koşu', label: 'Koşu' },
  { key: 'fitness', label: 'Fitness' }, { key: 'valorant', label: 'Valorant' },
  { key: 'lol', label: 'LoL' }, { key: 'cs2', label: 'CS2' },
  { key: 'satranç', label: 'Satranç' }, { key: 'catan', label: 'Catan' },
  { key: 'doğa yürüyüşü', label: 'Doğa Yürüyüşü' }, { key: 'kamp', label: 'Kamp' },
];

const COMPETITION_LABELS = {
  1: 'Yeni Başlayan', 2: 'Geliştirici', 3: 'Orta Seviye', 4: 'İleri Seviye', 5: 'Profesyonel',
};

export default function ProfileScreen() {
  const t = UI_TEXT.profile;
  const createUser = useActivityStore(s => s.createUser);
  const currentUser = useActivityStore(s => s.user);

  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [compLevel, setCompLevel] = useState(3);
  const [loading, setLoading] = useState(false);

  // Pure toggle: creates new array without mutating current
  const toggleInterest = (key) => {
    setSelectedInterests(prev =>
      prev.includes(key)
        ? prev.filter(i => i !== key)   // remove (new array)
        : [...prev, key]                // add (spread = new array)
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Uyarı', UI_TEXT.common.fillAll);
      return;
    }
    setLoading(true);
    const user = await createUser({
      name: name.trim(),
      interests: selectedInterests,
      competition_level: compLevel,
    });
    setLoading(false);
    if (user) Alert.alert('✓', t.saved);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>👤 {t.title}</Text>

      {/* Show current profile */}
      {currentUser && (
        <View style={styles.currentProfile}>
          <Text style={styles.profileName}>{currentUser.name}</Text>
          <Text style={styles.profileId}>ID: {currentUser.id}</Text>
          <Text style={styles.profileMeta}>
            Seviye: {COMPETITION_LABELS[currentUser.competition_level]} ·
            İlgi: {currentUser.interests?.join(', ') || 'Belirtilmemiş'}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>{t.name}</Text>
        <TextInput
          style={styles.input}
          placeholder="Adınızı girin"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Competition level picker */}
      <View style={styles.section}>
        <Text style={styles.label}>{t.competitionLevel}</Text>
        <View style={styles.levelRow}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.levelBtn, compLevel === n && styles.levelBtnActive]}
              onPress={() => setCompLevel(n)}
            >
              <Text style={[styles.levelBtnText, compLevel === n && styles.levelBtnTextActive]}>
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.levelLabel}>{COMPETITION_LABELS[compLevel]}</Text>
      </View>

      {/* Interest tags */}
      <View style={styles.section}>
        <Text style={styles.label}>{t.interests}</Text>
        <View style={styles.tagsGrid}>
          {INTEREST_TAGS.map(tag => {
            const isSelected = selectedInterests.includes(tag.key);
            return (
              <TouchableOpacity
                key={tag.key}
                style={[styles.tag, isSelected && styles.tagActive]}
                onPress={() => toggleInterest(tag.key)}
              >
                <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        <Text style={styles.saveBtnText}>{loading ? '...' : t.save}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 16 },
  currentProfile: {
    backgroundColor: '#eef2ff', borderRadius: 10, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#c7d2fe',
  },
  profileName: { fontSize: 16, fontWeight: '700', color: '#3730a3' },
  profileId: { fontSize: 10, color: '#6366f1', fontFamily: 'monospace', marginTop: 2 },
  profileMeta: { fontSize: 12, color: '#4338ca', marginTop: 4 },
  section: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 8,
    padding: 12, fontSize: 15, backgroundColor: '#fff',
  },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5,
    borderColor: '#e5e7eb', alignItems: 'center', backgroundColor: '#fff',
  },
  levelBtnActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  levelBtnText: { fontSize: 16, fontWeight: '700', color: '#9ca3af' },
  levelBtnTextActive: { color: '#4338ca' },
  levelLabel: { marginTop: 8, textAlign: 'center', color: '#6366f1', fontWeight: '600', fontSize: 13 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
  },
  tagActive: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  tagText: { fontSize: 13, color: '#374151' },
  tagTextActive: { color: '#4338ca', fontWeight: '600' },
  saveBtn: { backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
