import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useStore } from '../store/useStore';
import { getMe } from '../services/api';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const { setUser, user } = useStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function clearSession() {
      try {
        await SecureStore.deleteItemAsync('squadup-token');
        setUser(null);
      } catch (err) {
        console.log('Session clear failed', err);
      } finally {
        setIsReady(true);
      }
    }
    clearSession();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Use setImmediate or similar to ensure the router is ready
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
    } else if (user && inAuthGroup) {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 0);
    }
  }, [user, segments, isReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
