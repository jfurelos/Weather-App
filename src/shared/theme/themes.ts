import { Platform, ViewStyle } from 'react-native';

export type AppThemeId = 'ilustrada' | 'acuarela' | 'tormenta' | 'papercut';

export interface ThemeColors {
  background: string;
  outerShellBg: string;
  surface: string;
  card: string;
  cardSolid: string;
  headerBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  subcardBorder: string;
  divider: string;
  primary: string;
  onPrimary: string;
  primaryMuted: string;
  accent: string;
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
  pillBg: string;
  pillActiveBg: string;
  pillActiveText: string;
  tabActiveBg: string;
  tabActiveText: string;
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
  id: AppThemeId;
  order: number;
  name: string;
  shortName: string;
  subtitle: string;
  emoji: string;
  isDark: boolean;
  swatchBg: string;
  swatchGradientWeb?: string;
  swatchBorder: string;
  swatchShadowWeb?: string;
  swatchDots: [string, string];
  swatchDotBorder?: string;
  activeOptionBorder: string;
  activeOptionBg: string;
  activeOptionShadowWeb: string;
}

export interface AppTheme {
  id: AppThemeId;
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

export const THEMES: Record<AppThemeId, AppTheme> = {
  ilustrada: {
    id: 'ilustrada',
    isDark: false,
    colors: {
      background: '#F6F1E3',
      outerShellBg: '#EAE2CE',
      surface: '#F4F8FC',
      card: '#FFFDF7',
      cardSolid: '#FFFDF7',
      headerBg: '#F4EFE0',
      textPrimary: '#28323E',
      textSecondary: '#516070',
      textMuted: '#758494',
      border: '#28323E',
      borderStrong: '#28323E',
      subcardBorder: '#28323E',
      divider: 'rgba(40, 50, 62, 0.16)',
      primary: '#5A9BD5',
      onPrimary: '#FFFFFF',
      primaryMuted: '#DCEAF7',
      accent: '#67B7B5',
      sky: '#C4D9EC',
      gold: '#FAD165',
      turquoise: '#67B7B5',
      plum: '#58333E',
      sand: '#EADEC9',
      warning: '#B57B14',
      info: '#5A9BD5',
      rain: '#5A9BD5',
      wind: '#489997',
      heat: '#58333E',
      pillBg: '#F3EFE3',
      pillActiveBg: '#FAD165',
      pillActiveText: '#28323E',
      tabActiveBg: '#FFFDF7',
      tabActiveText: '#28323E',
      tabInactiveBg: '#DCEAF7',
      tabInactiveText: '#455669',
      tabBorder: '#28323E',
      cardShadow: '#C4D9EC',
    },
    metrics: {
      windowBorderWidth: 2,
      subcardBorderWidth: 1.5,
      tabBorderWidth: 2,
      windowRadius: 22,
      subcardRadius: 18,
      glassBlur: 0,
    },
    webPattern: {
      backgroundImage: 'radial-gradient(#DDD3BC 1.3px, transparent 1.3px)',
      backgroundSize: '24px 24px',
    },
    shadows: {
      window: Platform.select({
        web: makeWebStyle({ boxShadow: '5px 5px 0px #C4D9EC' }),
        ios: {
          shadowColor: '#C4D9EC',
          shadowOffset: { width: 5, height: 5 },
          shadowOpacity: 1,
          shadowRadius: 0,
        },
        android: { elevation: 4 },
        default: {},
      }) as ViewStyle,
      subcard: {},
      pillActive: Platform.select({
        web: makeWebStyle({ boxShadow: '2px 2px 0px #28323E' }),
        ios: {
          shadowColor: '#28323E',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
        },
        android: { elevation: 2 },
        default: {},
      }) as ViewStyle,
      modal: Platform.select({
        web: makeWebStyle({ boxShadow: '0 -6px 0px #C4D9EC, 0 -12px 28px rgba(40, 50, 62, 0.16)' }),
        ios: {
          shadowColor: '#28323E',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: { elevation: 10 },
        default: {},
      }) as ViewStyle,
    },
    meta: {
      id: 'ilustrada',
      order: 1,
      name: '1. Nube Ilustrada',
      shortName: 'Nube Ilustrada',
      subtitle: 'Papel crema, tinta pizarra y cómic suave',
      emoji: '☁️',
      isDark: false,
      swatchBg: '#F6F1E3',
      swatchBorder: '#28323E',
      swatchShadowWeb: '2px 2px 0 #C4D9EC',
      swatchDots: ['#C4D9EC', '#FAD165'],
      swatchDotBorder: '#28323E',
      activeOptionBorder: '#28323E',
      activeOptionBg: '#FFFDF7',
      activeOptionShadowWeb: '3px 3px 0px #FAD165',
    },
  },

  acuarela: {
    id: 'acuarela',
    isDark: false,
    colors: {
      background: '#E4F1FC',
      outerShellBg: '#CFE5F9',
      surface: 'rgba(240, 248, 255, 0.85)',
      card: 'rgba(255, 255, 255, 0.80)',
      cardSolid: '#F4FAFF',
      headerBg: 'rgba(235, 246, 255, 0.72)',
      textPrimary: '#23384D',
      textSecondary: '#4B6882',
      textMuted: '#6E8BA6',
      border: 'rgba(255, 255, 255, 0.95)',
      borderStrong: 'rgba(90, 155, 213, 0.35)',
      subcardBorder: 'rgba(90, 155, 213, 0.22)',
      divider: 'rgba(90, 155, 213, 0.18)',
      primary: '#5A9BD5',
      onPrimary: '#FFFFFF',
      primaryMuted: 'rgba(182, 215, 242, 0.45)',
      accent: '#5BB5B0',
      sky: '#B6D7F2',
      gold: '#FAD165',
      turquoise: '#5BB5B0',
      plum: '#58333E',
      sand: '#EBF4FC',
      warning: '#B57B14',
      info: '#5A9BD5',
      rain: '#5A9BD5',
      wind: '#5BB5B0',
      heat: '#58333E',
      pillBg: 'rgba(226, 240, 252, 0.85)',
      pillActiveBg: '#5BB5B0',
      pillActiveText: '#FFFFFF',
      tabActiveBg: 'rgba(255, 255, 255, 0.92)',
      tabActiveText: '#1F4E78',
      tabInactiveBg: 'rgba(215, 234, 250, 0.65)',
      tabInactiveText: '#4A6B88',
      tabBorder: 'rgba(255, 255, 255, 0.90)',
      cardShadow: 'rgba(90, 155, 213, 0.18)',
    },
    metrics: {
      windowBorderWidth: 2,
      subcardBorderWidth: 1.5,
      tabBorderWidth: 1.5,
      windowRadius: 28,
      subcardRadius: 18,
      glassBlur: 14,
    },
    webPattern: {
      backgroundImage:
        'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.75) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(196,217,236,0.55) 0%, transparent 50%)',
      backgroundSize: '100% 100%',
    },
    shadows: {
      window: Platform.select({
        web: makeWebStyle({
          boxShadow: '0 14px 34px rgba(90, 155, 213, 0.18), inset 0 2px 0 rgba(255, 255, 255, 0.95)',
        }),
        ios: {
          shadowColor: '#5A9BD5',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.18,
          shadowRadius: 20,
        },
        android: { elevation: 4 },
        default: {},
      }) as ViewStyle,
      subcard: Platform.select({
        web: makeWebStyle({ boxShadow: '0 4px 12px rgba(90, 155, 213, 0.08)' }),
        default: {},
      }) as ViewStyle,
      pillActive: Platform.select({
        web: makeWebStyle({ boxShadow: '0 4px 12px rgba(91, 181, 176, 0.28)' }),
        ios: {
          shadowColor: '#5BB5B0',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
        default: {},
      }) as ViewStyle,
      modal: Platform.select({
        web: makeWebStyle({ boxShadow: '0 -12px 34px rgba(90, 155, 213, 0.22)' }),
        ios: {
          shadowColor: '#5A9BD5',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.2,
          shadowRadius: 18,
        },
        android: { elevation: 10 },
        default: {},
      }) as ViewStyle,
    },
    meta: {
      id: 'acuarela',
      order: 2,
      name: '2. Cielo Acuarela',
      shortName: 'Cielo Acuarela',
      subtitle: 'Cristal esmerilado y nubes esponjosas',
      emoji: '🫧',
      isDark: false,
      swatchBg: '#D9ECFC',
      swatchGradientWeb: 'linear-gradient(135deg, #D9ECFC 0%, #FFFFFF 100%)',
      swatchBorder: '#FFFFFF',
      swatchShadowWeb: '0 4px 10px rgba(90, 155, 213, 0.25)',
      swatchDots: ['#5A9BD5', '#5BB5B0'],
      activeOptionBorder: '#5A9BD5',
      activeOptionBg: 'rgba(255, 255, 255, 0.92)',
      activeOptionShadowWeb: '0 6px 16px rgba(90, 155, 213, 0.22)',
    },
  },

  tormenta: {
    id: 'tormenta',
    isDark: true,
    colors: {
      background: '#1E2733',
      outerShellBg: '#131922',
      surface: '#314054',
      card: '#283444',
      cardSolid: '#283444',
      headerBg: '#222D3B',
      textPrimary: '#F2F6FA',
      textSecondary: '#B8C7D9',
      textMuted: '#8496AB',
      border: '#42556E',
      borderStrong: '#526A88',
      subcardBorder: '#42556E',
      divider: 'rgba(196, 217, 236, 0.14)',
      primary: '#7CB5E8',
      onPrimary: '#1E2733',
      primaryMuted: 'rgba(124, 181, 232, 0.18)',
      accent: '#67B7B5',
      sky: '#C4D9EC',
      gold: '#FAD165',
      turquoise: '#67B7B5',
      plum: '#B88A98',
      sand: '#36465B',
      warning: '#FAD165',
      info: '#7CB5E8',
      rain: '#7CB5E8',
      wind: '#67B7B5',
      heat: '#D6A4B3',
      pillBg: '#324154',
      pillActiveBg: '#FAD165',
      pillActiveText: '#1E2733',
      tabActiveBg: '#C4D9EC',
      tabActiveText: '#1E2733',
      tabInactiveBg: '#324154',
      tabInactiveText: '#B8C7D9',
      tabBorder: '#4A5F7A',
      cardShadow: 'rgba(11, 16, 23, 0.45)',
    },
    metrics: {
      windowBorderWidth: 1.5,
      subcardBorderWidth: 1.5,
      tabBorderWidth: 1.5,
      windowRadius: 22,
      subcardRadius: 18,
      glassBlur: 0,
    },
    webPattern: {
      backgroundImage: 'radial-gradient(#2D3B4D 1.2px, transparent 1.2px)',
      backgroundSize: '24px 24px',
    },
    shadows: {
      window: Platform.select({
        web: makeWebStyle({ boxShadow: '0 14px 30px rgba(11, 16, 23, 0.45)' }),
        ios: {
          shadowColor: '#0B1017',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.45,
          shadowRadius: 18,
        },
        android: { elevation: 6 },
        default: {},
      }) as ViewStyle,
      subcard: {},
      pillActive: Platform.select({
        web: makeWebStyle({ boxShadow: '0 4px 12px rgba(250, 209, 101, 0.25)' }),
        ios: {
          shadowColor: '#FAD165',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
        default: {},
      }) as ViewStyle,
      modal: Platform.select({
        web: makeWebStyle({ boxShadow: '0 -12px 30px rgba(5, 9, 15, 0.6)' }),
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
        },
        android: { elevation: 12 },
        default: {},
      }) as ViewStyle,
    },
    meta: {
      id: 'tormenta',
      order: 3,
      name: '3. Pizarra Tormenta',
      shortName: 'Pizarra Tormenta',
      subtitle: 'Modo crepúsculo con nube pastel y oro',
      emoji: '⛈️',
      isDark: true,
      swatchBg: '#1E2733',
      swatchBorder: '#4A5F7A',
      swatchDots: ['#C4D9EC', '#FAD165'],
      activeOptionBorder: '#FAD165',
      activeOptionBg: '#334357',
      activeOptionShadowWeb: '0 6px 18px rgba(11, 16, 23, 0.45)',
    },
  },

  papercut: {
    id: 'papercut',
    isDark: false,
    colors: {
      background: '#EADEC9',
      outerShellBg: '#DDD0B8',
      surface: '#F3EFE6',
      card: '#FAF7F0',
      cardSolid: '#FAF7F0',
      headerBg: '#F2ECE0',
      textPrimary: '#362A30',
      textSecondary: '#58333E',
      textMuted: '#7C656C',
      border: '#DFD3BE',
      borderStrong: '#CBBBA0',
      subcardBorder: '#E2D6C1',
      divider: 'rgba(88, 51, 62, 0.14)',
      primary: '#58333E',
      onPrimary: '#FAF7F0',
      primaryMuted: 'rgba(88, 51, 62, 0.11)',
      accent: '#67B7B5',
      sky: '#B4CDE0',
      gold: '#FAD165',
      turquoise: '#67B7B5',
      plum: '#58333E',
      sand: '#EADEC9',
      warning: '#9A6712',
      info: '#497494',
      rain: '#497494',
      wind: '#468E8C',
      heat: '#58333E',
      pillBg: '#EDE4D3',
      pillActiveBg: '#58333E',
      pillActiveText: '#FAF7F0',
      tabActiveBg: '#FAF7F0',
      tabActiveText: '#58333E',
      tabInactiveBg: '#B4CDE0',
      tabInactiveText: '#28323E',
      tabBorder: 'transparent',
      cardShadow: '#D4C5AC',
    },
    metrics: {
      windowBorderWidth: 1,
      subcardBorderWidth: 1,
      tabBorderWidth: 0,
      windowRadius: 24,
      subcardRadius: 18,
      glassBlur: 0,
    },
    webPattern: {
      backgroundImage:
        'linear-gradient(135deg, rgba(250,247,240,0.4) 25%, transparent 25%), linear-gradient(225deg, rgba(250,247,240,0.4) 25%, transparent 25%)',
      backgroundSize: '40px 40px',
    },
    shadows: {
      window: Platform.select({
        web: makeWebStyle({
          boxShadow: '0 10px 0px #D4C5AC, 0 16px 28px rgba(88, 51, 62, 0.12)',
        }),
        ios: {
          shadowColor: '#58333E',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 12,
        },
        android: { elevation: 5 },
        default: {},
      }) as ViewStyle,
      subcard: Platform.select({
        web: makeWebStyle({ boxShadow: '0 3px 0px #DFD3BE' }),
        ios: {
          shadowColor: '#D4C5AC',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.85,
          shadowRadius: 0,
        },
        android: { elevation: 2 },
        default: {},
      }) as ViewStyle,
      pillActive: Platform.select({
        web: makeWebStyle({ boxShadow: '0 3px 0px #362A30' }),
        ios: {
          shadowColor: '#362A30',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.6,
          shadowRadius: 0,
        },
        android: { elevation: 3 },
        default: {},
      }) as ViewStyle,
      modal: Platform.select({
        web: makeWebStyle({ boxShadow: '0 -8px 0px #D4C5AC, 0 -16px 28px rgba(88, 51, 62, 0.14)' }),
        ios: {
          shadowColor: '#58333E',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.16,
          shadowRadius: 14,
        },
        android: { elevation: 10 },
        default: {},
      }) as ViewStyle,
    },
    meta: {
      id: 'papercut',
      order: 4,
      name: '4. Brisa Paper-Cut',
      shortName: 'Brisa Paper-Cut',
      subtitle: 'Capas de papel arena, niebla y ciruela',
      emoji: '☂️',
      isDark: false,
      swatchBg: '#EADEC9',
      swatchBorder: '#D4C5AC',
      swatchShadowWeb: '0 3px 0 #58333E',
      swatchDots: ['#B4CDE0', '#58333E'],
      activeOptionBorder: '#58333E',
      activeOptionBg: '#FAF7F0',
      activeOptionShadowWeb: '0 4px 0px #58333E',
    },
  },
};

export const THEME_LIST: AppTheme[] = [
  THEMES.ilustrada,
  THEMES.acuarela,
  THEMES.tormenta,
  THEMES.papercut,
];

export const DEFAULT_THEME_ID: AppThemeId = 'ilustrada';

export function isValidThemeId(value: string | null | undefined): value is AppThemeId {
  return (
    value === 'ilustrada' ||
    value === 'acuarela' ||
    value === 'tormenta' ||
    value === 'papercut'
  );
}
