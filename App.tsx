import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/app/providers/AppProvider';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { useThemeStore } from '@/shared/store/useThemeStore';

export default function App() {
  const { mode } = useThemeStore();

  return (
    <AppProvider>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </AppProvider>
  );
}
