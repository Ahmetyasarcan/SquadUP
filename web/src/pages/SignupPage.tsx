import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import AvatarPicker from '../components/AvatarPicker';
import { AVATAR_SEEDS } from '../utils/avatars';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar_seed: AVATAR_SEEDS[0],
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordMatch = formData.confirmPassword.length > 0
    ? formData.password === formData.confirmPassword
    : null;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Geçerli bir email adresi girin');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name, formData.avatar_seed);
      // signUp already shows success toast → redirect to login after delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        toast.error('Bu email adresi zaten kayıtlı');
      } else if (msg.includes('Password should be')) {
        toast.error('Şifre en az 6 karakter olmalı');
      } else {
        toast.error('Kayıt olunamadı: ' + msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl p-8 border border-dark-border shadow-2xl">
          
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-400 rounded-2xl shadow-glow-purple mb-4">
              <span className="text-white font-black text-2xl">S</span>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-secondary-400 to-primary-400 bg-clip-text text-transparent mb-2">
              Kayıt Ol
            </h1>
            <p className="text-slate-400">Aktivite dünyasına katıl 🎯</p>
          </div>

          {/* Avatar Picker */}
          <AvatarPicker 
            currentSeed={formData.avatar_seed} 
            onSelect={(seed) => setFormData({ ...formData, avatar_seed: seed })} 
          />

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="squad_player"
                  className="w-full pl-11 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg 
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20
                           transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg 
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20
                           transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-dark-card border border-dark-border rounded-lg 
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-secondary-400 focus:ring-2 focus:ring-secondary-400/20
                           transition-all duration-200"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">En az 6 karakter</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-12 py-3 bg-dark-card border rounded-lg 
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:ring-2 transition-all duration-200
                           ${passwordMatch === null
                             ? 'border-dark-border focus:border-secondary-400 focus:ring-secondary-400/20'
                             : passwordMatch
                               ? 'border-green-500 focus:border-green-400 focus:ring-green-400/20'
                               : 'border-red-500 focus:border-red-400 focus:ring-red-400/20'
                           }`}
                  required
                />
                {passwordMatch !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {passwordMatch
                      ? <CheckCircle className="w-5 h-5 text-green-400" />
                      : <XCircle className="w-5 h-5 text-red-400" />
                    }
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol 🚀'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-card text-slate-400">veya</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-slate-400">
              Zaten hesabın var mı?{' '}
              <Link 
                to="/login" 
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
