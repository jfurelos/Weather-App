import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, useWindowDimensions, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { registerRootComponent } from 'expo';
import { AppProvider } from '@/app/providers/AppProvider';
import { RootNavigator } from '@/app/navigation/RootNavigator';
import { useThemeStore } from '@/shared/store/useThemeStore';

// Reset de márgenes, fuentes Fredoka/Nunito y metadatos PWA para entorno web
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
  ensureHeadTag('link[data-google-fonts="nube"]', 'link', {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800&display=swap',
    'data-google-fonts': 'nube',
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
      font-family: 'Nunito', -apple-system, BlinkMacSystemFont, sans-serif;
      transition: background-color 0.35s ease, color 0.3s ease;
    }
    #root {
      height: 100% !important;
      width: 100% !important;
    }
    ::selection {
      background: #FAD165;
      color: #28323E;
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
  const { themeId, theme, isDark, colors } = useThemeStore();
  const { width } = useWindowDimensions();

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
      document.body.style.backgroundImage = theme.webPattern.backgroundImage;
      document.body.style.backgroundSize = theme.webPattern.backgroundSize;
    }
  }, [themeId, theme, colors.background, colors.outerShellBg]);

  const isDesktopWeb = Platform.OS === 'web' && width > 520;
  const webOuterPattern =
    Platform.OS === 'web'
      ? ({
          backgroundImage: theme.webPattern.backgroundImage,
          backgroundSize: theme.webPattern.backgroundSize,
        } as unknown as ViewStyle)
      : undefined;

  return (
    <View
      style={[
        styles.outerShell,
        {
          backgroundColor: isDesktopWeb ? colors.outerShellBg : colors.background,
        },
        webOuterPattern,
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
              borderWidth: theme.metrics.windowBorderWidth,
              borderRadius: theme.metrics.windowRadius + 4,
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
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 10,
  },
});

export default registerRootComponent(App);
