import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, TrendingUp, Shield } from 'lucide-react';
import { UI_TEXT, CATEGORY_ICONS, CATEGORIES } from '../constants/translations';
import Button from '../components/ui/Button';

const FEATURES = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Akıllı Eşleştirme',
    desc: 'İlgi alanlarınıza ve seviyenize göre puanlama algoritmasıyla size özel öneriler',
    color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Topluluk',
    desc: 'Yeni insanlarla tanışın, takım kurun ve birlikte eğlenceli anılar biriktirin',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Kişisel Gelişim',
    desc: 'Farklı seviyelerden aktiviteler keşfet, hem öğren hem öğret',
    color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Güvenilirlik Skoru',
    desc: 'Katıldığın etkinliklere uyduğun ölçüde güvenilirlik puanın yükselir',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  },
];

const CATEGORY_KEYS = ['sports', 'esports', 'board_games', 'outdoor'] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Background blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 dark:bg-primary-900/30 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 border border-primary-100 dark:border-primary-800">
            <Zap className="w-3.5 h-3.5" /> Yapay zekasız, saf fonksiyonel eşleştirme
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
            Aktivite Bul,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-500">
              Takım Kur
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {UI_TEXT.home.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/activities">
              <Button variant="primary" size="lg">
                {UI_TEXT.home.cta}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/recommendations">
              <Button variant="secondary" size="lg">
                <Zap className="w-4 h-4" />
                Öneri Al
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORY_KEYS.map((cat) => (
            <Link
              key={cat}
              to={`/activities?category=${cat}`}
              className="flex flex-col items-center gap-2 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group"
            >
              <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {CATEGORIES[cat]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
          Neden SquadUp?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-3 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <span className={`inline-flex p-2.5 rounded-xl w-fit ${f.color}`}>{f.icon}</span>
              <h3 className="font-bold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="bg-gradient-to-r from-primary-600 to-blue-600 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Hemen başla</h2>
          <p className="text-primary-100 mb-8">Profilini oluştur, ilgi alanlarını seç ve kişiselleştirilmiş önerileri keşfet.</p>
          <Link to="/profile">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary-700 hover:bg-gray-50 border-0 shadow-lg"
            >
              Profil Oluştur <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
