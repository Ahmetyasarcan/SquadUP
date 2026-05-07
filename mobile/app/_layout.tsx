import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';

// ---------------------------------------------------------------------------
// Navigation guard — lives inside AuthProvider so it can read useAuth()
// ---------------------------------------------------------------------------
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wait until session checked from AsyncStorage

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not authenticated → send to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Already authenticated → send to tabs
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  // Show splash spinner while AsyncStorage session is being read
  if (loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={COLORS.primaryLight} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          presentation: 'modal',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          presentation: 'modal',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="new-chat" 
        options={{ 
          presentation: 'modal',
          headerShown: false
        }} 
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Root layout — wraps everything in AuthProvider + Toast
// ---------------------------------------------------------------------------
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <Toast />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
  },
});
