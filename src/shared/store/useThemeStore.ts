import { create } from 'zustand';
import { lightPalette, darkPalette, ThemeColors } from '../theme/colors';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  colors: lightPalette,
  toggleTheme: () =>
    set((state) => {
      const nextMode = state.mode === 'light' ? 'dark' : 'light';
      return {
        mode: nextMode,
        colors: nextMode === 'light' ? lightPalette : darkPalette,
      };
    }),
  setTheme: (mode: ThemeMode) =>
    set({
      mode,
      colors: mode === 'light' ? lightPalette : darkPalette,
    }),
}));
