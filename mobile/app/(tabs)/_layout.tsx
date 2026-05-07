import React, { useState, useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { getNotifications, subscribeToNotifications } from '../../services/socialApi';
import Toast from 'react-native-toast-message';

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Load initial count
    getNotifications().then((data) => {
      setUnreadNotifCount(data.filter((n: any) => !n.read).length);
    }).catch(() => {});

    // Subscribe to new notifications
    const channel = subscribeToNotifications(user.id, (newNotif) => {
      setUnreadNotifCount((prev) => prev + 1);
      Toast.show({
        type: 'info',
        text1: newNotif.title,
        text2: newNotif.message,
        onPress: () => router.push('/notifications')
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const headerRightIcon = () => (
    <TouchableOpacity 
      style={styles.bellButton} 
      onPress={() => router.push('/notifications')}
    >
      <Ionicons name="notifications" size={24} color={COLORS.textPrimary} />
      {unreadNotifCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primaryLight,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.darkCard,
          borderTopColor: COLORS.darkBorder,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: COLORS.darkBg,
          borderBottomColor: COLORS.darkBorder,
          borderBottomWidth: 1,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShown: true,
        headerRight: headerRightIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Aktiviteler',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: 'Öneriler',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? 'star' : 'star-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Oluştur',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.createIconContainer}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="squads"
        options={{
          title: 'Squads',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Arkadaşlar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? 'person-add' : 'person-add-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mesajlar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: COLORS.primary + '22',
    padding: 6,
    borderRadius: 12,
  },
  createIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  bellButton: {
    marginRight: 16,
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.darkBg,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  }
});
