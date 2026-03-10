// mobile/src/App.js
// ==================
// Root component: Bottom Tab Navigator with Turkish tab labels.
// Turkish navigation: "Ana Sayfa" | "Öneriler" | "Profilim"

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import FeedScreen from './src/screens/FeedScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { UI_TEXT } from './src/constants/translations';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  [UI_TEXT.nav.home]:            '🎯',
  [UI_TEXT.nav.recommendations]: '⭐',
  [UI_TEXT.nav.profile]:         '👤',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '800', fontSize: 18 },
            tabBarActiveTintColor: '#6366f1',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarStyle: { borderTopColor: '#e5e7eb', paddingBottom: 4 },
            tabBarIcon: () => (
              <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name] || '•'}</Text>
            ),
          })}
        >
          <Tab.Screen
            name={UI_TEXT.nav.home}
            component={FeedScreen}
            options={{ title: '🎯 ' + UI_TEXT.nav.home }}
          />
          <Tab.Screen
            name={UI_TEXT.nav.recommendations}
            component={RecommendationsScreen}
            options={{ title: '⭐ ' + UI_TEXT.nav.recommendations }}
          />
          <Tab.Screen
            name={UI_TEXT.nav.profile}
            component={ProfileScreen}
            options={{ title: '👤 ' + UI_TEXT.nav.profile }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
