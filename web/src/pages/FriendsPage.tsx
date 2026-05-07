import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Check, X, Clock,
  Shield, Star, MessageCircle, RefreshCw,
} from 'lucide-react';
import {
  searchUsers, sendFriendRequest, getFriends,
  getFriendRequests, acceptFriendRequest,
  rejectFriendRequest, getRealUserSuggestions,
} from '../services/socialApi';
import {
  mixRealAndMockUsers, normalizeRealUser, MOCK_SOCIAL_USERS,
} from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

type Tab = 'friends' | 'requests' | 'suggestions' | 'search';

function reliabilityColor(score: number) {
  if (score >= 0.9) return 'text-emerald-400';
  if (score >= 0.75) return 'text-primary-400';
  return 'text-amber-400';
}

function interestLabel(key: string) {
  const map: Record<string, string> = {
    sports: 'Spor', esports: 'Esports',
    board_games: 'Kutu Oyunu', outdoor: 'Outdoor',
  };
  return map[key] || key;
}

// ─── User Card ───────────────────────────────────────────────────────────────
interface UserCardProps {
  user: any;
  action: React.ReactNode;
  isMock?: boolean;
}

function UserCard({ user, action, isMock }: UserCardProps) {
  const initial = (user?.name || '?').charAt(0).toUpperCase();
  return (
    <div className="glass rounded-2xl border border-dark-border hover:border-primary-400/50 transition-all duration-300 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-400/30 flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center shadow-glow-cyan flex-shrink-0 text-xl font-black text-white">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-100 truncate">{user.name}</h3>
            {isMock && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                ✨ Öneri
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>

          {user.reliability_score != null && (
            <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${reliabilityColor(user.reliability_score)}`}>
              <Shield className="w-3 h-3" />
              %{Math.round(user.reliability_score * 100)} Güvenilirlik
            </p>
          )}

          {user.common_activities?.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              🎮 {user.common_activities.join(', ')}
            </p>
          )}

          {user.mutual_friends > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">
              👥 {user.mutual_friends} ortak arkadaş
            </p>
          )}

          {user.interests?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.interests.slice(0, 3).map((i: string) => (
                <span key={i} className="text-[10px] bg-dark-hover border border-dark-border text-slate-400 px-2 py-0.5 rounded-full">
                  {interestLabel(i)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div>{action}</div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 gap-4">
      <div className="w-16 h-16 bg-dark-card rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 opacity-40" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FriendsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('suggestions');
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAll();
  }, [user]);

  async function loadAll() {
    await Promise.all([loadFriends(), loadRequests(), loadSuggestions()]);
  }

  async function loadFriends() {
    if (!user) return;
    try {
      const data = await getFriends();
      setFriends(data);
    } catch { /* silently fail */ }
  }

  async function loadRequests() {
    if (!user) return;
    try {
      const data = await getFriendRequests();
      setRequests(data);
    } catch { /* silently fail */ }
  }

  async function loadSuggestions() {
    setLoadingSuggestions(true);
    try {
      const realUsers = await getRealUserSuggestions();
      const normalized = realUsers.map(normalizeRealUser);
      setSuggestions(mixRealAndMockUsers(normalized, 0.5));
    } catch {
      // Fallback: only mock data
      setSuggestions(MOCK_SOCIAL_USERS);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setTab('search');
    try {
      const data = await searchUsers(searchQuery);
      if (data.length > 0) {
        setSearchResults(data);
      } else {
        // Fallback: filter static mock data
        const q = searchQuery.toLowerCase();
        setSearchResults(MOCK_SOCIAL_USERS.filter(u =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        ));
      }
    } catch {
      toast.error('Arama yapılamadı');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(userId: string, userName: string) {
    if (userId.startsWith('mock-')) {
      toast('Bu kullanıcı demo verisidir 😊', { icon: 'ℹ️', style: { background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155' } });
      return;
    }
    try {
      await sendFriendRequest(userId);
      setSentRequests(prev => new Set([...prev, userId]));
      toast.success(`${userName} kişisine arkadaşlık isteği gönderildi! 🎉`);
    } catch (e: any) {
      if (e?.message?.includes('duplicate') || e?.code === '23505') {
        toast.error('Zaten arkadaşlık isteği gönderilmiş');
      } else {
        toast.error('İstek gönderilemedi');
      }
    }
  }

  async function handleAccept(requestId: string, name: string) {
    try {
      await acceptFriendRequest(requestId);
      toast.success(`${name} artık arkadaşın! 🎉`);
      await loadAll();
    } catch { toast.error('İstek kabul edilemedi'); }
  }

  async function handleReject(requestId: string) {
    try {
      await rejectFriendRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast('İstek reddedildi', { icon: '✗', style: { background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155' } });
    } catch { toast.error('İşlem başarısız'); }
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'suggestions', label: 'Öneriler' },
    { id: 'friends', label: 'Arkadaşlarım', count: friends.length },
    { id: 'requests', label: 'İstekler', count: requests.length },
    { id: 'search', label: 'Ara' },
  ];

  const isAlreadyFriend = (id: string) => friends.some((f: any) => f.friend?.id === id);
  const hasSentRequest = (id: string) => sentRequests.has(id);

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow-purple">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-100">Arkadaşlar</h1>
          </div>
          <p className="text-slate-400">Takım kur, yeni insanlarla tanış</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 glass rounded-2xl p-4 border border-dark-border">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="friends-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="İsim ile kullanıcı ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-dark-hover border border-dark-border rounded-xl focus:ring-2 focus:ring-primary-400 outline-none text-sm text-slate-100 placeholder-slate-500"
              />
            </div>
            <Button id="friends-search-btn" variant="neon" size="sm" onClick={handleSearch} loading={loading}>
              Ara
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-7 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              id={`friends-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                tab === t.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-neon'
                  : 'bg-dark-card text-slate-300 hover:bg-dark-hover hover:text-slate-100 border border-dark-border'
              }`}
            >
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.id ? 'bg-white/20 text-white' : 'bg-primary-500/20 text-primary-400'
                }`}>
                  {t.count}
                </span>
              )}
              {t.id === 'requests' && requests.length > 0 && tab !== 'requests' && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* ── Suggestions ─────────────────────────────────────────────── */}
          {tab === 'suggestions' && (
            <>
              <div className="col-span-full flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                  Gerçek + Öneri kullanıcılar
                </p>
                <button onClick={loadSuggestions} disabled={loadingSuggestions}
                  className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50">
                  <RefreshCw className={`w-3 h-3 ${loadingSuggestions ? 'animate-spin' : ''}`} />
                  Yenile
                </button>
              </div>
              {suggestions.length === 0 && <EmptyState icon={Users} message="Öneri yükleniyor..." />}
              {suggestions.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  isMock={!!u.isMock}
                  action={
                    isAlreadyFriend(u.id) ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Arkadaşsınız
                      </span>
                    ) : hasSentRequest(u.id) ? (
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> İstek Gönderildi
                      </span>
                    ) : (
                      <Button
                        id={`send-request-${u.id}`}
                        variant="neon"
                        size="sm"
                        onClick={() => handleSendRequest(u.id, u.name)}
                        className="w-full"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        {u.isMock ? 'Demo Kullanıcı' : 'Arkadaş Ekle'}
                      </Button>
                    )
                  }
                />
              ))}
            </>
          )}

          {/* ── Friends ─────────────────────────────────────────────────── */}
          {tab === 'friends' && (
            <>
              {friends.length === 0 && <EmptyState icon={Users} message="Henüz arkadaşın yok. Öneriler sekmesinden başla!" />}
              {friends.map((f: any) => (
                <UserCard
                  key={f.id}
                  user={f.friend}
                  action={
                    <Link to="/messages">
                      <Button variant="ghost" size="sm" className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" /> Mesaj Gönder
                      </Button>
                    </Link>
                  }
                />
              ))}
            </>
          )}

          {/* ── Requests ────────────────────────────────────────────────── */}
          {tab === 'requests' && (
            <>
              {requests.length === 0 && <EmptyState icon={Clock} message="Bekleyen arkadaşlık isteği yok" />}
              {requests.map((r: any) => {
                const requester = r.requester;
                return (
                  <UserCard
                    key={r.id}
                    user={requester}
                    action={
                      <div className="flex gap-2">
                        <Button
                          id={`accept-request-${r.id}`}
                          variant="neon"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleAccept(r.id, requester?.name || 'Kullanıcı')}
                        >
                          <Check className="w-4 h-4 mr-1" /> Kabul Et
                        </Button>
                        <Button
                          id={`reject-request-${r.id}`}
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleReject(r.id)}
                        >
                          <X className="w-4 h-4 mr-1" /> Reddet
                        </Button>
                      </div>
                    }
                  />
                );
              })}
            </>
          )}

          {/* ── Search Results ───────────────────────────────────────────── */}
          {tab === 'search' && (
            <>
              {searchResults.length === 0 && searchQuery && (
                <EmptyState icon={Search} message="Sonuç bulunamadı. Farklı bir isim dene." />
              )}
              {searchResults.length === 0 && !searchQuery && (
                <EmptyState icon={Search} message="Arama yapmak için yukarıdaki kutuyu kullan." />
              )}
              {searchResults.map((u) => (
                <UserCard
                  key={u.id}
                  user={u}
                  isMock={!!u.isMock}
                  action={
                    isAlreadyFriend(u.id) ? (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Arkadaşsınız
                      </span>
                    ) : hasSentRequest(u.id) ? (
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> İstek Gönderildi
                      </span>
                    ) : (
                      <Button
                        variant="neon"
                        size="sm"
                        onClick={() => handleSendRequest(u.id, u.name)}
                        className="w-full"
                      >
                        <UserPlus className="w-4 h-4 mr-1" /> Arkadaş Ekle
                      </Button>
                    )
                  }
                />
              ))}
            </>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-10 glass rounded-2xl border border-dark-border p-6">
          <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary-400" /> Sosyal İstatistikler
          </h3>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Arkadaş', value: friends.length, color: 'text-secondary-400' },
              { label: 'Gelen İstekler', value: requests.length, color: 'text-amber-400' },
              { label: 'Öneri', value: suggestions.length, color: 'text-primary-400' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
