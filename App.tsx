import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { AppProvider } from '@/app/providers/AppProvider';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { useThemeStore } from '@/shared/store/useThemeStore';

// Reset de márgenes, altura y metadatos PWA para entorno web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.title = 'Clima & Comunidad España';

  const ensureHeadTag = (
    selector: string,
    tagName: 'link' | 'meta',
    attrs: Record<string, string>
  ) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(tagName);
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
  };

  ensureHeadTag('link[rel="manifest"]', 'link', { rel: 'manifest', href: '/manifest.json' });
  ensureHeadTag('link[rel="apple-touch-icon"]', 'link', {
    rel: 'apple-touch-icon',
    href: '/icon-192.png',
  });
  ensureHeadTag('meta[name="apple-mobile-web-app-capable"]', 'meta', {
    name: 'apple-mobile-web-app-capable',
    content: 'yes',
  });
  ensureHeadTag('meta[name="apple-mobile-web-app-status-bar-style"]', 'meta', {
    name: 'apple-mobile-web-app-status-bar-style',
    content: 'default',
  });
  ensureHeadTag('meta[name="apple-mobile-web-app-title"]', 'meta', {
    name: 'apple-mobile-web-app-title',
    content: 'Clima España',
  });
  ensureHeadTag('meta[name="mobile-web-app-capable"]', 'meta', {
    name: 'mobile-web-app-capable',
    content: 'yes',
  });

  const style = document.createElement('style');
  style.textContent = `
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      overflow: hidden !important;
      overscroll-behavior: none;
    }
    #root {
      height: 100% !important;
      width: 100% !important;
    }
  `;
  document.head.appendChild(style);

  // Registrar Service Worker para permitir "Instalar app" (PWA) en móviles
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

function App() {
  const { mode, colors } = useThemeStore();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      let themeMeta = document.head.querySelector('meta[name="theme-color"]');
      if (!themeMeta) {
        themeMeta = document.createElement('meta');
        themeMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeMeta);
      }
      themeMeta.setAttribute('content', colors.background);
      document.body.style.backgroundColor = mode === 'dark' ? '#100F0E' : '#EFE9DD';
    }
  }, [mode, colors.background]);

  const isDesktopWeb = Platform.OS === 'web' && width > 520;

  return (
    <View
      style={[
        styles.outerShell,
        {
          backgroundColor: isDesktopWeb
            ? mode === 'dark'
              ? '#100F0E'
              : '#EFE9DD'
            : colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.appFrame,
          { backgroundColor: colors.background },
          isDesktopWeb && [
            styles.desktopFrame,
            {
              borderColor: colors.border,
              shadowColor: '#000',
            },
          ],
        ]}
      >
        <AppProvider>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          <RootNavigator />
        </AppProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  desktopFrame: {
    maxWidth: 430,
    maxHeight: 900,
    borderRadius: 28,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 10,
  },
});

export default registerRootComponent(App);
