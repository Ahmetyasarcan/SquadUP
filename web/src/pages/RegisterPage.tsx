import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { register } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { 
  UserPlus, Mail, Lock, User as UserIcon, 
  ChevronRight, ChevronLeft, Target, 
  Loader2, CheckCircle2 
} from 'lucide-react';

const INTEREST_OPTIONS = [
  { label: 'Futbol', value: 'futbol' },
  { label: 'Basketbol', value: 'basketbol' },
  { label: 'Voleybol', value: 'voleybol' },
  { label: 'Tenis', value: 'tenis' },
  { label: 'Yüzme', value: 'yüzme' },
  { label: 'Satranç', value: 'satranç' },
  { label: 'Valorant', value: 'valorant' },
  { label: 'League of Legends', value: 'lol' },
  { label: 'CS:GO / CS2', value: 'csgo' },
  { label: 'Dungeons & Dragons', value: 'dnd' },
  { label: 'Board Games', value: 'board_games' },
  { label: 'Yürüyüş', value: 'yürüyüş' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
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

  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Lütfen tüm alanları doldurun');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) {
      if (!formData.name) toast.error('Lütfen isminizi girin');
      else setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.interests.length === 0) {
      toast.error('En az bir ilgi alanı seçmelisiniz');
      return;
    }

    setIsLoading(true);
    const { data, error } = await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      interests: formData.interests,
      competition_level: formData.competition_level
    });
    setIsLoading(false);

    if (data) {
      // If session is returned (auto-confirm on), log them in
      if (data.session) {
        setUser(data.user, data.session.access_token);
        toast.success(`Hoş geldin, ${data.user.name}! Hesabın oluşturuldu.`);
        navigate('/');
      } else {
        // Confirmation required
        toast.success('Kayıt başarılı! Lütfen e-postanı kontrol et.');
        navigate('/login');
      }
    } else {
      toast.error(error || 'Kayıt sırasında bir hata oluştu');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-primary-50/30 to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="fixed top-20 -right-20 w-80 h-80 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="fixed bottom-20 -left-20 w-60 h-60 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="w-full max-w-xl animate-fade-in-up">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <UserPlus className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
            SquadUp'a Katıl
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-primary-600' : 
                  s < step ? 'w-4 bg-primary-300 dark:bg-primary-800' : 'w-4 bg-gray-200 dark:bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-8 mb-6">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: Account Details */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hesap Bilgileri</h2>
                  <p className="text-sm text-gray-500">Giriş yapmak için kullanacağınız bilgiler</p>
                </div>
                <div className="space-y-4">
                  <Input
                    label="E-posta"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    icon={<Mail className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Şifre"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />
                  <Input
                    label="Şifre Tekrar"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    icon={<Lock className="w-4 h-4" />}
                    required
                  />
                </div>
                <Button type="button" variant="primary" className="w-full mt-6" onClick={handleNext}>
                  Devam Et
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* STEP 2: Profile Details */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profilini Oluştur</h2>
                  <p className="text-sm text-gray-500">Seni nasıl tanımalıyız?</p>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Tam İsim"
                    placeholder="Ahmet Yılmaz"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    icon={<UserIcon className="w-4 h-4" />}
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Rekabet Seviyen: {formData.competition_level}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.competition_level}
                      onChange={(e) => setFormData({...formData, competition_level: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                      <span>Eğlence</span>
                      <span>Rekabetçi</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-4 h-4" />
                    Geri
                  </Button>
                  <Button type="button" variant="primary" className="flex-[2]" onClick={handleNext}>
                    Devam Et
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Interests */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">İlgi Alanların</h2>
                  <p className="text-sm text-gray-500">Sana en uygun aktiviteleri önermemize yardımcı ol</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest.value}
                      type="button"
                      onClick={() => handleInterestToggle(interest.value)}
                      className={`relative p-3 rounded-xl border text-sm font-medium transition-all text-center ${
                        formData.interests.includes(interest.value)
                          ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-400'
                          : 'bg-white border-gray-100 text-gray-600 hover:border-primary-200 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {interest.label}
                      {formData.interests.includes(interest.value) && (
                        <CheckCircle2 className="w-3 h-3 absolute top-1 right-1 text-primary-500" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setStep(2)}>
                    <ChevronLeft className="w-4 h-4" />
                    Geri
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-[2]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    Kaydı Tamamla
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Zaten hesabın var mı?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-bold">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
