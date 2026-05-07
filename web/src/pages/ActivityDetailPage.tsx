import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Trophy, ArrowLeft, Share2, Clock, Zap, MessageCircle } from 'lucide-react';
import { getActivities, joinActivity, getActivityParticipants, respondActivityRequest, getParticipationStatus } from '../services/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import type { Activity } from '../types';
import Button from '../components/ui/Button';
import StatusBadge from '../components/StatusBadge';
import { CATEGORIES, CATEGORY_ICONS, COMPETITION_LEVELS, COMPETITION_COLORS } from '../constants/translations';
import { formatDateTime, getRelativeTime, formatScore } from '../utils/formatters';
import { MOCK_ACTIVITIES } from '../data/mockData';
import { Check, X, UserCheck, UserPlus } from 'lucide-react';
import { getAvatarUrl } from '../utils/avatars';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useStore();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<{ pending: any[], approved: any[] }>({ pending: [], approved: [] });
  const [userStatus, setUserStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const [actRes, statRes] = await Promise.all([
          getActivities(),
          user ? getParticipationStatus() : Promise.resolve({ data: { statuses: {} } })
        ]);

        if (actRes.data) {
          const found = actRes.data.activities.find((a) => a.id === id);
          if (found) {
            setActivity(found);
            
            // If user is creator, fetch full participants list including pending
            if (user && found.creator_id === user.id) {
              const partRes = await getActivityParticipants(id);
              if (partRes.data) {
                setParticipants(partRes.data);
              }
            }
          } else {
            // Fallback: check mock data
            const mockFound = MOCK_ACTIVITIES.find(a => a.id === id);
            if (mockFound) {
              setActivity(mockFound);
            } else {
              toast.error('Aktivite bulunamadı');
              navigate('/activities');
            }
          }
        }

        if (statRes.data) {
          setUserStatus(statRes.data.statuses[id]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Bağlantı hatası');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  async function handleJoin() {
    if (!user) {
      toast.error('Lütfen giriş yapın');
      navigate('/login');
      return;
    }
    if (!activity) return;

    setJoining(true);
    const toastId = toast.loading('İstek gönderiliyor...');

    try {
      const res = await joinActivity(activity.id, user.id);
      if (res.data) {
        toast.dismiss(toastId);
        toast.success(res.data.message || 'Katılım isteğiniz gönderildi! ⏳');
        setUserStatus('pending');
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

  async function handleRespond(participationId: string, status: 'joined' | 'rejected') {
    if (!id || respondingId) return;
    setRespondingId(participationId);
    
    try {
      const res = await respondActivityRequest(id, participationId, status);
      if (res.data) {
        toast.success(status === 'joined' ? 'İstek onaylandı! ✅' : 'İstek reddedildi.');
        
        // Refresh participants list
        const partRes = await getActivityParticipants(id);
        if (partRes.data) {
          setParticipants(partRes.data);
          
          // Update activity count if approved
          if (status === 'joined' && activity) {
            setActivity({
              ...activity,
              current_participants: partRes.data.approved.length,
              participant_count: partRes.data.approved.length
            });
          }
        }
      } else {
        toast.error(res.error || 'İşlem başarısız');
      }
    } catch (err) {
      toast.error('Bir hata oluştu');
    } finally {
      setRespondingId(null);
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
                Katılımcılar ({participants.approved.length || count})
              </h2>
              <div className="flex flex-wrap gap-3">
                {(participants.approved.length > 0 ? participants.approved : activity.participants)?.map((participant) => (
                  <div key={participant.id} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm group-hover:scale-110 transition-transform cursor-pointer relative bg-slate-100 dark:bg-slate-800">
                      <img 
                        src={getAvatarUrl(participant.avatar_seed || participant.id)} 
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate w-14 text-center">
                      {participant.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
                {/* Empty spots */}
                {Array.from({ length: Math.max(0, spotsLeft) }).slice(0, 3).map((_, i) => (
                  <div key={`empty-${i}`} className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-300 dark:text-gray-600">
                    ?
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof for non-creators */}
            {user && activity.creator_id !== user.id && activity.participants?.some(p => p.interests.some(i => user.interests.includes(i))) && (
              <p className="mb-6 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg animate-pulse">
                <Zap className="w-3 h-3" />
                Bu aktivitede seninle ortak ilgi alanına sahip kişiler var!
              </p>
            )}

            {/* Pending Requests for Creator */}
            {user && activity.creator_id === user.id && participants.pending.length > 0 && (
              <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-800/50">
                <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Onay Bekleyen İstekler ({participants.pending.length})
                </h2>
                <div className="space-y-4">
                  {participants.pending.map((req) => (
                    <div key={req.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                          <img 
                            src={getAvatarUrl(req.avatar_seed || req.user_id || req.id)} 
                            className="w-full h-full object-cover"
                            alt={req.name}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{req.name}</p>
                          <p className="text-xs text-gray-500">Seviye: {COMPETITION_LEVELS[req.competition_level]}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          className="!py-1.5 !px-3 bg-emerald-500 hover:bg-emerald-600 border-none"
                          onClick={() => handleRespond(req.participation_id, 'joined')}
                          loading={respondingId === req.participation_id}
                        >
                          <Check className="w-4 h-4 mr-1" /> Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="!py-1.5 !px-3"
                          onClick={() => handleRespond(req.participation_id, 'rejected')}
                          disabled={respondingId === req.participation_id}
                        >
                          <X className="w-4 h-4 mr-1" /> Reddet
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Activity Chat Section */}
            {(user && (activity.creator_id === user.id || userStatus === 'joined')) && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-secondary-500" />
                    Grup Sohbeti
                  </h2>
                  <span className="text-[10px] font-bold bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 px-2 py-0.5 rounded-full">
                    Sadece Katılımcılar
                  </span>
                </div>
                
                <div className="h-64 overflow-y-auto mb-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  {/* Mock messages for demo if none exist */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-secondary-500 ml-1">Sistem</span>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-slate-600 dark:text-slate-400">
                      Hoş geldiniz! Etkinlik hakkındaki detayları buradan konuşabilirsiniz.
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 py-2">--- Sohbet Başladı ---</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Mesajınızı yazın..." 
                    className="flex-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-secondary-500 outline-none"
                  />
                  <Button variant="secondary" size="sm" className="bg-secondary-500 hover:bg-secondary-600 text-white border-none shadow-glow-purple">
                    Gönder
                  </Button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {user && activity.creator_id === user.id ? (
                <div className="flex-1 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/50 text-center">
                  <p className="text-sm font-bold text-primary-700 dark:text-primary-300 flex items-center justify-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Bu etkinliği sen yönetiyorsun
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={isFull || joining || userStatus === 'pending' || userStatus === 'joined' || userStatus === 'attended'}
                  loading={joining}
                  variant={userStatus === 'joined' ? 'secondary' : 'primary'}
                  size="lg"
                  className="flex-1"
                >
                  {userStatus === 'joined' || userStatus === 'attended' ? (
                    <><UserCheck className="w-5 h-5 mr-2" /> Katıldın ✅</>
                  ) : userStatus === 'pending' ? (
                    <><Clock className="w-5 h-5 mr-2" /> İstek Gönderildi ⏳</>
                  ) : isFull ? (
                    'Aktivite Dolu'
                  ) : (
                    <><UserPlus className="w-5 h-5 mr-2" /> 🎉 Aktiviteye Katıl</>
                  )}
                </Button>
              )}
              
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
