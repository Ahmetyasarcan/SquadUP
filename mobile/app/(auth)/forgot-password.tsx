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

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false); // show success state after send

  async function handleReset() {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen email adresinizi girin' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({ type: 'error', text1: 'Geçersiz Email', text2: 'Geçerli bir email adresi girin' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      Toast.show({ type: 'error', text1: 'Hata', text2: msg || 'Bir hata oluştu' });
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
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={[COLORS.warning, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Ionicons name="lock-open-outline" size={36} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>Şifremi Unuttum</Text>
          <Text style={styles.subtitle}>
            Email adresinize şifre sıfırlama linki göndereceğiz
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          {!sent ? (
            <>
              {/* Email Input */}
              <View style={styles.field}>
                <Text style={styles.label}>Email Adresin</Text>
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
                    autoFocus
                  />
                </View>
              </View>

              {/* Send Button */}
              <TouchableOpacity onPress={handleReset} disabled={loading} activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.warning, COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.btn}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={20} color="#fff" />
                      <Text style={styles.btnText}>Link Gönder</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            /* Success State */
            <View style={styles.successWrap}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>Email Gönderildi! 📧</Text>
              <Text style={styles.successText}>
                <Text style={styles.successEmail}>{email}</Text>
                {' '}adresine şifre sıfırlama linki gönderdik.{'\n'}
                Spam klasörünü de kontrol etmeyi unutma.
              </Text>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={() => { setSent(false); setEmail(''); }}
              >
                <Text style={styles.resendText}>Farklı email dene</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>veya</Text>
            <View style={styles.divLine} />
          </View>

          {/* Back to Login */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Şifreni hatırladın mı? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
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
    opacity: 0.2,
  },
  orb1: {
    top: 40, left: -80,
    width: 280, height: 280,
    backgroundColor: COLORS.warning,
  },
  orb2: {
    bottom: 60, right: -80,
    width: 280, height: 280,
    backgroundColor: COLORS.primary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.darkCard,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoWrap: { alignItems: 'center', marginBottom: 32, marginTop: 60 },
  logo: {
    width: 80, height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  appName:  { fontSize: 28, fontWeight: '900', color: COLORS.primaryLight, marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

  card: {
    backgroundColor: COLORS.darkCard + 'CC',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.darkBorder,
  },
  field: { marginBottom: 20 },
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

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Success state
  successWrap:  { alignItems: 'center', paddingVertical: 8 },
  successIcon:  { marginBottom: 16 },
  successTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  successText:  { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  successEmail: { color: COLORS.primaryLight, fontWeight: '700' },
  resendBtn:    { marginTop: 20 },
  resendText:   { fontSize: 14, color: COLORS.textTertiary, textDecorationLine: 'underline' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divLine: { flex: 1, height: 1, backgroundColor: COLORS.darkBorder },
  divText: { marginHorizontal: 16, fontSize: 14, color: COLORS.textSecondary },

  loginRow:  { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, color: COLORS.primaryLight, fontWeight: '700' },
});
