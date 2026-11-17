import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
  const tabHeight = 56 + bottomPadding;

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
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="WeatherMap"
        component={WeatherMapScreen}
        options={{
          tabBarLabel: 'Noticias',
          tabBarIcon: ({ color, size }) => <CloudRain color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={ForumListScreen}
        options={{
          tabBarLabel: 'Comunidad',
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={22} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
};
