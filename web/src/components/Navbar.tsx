import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Compass, PlusCircle, User, Sparkles, Moon, Sun, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { logout } from '../utils/auth';
import { UI_TEXT } from '../constants/translations';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { darkMode, toggleDarkMode, user, setUser } = useStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setUser(null);
    setShowUserMenu(false);
    setShowMobileMenu(false);
    toast.success('Çıkış yapıldı');
    navigate('/');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {UI_TEXT.navbar.title}
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/activities" className={linkClass}>
              <Compass className="w-4 h-4" />
              <span>{UI_TEXT.navbar.activities}</span>
            </NavLink>

            <NavLink to="/recommendations" className={linkClass}>
              <Sparkles className="w-4 h-4" />
              <span>{UI_TEXT.navbar.recommendations}</span>
            </NavLink>

            <NavLink
              to="/create"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md'
                }`
              }
            >
              <PlusCircle className="w-4 h-4" />
              <span>{UI_TEXT.navbar.create}</span>
            </NavLink>

            {/* User Menu or Login */}
            {user ? (
              <div className="relative ml-2" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Kullanıcı menüsü"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1.5 animate-slide-down z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profilim
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Giriş Yap
              </Link>
            )}

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-1 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile: dark mode + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Menüyü aç"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            <NavLink to="/activities" className={mobileLinkClass} onClick={() => setShowMobileMenu(false)}>
              <Compass className="w-5 h-5" />
              {UI_TEXT.navbar.activities}
            </NavLink>
            <NavLink to="/recommendations" className={mobileLinkClass} onClick={() => setShowMobileMenu(false)}>
              <Sparkles className="w-5 h-5" />
              {UI_TEXT.navbar.recommendations}
            </NavLink>
            <NavLink to="/create" className={mobileLinkClass} onClick={() => setShowMobileMenu(false)}>
              <PlusCircle className="w-5 h-5" />
              {UI_TEXT.navbar.create}
            </NavLink>

            {user ? (
              <>
                <NavLink to="/profile" className={mobileLinkClass} onClick={() => setShowMobileMenu(false)}>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  {user.name}
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <NavLink to="/login" className={mobileLinkClass} onClick={() => setShowMobileMenu(false)}>
                <User className="w-5 h-5" />
                Giriş Yap
              </NavLink>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
