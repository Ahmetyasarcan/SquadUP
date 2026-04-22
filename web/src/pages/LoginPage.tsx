import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { login } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('E-posta ve şifre girin');
      return;
    }

    setIsLoading(true);
    const { data, error } = await login({ email, password });
    setIsLoading(false);

    if (data) {
      setUser(data.user, data.session.access_token);
      toast.success(`Hoş geldin, ${data.user.name}! 👋`);
      navigate('/');
    } else {
      toast.error(error || 'Giriş başarısız');
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-primary-50/30 to-blue-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Background blobs */}
      <div className="fixed top-20 -right-20 w-80 h-80 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="fixed bottom-20 -left-20 w-60 h-60 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
            <span className="text-white font-extrabold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
            SquadUp'a Giriş Yap
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hesabınla giriş yap, takımını kur
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-6 space-y-5 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Input
                label="E-posta"
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
              <Input
                label="Şifre"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              size="md" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              Giriş Yap
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Henüz hesabınız yok mu?{' '}
          <a href="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Kayıt olun
          </a>.
        </p>
      </div>
    </div>
  );
}
