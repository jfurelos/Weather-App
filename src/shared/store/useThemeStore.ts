import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppTheme,
  AppThemeId,
  DEFAULT_THEME_ID,
  isValidThemeId,
  ThemeColors,
  ThemeMode,
  THEMES,
} from '../theme/themes';

// Nueva clave v3 para garantizar que usuarios nuevos y existentes inicien en Modo Oscuro predeterminado
const THEME_STORAGE_KEY = '@clima_comunidad_theme_mode_v3';

export type { ThemeMode };

interface ThemeState {
  themeId: AppThemeId;
  theme: AppTheme;
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  loadTheme: () => Promise<void>;
  setTheme: (themeId: AppThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

function buildThemeSlice(mode: ThemeMode) {
  const theme = THEMES[mode];
  return {
    themeId: mode,
    theme,
    isDark: theme.isDark,
    mode,
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
      set(buildThemeSlice(DEFAULT_THEME_ID));
    }
  },

  setTheme: (themeId: AppThemeId) => {
    if (!isValidThemeId(themeId)) return;
    AsyncStorage.setItem(THEME_STORAGE_KEY, themeId).catch(() => {});
    set(buildThemeSlice(themeId));
  },

  setMode: (mode: ThemeMode) => {
    if (!isValidThemeId(mode)) return;
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
    set(buildThemeSlice(mode));
  },

  toggleTheme: () =>
    set((state) => {
      const nextMode: ThemeMode = state.isDark ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode).catch(() => {});
      return buildThemeSlice(nextMode);
    }),
}));
