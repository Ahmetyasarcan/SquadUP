import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getRecommendations } from '../services/api';
import ActivityCard from '../components/ActivityCard';
import ActivityCardSkeleton from '../components/ActivityCardSkeleton';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import { UI_TEXT } from '../constants/translations';
import { Sparkles, User, AlertCircle, BarChart3, RefreshCw, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

type ScoreFilter = 'all' | 'high' | 'medium';

export default function RecommendationsPage() {
  const { recommendations, user, loading, error, setRecommendations, setLoading, setError } = useStore();
  const [stats, setStats] = useState<{ count: number; avg_score: number; perfect: number; good: number; low: number } | null>(null);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');

  useEffect(() => {
    if (!user) return;
    loadRecommendations();
  }, [user?.id]);

  async function loadRecommendations() {
    if (!user) return;
    setLoading(true);
    setError(null);
    const res = await getRecommendations(user.id);
    if (res.data) {
      setRecommendations(res.data.recommendations);
      setStats(res.data.stats);
    } else if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  }

  // Filter recommendations by score
  const filteredRecs = recommendations.filter((r) => {
    const score = r.score ?? r.match_result?.final_score ?? 0;
    if (scoreFilter === 'high') return score >= 0.9;
    if (scoreFilter === 'medium') return score >= 0.7;
    return true;
  });

  // Generate "why recommended" text
  function getReasonText(activity: typeof recommendations[0]): string | null {
    if (!activity.match_result) return null;
    const { breakdown, label } = activity.match_result;
    const reasons: string[] = [];
    if (breakdown.interest.score >= 0.8) reasons.push('İlgi alanlarınız eşleşiyor');
    if (breakdown.competition.score >= 0.8) reasons.push('Seviyenize uygun');
    if (breakdown.reliability.score >= 0.8) reasons.push('Güvenilir bir aktivite');
    if (label === 'perfect_match') return '🎯 ' + (reasons[0] || 'Mükemmel eşleşme!');
    if (label === 'good_match') return '✨ ' + (reasons[0] || 'İyi bir eşleşme');
    return reasons[0] || null;
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Profil Gerekli
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
            {UI_TEXT.recommendations.noUser}. İlgi alanlarını girince sana özel öneriler oluşturulacak.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login">
              <Button variant="primary" size="md">
                Giriş Yap
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="secondary" size="md">
                <User className="w-4 h-4" />
                {UI_TEXT.recommendations.createProfile}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading with skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-7 w-40 skeleton rounded-lg mb-2" />
            <div className="h-4 w-72 skeleton rounded" />
          </div>
          <div className="flex gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-32 skeleton rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ActivityCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        <Button variant="secondary" size="sm" onClick={loadRecommendations}>
          <RefreshCw className="w-4 h-4" />
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const scoreFilters: { key: ScoreFilter; label: string; emoji: string }[] = [
    { key: 'all', label: 'Tümü', emoji: '✨' },
    { key: 'medium', label: '>70%', emoji: '👍' },
    { key: 'high', label: '>90%', emoji: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {UI_TEXT.recommendations.title}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.name} için — {UI_TEXT.recommendations.subtitle}
          </p>
        </div>

        {/* Stats bar */}
        {stats && stats.count > 0 && (
          <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
            {[
              { label: 'Toplam', value: stats.count, color: 'text-gray-700 dark:text-gray-300', bg: 'bg-white dark:bg-gray-900' },
              { label: 'Ort. Skor', value: `${Math.round(stats.avg_score * 100)}%`, color: 'text-primary-700 dark:text-primary-300', bg: 'bg-primary-50 dark:bg-primary-900/20' },
              { label: '🎯 Mükemmel', value: stats.perfect, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: '✨ İyi', value: stats.good, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm ${s.bg}`}
              >
                <BarChart3 className={`w-4 h-4 ${s.color} opacity-70`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
                <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Score filter pills */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-gray-400" />
          {scoreFilters.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setScoreFilter(key)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                scoreFilter === key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
            {filteredRecs.length} sonuç
          </span>
        </div>

        {/* Cards */}
        {filteredRecs.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-gray-400" />}
            title="Öneri Bulunamadı"
            description={
              scoreFilter !== 'all'
                ? 'Bu filtre ile eşleşen öneri yok. Filtreyi genişletmeyi deneyin.'
                : 'İlgi alanlarını veya seviyeni profil sayfasından güncelle.'
            }
            action={
              scoreFilter !== 'all' ? (
                <Button variant="secondary" size="sm" onClick={() => setScoreFilter('all')}>
                  Tüm Önerileri Göster
                </Button>
              ) : (
                <Link to="/profile">
                  <Button variant="secondary" size="sm">Profili Düzenle</Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecs.map((activity, index) => (
              <div
                key={activity.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <ActivityCard activity={activity} showMatchScore />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
