import { Platform, TextStyle } from 'react-native';

export const FONT_DISPLAY_BOLD = Platform.select({
  web: "'Jost_700Bold', 'Jost', 'Futura', 'Helvetica Neue', Arial, sans-serif",
  default: 'Jost_700Bold',
});

export const FONT_DISPLAY_SEMIBOLD = Platform.select({
  web: "'Jost_600SemiBold', 'Jost', 'Futura', 'Helvetica Neue', Arial, sans-serif",
  default: 'Jost_600SemiBold',
});

export const FONT_BODY_BOLD = Platform.select({
  web: "'Montserrat_700Bold', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  default: 'Montserrat_700Bold',
});

export const FONT_BODY_SEMIBOLD = Platform.select({
  web: "'Montserrat_600SemiBold', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  default: 'Montserrat_600SemiBold',
});

export const DISPLAY_FONT = FONT_DISPLAY_BOLD;
export const BODY_FONT = FONT_BODY_BOLD;

export const typography: Record<string, TextStyle> = {
  // Títulos de la app y categorías/secciones: Jost (Bold / SemiBold)
  hero: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 38,
  },
  h1: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  h2: {
    fontFamily: FONT_DISPLAY_SEMIBOLD,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.15,
    lineHeight: 26,
  },
  h3: {
    fontFamily: FONT_DISPLAY_SEMIBOLD,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 23,
  },

  // Resto del texto (cuerpo, tarjetas, botones, chats): Montserrat Bold (SemiBold solo en microtextos)
  body: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },
  bodyMedium: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 21,
  },
  callout: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 19,
  },
  caption: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  captionMedium: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
};

export type Typography = typeof typography;
