import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, CloudRain, MessageSquare, User } from 'lucide-react-native';
import { MainTabParamList } from './types';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { WeatherMapScreen } from '@/features/weather-map/screens/WeatherMapScreen';
import { ForumListScreen } from '@/features/community/screens/ForumListScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { FONT_BODY_BOLD, FONT_BODY_SEMIBOLD } from '@/shared/theme/typography';
import { spacing } from '@/shared/theme/spacing';
import { Typography } from '@/shared/components/Typography';

const Tab = createBottomTabNavigator<MainTabParamList>();

const EditorialTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { isDark, colors } = useThemeStore();

  const renderIcon = (routeName: string, color: string, focused: boolean) => {
    const strokeWidth = focused ? 2.4 : 2;
    switch (routeName) {
      case 'Home':
        return <Home color={color} size={20} strokeWidth={strokeWidth} />;
      case 'WeatherMap':
        return <CloudRain color={color} size={20} strokeWidth={strokeWidth} />;
      case 'Community':
        return <MessageSquare color={color} size={20} strokeWidth={strokeWidth} />;
      case 'Profile':
      default:
        return <User color={color} size={20} strokeWidth={strokeWidth} />;
    }
  };

  return (
    <View
      style={[
        styles.barOuter,
        {
          backgroundColor: colors.headerBg,
          borderTopColor: colors.tabBorder,
        },
      ]}
    >
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const contentColor = isFocused ? colors.tabActiveText : colors.tabInactiveText;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              activeOpacity={0.82}
              onPress={onPress}
              style={[
                styles.tabBtn,
                isFocused && [
                  styles.tabBtnActive,
                  {
                    backgroundColor: colors.tabActiveBg,
                    borderColor: isDark ? 'rgba(224, 159, 62, 0.35)' : 'rgba(51, 92, 103, 0.18)',
                  },
                ],
              ]}
            >
              {renderIcon(route.name, contentColor, isFocused)}
              <Typography
                variant="captionMedium"
                numberOfLines={1}
                style={{
                  color: contentColor,
                  fontFamily: isFocused ? FONT_BODY_BOLD : FONT_BODY_SEMIBOLD,
                  fontWeight: isFocused ? '700' : '600',
                  fontSize: 11,
                  lineHeight: 14,
                }}
              >
                {label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const BottomTabNavigator: React.FC = () => {
  const isAuthenticated = useProfileStore((state) => state.profile.isAuthenticated);

  return (
    <Tab.Navigator
      tabBar={(props) => <EditorialTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen
        name="WeatherMap"
        component={WeatherMapScreen}
        options={{
          tabBarLabel: 'Noticias',
        }}
      />
      {isAuthenticated && (
        <Tab.Screen
          name="Community"
          component={ForumListScreen}
          options={{
            tabBarLabel: 'Comunidad',
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  barOuter: {
    borderTopWidth: 1,
    paddingTop: spacing.sm + 2,
    paddingBottom: Platform.OS === 'ios' ? 20 : spacing.sm + 4,
    paddingHorizontal: spacing.md,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs + 2,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.borderRadiusMd,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    borderWidth: 1,
  },
});
