/**
 * contexts/AuthContext.tsx
 * ========================
 * Global auth state via React Context + Supabase.
 *
 * Provides:
 *   user      — Supabase User object (or null)
 *   session   — Active session (or null)
 *   loading   — True while initial session is being checked (splash screen)
 *   signIn    — Email/password login
 *   signUp    — Email/password registration + profile creation in users table
 *   signOut   — Logout + session cleanup
 *   resetPassword — Send password reset email
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import Toast from 'react-native-toast-message';
import { useStore } from '../store/useStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, avatarSeed?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // true → splash spinner shown
  const setStoreUser = useStore((state) => state.setUser);

  useEffect(() => {
    // 1. Check existing session on app start (AsyncStorage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // Sync to Zustand store (cast to our User type)
      setStoreUser(currentUser as any);
      setLoading(false);
    });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        // Sync to Zustand store
        setStoreUser(currentUser as any);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setStoreUser]);

  // -------------------------------------------------------------------------
  // signUp
  // -------------------------------------------------------------------------
  const signUp = async (email: string, password: string, name: string, avatarSeed?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // stored in user_metadata
      },
    });

    if (error) throw error;

    // Create profile row in public.users table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert(
          {
            id: data.user.id,
            email,
            name,
            interests: [],
            competition_level: 3,
            attended_events: 0,
            joined_events: 0,
            avatar_seed: avatarSeed,
          },
          { onConflict: 'id' } // safe for existing users
        );

      if (profileError) {
        // Non-fatal: log but don't block the signup flow
        console.warn('Profile creation warning:', profileError.message);
      }
    }

    Toast.show({
      type: 'success',
      text1: 'Kayıt Başarılı! 🎉',
      text2: 'Email adresinizi onaylayın 📧',
      visibilityTime: 5000,
    });
  };

  // -------------------------------------------------------------------------
  // signIn
  // -------------------------------------------------------------------------
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    Toast.show({
      type: 'success',
      text1: 'Hoş Geldin! 👋',
      text2: 'Giriş başarılı',
    });
  };

  // -------------------------------------------------------------------------
  // signOut
  // -------------------------------------------------------------------------
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    Toast.show({
      type: 'info',
      text1: 'Çıkış Yapıldı',
      text2: 'Görüşmek üzere! 👋',
    });
  };

  // -------------------------------------------------------------------------
  // resetPassword
  // -------------------------------------------------------------------------
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;

    Toast.show({
      type: 'success',
      text1: 'Email Gönderildi! 📧',
      text2: 'Şifre sıfırlama linkini kontrol edin',
      visibilityTime: 5000,
    });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
