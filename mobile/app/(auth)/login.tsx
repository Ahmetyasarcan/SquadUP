import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { useStore } from '../../store/useStore';
import { login } from '../../services/api';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledScrollView = styled(ScrollView);
const StyledLinearGradient = styled(LinearGradient);

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await login({ email, password });
      setUser(data.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledKeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <StyledLinearGradient
        colors={['#0c4a6e', '#0284c7', '#f8fafc']}
        className="flex-1"
      >
        <StyledScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-20">
          {/* Logo Area */}
          <StyledView className="items-center mb-12">
            <StyledView className="w-20 h-20 bg-primary-600 rounded-3xl items-center justify-center shadow-lg shadow-primary-500/50">
              <StyledText className="text-white text-4xl font-extrabold">S</StyledText>
            </StyledView>
            <StyledText className="text-white text-3xl font-extrabold mt-6">SquadUp</StyledText>
            <StyledText className="text-blue-100 mt-2">Takımını kur, maceraya katıl</StyledText>
          </StyledView>

          {/* Form */}
          <StyledView className="bg-white/95 p-8 rounded-[40px] shadow-2xl border border-white/50">
            <StyledText className="text-xl font-bold text-gray-900 mb-6">Giriş Yap</StyledText>

            {error && (
              <StyledView className="bg-red-50 p-4 rounded-2xl mb-4 border border-red-100">
                <StyledText className="text-red-600 text-sm">{error}</StyledText>
              </StyledView>
            )}

            <StyledView className="space-y-4">
              {/* Email Input */}
              <StyledView className="space-y-2">
                <StyledText className="text-sm font-semibold text-gray-700 ml-1">E-posta</StyledText>
                <StyledView className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                  <Mail size={20} color="#64748b" />
                  <StyledTextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="ornek@email.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </StyledView>
              </StyledView>

              {/* Password Input */}
              <StyledView className="space-y-2">
                <StyledText className="text-sm font-semibold text-gray-700 ml-1">Şifre</StyledText>
                <StyledView className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                  <Lock size={20} color="#64748b" />
                  <StyledTextInput
                    className="flex-1 ml-3 text-gray-900"
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </StyledView>
              </StyledView>

              {/* Forgot Password */}
              <StyledTouchableOpacity className="items-end">
                <StyledText className="text-primary-600 text-sm font-medium">Şifremi Unuttum</StyledText>
              </StyledTouchableOpacity>

              {/* Login Button */}
              <StyledTouchableOpacity 
                onPress={handleLogin}
                disabled={isLoading}
                className={`mt-4 py-4 rounded-2xl flex-row items-center justify-center ${
                  isLoading ? 'bg-primary-400' : 'bg-primary-600 shadow-md shadow-primary-500/40'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <StyledText className="text-white font-bold text-lg mr-2">Giriş Yap</StyledText>
                    <LogIn size={20} color="white" />
                  </>
                )}
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>

          {/* Footer */}
          <StyledView className="flex-row justify-center mt-12 mb-10">
            <StyledText className="text-gray-500">Hesabın yok mu? </StyledText>
            <Link href="/(auth)/register" asChild>
              <StyledTouchableOpacity>
                <StyledText className="text-primary-600 font-bold">Kayıt Ol</StyledText>
              </StyledTouchableOpacity>
            </Link>
          </StyledView>
        </StyledScrollView>
      </StyledLinearGradient>
    </StyledKeyboardAvoidingView>
  );
}
