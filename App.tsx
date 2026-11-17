import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { AppProvider } from '@/app/providers/AppProvider';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { useThemeStore } from '@/shared/store/useThemeStore';

// Reset de márgenes y altura para entorno web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      overflow: hidden !important;
    }
    #root {
      height: 100% !important;
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);
}

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

