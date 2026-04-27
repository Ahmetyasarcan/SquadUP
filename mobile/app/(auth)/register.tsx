  import React, { useState } from 'react';
  import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    ScrollView,
    ActivityIndicator,
    Dimensions
  } from 'react-native';
  import { useRouter, Link } from 'expo-router';
  import { LinearGradient } from 'expo-linear-gradient';
  import { 
    Mail, Lock, User as UserIcon, 
    ChevronRight, ChevronLeft,
    CheckCircle2, Inbox
  } from 'lucide-react-native';
  import { useStore } from '../../store/useStore';
  import { registerStep1, registerStep2, checkVerification } from '../../services/api';
  import { styled } from 'nativewind';

  const StyledView = styled(View);
  const StyledText = styled(Text);
  const StyledTextInput = styled(TextInput);
  const StyledTouchableOpacity = styled(TouchableOpacity);
  const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
  const StyledScrollView = styled(ScrollView);
  const StyledLinearGradient = styled(LinearGradient);

  const { width } = Dimensions.get('window');

  const INTEREST_OPTIONS = [
    { label: 'Futbol', value: 'futbol' },
    { label: 'Basketbol', value: 'basketbol' },
    { label: 'Voleybol', value: 'voleybol' },
    { label: 'Satranç', value: 'satranç' },
    { label: 'Valorant', value: 'valorant' },
    { label: 'LoL', value: 'lol' },
    { label: 'CS2', value: 'csgo' },
    { label: 'Yürüyüş', value: 'yürüyüş' },
  ];

  export default function RegisterScreen() {
    const router = useRouter();
    
    const [step, setStep] = useState(1); // 1, 1.5, 2, 3
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      interests: [] as string[],
      competition_level: 3,
    });

    const handleInterestToggle = (interest: string) => {
      setFormData(prev => ({
        ...prev,
        interests: prev.interests.includes(interest)
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      }));
    };

    const handleRegisterStep1 = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Lütfen tüm alanları doldurun');
        return;
      }
      if (!emailRegex.test(formData.email)) {
        setError('Geçerli bir e-posta adresi girin');
        return;
      }
      if (formData.password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Şifreler eşleşmiyor');
        return;
      }

      setError(null);
      setIsLoading(true);
      try {
        const data = await registerStep1({
          email: formData.email,
          password: formData.password
        });
        setUserId(data.user_id);
        setStep(1.5);
      } catch (err: any) {
        setError(err.message || 'Kayıt başlatılamadı');
      } finally {
        setIsLoading(false);
      }
    };

    const handleVerifyDone = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await checkVerification({
          email: formData.email,
          password: formData.password
        });
        if (data.verified) {
          setStep(2);
        } else {
          setError('E-posta henüz onaylanmamış. Lütfen linke tıklayın.');
        }
      } catch (err: any) {
        setError(err.message || 'Doğrulama kontrolü başarısız');
      } finally {
        setIsLoading(false);
      }
    };

    const handleSubmitFinal = async () => {
      if (formData.interests.length === 0) {
        setError('En az bir ilgi alanı seçmelisiniz');
        return;
      }

      setIsLoading(true);
      try {
        await registerStep2({
          user_id: userId,
          name: formData.name,
          interests: formData.interests,
          competition_level: formData.competition_level
        });
        router.replace('/login');
      } catch (err: any) {
        setError(err.message || 'Profil güncellenemedi');
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
          colors={['#0f172a', '#1e293b', '#334155']}
          className="flex-1"
        >
          <StyledScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <StyledView className="flex-1 px-6 pt-12 pb-8 justify-center">
              
              <StyledView className="bg-white rounded-[40px] shadow-2xl p-8 overflow-hidden">
                {/* Progress Bar */}
                <StyledView className="h-1.5 w-full bg-gray-100 rounded-full mb-8 overflow-hidden">
                  <StyledView 
                    className="h-full bg-primary-600 rounded-full"
                    style={{ width: `${(step / 3) * 100}%` }}
                  />
                </StyledView>

                {/* Step Header */}
                <StyledView className="items-center mb-8">
                  <StyledText className="text-3xl font-bold text-gray-900">SquadUp'a Katıl</StyledText>
                  <StyledText className="text-gray-500 mt-2">
                    {step === 1 ? 'Hesap Bilgileri' : step === 1.5 ? 'Onay Bekleniyor' : step === 2 ? 'Profil Bilgileri' : 'İlgi Alanları'}
                  </StyledText>
                </StyledView>

                {error && (
                  <StyledView className="bg-red-50 p-4 rounded-2xl mb-6 border border-red-100">
                    <StyledText className="text-red-600 text-sm font-medium text-center">{error}</StyledText>
                  </StyledView>
                )}

                {/* Step 1: Auth */}
                {step === 1 && (
                  <StyledView className="space-y-4">
                    <StyledView className="space-y-2">
                      <StyledText className="text-sm font-semibold text-gray-700">E-posta</StyledText>
                      <StyledView className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border ${
                        formData.email.length > 0
                          ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50')
                          : 'border-gray-100'
                      }`}>
                        <Mail size={18} color={formData.email.length > 0 ? (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? '#10b981' : '#ef4444') : '#64748b'} />
                        <StyledTextInput
                          className="flex-1 ml-3"
                          placeholder="ornek@email.com"
                          value={formData.email}
                          onChangeText={(t) => setFormData({...formData, email: t})}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </StyledView>
                    </StyledView>

                    <StyledView className="space-y-2">
                      <StyledText className="text-sm font-semibold text-gray-700">Şifre</StyledText>
                      <StyledView className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border ${
                        formData.password.length > 0
                          ? (formData.password.length < 6 ? 'border-red-400 bg-red-50' : 'border-green-500 bg-green-50')
                          : 'border-gray-100'
                      }`}>
                        <Lock size={18} color={formData.password.length > 0 ? (formData.password.length < 6 ? '#ef4444' : '#10b981') : '#64748b'} />
                        <StyledTextInput
                          className="flex-1 ml-3"
                          placeholder="••••••••"
                          value={formData.password}
                          onChangeText={(t) => setFormData({...formData, password: t})}
                          secureTextEntry
                        />
                      </StyledView>
                    </StyledView>

                    <StyledView className="space-y-2">
                      <StyledText className="text-sm font-semibold text-gray-700">Şifre Tekrar</StyledText>
                      <StyledView className={`flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border ${
                        formData.confirmPassword.length > 0
                          ? (formData.confirmPassword !== formData.password ? 'border-red-400 bg-red-50' : 'border-green-500 bg-green-50')
                          : 'border-gray-100'
                      }`}>
                        <Lock size={18} color={formData.confirmPassword.length > 0 ? (formData.confirmPassword !== formData.password ? '#ef4444' : '#10b981') : '#64748b'} />
                        <StyledTextInput
                          className="flex-1 ml-3"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChangeText={(t) => setFormData({...formData, confirmPassword: t})}
                          secureTextEntry
                        />
                      </StyledView>
                    </StyledView>

                    <StyledTouchableOpacity 
                      onPress={handleRegisterStep1}
                      disabled={isLoading}
                      className="bg-primary-600 py-5 rounded-3xl flex-row items-center justify-center mt-4 shadow-lg shadow-primary-500/30"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <StyledText className="text-white font-bold text-lg mr-2">E-posta Doğrula</StyledText>
                          <ChevronRight size={20} color="white" />
                        </>
                      )}
                    </StyledTouchableOpacity>
                  </StyledView>
                )}

                {/* Step 1.5: Verification Pending */}
                {step === 1.5 && (
                  <StyledView className="items-center space-y-6">
                    <StyledView className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-2">
                      <Inbox size={40} color="#2563eb" />
                    </StyledView>
                    <StyledText className="text-xl font-bold text-gray-900 text-center">E-postanı Onayla</StyledText>
                    <StyledText className="text-gray-500 text-center leading-5">
                      {formData.email} adresine bir onay linki gönderdik. Lütfen onayladıktan sonra devam et.
                    </StyledText>
                    
                    <StyledTouchableOpacity 
                      onPress={() => setStep(2)}
                      className="w-full bg-green-600 py-5 rounded-3xl flex-row items-center justify-center mt-4"
                    >
                      <StyledText className="text-white font-bold text-lg mr-2">Onayladım, Devam Et</StyledText>
                      <CheckCircle2 size={20} color="white" />
                    </StyledTouchableOpacity>

                    <StyledTouchableOpacity onPress={() => setStep(1)}>
                      <StyledText className="text-primary-600 font-semibold">Bilgileri Düzenle</StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                )}

                {/* Step 2: Profile */}
                {step === 2 && (
                  <StyledView className="space-y-6">
                    <StyledView className="space-y-2">
                      <StyledText className="text-sm font-semibold text-gray-700">Ad Soyad</StyledText>
                      <StyledView className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-100">
                        <UserIcon size={18} color="#64748b" />
                        <StyledTextInput
                          className="flex-1 ml-3"
                          placeholder="Ahmet Yılmaz"
                          value={formData.name}
                          onChangeText={(t) => setFormData({...formData, name: t})}
                        />
                      </StyledView>
                    </StyledView>

                    <StyledView className="space-y-4">
                      <StyledText className="text-sm font-semibold text-gray-700 text-center">Rekabet Seviyen (1-5)</StyledText>
                      <StyledView className="flex-row justify-between">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <StyledTouchableOpacity
                            key={level}
                            onPress={() => setFormData({...formData, competition_level: level})}
                            className={`w-12 h-12 rounded-2xl items-center justify-center ${
                              formData.competition_level === level ? 'bg-primary-600 shadow-md' : 'bg-gray-50'
                            }`}
                          >
                            <StyledText className={`font-bold ${formData.competition_level === level ? 'text-white' : 'text-gray-400'}`}>
                              {level}
                            </StyledText>
                          </StyledTouchableOpacity>
                        ))}
                      </StyledView>
                    </StyledView>

                    <StyledTouchableOpacity 
                      onPress={() => setStep(3)}
                      className="bg-primary-600 py-5 rounded-3xl flex-row items-center justify-center mt-4"
                    >
                      <StyledText className="text-white font-bold text-lg mr-2">Devam Et</StyledText>
                      <ChevronRight size={20} color="white" />
                    </StyledTouchableOpacity>
                  </StyledView>
                )}

                {/* Step 3: Interests */}
                {step === 3 && (
                  <StyledView className="space-y-6">
                    <StyledView className="flex-row flex-wrap gap-2 justify-center">
                      {INTEREST_OPTIONS.map((option) => (
                        <StyledTouchableOpacity
                          key={option.value}
                          onPress={() => handleInterestToggle(option.value)}
                          className={`px-4 py-3 rounded-2xl border-2 ${
                            formData.interests.includes(option.value)
                              ? 'bg-primary-600 border-primary-600'
                              : 'bg-white border-gray-100'
                          }`}
                        >
                          <StyledText className={`text-xs font-bold ${
                            formData.interests.includes(option.value) ? 'text-white' : 'text-gray-600'
                          }`}>
                            {option.label}
                          </StyledText>
                        </StyledTouchableOpacity>
                      ))}
                    </StyledView>

                    <StyledTouchableOpacity 
                      onPress={handleSubmitFinal}
                      disabled={isLoading}
                      className="bg-primary-600 py-5 rounded-3xl flex-row items-center justify-center mt-4 shadow-lg shadow-primary-500/30"
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <StyledText className="text-white font-bold text-lg mr-2">Kaydı Tamamla</StyledText>
                          <CheckCircle2 size={20} color="white" />
                        </>
                      )}
                    </StyledTouchableOpacity>
                  </StyledView>
                )}

                {/* Footer */}
                <StyledView className="mt-8 pt-6 border-t border-gray-100 items-center">
                  <StyledText className="text-gray-500 text-sm">
                    Zaten hesabın var mı?{' '}
                    <StyledText 
                      onPress={() => router.push('/login')}
                      className="text-primary-600 font-bold"
                    >
                      Giriş Yap
                    </StyledText>
                  </StyledText>
                </StyledView>

              </StyledView>
            </StyledView>
          </StyledScrollView>
        </StyledLinearGradient>
      </StyledKeyboardAvoidingView>
    );
  }
