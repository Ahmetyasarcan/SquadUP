/**
 * lib/supabase.ts
 * =====================
 * Supabase client configured for React Native / Expo.
 * - Uses AsyncStorage for session persistence (token survives app restarts)
 * - autoRefreshToken: true  → tokens refresh automatically
 * - persistSession: true    → session saved to AsyncStorage
 * - detectSessionInUrl: false → not needed in native (no URL scheme auth)
 */

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL ve Anon Key eksik!\n' +
    'mobile/.env dosyasına EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY ekle.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
