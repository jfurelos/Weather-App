import { Platform, ViewStyle } from 'react-native';

export type ThemeMode = 'dark' | 'light';
export type AppThemeId = ThemeMode;

export const OFFICIAL_PALETTE = {
  slate: '#335C67',
  slateDeep: '#24434B',
  slateHeader: '#274953',
  slateSecondary: '#4B6F79',
  slateMuted: '#6A8991',
  vanilla: '#FFF3B0',
  offWhite: '#FAF6E8',
  paperSoft: '#F2EBD5',
  white: '#FFFFFF',
  honey: '#E09F3E',
  burgundy: '#9E2A2B',
  burgundyDeep: '#540B0E',
} as const;

export interface ThemeColors {
  // Fondos principales
  background: string;
  outerShellBg: string;
  surface: string;
  card: string;
  cardHighlight: string;
  cardSolid: string;
  inputBg: string;
  headerBg: string;
  headerText: string;
  headerSubtext: string;

  // Texto sobre el fondo general de pantalla (Dark: blanco/vainilla, Light: azul pizarra)
  onBackground: string;
  onBackgroundAccent: string;
  onBackgroundSecondary: string;

  // Texto dentro de tarjetas, contenedores y modales
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Bordes y divisores
  border: string;
  borderStrong: string;
  subcardBorder: string;
  divider: string;

  // Acciones, acentos y estados
  primary: string;
  primaryDark: string;
  onPrimary: string;
  primaryMuted: string;
  accent: string;
  onAccent: string;
  accentMuted: string;
  danger: string;
  sky: string;
  gold: string;
  turquoise: string;
  plum: string;
  sand: string;
  warning: string;
  info: string;
  rain: string;
  wind: string;
  heat: string;

  // Pills y navegación
  pillBg: string;
  pillActiveBg: string;
  pillActiveText: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabActiveIndicator: string;
  tabInactiveBg: string;
  tabInactiveText: string;
  tabBorder: string;
  cardShadow: string;
}

export interface ThemeMetrics {
  windowBorderWidth: number;
  subcardBorderWidth: number;
  tabBorderWidth: number;
  windowRadius: number;
  subcardRadius: number;
  glassBlur: number;
}

export interface ThemeMeta {
  id: ThemeMode;
  name: string;
  shortName: string;
  subtitle: string;
  isDark: boolean;
  swatchBg: string;
  swatchCard: string;
  swatchAccent: string;
  swatchPrimary: string;
}

export interface AppTheme {
  id: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  metrics: ThemeMetrics;
  webPattern: {
    backgroundImage: string;
    backgroundSize: string;
  };
  shadows: {
    window: ViewStyle;
    subcard: ViewStyle;
    pillActive: ViewStyle;
    modal: ViewStyle;
  };
  meta: ThemeMeta;
}

function makeWebStyle(styles: Record<string, string | number>): ViewStyle {
  return Platform.OS === 'web' ? (styles as unknown as ViewStyle) : {};
}

export function getGlassStyle(theme: AppTheme): ViewStyle {
  if (Platform.OS !== 'web' || theme.metrics.glassBlur <= 0) {
    return {};
  }
  return {
    backdropFilter: `blur(${theme.metrics.glassBlur}px)`,
    WebkitBackdropFilter: `blur(${theme.metrics.glassBlur}px)`,
  } as unknown as ViewStyle;
}

export const THEMES: Record<ThemeMode, AppTheme> = {
  dark: {
    id: 'dark',
    isDark: true,
    colors: {
      background: OFFICIAL_PALETTE.slate, // #335C67
      outerShellBg: OFFICIAL_PALETTE.slateDeep, // #24434B
      surface: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      card: OFFICIAL_PALETTE.offWhite, // #FAF6E8
      cardHighlight: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      cardSolid: OFFICIAL_PALETTE.offWhite, // #FAF6E8
      inputBg: OFFICIAL_PALETTE.white, // #FFFFFF
      headerBg: OFFICIAL_PALETTE.slateHeader, // #274953
      headerText: OFFICIAL_PALETTE.white, // #FFFFFF
      headerSubtext: OFFICIAL_PALETTE.vanilla, // #FFF3B0

      onBackground: OFFICIAL_PALETTE.white, // #FFFFFF
      onBackgroundAccent: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      onBackgroundSecondary: 'rgba(255, 255, 255, 0.84)',

      textPrimary: OFFICIAL_PALETTE.slate, // #335C67
      textSecondary: OFFICIAL_PALETTE.slateSecondary, // #4B6F79
      textMuted: OFFICIAL_PALETTE.slateMuted, // #6A8991

      border: 'rgba(51, 92, 103, 0.16)',
      borderStrong: OFFICIAL_PALETTE.slate, // #335C67
      subcardBorder: 'rgba(51, 92, 103, 0.18)',
      divider: 'rgba(51, 92, 103, 0.14)',

      primary: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      primaryDark: OFFICIAL_PALETTE.burgundyDeep, // #540B0E
      onPrimary: OFFICIAL_PALETTE.white, // #FFFFFF
      primaryMuted: 'rgba(158, 42, 43, 0.12)',

      accent: OFFICIAL_PALETTE.honey, // #E09F3E
      onAccent: OFFICIAL_PALETTE.burgundyDeep, // #540B0E
      accentMuted: 'rgba(224, 159, 62, 0.22)',

      danger: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      sky: OFFICIAL_PALETTE.slate, // #335C67
      gold: OFFICIAL_PALETTE.honey, // #E09F3E
      turquoise: OFFICIAL_PALETTE.slate, // #335C67
      plum: OFFICIAL_PALETTE.burgundyDeep, // #540B0E
      sand: OFFICIAL_PALETTE.offWhite, // #FAF6E8
      warning: OFFICIAL_PALETTE.honey, // #E09F3E
      info: OFFICIAL_PALETTE.slate, // #335C67
      rain: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      wind: OFFICIAL_PALETTE.slate, // #335C67
      heat: OFFICIAL_PALETTE.honey, // #E09F3E

      pillBg: OFFICIAL_PALETTE.paperSoft, // #F2EBD5
      pillActiveBg: OFFICIAL_PALETTE.honey, // #E09F3E
      pillActiveText: OFFICIAL_PALETTE.burgundyDeep, // #540B0E

      tabActiveBg: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      tabActiveText: OFFICIAL_PALETTE.slate, // #335C67
      tabActiveIndicator: OFFICIAL_PALETTE.honey, // #E09F3E
      tabInactiveBg: 'transparent',
      tabInactiveText: 'rgba(255, 255, 255, 0.78)',
      tabBorder: 'rgba(255, 243, 176, 0.16)',
      cardShadow: 'rgba(14, 30, 35, 0.28)',
    },
    metrics: {
      windowBorderWidth: 1,
      subcardBorderWidth: 1,
      tabBorderWidth: 1,
      windowRadius: 20,
      subcardRadius: 14,
      glassBlur: 0,
    },
    webPattern: {
      backgroundImage: 'none',
      backgroundSize: 'auto',
    },
    shadows: {
      window: Platform.select({
        web: makeWebStyle({ boxShadow: '0 8px 24px rgba(14, 30, 35, 0.22)' }),
        ios: {
          shadowColor: '#0E1E23',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 14,
        },
        android: { elevation: 4 },
        default: {},
      }) as ViewStyle,
      subcard: Platform.select({
        web: makeWebStyle({ boxShadow: '0 2px 8px rgba(51, 92, 103, 0.08)' }),
        ios: {
          shadowColor: '#335C67',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: { elevation: 1 },
        default: {},
      }) as ViewStyle,
      pillActive: Platform.select({
        web: makeWebStyle({ boxShadow: '0 4px 12px rgba(20, 38, 43, 0.22)' }),
        ios: {
          shadowColor: '#14262B',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
        default: {},
      }) as ViewStyle,
      modal: Platform.select({
        web: makeWebStyle({ boxShadow: '0 -10px 32px rgba(14, 30, 35, 0.34)' }),
        ios: {
          shadowColor: '#0E1E23',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.28,
          shadowRadius: 18,
        },
        android: { elevation: 10 },
        default: {},
      }) as ViewStyle,
    },
    meta: {
      id: 'dark',
      name: 'Modo Oscuro',
      shortName: 'Oscuro',
      subtitle: 'Pizarra nocturna (#335C67) con tarjetas crema cálidas',
      isDark: true,
      swatchBg: OFFICIAL_PALETTE.slate,
      swatchCard: OFFICIAL_PALETTE.offWhite,
      swatchAccent: OFFICIAL_PALETTE.honey,
      swatchPrimary: OFFICIAL_PALETTE.burgundy,
    },
  },

  light: {
    id: 'light',
    isDark: false,
    colors: {
      background: OFFICIAL_PALETTE.white, // #FFFFFF
      outerShellBg: '#F4EFE4',
      surface: OFFICIAL_PALETTE.offWhite, // #FAF6E8
      card: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      cardHighlight: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      cardSolid: OFFICIAL_PALETTE.white, // #FFFFFF
      inputBg: OFFICIAL_PALETTE.white, // #FFFFFF
      headerBg: OFFICIAL_PALETTE.white, // #FFFFFF
      headerText: OFFICIAL_PALETTE.slate, // #335C67
      headerSubtext: OFFICIAL_PALETTE.slateSecondary, // #4B6F79

      onBackground: OFFICIAL_PALETTE.slate, // #335C67
      onBackgroundAccent: OFFICIAL_PALETTE.burgundyDeep, // #540B0E
      onBackgroundSecondary: OFFICIAL_PALETTE.slateSecondary, // #4B6F79

      textPrimary: OFFICIAL_PALETTE.slate, // #335C67
      textSecondary: OFFICIAL_PALETTE.slateSecondary, // #4B6F79
      textMuted: OFFICIAL_PALETTE.slateMuted, // #6A8991

      border: 'rgba(51, 92, 103, 0.20)',
      borderStrong: OFFICIAL_PALETTE.slate, // #335C67
      subcardBorder: 'rgba(51, 92, 103, 0.16)',
      divider: 'rgba(51, 92, 103, 0.15)',

      primary: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      primaryDark: OFFICIAL_PALETTE.burgundyDeep, // #540B0E
      onPrimary: OFFICIAL_PALETTE.white, // #FFFFFF
      primaryMuted: 'rgba(158, 42, 43, 0.11)',

      accent: OFFICIAL_PALETTE.honey, // #E09F3E
      onAccent: OFFICIAL_PALETTE.burgundyDeep, // #540B0E
      accentMuted: 'rgba(224, 159, 62, 0.22)',

      danger: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      sky: OFFICIAL_PALETTE.slate, // #335C67
      gold: OFFICIAL_PALETTE.honey, // #E09F3E
      turquoise: OFFICIAL_PALETTE.slate, // #335C67
      plum: OFFICIAL_PALETTE.burgundyDeep, // #540B0E
      sand: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      warning: OFFICIAL_PALETTE.honey, // #E09F3E
      info: OFFICIAL_PALETTE.slate, // #335C67
      rain: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      wind: OFFICIAL_PALETTE.slate, // #335C67
      heat: OFFICIAL_PALETTE.honey, // #E09F3E

      pillBg: OFFICIAL_PALETTE.offWhite, // #FAF6E8
      pillActiveBg: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      pillActiveText: OFFICIAL_PALETTE.white, // #FFFFFF

      tabActiveBg: OFFICIAL_PALETTE.vanilla, // #FFF3B0
      tabActiveText: OFFICIAL_PALETTE.slate, // #335C67
      tabActiveIndicator: OFFICIAL_PALETTE.burgundy, // #9E2A2B
      tabInactiveBg: 'transparent',
      tabInactiveText: OFFICIAL_PALETTE.slateMuted, // #6A8991
      tabBorder: 'rgba(51, 92, 103, 0.14)',
      cardShadow: 'rgba(51, 92, 103, 0.12)',
    },
    metrics: {
      windowBorderWidth: 1,
      subcardBorderWidth: 1,
      tabBorderWidth: 1,
      windowRadius: 20,
      subcardRadius: 14,
      glassBlur: 0,
    },
    webPattern: {
      backgroundImage: 'none',
      backgroundSize: 'auto',
    },
    shadows: {
      window: Platform.select({
        web: makeWebStyle({ boxShadow: '0 6px 20px rgba(51, 92, 103, 0.10)' }),
        ios: {
          shadowColor: '#335C67',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: { elevation: 3 },
        default: {},
      }) as ViewStyle,
      subcard: Platform.select({
        web: makeWebStyle({ boxShadow: '0 2px 8px rgba(51, 92, 103, 0.06)' }),
        ios: {
          shadowColor: '#335C67',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        android: { elevation: 1 },
        default: {},
      }) as ViewStyle,
      pillActive: Platform.select({
        web: makeWebStyle({ boxShadow: '0 4px 12px rgba(158, 42, 43, 0.20)' }),
        ios: {
          shadowColor: '#9E2A2B',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.18,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
        default: {},
      }) as ViewStyle,
      modal: Platform.select({
        web: makeWebStyle({ boxShadow: '0 -8px 28px rgba(51, 92, 103, 0.16)' }),
        ios: {
          shadowColor: '#335C67',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.14,
          shadowRadius: 16,
        },
        android: { elevation: 10 },
        default: {},
      }) as ViewStyle,
    },
    meta: {
      id: 'light',
      name: 'Modo Claro',
      shortName: 'Claro',
      subtitle: 'Papel blanco limpio (#FFFFFF) con tarjetas vainilla',
      isDark: false,
      swatchBg: OFFICIAL_PALETTE.white,
      swatchCard: OFFICIAL_PALETTE.vanilla,
      swatchAccent: OFFICIAL_PALETTE.honey,
      swatchPrimary: OFFICIAL_PALETTE.burgundy,
    },
  },
};

export const THEME_LIST: AppTheme[] = [THEMES.dark, THEMES.light];

// Modo Oscuro es el tema PREDETERMINADO al abrir la app por primera vez
export const DEFAULT_THEME_ID: ThemeMode = 'dark';

export function isValidThemeId(value: string | null | undefined): value is ThemeMode {
  return value === 'dark' || value === 'light';
}
