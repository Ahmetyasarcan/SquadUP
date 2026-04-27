import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function TabLayout() {
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
          fontSize: 12,
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Aktiviteler',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons 
                name={focused ? 'grid' : 'grid-outline'} 
                size={size} 
                color={color} 
              />
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
              <Ionicons 
                name={focused ? 'star' : 'star-outline'} 
                size={size} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="squads"
        options={{
          title: 'Squads',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused && styles.activeIconContainer}>
              <Ionicons 
                name={focused ? 'people' : 'people-outline'} 
                size={size} 
                color={color} 
              />
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
              <Ionicons 
                name={focused ? 'person-add' : 'person-add-outline'} 
                size={size} 
                color={color} 
              />
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
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={size} 
                color={color} 
              />
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
    padding: 8,
    borderRadius: 12,
  },
});
