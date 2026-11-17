import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightPalette, darkPalette, ThemeColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@clima_comunidad_theme_mode_v1';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  loadTheme: () => Promise<void>;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  colors: lightPalette,
  loadTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        set({
          mode: stored,
          colors: stored === 'light' ? lightPalette : darkPalette,
        });
      }
    } catch {
      // Ignorar fallo de lectura local
    }
  },
  toggleTheme: () =>
    set((state) => {
      const nextMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode).catch(() => {});
      return {
        mode: nextMode,
        colors: nextMode === 'light' ? lightPalette : darkPalette,
      };
    }),
  setTheme: (mode: ThemeMode) => {
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
    set({
      mode,
      colors: mode === 'light' ? lightPalette : darkPalette,
    });
  },
}));
