import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import { AlertNotificationBanner } from '@/features/profile/components/AlertNotificationBanner';
import { buildClaudyReminderPayload } from '@/features/profile/data/notificationPreferences';
import { checkAndFireDueWebReminder } from '@/shared/services/dailyNotificationService';
import {
  navigationRef,
  navigateToHomeOutfitRecommender,
} from '@/app/navigation/navigationRef';
import {
  ClaudyCustomizerModal,
  ClaudyGreetingOverlay,
  useClaudyStore,
} from '@/features/claudy';

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { isDark, colors, loadTheme } = useThemeStore();
  const loadProfileState = useProfileStore((state) => state.loadProfileState);
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const hasEnteredApp = useProfileStore((state) => state.hasEnteredApp);
  const profile = useProfileStore((state) => state.profile);
  const fixedLocation = useProfileStore((state) => state.fixedLocation);
  const notificationPreferences = useProfileStore((state) => state.notificationPreferences);

  const loadClaudyConfig = useClaudyStore((state) => state.loadClaudyConfig);
  const initGreetingForSession = useClaudyStore((state) => state.initGreetingForSession);

  const weather = useHomeStore((state) => state.weather);
  const advice = useHomeStore((state) => state.advice);
  const selectedCity = useHomeStore((state) => state.selectedCity);

  useEffect(() => {
    loadTheme();
    loadClaudyConfig();
    loadProfileState();
  }, [loadTheme, loadClaudyConfig, loadProfileState]);

  useEffect(() => {
    if (hasHydrated && hasEnteredApp) {
      initGreetingForSession();
    }
  }, [hasHydrated, hasEnteredApp, initGreetingForSession]);

  // Manejar deep-link web `?section=outfit` (al abrir desde una notificación)
  useEffect(() => {
    if (Platform.OS !== 'web' || !hasHydrated || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('section') === 'outfit') {
      try {
        window.history.replaceState({}, document.title, window.location.pathname || '/');
      } catch {
        // Ignorar si history.replaceState no está disponible
      }
      setTimeout(() => {
        navigateToHomeOutfitRecommender();
      }, 120);
    }
  }, [hasHydrated]);

  // Comprobador ligero en pestaña web abierta para recordatorios diarios programados
  useEffect(() => {
    if (Platform.OS !== 'web' || !notificationPreferences.enabled) return;

    const tick = () => {
      checkAndFireDueWebReminder(notificationPreferences, () =>
        buildClaudyReminderPayload({
          claudyName: 'Claudy',
          userName: profile.fullName,
          isAuthenticated: profile.isAuthenticated,
          cityName: fixedLocation.name || selectedCity.name || 'Madrid',
          weather,
          advice,
          includeTempAndOutfit: notificationPreferences.includeTempAndOutfit,
        })
      );
    };

    tick();
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, [
    notificationPreferences,
    profile.fullName,
    profile.isAuthenticated,
    fixedLocation.name,
    selectedCity.name,
    weather,
    advice,
  ]);

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.cardSolid,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.gold,
    },
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <NavigationContainer ref={navigationRef} theme={navigationTheme}>
          {children}
        </NavigationContainer>
        <ClaudyGreetingOverlay />
        <ClaudyCustomizerModal />
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
