import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, CloudRain, MessageSquare, User } from 'lucide-react-native';
import { MainTabParamList } from './types';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { WeatherMapScreen } from '@/features/weather-map/screens/WeatherMapScreen';
import { ForumListScreen } from '@/features/community/screens/ForumListScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { useThemeStore } from '@/shared/store/useThemeStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size ?? 22} />,
        }}
      />
      <Tab.Screen
        name="WeatherMap"
        component={WeatherMapScreen}
        options={{
          tabBarLabel: 'Noticias & Radar',
          tabBarIcon: ({ color, size }) => <CloudRain color={color} size={size ?? 22} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={ForumListScreen}
        options={{
          tabBarLabel: 'Comunidad',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size ?? 22} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size ?? 22} />,
        }}
      />
    </Tab.Navigator>
  );
};
