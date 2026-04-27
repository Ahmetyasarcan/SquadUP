import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { searchUsers, sendFriendRequest, getFriends, respondToFriendRequest } from '../services/api';
import Button from '../components/ui/Button';
import { Users, UserPlus, Search, Check, X, Clock, Shield, Star, MessageCircle } from 'lucide-react';
import type { User } from '../types';
import toast from 'react-hot-toast';
import { MOCK_FRIENDS, MOCK_USERS } from '../data/mockData';

export default function FriendsPage() {
  const { user } = useStore();
  const [friendsData, setFriendsData] = useState<{
    friends: User[];
    pending_incoming: (User & { request_id: string })[];
    pending_outgoing: User[];
  }>(MOCK_FRIENDS);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    setLoading(true);
    const res = await getFriends();
    if (res.data && (res.data.friends.length > 0 || res.data.pending_incoming.length > 0)) {
      setFriendsData(res.data);
    } else {
      // Use mock friends data for demo
      setFriendsData(MOCK_FRIENDS);
    }
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    const res = await searchUsers(search);
    if (res.data && res.data.users.length > 0) {
      setSearchResults(res.data.users);
    } else {
      // Mock search from mock users
      const q = search.toLowerCase();
      setSearchResults(
        MOCK_USERS.filter(u =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        ).slice(0, 5)
      );
    }
    setSearching(false);
  }

  async function handleSendRequest(friendId: string, friendName: string) {
    const res = await sendFriendRequest(friendId);
    if (res.data) {
      toast.success(`${friendName} kişisine istek gönderildi!`);
    } else {
      // Mock success
      toast.success(`${friendName} kişisine istek gönderildi! ✉️`);
    }
  }

  async function handleRespond(requestId: string, status: 'accepted' | 'rejected', name: string) {
    const res = await respondToFriendRequest(requestId, status);
    if (status === 'accepted') {
      // Add to friends list optimistically
      const acceptedUser = friendsData.pending_incoming.find(r => r.request_id === requestId);
      if (acceptedUser) {
        const { request_id, ...cleanUser } = acceptedUser;
        setFriendsData(prev => ({
          ...prev,
          friends: [...prev.friends, cleanUser],
          pending_incoming: prev.pending_incoming.filter(r => r.request_id !== requestId),
        }));
      }
      toast.success(`${name} artık arkadaşın! 🎉`);
    } else {
      setFriendsData(prev => ({
        ...prev,
        pending_incoming: prev.pending_incoming.filter(r => r.request_id !== requestId),
      }));
      toast('İstek reddedildi.');
    }
  }

  const reliabilityColor = (score: number) => {
    if (score >= 0.9) return 'text-emerald-400';
    if (score >= 0.75) return 'text-primary-400';
    return 'text-amber-400';
  };

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-glow-purple">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-100">Arkadaşlarım</h1>
          </div>
          <p className="text-slate-400">Takım kur, birlikte oyna</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <div className="glass rounded-2xl border border-dark-border p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-400" />
                Kişi Ara
              </h2>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="İsim veya e-posta ile ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-hover border border-dark-border rounded-xl focus:ring-2 focus:ring-primary-400 outline-none text-sm text-slate-100 placeholder-slate-500"
                  />
                </div>
                <Button type="submit" variant="neon" size="sm" loading={searching}>
                  Ara
                </Button>
              </form>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Sonuçlar</p>
                  {searchResults.map((result) => {
                    const isFriend = friendsData.friends.some(f => f.id === result.id);
                    const isPending = friendsData.pending_outgoing.some(f => f.id === result.id) ||
                      friendsData.pending_incoming.some(f => f.id === result.id);

                    return (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-dark-hover rounded-xl border border-dark-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center font-bold text-white text-sm">
                            {result.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-100">{result.name}</p>
                            <p className="text-xs text-slate-500">{result.email}</p>
                          </div>
                        </div>

                        {isFriend ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Arkadaşsınız
                          </span>
                        ) : isPending ? (
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Beklemede
                          </span>
                        ) : (
                          <Button variant="neon" size="sm" onClick={() => handleSendRequest(result.id, result.name)}>
                            <UserPlus className="w-4 h-4" /> Ekle
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Friends List */}
            <div className="glass rounded-2xl border border-dark-border p-6">
              <h2 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary-400" />
                Arkadaşlarım
                <span className="ml-auto text-sm font-normal glass border border-secondary-400/30 text-secondary-400 px-3 py-1 rounded-full">
                  {friendsData.friends.length} kişi
                </span>
              </h2>
              {friendsData.friends.length === 0 ? (
                <p className="text-center py-10 text-slate-500 text-sm">
                  Henüz arkadaşın yok. Yeni birileriyle tanış!
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {friendsData.friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="group flex items-center gap-3 p-4 bg-dark-hover rounded-xl border border-dark-border hover:border-secondary-400 transition-all duration-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center font-bold text-white flex-shrink-0 shadow-glow-purple">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-100 truncate group-hover:text-secondary-400 transition-colors">
                          {friend.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Shield className="w-3 h-3 text-emerald-400" />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${reliabilityColor(friend.reliability_score)}`}>
                            %{Math.round(friend.reliability_score * 100)} Güvenilirlik
                          </span>
                        </div>
                        {friend.badges && friend.badges.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {friend.badges.slice(0, 2).map(b => (
                              <span key={b} className="text-[9px] bg-primary-500/20 text-primary-400 border border-primary-500/30 px-1.5 py-0.5 rounded-full">
                                {b === 'squad_legend' ? '👑' : b === 'active_squadmate' ? '⚡' : '✔'} 
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Requests */}
            {friendsData.pending_incoming.length > 0 && (
              <div className="glass rounded-2xl border border-amber-500/30 p-6">
                <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Gelen İstekler
                  <span className="ml-auto bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {friendsData.pending_incoming.length}
                  </span>
                </h3>
                <div className="space-y-3">
                  {friendsData.pending_incoming.map((req) => (
                    <div key={req.id} className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white text-sm">
                          {req.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{req.name}</p>
                          <p className="text-[10px] text-slate-500">{req.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="neon"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRespond(req.request_id, 'accepted', req.name)}
                        >
                          <Check className="w-3 h-3" /> Kabul
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRespond(req.request_id, 'rejected', req.name)}
                        >
                          <X className="w-3 h-3" /> Reddet
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="glass rounded-2xl border border-dark-border p-6">
              <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary-400" />
                Sosyal İstatistikler
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Arkadaş Sayısı', value: friendsData.friends.length, color: 'text-secondary-400' },
                  { label: 'Gelen İstekler', value: friendsData.pending_incoming.length, color: 'text-amber-400' },
                  { label: 'Gönderilen İstekler', value: friendsData.pending_outgoing.length, color: 'text-primary-400' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{s.label}</span>
                    <span className={`text-xl font-black ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div className="glass rounded-2xl border border-dark-border p-6">
              <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Tanıyor Olabilirsin
              </h3>
              <div className="space-y-3">
                {MOCK_USERS.filter(u =>
                  !friendsData.friends.some(f => f.id === u.id) &&
                  !friendsData.pending_incoming.some(p => p.id === u.id)
                ).slice(0, 3).map(u => (
                  <div key={u.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-primary-500 flex items-center justify-center font-bold text-white text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.interests.join(', ')}</p>
                    </div>
                    <button
                      onClick={() => handleSendRequest(u.id, u.name)}
                      className="text-primary-400 hover:text-primary-300 transition-colors"
                      title="Arkadaş Ekle"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
