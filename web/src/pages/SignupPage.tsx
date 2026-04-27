import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Lütfen tüm alanları doldurun');
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
      await signUp(formData.email, formData.password, formData.name);
      
      toast.success(
        'Kayıt başarılı! Email adresinize gönderilen linke tıklayarak hesabınızı onaylayın.',
        { duration: 5000 }
      );
      
      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.message.includes('already registered')) {
        toast.error('Bu email adresi zaten kayıtlı');
      } else {
        toast.error('Kayıt olunamadı: ' + error.message);
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-2xl shadow-glow-cyan mb-4">
              <span className="text-white font-black text-2xl">S</span>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent mb-2">
              Kayıt Ol
            </h1>
            <p className="text-slate-400">Aktivite dünyasına katıl</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                İsim Soyisim
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  className="w-full pl-11 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg 
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
                  required
                />
              </div>
            </div>

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
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg 
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">En az 6 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-dark-card border border-dark-border rounded-lg 
                           text-slate-100 placeholder-slate-500
                           focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
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
