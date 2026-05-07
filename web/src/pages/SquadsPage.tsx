import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getSquads, joinSquad } from '../services/api';
import Button from '../components/ui/Button';
import { Users, Plus, Shield, Zap, Search, Star, Lock, Globe } from 'lucide-react';
import type { Squad, Category } from '../types';
import { CATEGORIES, CATEGORY_ICONS } from '../constants/translations';
import toast from 'react-hot-toast';
import { MOCK_SQUADS } from '../data/mockData';

const CATEGORY_GRADIENT: Record<string, string> = {
  sports: 'from-emerald-500 to-teal-600',
  esports: 'from-primary-500 to-secondary-500',
  board_games: 'from-amber-500 to-orange-600',
  outdoor: 'from-green-500 to-lime-600',
};

const CATEGORY_BORDER: Record<string, string> = {
  sports: 'border-emerald-500/30 hover:border-emerald-400',
  esports: 'border-primary-500/30 hover:border-primary-400',
  board_games: 'border-amber-500/30 hover:border-amber-400',
  outdoor: 'border-green-500/30 hover:border-green-400',
};

export default function SquadsPage() {
  const { user } = useStore();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [joinedSquads, setJoinedSquads] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSquads();
  }, []);

  async function loadSquads() {
    setLoading(true);
    const res = await getSquads();
    if (res.data && res.data.squads.length > 0) {
      setSquads(res.data.squads);
    } else {
      setSquads(MOCK_SQUADS);
    }
    setLoading(false);
  }

  async function handleJoin(squadId: string, squadName: string) {
    if (!user) {
      toast.error('Giriş yapmalısın');
      return;
    }
    const res = await joinSquad(squadId, user.id);
    if (res.data) {
      toast.success(`${squadName} grubuna katıldın! 🎉`);
    } else {
      // Mock join success
      toast.success(`${squadName} grubuna katıldın! 🎉`);
    }
    setJoinedSquads(prev => new Set([...prev, squadId]));
  }

  const filtered = squads.filter(s => {
    const name = s.name || '';
    const desc = s.description || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories: (Category | 'all')[] = ['all', 'sports', 'esports', 'board_games', 'outdoor'];

  return (
    <div className="min-h-screen bg-dark-bg py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow-cyan">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-100">Squads</h1>
            </div>
            <p className="text-slate-400">
              <span className="text-primary-400 font-bold">{squads.length}</span> aktif ekip seni bekliyor
            </p>
          </div>
          <Button variant="neon" size="md">
            <Plus className="w-4 h-4" />
            Yeni Squad Kur
          </Button>
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Squad ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-dark-card border border-dark-border rounded-2xl focus:ring-2 focus:ring-primary-400 outline-none text-slate-100 placeholder-slate-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  categoryFilter === cat
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-neon'
                    : 'glass border border-dark-border text-slate-300 hover:border-primary-400'
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span className="hidden sm:inline">{CATEGORIES[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-56 bg-dark-hover rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-dark-hover rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-slate-400 text-lg font-semibold">Squad bulunamadı</p>
                <p className="text-slate-500 text-sm mt-1">Farklı bir arama deneyin</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((squad, idx) => {
                  const isJoined = joinedSquads.has(squad.id);
                  const gradient = CATEGORY_GRADIENT[squad.category] ?? 'from-primary-500 to-secondary-500';
                  const borderClass = CATEGORY_BORDER[squad.category] ?? 'border-dark-border hover:border-primary-400';
                  return (
                    <div
                      key={squad.id}
                      className={`group relative glass rounded-2xl border ${borderClass} p-6 transition-all duration-300 hover:shadow-glow-cyan hover:-translate-y-1 animate-fade-in-up`}
                      style={{ animationDelay: `${idx * 0.05}s`, animationFillMode: 'both' }}
                    >
                      {/* Top */}
                      <div className="flex justify-between items-start mb-5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}>
                          {CATEGORY_ICONS[squad.category]}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Aktif
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Herkese açık
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-primary-400 transition-colors">
                        {squad.name}
                      </h3>
                      <p className="text-sm text-slate-400 mb-5 line-clamp-2 leading-relaxed">
                        {squad.description}
                      </p>

                      {/* Stats Row */}
                      <div className="flex items-center gap-4 mb-5 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-primary-400" />
                          <span className="font-bold text-slate-300">{squad.member_count}</span> üye
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-slate-300">{CATEGORIES[squad.category]}</span>
                        </span>
                      </div>

                      <Button
                        variant={isJoined ? 'secondary' : 'neon'}
                        size="sm"
                        className="w-full"
                        onClick={() => !isJoined && handleJoin(squad.id, squad.name)}
                        disabled={isJoined}
                      >
                        {isJoined ? (
                          <><Check className="w-4 h-4" /> Katıldın</>
                        ) : (
                          <><Zap className="w-4 h-4" /> Katıl</>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Inline Check icon to avoid import issue
function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
