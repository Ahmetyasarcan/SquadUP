import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import AvatarPicker from '../../components/AvatarPicker';
import { AVATAR_SEEDS } from '../../utils/avatars';

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar_seed: AVATAR_SEEDS[0],
  });
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: keyof typeof form) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  async function handleRegister() {
    const { name, email, password, confirmPassword } = form;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen tüm alanları doldurun' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({ type: 'error', text1: 'Geçersiz Email', text2: 'Geçerli bir email adresi girin' });
      return;
    }

    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Şifre Çok Kısa', text2: 'Şifre en az 6 karakter olmalı' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Şifreler Eşleşmiyor', text2: 'Lütfen aynı şifreyi girin' });
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim(), form.avatar_seed);
      // signUp shows success toast; redirect to login after a short delay
      setTimeout(() => router.replace('/(auth)/login'), 2000);
    } catch (error: any) {
      const msg: string = error?.message ?? '';

      if (msg.includes('already registered') || msg.includes('already been registered')) {
        Toast.show({ type: 'error', text1: 'Email Zaten Kayıtlı', text2: 'Bu email adresi zaten kullanılıyor' });
      } else if (msg.includes('Password should be')) {
        Toast.show({ type: 'error', text1: 'Şifre Geçersiz', text2: 'Şifre en az 6 karakter olmalı' });
      } else {
        Toast.show({ type: 'error', text1: 'Kayıt Başarısız', text2: msg || 'Bir hata oluştu' });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background orbs */}
      <View style={styles.bg}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={[COLORS.secondary, COLORS.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoLetter}>S</Text>
          </LinearGradient>
          <Text style={styles.appName}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Aktivite dünyasına katıl 🎯</Text>
        </View>

        {/* Avatar Picker */}
        <AvatarPicker 
          currentSeed={form.avatar_seed} 
          onSelect={(seed) => setForm({ ...form, avatar_seed: seed })} 
        />

        {/* Card */}
        <View style={styles.card}>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="squad_player"
                placeholderTextColor={COLORS.textTertiary}
                value={form.name}
                onChangeText={update('name')}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor={COLORS.textTertiary}
                value={form.email}
                onChangeText={update('email')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textTertiary}
                value={form.password}
                onChangeText={update('password')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>En az 6 karakter</Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <View style={[
              styles.inputRow,
              form.confirmPassword.length > 0 && {
                borderColor: form.confirmPassword === form.password
                  ? COLORS.success
                  : COLORS.error,
              },
            ]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textTertiary}
                value={form.confirmPassword}
                onChangeText={update('confirmPassword')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {form.confirmPassword.length > 0 && (
                <Ionicons
                  name={form.confirmPassword === form.password ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={form.confirmPassword === form.password ? COLORS.success : COLORS.error}
                />
              )}
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Kayıt Ol</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>veya</Text>
            <View style={styles.divLine} />
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  bg:        { ...StyleSheet.absoluteFillObject },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.25,
  },
  orb1: {
    top: 60, right: -60,
    width: 260, height: 260,
    backgroundColor: COLORS.secondary,
  },
  orb2: {
    bottom: 80, left: -60,
    width: 300, height: 300,
    backgroundColor: COLORS.primary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 80, height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  logoLetter: { fontSize: 40, fontWeight: '900', color: '#fff' },
  appName:    { fontSize: 32, fontWeight: '900', color: COLORS.primaryLight, marginBottom: 6 },
  subtitle:   { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.darkCard + 'CC',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  field: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, fontSize: 16, color: COLORS.textPrimary },
  hint:      { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.darkBorder },
  divText: { marginHorizontal: 16, fontSize: 14, color: COLORS.textSecondary },

  loginRow:  { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '700' },
});
