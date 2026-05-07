import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, MessageCircle, User, LogOut, Menu, X,
  Home, Compass, PlusCircle, Users, UserPlus, Check, BellOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getNotifications, markAllNotificationsAsRead,
  subscribeToNotifications, getConversations,
} from '../services/socialApi';
import toast from 'react-hot-toast';

function NotifIcon({ type }: { type: string }) {
  if (type === 'friend_request' || type === 'friend_accepted')
    return <UserPlus className="w-4 h-4 text-secondary-400 flex-shrink-0" />;
  if (type === 'message')
    return <MessageCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />;
  return <Bell className="w-4 h-4 text-amber-400 flex-shrink-0" />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins}dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadNotif(data.filter((n: any) => !n.read).length);
    } catch { /* tables may not exist yet */ }
  }, []);

  const loadUnreadMsg = useCallback(async () => {
    try {
      const convs = await getConversations();
      setUnreadMsg(convs.reduce((a, c) => a + c.unreadCount, 0));
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    loadUnreadMsg();
    const channel = subscribeToNotifications(user.id, (n) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadNotif((p) => p + 1);
      if (n.type === 'message') setUnreadMsg((p) => p + 1);
      toast(n.title, {
        icon: n.type === 'message' ? '💬' : '🔔',
        style: { background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155' },
      });
    });
    return () => { channel.unsubscribe(); };
  }, [user?.id, loadNotifications, loadUnreadMsg]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsAsRead();
      setUnreadNotif(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { toast.error('İşlem başarısız'); }
  }

  async function handleLogout() {
    try { await signOut(); navigate('/'); } catch (e) { console.error(e); }
  }

  const navLink = 'flex items-center gap-2 text-slate-300 hover:text-primary-400 transition-colors duration-200';

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-border backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl shadow-glow-cyan group-hover:shadow-glow-cyan-lg transition-all duration-300 flex items-center justify-center transform group-hover:scale-105">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent">SquadUp</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/" className={navLink}><Home className="w-5 h-5" /><span>Ana Sayfa</span></Link>
            <Link to="/activities" className={navLink}><Compass className="w-5 h-5" /><span>Aktiviteler</span></Link>
            <Link to="/friends" className={navLink}><Users className="w-5 h-5" /><span>Arkadaşlar</span></Link>
            <Link to="/create" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg shadow-neon transition-all duration-300 transform hover:scale-105">
              <PlusCircle className="w-5 h-5" /><span className="font-semibold">Oluştur</span>
            </Link>

            {user ? (
              <>
                {/* Bell */}
                <div className="relative" ref={notifRef}>
                  <button id="navbar-notif-btn" onClick={() => { setShowNotif(v => !v); setShowUserMenu(false); }}
                    className="relative p-2 rounded-lg hover:bg-dark-hover transition-colors" aria-label="Bildirimler">
                    <Bell className="w-6 h-6 text-slate-300" />
                    {unreadNotif > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                        {unreadNotif > 9 ? '9+' : unreadNotif}
                      </span>
                    )}
                  </button>

                  {showNotif && (
                    <div className="absolute right-0 mt-3 w-96 max-h-[520px] flex flex-col glass rounded-2xl border border-dark-border shadow-2xl backdrop-blur-xl z-50">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border flex-shrink-0">
                        <h3 className="font-bold text-slate-100 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-primary-400" /> Bildirimler
                          {unreadNotif > 0 && (
                            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">{unreadNotif} yeni</span>
                          )}
                        </h3>
                        {unreadNotif > 0 && (
                          <button onClick={handleMarkAllRead} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                            <Check className="w-3 h-3" /> Tümünü okundu işaretle
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                            <BellOff className="w-10 h-10 opacity-40" />
                            <p className="text-sm">Bildirim yok</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-dark-border">
                            {notifications.map((n) => (
                              <div key={n.id} className={`flex gap-3 px-5 py-4 hover:bg-dark-hover transition-colors cursor-pointer ${!n.read ? 'bg-primary-500/5' : ''}`}>
                                <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${!n.read ? 'bg-primary-500/15' : 'bg-dark-hover'}`}>
                                  <NotifIcon type={n.type} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-semibold truncate ${!n.read ? 'text-slate-100' : 'text-slate-300'}`}>{n.title}</p>
                                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[11px] text-slate-500 mt-1">{timeAgo(n.created_at)}</p>
                                </div>
                                {!n.read && <div className="w-2 h-2 bg-primary-400 rounded-full mt-1 flex-shrink-0" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <Link to="/messages" id="navbar-messages-link" onClick={() => setUnreadMsg(0)}
                  className="relative p-2 rounded-lg hover:bg-dark-hover transition-colors" aria-label="Mesajlar">
                  <MessageCircle className="w-6 h-6 text-slate-300" />
                  {unreadMsg > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadMsg > 9 ? '9+' : unreadMsg}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative" ref={userRef}>
                  <button id="navbar-user-btn" onClick={() => { setShowUserMenu(v => !v); setShowNotif(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border hover:border-primary-400 transition-all duration-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-full flex items-center justify-center shadow-glow-cyan">
                      <span className="text-white font-bold text-sm">
                        {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-slate-100 font-medium max-w-[140px] truncate">
                      {user.user_metadata?.name || user.email}
                    </span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 glass rounded-xl border border-dark-border shadow-2xl shadow-primary-500/20 py-2 backdrop-blur-xl z-50">
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-hover text-slate-300 hover:text-primary-400 transition-colors" onClick={() => setShowUserMenu(false)}>
                        <User className="w-4 h-4" /> Profilim
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-hover text-red-400 hover:text-red-300 transition-colors">
                        <LogOut className="w-4 h-4" /> Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg font-semibold shadow-neon transition-all duration-300">
                Giriş Yap
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-slate-300 hover:text-primary-400" onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-dark-border backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {[['/', 'Ana Sayfa'], ['/activities', 'Aktiviteler'], ['/friends', 'Arkadaşlar'], ['/messages', 'Mesajlar'], ['/create', 'Aktivite Oluştur']].map(([to, label]) => (
              <Link key={to} to={to} className="block px-4 py-2.5 text-slate-300 hover:text-primary-400 hover:bg-dark-card rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>{label}</Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="block px-4 py-2.5 text-slate-300 hover:text-primary-400 hover:bg-dark-card rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Profilim</Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-dark-card rounded-lg transition-colors">Çıkış Yap</button>
              </>
            ) : (
              <Link to="/login" className="block px-4 py-2.5 text-primary-400 font-semibold hover:bg-dark-card rounded-lg transition-colors" onClick={() => setMobileOpen(false)}>Giriş Yap</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
