import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getRecommendations } from '../services/api';
import ActivityCard from '../components/ActivityCard';
import ActivityCardSkeleton from '../components/ActivityCardSkeleton';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import { UI_TEXT } from '../constants/translations';
import { Sparkles, User, BarChart3, Filter, Star, Zap, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { MOCK_RECOMMENDATIONS } from '../data/mockData';

type ScoreFilter = 'all' | 'high' | 'medium';

export default function RecommendationsPage() {
  const { recommendations, user, loading, error, setRecommendations, setLoading, setError } = useStore();
  const [stats, setStats] = useState<{ count: number; avg_score: number; perfect: number; good: number; low: number } | null>(null);
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');

  useEffect(() => {
    loadRecommendations();
  }, [user?.id]);

  async function loadRecommendations() {
    setLoading(true);
    setError(null);

    if (user) {
      const res = await getRecommendations(user.id);
      if (res.data && res.data.recommendations.length > 0) {
        setRecommendations(res.data.recommendations);
        setStats(res.data.stats);
        setLoading(false);
        return;
      }
    }

    // Fallback to mock recommendations
    setRecommendations(MOCK_RECOMMENDATIONS);
    const perfect = MOCK_RECOMMENDATIONS.filter(r => (r.match_score ?? 0) >= 0.9).length;
    const good = MOCK_RECOMMENDATIONS.filter(r => (r.match_score ?? 0) >= 0.75 && (r.match_score ?? 0) < 0.9).length;
    const low = MOCK_RECOMMENDATIONS.filter(r => (r.match_score ?? 0) < 0.75).length;
    const avg = MOCK_RECOMMENDATIONS.reduce((s, r) => s + (r.match_score ?? 0), 0) / MOCK_RECOMMENDATIONS.length;
    setStats({ count: MOCK_RECOMMENDATIONS.length, avg_score: avg, perfect, good, low });
    setLoading(false);
  }

  // Filter recommendations by score
  const filteredRecs = recommendations.filter((r) => {
    const score = r.score ?? r.match_result?.final_score ?? r.match_score ?? 0;
    if (scoreFilter === 'high') return score >= 0.9;
    if (scoreFilter === 'medium') return score >= 0.75;
    return true;
  });

  // Loading with skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-7 w-40 bg-dark-hover rounded-lg mb-2 animate-pulse" />
            <div className="h-4 w-72 bg-dark-hover rounded animate-pulse" />
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

  const scoreFilters: { key: ScoreFilter; label: string; emoji: string }[] = [
    { key: 'all', label: 'Tümü', emoji: '✨' },
    { key: 'medium', label: '>75%', emoji: '👍' },
    { key: 'high', label: '>90%', emoji: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-primary-500 rounded-xl flex items-center justify-center shadow-glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-100">
              {UI_TEXT.recommendations.title}
            </h1>
          </div>
          <p className="text-slate-400">
            {user ? `${user.name} için` : 'Sana özel'} — AI ile kişiselleştirilmiş öneriler
          </p>
        </div>

        {/* Stats bar */}
        {stats && stats.count > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Toplam Öneri',
                value: stats.count,
                icon: <Star className="w-5 h-5 text-primary-400" />,
                color: 'from-primary-500/20 to-primary-600/10',
                border: 'border-primary-500/30',
                textColor: 'text-primary-400',
              },
              {
                label: 'Ort. Uyum',
                value: `${Math.round(stats.avg_score * 100)}%`,
                icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
                color: 'from-emerald-500/20 to-emerald-600/10',
                border: 'border-emerald-500/30',
                textColor: 'text-emerald-400',
              },
              {
                label: '🎯 Mükemmel',
                value: stats.perfect,
                icon: <Zap className="w-5 h-5 text-secondary-400" />,
                color: 'from-secondary-500/20 to-secondary-600/10',
                border: 'border-secondary-500/30',
                textColor: 'text-secondary-400',
              },
              {
                label: '✨ İyi Eşleşme',
                value: stats.good,
                icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
                color: 'from-cyan-500/20 to-cyan-600/10',
                border: 'border-cyan-500/30',
                textColor: 'text-cyan-400',
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`glass rounded-xl p-4 border ${s.border} bg-gradient-to-br ${s.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  {s.icon}
                  <span className={`text-2xl font-black ${s.textColor}`}>{s.value}</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Score filter pills */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-slate-400" />
          {scoreFilters.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setScoreFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                scoreFilter === key
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-neon'
                  : 'glass border border-dark-border text-slate-300 hover:border-primary-400'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-2">
            {filteredRecs.length} sonuç
          </span>
        </div>

        {/* Cards */}
        {filteredRecs.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-slate-400" />}
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
