import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, CloudRain, MessageSquare, User } from 'lucide-react-native';
import { MainTabParamList } from './types';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { WeatherMapScreen } from '@/features/weather-map/screens/WeatherMapScreen';
import { ForumListScreen } from '@/features/community/screens/ForumListScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const { colors } = useThemeStore();
  const isAuthenticated = useProfileStore((state) => state.profile.isAuthenticated);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingTop: 8,
          paddingBottom: 16,
        },
        tabBarItemStyle: {
          height: 52,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          marginBottom: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          lineHeight: 14,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="WeatherMap"
        component={WeatherMapScreen}
        options={{
          tabBarLabel: 'Noticias',
          tabBarIcon: ({ color }) => <CloudRain color={color} size={22} />,
        }}
      />
      {isAuthenticated && (
        <Tab.Screen
          name="Community"
          component={ForumListScreen}
          options={{
            tabBarLabel: 'Comunidad',
            tabBarIcon: ({ color }) => <MessageSquare color={color} size={22} />,
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
};
