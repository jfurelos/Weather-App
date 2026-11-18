import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, ViewStyle } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import { Home, CloudRain, MessageSquare, User } from 'lucide-react-native';
import { MainTabParamList } from './types';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { WeatherMapScreen } from '@/features/weather-map/screens/WeatherMapScreen';
import { ForumListScreen } from '@/features/community/screens/ForumListScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { DISPLAY_FONT } from '@/shared/theme/typography';
import { Typography } from '@/shared/components/Typography';

const Tab = createBottomTabNavigator<MainTabParamList>();

const CLOUD_TAB_PATH =
  'M 4,56 L 4,34 C 4,23 14,16 25,18 C 30,9 43,6 54,11 C 63,3 79,2 90,9 C 101,2 117,3 126,11 C 137,6 150,9 155,18 C 166,16 176,23 176,34 L 176,56';

const CloudTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { themeId, theme, colors } = useThemeStore();

  const renderIcon = (routeName: string, color: string) => {
    switch (routeName) {
      case 'Home':
        return <Home color={color} size={18} strokeWidth={2.3} />;
      case 'WeatherMap':
        return <CloudRain color={color} size={18} strokeWidth={2.3} />;
      case 'Community':
        return <MessageSquare color={color} size={18} strokeWidth={2.3} />;
      case 'Profile':
      default:
        return <User color={color} size={18} strokeWidth={2.3} />;
    }
  };

  const getActiveTabShadow = (): ViewStyle | undefined => {
    if (Platform.OS !== 'web') return undefined;
    if (themeId === 'tormenta') {
      return {
        filter: 'drop-shadow(0 4px 10px rgba(196, 217, 236, 0.28))',
      } as unknown as ViewStyle;
    }
    if (themeId === 'acuarela') {
      return {
        filter: 'drop-shadow(0 -3px 8px rgba(90, 155, 213, 0.18))',
      } as unknown as ViewStyle;
    }
    if (themeId === 'papercut') {
      return {
        filter: 'drop-shadow(0 -3px 0px #D4C5AC)',
      } as unknown as ViewStyle;
    }
    return undefined;
  };

  return (
    <View
      style={[
        styles.barOuter,
        {
          backgroundColor: colors.headerBg,
          borderTopColor: colors.border,
          borderTopWidth: theme.metrics.windowBorderWidth,
        },
        getGlassStyle(theme),
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

          const fill = isFocused ? colors.tabActiveBg : colors.tabInactiveBg;
          const stroke = isFocused ? colors.border : colors.tabBorder;
          const strokeWidth = isFocused
            ? theme.metrics.windowBorderWidth
            : theme.metrics.tabBorderWidth;
          const textColor = isFocused ? colors.tabActiveText : colors.tabInactiveText;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              activeOpacity={0.85}
              onPress={onPress}
              style={[
                styles.cloudTabBtn,
                isFocused && styles.cloudTabActive,
                isFocused && getActiveTabShadow(),
              ]}
            >
              <View style={styles.svgContainer} pointerEvents="none">
                <Svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 180 56"
                  preserveAspectRatio="none"
                >
                  <Path
                    d={CLOUD_TAB_PATH}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth * 1.4}
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>

              <View style={styles.tabContent}>
                {renderIcon(route.name, textColor)}
                <Typography
                  variant="captionMedium"
                  numberOfLines={1}
                  style={{
                    color: textColor,
                    fontFamily: DISPLAY_FONT,
                    fontWeight: isFocused ? '700' : '600',
                    fontSize: 11,
                    lineHeight: 13,
                  }}
                >
                  {label}
                </Typography>
              </View>
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
      tabBar={(props) => <CloudTabBar {...props} />}
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
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingHorizontal: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
  },
  cloudTabBtn: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
    position: 'relative',
  },
  cloudTabActive: {
    transform: [{ translateY: -3 }],
    zIndex: 5,
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 12,
  },
});
