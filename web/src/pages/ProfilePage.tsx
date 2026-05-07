import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { createUser, getUsers, updateUser as updateUserAPI } from '../services/api';
import { persistUser } from '../utils/auth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { UI_TEXT, CATEGORIES, COMPETITION_LEVELS, CATEGORY_ICONS } from '../constants/translations';
import { User, CheckCircle, ShieldCheck, Mail, Target, Sparkles, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import type { Category } from '../types';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl, AVATAR_SEEDS } from '../utils/avatars';
import AvatarPicker from '../components/AvatarPicker';

const CATEGORY_OPTIONS: Category[] = ['sports', 'esports', 'board_games', 'outdoor'];

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { user, setUser, loading, setLoading } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    interests: user?.interests || [],
    competition_level: user?.competition_level || 3,
    avatar_seed: user?.avatar_seed || AVATAR_SEEDS[0],
  });

  const [saved, setSaved] = useState(false);

  // Sync form when user is loaded
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        interests: user.interests || [],
        competition_level: user.competition_level || 3,
        avatar_seed: user.avatar_seed || AVATAR_SEEDS[0],
      });
    }
  }, [user]);

  function toggleInterest(cat: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(cat)
        ? prev.interests.filter((i) => i !== cat)
        : [...prev.interests, cat],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    if (user) {
      const res = await updateUserAPI(user.id, {
        name: form.name,
        interests: form.interests as Category[],
        competition_level: form.competition_level,
        avatar_seed: form.avatar_seed
      });

      if (res.data) {
        setUser(res.data);
        persistUser(res.data);
        setSaved(true);
        toast.success('Profil güncellendi! ✓');
      } else {
        toast.error(res.error || 'Güncelleme başarısız');
      }
      setLoading(false);
      return;
    }

    const payload = {
      name: form.name,
      email: form.email || `${form.name.toLowerCase().replace(/\s/g, '')}@example.com`,
      interests: form.interests,
      competition_level: form.competition_level
    };

    const toastId = toast.loading('Profil oluşturuluyor...');
    const res = await createUser(payload);

    if (res.data) {
      setUser(res.data.user);
      persistUser(res.data.user);
      setSaved(true);
      toast.dismiss(toastId);
      toast.success('Profil başarıyla oluşturuldu!');
    } else {
      if (res.error?.includes("duplicate key")) {
        const users = await getUsers();
        const existing = users.data?.users.find(u => u.email === payload.email);
        if (existing) {
          setUser(existing);
          persistUser(existing);
          setSaved(true);
          toast.dismiss(toastId);
          toast.success('Mevcut profil yüklendi!');
        } else {
          toast.dismiss(toastId);
          toast.error("Bu e-posta kullanımda.");
        }
      } else {
        toast.dismiss(toastId);
        toast.error(res.error || "Bilinmeyen Hata");
      }
    }
    setLoading(false);
  }

  if (authLoading || (authUser && !user)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <p className="text-slate-400 animate-pulse text-sm">Profil bilgileriniz yükleniyor...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 animate-fade-in-up">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-dark-hover flex items-center justify-center mx-auto mb-4 border border-dark-border">
            <User className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Giriş Gerekli
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            Profilinizi görüntülemek için önce giriş yapmanız gerekiyor.
          </p>
          <Button variant="neon" onClick={() => navigate('/login')}>
            Giriş Yap
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-6 h-6 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user ? UI_TEXT.profile.title : UI_TEXT.profile.create}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {UI_TEXT.profile.subtitle}
            </p>
          </div>
          {user && (
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-800">
              <img 
                src={getAvatarUrl(form.avatar_seed || user.id)} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 animate-fade-in-up">
              <AvatarPicker 
                currentSeed={form.avatar_seed} 
                onSelect={(seed) => setForm({ ...form, avatar_seed: seed })} 
              />
              <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Ad Soyad"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Örn: Ahmet Yılmaz"
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="E-posta"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Örn: ahmet@example.com"
                icon={<Mail className="w-4 h-4" />}
                disabled={!!user}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {UI_TEXT.profile.interests}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all
                        ${form.interests.includes(cat)
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                      <span>{CATEGORY_ICONS[cat]}</span>
                      {CATEGORIES[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  Genel Rekabet Seviyesi: <span className="text-primary-600 dark:text-primary-400 font-bold">{COMPETITION_LEVELS[form.competition_level]}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.competition_level}
                  onChange={(e) => setForm({ ...form, competition_level: +e.target.value as any })}
                  className="w-full accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1">
                  <span>Başlangıç</span><span>Orta</span><span>Profesyonel</span>
                </div>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full" loading={loading}>
                {saved && !loading ? <CheckCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                {saved && !loading ? UI_TEXT.profile.saved : UI_TEXT.profile.save}
              </Button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            {user ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 animate-fade-in">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                  <Target className="w-5 h-5 text-primary-500" />
                  {UI_TEXT.profile.stats}
                </h3>

                {/* Level & XP System */}
                <div className="mb-6 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-4 text-white shadow-lg shadow-primary-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform">
                    <Zap className="w-12 h-12 text-white" fill="white" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Mevcut Seviye</p>
                        <p className="text-2xl font-black">Lv. {Math.floor((user.attended_events || 0) / 5) + 1}</p>
                      </div>
                      <p className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">{user.attended_events % 5} / 5 XP</p>
                    </div>
                    <div className="h-2 bg-black/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-1000"
                        style={{ width: `${((user.attended_events || 0) % 5) * 20}%` }}
                      />
                    </div>
                    <p className="text-[10px] mt-2 opacity-70">Sonraki seviyeye {5 - (user.attended_events % 5)} etkinlik kaldı</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{UI_TEXT.profile.joined}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{user.joined_events}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{UI_TEXT.profile.attended}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{user.attended_events}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center mb-2">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        {UI_TEXT.profile.reliability}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                        {Math.round((user.reliability_score || 0.5) * 100)}%
                      </span>
                    </p>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${(user.reliability_score || 0.5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {user.badges && user.badges.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Kazanılan Rozetler</p>
                      <div className="flex flex-wrap gap-2">
                        {user.badges.map((badge) => {
                          const badgeData: Record<string, { label: string, color: string, icon: string }> = {
                            active_squadmate: { label: 'Aktif Oyuncu', color: 'bg-cyan-500', icon: '⚡' },
                            squad_legend: { label: 'Efsane', color: 'bg-purple-500', icon: '👑' },
                            verified: { label: 'Onaylı', color: 'bg-blue-500', icon: '✔' },
                          };
                          const data = badgeData[badge] || { label: badge, color: 'bg-gray-500', icon: '⭐' };
                          return (
                            <div key={badge} className={`${data.color} text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm animate-pulse`}>
                              <span>{data.icon}</span>
                              {data.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/10 rounded-2xl border border-primary-100 dark:border-primary-800/30 p-6 text-sm text-primary-800 dark:text-primary-200 animate-fade-in">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  İpuçları
                </h4>
                <ul className="space-y-2.5 list-disc list-inside opacity-90 text-xs leading-relaxed">
                  <li>İlgi alanların öneri algoritmasında %50 etkilidir.</li>
                  <li>Rekabet seviyen uygun rakipler bulmanı sağlar.</li>
                  <li>Katıldığın etkinliklere giderek güvenilirlik skorunu artır.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
