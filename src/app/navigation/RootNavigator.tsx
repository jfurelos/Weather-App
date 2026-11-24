import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { BottomTabNavigator } from './BottomTabNavigator';
import { WelcomeAuthScreen } from '@/features/auth/screens/WelcomeAuthScreen';
import { ComarcaDetailScreen } from '@/features/community/screens/ComarcaDetailScreen';
import { ChatConversationScreen } from '@/features/community/screens/ChatConversationScreen';
import { ScreenBackground } from '@/shared/components/ScreenBackground';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useThemeStore } from '@/shared/store/useThemeStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { colors } = useThemeStore();
  const hasHydrated = useProfileStore((state) => state.hasHydrated);
  const hasEnteredApp = useProfileStore((state) => state.hasEnteredApp);
  const isAuthenticated = useProfileStore((state) => state.profile.isAuthenticated);

  if (!hasHydrated) {
    return (
      <ScreenBackground style={styles.loader}>
        <ActivityIndicator size="large" color={colors.onBackgroundAccent} />
      </ScreenBackground>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasEnteredApp ? (
        <Stack.Screen name="WelcomeAuth" component={WelcomeAuthScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          {isAuthenticated && (
            <>
              <Stack.Screen name="ComarcaDetail" component={ComarcaDetailScreen} />
              <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
