import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, TrendingUp, Sparkles, Star, Shield, Trophy, Calendar, MapPin, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { MOCK_ACTIVITIES, MOCK_SQUADS, PLATFORM_STATS } from '../data/mockData';
import { CATEGORIES, CATEGORY_ICONS, COMPETITION_LEVELS } from '../constants/translations';
import { formatDateTime } from '../utils/formatters';

export default function HomePage() {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Show top 3 trending activities (highest participants ratio)
  const trendingActivities = [...MOCK_ACTIVITIES]
    .sort((a, b) => (b.current_participants / b.max_participants) - (a.current_participants / a.max_participants))
    .slice(0, 3);

  // Show top 3 squads by members
  const topSquads = [...MOCK_SQUADS]
    .sort((a, b) => b.member_count - a.member_count)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-card border border-primary-400/30 
                        rounded-full mb-6 shadow-glow-cyan">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-semibold text-primary-400">Akıllı Eşleştirme Teknolojisi</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
            <span className="block text-slate-100">Aktivite Bul,</span>
            <span className="block bg-gradient-to-r from-primary-400 via-secondary-500 to-secondary-600 
                           bg-clip-text text-transparent text-glow-cyan">
              Takım Kur
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Sana uygun aktiviteleri keşfet, yeni insanlarla tanış, 
            <span className="text-primary-400 font-semibold"> AI destekli eşleştirme</span> ile 
            mükemmel takım arkadaşları bul
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/activities">
              <Button variant="neon" size="lg" className="group">
                Aktiviteleri Keşfet
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/create">
              <Button variant="secondary" size="lg">
                Aktivite Oluştur
              </Button>
            </Link>
          </div>
        </div>

        {/* Platform Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {[
            { label: 'Aktif Kullanıcı', value: PLATFORM_STATS.totalUsers.toLocaleString('tr'), icon: <Users className="w-5 h-5 text-primary-400" />, color: 'text-primary-400' },
            { label: 'Toplam Aktivite', value: PLATFORM_STATS.totalActivities, icon: <Calendar className="w-5 h-5 text-secondary-400" />, color: 'text-secondary-400' },
            { label: 'Aktif Squad', value: PLATFORM_STATS.totalSquads, icon: <Shield className="w-5 h-5 text-emerald-400" />, color: 'text-emerald-400' },
            { label: 'Bugün Aktif', value: PLATFORM_STATS.activeToday, icon: <Zap className="w-5 h-5 text-amber-400" />, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-6 border border-dark-border hover:border-primary-400/50 transition-all duration-300 text-center group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          
          {/* Feature 1 */}
          <div className="group relative glass rounded-2xl p-8 border border-dark-border 
                        hover:border-primary-400 transition-all duration-300 
                        hover:shadow-glow-cyan">
            <div className="absolute inset-0 bg-gradient-card rounded-2xl opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 
                            rounded-xl flex items-center justify-center mb-4 
                            shadow-glow-cyan group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-primary-400 
                           transition-colors">
                Akıllı Eşleştirme
              </h3>
              <p className="text-slate-400">
                İlgi alanlarınıza ve seviyenize göre size en uygun aktiviteleri ve 
                takım arkadaşlarını bulun
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative glass rounded-2xl p-8 border border-dark-border 
                        hover:border-secondary-400 transition-all duration-300 
                        hover:shadow-glow-purple">
            <div className="absolute inset-0 bg-gradient-card rounded-2xl opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary-400 to-secondary-600 
                            rounded-xl flex items-center justify-center mb-4 
                            shadow-glow-purple group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-secondary-400 
                           transition-colors">
                Canlı Topluluk
              </h3>
              <p className="text-slate-400">
                Binlerce aktif kullanıcıyla tanışın, yeni arkadaşlıklar kurun, 
                birlikte aktivitelere katılın
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative glass rounded-2xl p-8 border border-dark-border 
                        hover:border-primary-400 transition-all duration-300 
                        hover:shadow-glow-cyan">
            <div className="absolute inset-0 bg-gradient-card rounded-2xl opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-secondary-500 
                            rounded-xl flex items-center justify-center mb-4 
                            shadow-neon group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-3 
                           bg-gradient-to-r from-primary-400 to-secondary-400 
                           bg-clip-text group-hover:text-transparent transition-all">
                Güvenilirlik Sistemi
              </h3>
              <p className="text-slate-400">
                Kullanıcı güvenilirlik skorları ile en aktif ve güvenilir 
                takım arkadaşlarını görün
              </p>
            </div>
          </div>
        </div>

        {/* Trending Activities */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-100">Trend Aktiviteler</h2>
            </div>
            <Link to="/activities" className="flex items-center gap-1 text-primary-400 text-sm font-semibold hover:text-primary-300 transition-colors">
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {trendingActivities.map((activity, idx) => {
              const fillPercent = Math.round((activity.current_participants / activity.max_participants) * 100);
              const isFull = activity.current_participants >= activity.max_participants;
              return (
                <Link key={activity.id} to="/activities">
                  <div className="group glass rounded-2xl border border-dark-border hover:border-primary-400 p-5 transition-all duration-300 hover:shadow-glow-cyan hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-2xl">{CATEGORY_ICONS[activity.category]}</span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full">
                          🔥 HOT
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-100 mb-1 text-sm group-hover:text-primary-400 transition-colors line-clamp-1">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location.split(',')[0]}
                    </p>
                    
                    {/* Fill bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                        <span>{activity.current_participants}/{activity.max_participants} kişi</span>
                        <span className={fillPercent >= 80 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                          {fillPercent >= 80 ? `Son ${activity.max_participants - activity.current_participants} yer!` : `%${fillPercent} dolu`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-dark-hover rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            fillPercent >= 80
                              ? 'bg-gradient-to-r from-red-500 to-orange-500'
                              : 'bg-gradient-to-r from-primary-500 to-secondary-500'
                          }`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-secondary-400" />
                        {COMPETITION_LEVELS[activity.competition_level]}
                      </span>
                      <span className="text-[10px] font-bold text-primary-400 flex items-center gap-1">
                        Katıl <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Top Squads */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-secondary-400 to-primary-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-100">Popüler Squads</h2>
            </div>
            <Link to="/squads" className="flex items-center gap-1 text-primary-400 text-sm font-semibold hover:text-primary-300 transition-colors">
              Tümünü Gör <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {topSquads.map((squad, idx) => (
              <Link key={squad.id} to="/squads">
                <div className="group glass rounded-2xl border border-dark-border hover:border-secondary-400 p-5 transition-all duration-300 hover:shadow-glow-purple hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-xl shadow-neon">
                      {CATEGORY_ICONS[squad.category]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 group-hover:text-secondary-400 transition-colors">
                        {squad.name}
                      </h3>
                      <p className="text-xs text-slate-500">{CATEGORIES[squad.category]}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{squad.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary-400" />
                      <span className="font-bold text-slate-200">{squad.member_count}</span> üye
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        ⭐ En Popüler
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center glass rounded-3xl p-12 border border-primary-400/30 
                      shadow-glow-cyan relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              Hemen Başla, İlk Aktiviteni Oluştur
            </h2>
            <p className="text-slate-400 mb-6 max-w-xl mx-auto">
              Dakikalar içinde yeni bir aktivite oluştur veya sana uygun bir aktiviteye katıl
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/create">
                <Button variant="neon" size="lg" className="animate-glow">
                  Ücretsiz Başla
                </Button>
              </Link>
              <Link to="/recommendations">
                <Button variant="secondary" size="lg">
                  <Sparkles className="w-5 h-5" />
                  AI Önerilerini Gör
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
