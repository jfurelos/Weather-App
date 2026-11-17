import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { AlertNotificationBanner } from '@/features/profile/components/AlertNotificationBanner';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { mode, colors, loadTheme } = useThemeStore();
  const loadProfileState = useProfileStore((state) => state.loadProfileState);

  useEffect(() => {
    loadTheme();
    loadProfileState();
  }, [loadTheme, loadProfileState]);

  const navigationTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <NavigationContainer theme={navigationTheme}>
          {children}
        </NavigationContainer>
        <AlertNotificationBanner />
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
