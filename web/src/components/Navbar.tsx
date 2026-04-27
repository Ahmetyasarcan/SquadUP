import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, PlusCircle, User, LogOut, Menu, X, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-dark-border backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo with Gradient */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl 
                            shadow-glow-cyan group-hover:shadow-glow-cyan-lg transition-all duration-300 
                            flex items-center justify-center transform group-hover:scale-105">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-primary-400 to-secondary-500 
                           bg-clip-text text-transparent">
              SquadUp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-slate-300 hover:text-primary-400 
                       transition-colors duration-200 group"
            >
              <Home className="w-5 h-5 group-hover:drop-shadow-glow-cyan" />
              <span>Ana Sayfa</span>
            </Link>
            
            <Link
              to="/activities"
              className="flex items-center gap-2 text-slate-300 hover:text-primary-400 
                       transition-colors duration-200 group"
            >
              <Compass className="w-5 h-5 group-hover:drop-shadow-glow-cyan" />
              <span>Aktiviteler</span>
            </Link>
            
            <Link
              to="/recommendations"
              className="flex items-center gap-2 text-slate-300 hover:text-secondary-400 
                       transition-colors duration-200 group"
            >
              <span className="group-hover:text-glow-purple">Öneriler</span>
            </Link>

            <Link
              to="/squads"
              className="flex items-center gap-2 text-slate-300 hover:text-primary-400 
                       transition-colors duration-200 group"
            >
              <Users className="w-5 h-5 group-hover:drop-shadow-glow-cyan" />
              <span>Squads</span>
            </Link>

            <Link
              to="/friends"
              className="flex items-center gap-2 text-slate-300 hover:text-secondary-400 
                       transition-colors duration-200 group"
            >
              <UserPlus className="w-5 h-5 group-hover:drop-shadow-glow-purple" />
              <span>Arkadaşlar</span>
            </Link>
            
            <Link
              to="/create"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 
                       hover:from-primary-400 hover:to-secondary-400 text-white rounded-lg 
                       shadow-neon hover:shadow-glow-cyan-lg transition-all duration-300 
                       transform hover:scale-105"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-semibold">Oluştur</span>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg 
                           bg-dark-card hover:bg-dark-hover border border-dark-border 
                           hover:border-primary-400 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-secondary-500 
                                rounded-full flex items-center justify-center shadow-glow-cyan">
                    <span className="text-white font-bold text-sm">
                      {user.user_metadata?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden lg:inline text-slate-100 font-medium">
                    {user.user_metadata?.name || user.email}
                  </span>
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass rounded-xl border border-dark-border 
                                shadow-2xl shadow-primary-500/20 py-2 backdrop-blur-xl z-50">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-hover 
                               text-slate-300 hover:text-primary-400 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Profilim</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-hover 
                               text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="neon">Giriş Yap</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-300 hover:text-primary-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-dark-border backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block px-4 py-2 text-slate-300 hover:text-primary-400 hover:bg-dark-card rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ana Sayfa
            </Link>
            <Link
              to="/activities"
              className="block px-4 py-2 text-slate-300 hover:text-primary-400 hover:bg-dark-card rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Aktiviteler
            </Link>
            <Link
              to="/recommendations"
              className="block px-4 py-2 text-slate-300 hover:text-primary-400 hover:bg-dark-card rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Öneriler
            </Link>
            <Link
              to="/squads"
              className="block px-4 py-2 text-slate-300 hover:text-primary-400 hover:bg-dark-card rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Squads
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
