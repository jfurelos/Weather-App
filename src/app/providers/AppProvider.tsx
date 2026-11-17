import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

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
      <NavigationContainer theme={navigationTheme}>
        {children}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
