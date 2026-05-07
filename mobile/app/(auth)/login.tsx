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

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen tüm alanları doldurun' });
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      const msg: string = error?.message ?? '';

      if (msg.includes('Invalid login credentials')) {
        Toast.show({ type: 'error', text1: 'Giriş Başarısız', text2: 'Email veya şifre hatalı' });
      } else if (msg.includes('Email not confirmed')) {
        Toast.show({ type: 'error', text1: 'Email Onayı Gerekli', text2: 'Lütfen email adresinizi onaylayın' });
      } else if (msg.includes('Too many requests')) {
        Toast.show({ type: 'error', text1: 'Çok Fazla Deneme', text2: 'Lütfen biraz bekleyin' });
      } else {
        Toast.show({ type: 'error', text1: 'Hata', text2: msg || 'Bir hata oluştu' });
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
            colors={[COLORS.primaryLight, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoLetter}>S</Text>
          </LinearGradient>
          <Text style={styles.appName}>SquadUp</Text>
          <Text style={styles.subtitle}>Hoş geldin! Giriş yap ve aktivitelere katıl</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
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
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => router.push('/(auth)/forgot-password')}
          >
            <Text style={styles.forgotText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Giriş Yap</Text>
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

          {/* Signup link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Hesabın yok mu? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>SquadUp ile aktivite bul, takım kur 🚀</Text>
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
    top: 60, left: -60,
    width: 260, height: 260,
    backgroundColor: COLORS.primary,
  },
  orb2: {
    bottom: 80, right: -60,
    width: 300, height: 300,
    backgroundColor: COLORS.secondary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logo: {
    width: 80, height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  logoLetter: { fontSize: 40, fontWeight: '900', color: '#fff' },
  appName:   { fontSize: 32, fontWeight: '900', color: COLORS.primaryLight, marginBottom: 6 },
  subtitle:  { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: COLORS.darkCard + 'CC',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  field:     { marginBottom: 20 },
  label:     { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
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
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '600' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  divider:  { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine:  { flex: 1, height: 1, backgroundColor: COLORS.darkBorder },
  divText:  { marginHorizontal: 16, fontSize: 14, color: COLORS.textSecondary },

  signupRow:  { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontSize: 14, color: COLORS.textSecondary },
  signupLink: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '700' },

  footer: { textAlign: 'center', fontSize: 12, color: COLORS.textTertiary, marginTop: 24 },
});
