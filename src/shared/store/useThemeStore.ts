import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppTheme,
  AppThemeId,
  DEFAULT_THEME_ID,
  isValidThemeId,
  ThemeColors,
  THEMES,
} from '../theme/themes';

const THEME_STORAGE_KEY = '@clima_comunidad_theme_style_v2';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  themeId: AppThemeId;
  theme: AppTheme;
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  loadTheme: () => Promise<void>;
  setTheme: (themeId: AppThemeId) => void;
  toggleTheme: () => void;
}

function buildThemeSlice(themeId: AppThemeId) {
  const theme = THEMES[themeId];
  return {
    themeId,
    theme,
    isDark: theme.isDark,
    mode: (theme.isDark ? 'dark' : 'light') as ThemeMode,
    colors: theme.colors,
  };
}

export const useThemeStore = create<ThemeState>((set) => ({
  ...buildThemeSlice(DEFAULT_THEME_ID),

  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (isValidThemeId(stored)) {
        set(buildThemeSlice(stored));
      } else {
        set(buildThemeSlice(DEFAULT_THEME_ID));
      }
    } catch {
      // Mantener Nube Ilustrada por defecto ante fallo de lectura
    }
  },

  setTheme: (themeId: AppThemeId) => {
    if (!isValidThemeId(themeId)) return;
    AsyncStorage.setItem(THEME_STORAGE_KEY, themeId).catch(() => {});
    set(buildThemeSlice(themeId));
  },

  toggleTheme: () =>
    set((state) => {
      const nextId: AppThemeId = state.isDark ? 'ilustrada' : 'tormenta';
      AsyncStorage.setItem(THEME_STORAGE_KEY, nextId).catch(() => {});
      return buildThemeSlice(nextId);
    }),
}));
