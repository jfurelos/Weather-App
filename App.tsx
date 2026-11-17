import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { AppProvider } from '@/app/providers/AppProvider';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { useThemeStore } from '@/shared/store/useThemeStore';

function App() {
  const { mode } = useThemeStore();

  return (
    <AppProvider>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </AppProvider>
  );
}

export default registerRootComponent(App);

