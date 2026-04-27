import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ArrowLeft, Share2, Clock, Zap } from 'lucide-react';
import { getActivities, joinActivity } from '../services/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import type { Activity } from '../types';
import Button from '../components/ui/Button';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES, CATEGORY_ICONS, COMPETITION_LEVELS, COMPETITION_COLORS } from '../constants/translations';
import { formatDateTime, getRelativeTime, formatScore } from '../utils/formatters';
import { MOCK_ACTIVITIES } from '../data/mockData';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useStore();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getActivities();
        if (res.data && res.data.activities.length > 0) {
          const found = res.data.activities.find((a) => a.id === id);
          if (found) {
            setActivity(found);
            setLoading(false);
            return;
          }
        }
        // Fallback: check mock data
        const mockFound = MOCK_ACTIVITIES.find(a => a.id === id);
        if (mockFound) {
          setActivity(mockFound);
        } else {
          toast.error('Aktivite bulunamadı');
          navigate('/activities');
        }
      } catch {
        const mockFound = MOCK_ACTIVITIES.find(a => a.id === id);
        if (mockFound) {
          setActivity(mockFound);
        } else {
          toast.error('Bağlantı hatası');
          navigate('/activities');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleJoin() {
    if (!user) {
      toast.error('Lütfen giriş yapın');
      navigate('/login');
      return;
    }
    if (!activity) return;

    setJoining(true);
    const toastId = toast.loading('Katılım işleniyor...');

    try {
      const res = await joinActivity(activity.id, user.id);
      if (res.data) {
        toast.dismiss(toastId);
        toast.success('Aktiviteye başarıyla katıldınız! 🎉');
        // Optimistic update
        setActivity({
          ...activity,
          current_participants: activity.current_participants + 1,
        });
      } else if (res.error) {
        toast.dismiss(toastId);
        toast.error(res.error);
      }
    } catch {
      toast.dismiss(toastId);
      toast.error('Bir hata oluştu');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Aktivite yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const count = activity.participant_count ?? activity.current_participants;
  const isFull = count >= activity.max_participants;
  const spotsLeft = activity.max_participants - count;
  const fillPercent = Math.round((count / activity.max_participants) * 100);

  // Gradient based on category
  const gradients: Record<string, string> = {
    sports: 'from-blue-600 via-primary-600 to-indigo-700',
    esports: 'from-purple-600 via-violet-600 to-indigo-700',
    board_games: 'from-amber-500 via-orange-500 to-red-500',
    outdoor: 'from-emerald-500 via-teal-500 to-cyan-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Hero gradient header */}
      <div className={`relative h-56 sm:h-64 bg-gradient-to-br ${gradients[activity.category] || gradients.sports}`}>
        <div className="absolute inset-0 bg-black/10" />
        {/* Decorative shapes */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-5 left-5 w-20 h-20 bg-white/5 rounded-full blur-xl" />

        {/* Back button */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </button>
        </div>

        {/* Category + Status on hero */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-full text-sm font-bold text-gray-900 dark:text-white shadow-sm">
              {CATEGORY_ICONS[activity.category]} {CATEGORIES[activity.category]}
            </span>
            <StatusBadge
              datetime={activity.datetime}
              currentParticipants={count}
              maxParticipants={activity.max_participants}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in-up">
          <div className="p-6 sm:p-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {activity.title}
            </h1>

            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Tarih</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDateTime(activity.datetime)}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    {getRelativeTime(activity.datetime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Konum</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {activity.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Katılımcılar</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {count} / {activity.max_participants}
                    {!isFull && spotsLeft <= 3 && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-bold">
                        (Son {spotsLeft} kişi!)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Seviye</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${COMPETITION_COLORS[activity.competition_level]}`}>
                      {COMPETITION_LEVELS[activity.competition_level]}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Participant fill bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                <span>Doluluk</span>
                <span className={isFull ? 'text-red-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>
                  {isFull ? 'Dolu' : `${spotsLeft} yer açık`}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-400' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>

            {/* Description */}
            {activity.description && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Açıklama
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {activity.description}
                </p>
              </div>
            )}

            {/* Participants Section */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                Katılımcılar ({activity.participants?.length || count})
              </h2>
              <div className="flex flex-wrap gap-3">
                {activity.participants?.map((participant) => (
                  <div key={participant.id} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-lg border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform cursor-pointer relative">
                      {participant.name.charAt(0).toUpperCase()}
                      {/* Social Proof Badge */}
                      {user && participant.interests.some(i => user.interests.includes(i)) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center" title="Ortak ilgi alanı!">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate w-14 text-center">
                      {participant.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
                {/* Empty spots */}
                {Array.from({ length: Math.min(3, spotsLeft) }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600">
                    ?
                  </div>
                ))}
              </div>
              {user && activity.participants?.some(p => p.interests.some(i => user.interests.includes(i))) && (
                <p className="mt-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                  <Zap className="w-3 h-3" />
                  Bu aktivitede seninle ortak ilgi alanına sahip kişiler var!
                </p>
              )}
            </div>

            {/* Match Score (if available) */}
            {activity.match_result && (
              <div className="mb-8 p-5 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/10 rounded-xl border border-primary-200 dark:border-primary-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-primary-900 dark:text-primary-100">
                    Eşleşme Skoru
                  </span>
                  <span className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                    {formatScore(activity.match_result.final_score)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${activity.match_result.final_score * 100}%` }}
                  />
                </div>
                {/* Breakdown */}
                <div className="space-y-2">
                  {(['interest', 'competition', 'reliability'] as const).map((key) => {
                    const item = activity.match_result!.breakdown[key];
                    const labels = { interest: '🎯 İlgi Alanı', competition: '⚔️ Rekabet', reliability: '🛡️ Güvenilirlik' };
                    return (
                      <div key={key} className="flex items-center gap-3 text-xs">
                        <span className="w-28 text-gray-600 dark:text-gray-300 flex-shrink-0 font-medium">{labels[key]}</span>
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                            style={{ width: `${item.score * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 w-10 text-right font-bold">{formatScore(item.score)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleJoin}
                disabled={isFull || joining}
                loading={joining}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                {joining ? 'Katılıyor...' : isFull ? 'Aktivite Dolu' : '🎉 Aktiviteye Katıl'}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link kopyalandı!');
                }}
              >
                <Share2 className="w-4 h-4" />
                Paylaş
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
