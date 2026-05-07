import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, avatarSeed?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // -------------------------------------------------------------------------
  // signUp — same logic as mobile (upsert to avoid duplicate key errors)
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

    // Create profile row in public.users (upsert = safe for existing users)
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
          { onConflict: 'id' }
        );

      if (profileError) {
        console.warn('Profile creation warning:', profileError.message);
      }
    }

    toast.success('Kayıt başarılı! 🎉 Email adresinizi onaylayın 📧', { duration: 5000 });
  };

  // -------------------------------------------------------------------------
  // signIn
  // -------------------------------------------------------------------------
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    toast.success('Hoş Geldin! 👋 Giriş başarılı');
    return data;
  };

  // -------------------------------------------------------------------------
  // signOut
  // -------------------------------------------------------------------------
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Çıkış yapıldı 👋');
  };

  // -------------------------------------------------------------------------
  // resetPassword
  // -------------------------------------------------------------------------
  const resetPassword = async (email: string) => {
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) throw error;
    toast.success('Şifre sıfırlama linki email adresinize gönderildi 📧', { duration: 5000 });
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
