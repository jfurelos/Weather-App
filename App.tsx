import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { useFonts } from 'expo-font';
import { Jost_600SemiBold } from '@expo-google-fonts/jost/600SemiBold';
import { Jost_700Bold } from '@expo-google-fonts/jost/700Bold';
import { Montserrat_600SemiBold } from '@expo-google-fonts/montserrat/600SemiBold';
import { Montserrat_700Bold } from '@expo-google-fonts/montserrat/700Bold';
import { AppProvider } from '@/app/providers/AppProvider';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { useThemeStore } from '@/shared/store/useThemeStore';

// Reset de márgenes, fuentes Jost/Montserrat y metadatos PWA para entorno web
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

  ensureHeadTag('link[data-font-preconnect="googleapis"]', 'link', {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
    'data-font-preconnect': 'googleapis',
  });
  ensureHeadTag('link[data-font-preconnect="gstatic"]', 'link', {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossorigin: 'anonymous',
    'data-font-preconnect': 'gstatic',
  });
  ensureHeadTag('link[data-google-fonts="editorial"]', 'link', {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Jost:wght@600;700&family=Montserrat:wght@600;700&display=swap',
    'data-google-fonts': 'editorial',
  });

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
    content: 'black-translucent',
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
      font-family: 'Montserrat_700Bold', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-synthesis: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.25s ease, color 0.2s ease;
    }
    *, *::before, *::after {
      font-synthesis: none;
    }
    input, textarea, button {
      font-family: 'Montserrat_700Bold', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #root {
      height: 100% !important;
      width: 100% !important;
    }
    ::selection {
      background: #E09F3E;
      color: #540B0E;
    }
  `;
  document.head.appendChild(style);

  // Registrar Service Worker para permitir "Instalar app" (PWA) en móviles
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => { });
    });
  }
}

function App() {
  const { themeId, theme, isDark, colors } = useThemeStore();
  const { width } = useWindowDimensions();

  const [fontsLoaded, fontError] = useFonts({
    Jost_600SemiBold,
    Jost_700Bold,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', themeId);
      let themeMeta = document.head.querySelector('meta[name="theme-color"]');
      if (!themeMeta) {
        themeMeta = document.createElement('meta');
        themeMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeMeta);
      }
      themeMeta.setAttribute('content', colors.background);
      document.body.style.backgroundColor = colors.outerShellBg;
      document.body.style.backgroundImage = 'none';
    }
  }, [themeId, colors.background, colors.outerShellBg]);

  // En nativo esperamos a la carga de fuentes; en web pintamos al instante con fallback Google Fonts
  if (!fontsLoaded && !fontError && Platform.OS !== 'web') {
    return <View style={[styles.outerShell, { backgroundColor: colors.background }]} />;
  }

  const isDesktopWeb = Platform.OS === 'web' && width > 520;

  return (
    <View
      style={[
        styles.outerShell,
        {
          backgroundColor: isDesktopWeb ? colors.outerShellBg : colors.background,
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
              borderColor: isDark ? 'rgba(255, 243, 176, 0.16)' : colors.border,
              borderWidth: 1,
              borderRadius: 28,
            },
            theme.shadows.window,
          ],
        ]}
      >
        <AppProvider>
          <StatusBar style={isDark ? 'light' : 'dark'} />
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
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    elevation: 10,
  },
});

export default registerRootComponent(App);
