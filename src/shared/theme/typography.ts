import { Platform, TextStyle } from 'react-native';

const DISPLAY_FONT = Platform.select({
  web: "'Fredoka', sans-serif",
  default: undefined,
});

const BODY_FONT = Platform.select({
  web: "'Nunito', sans-serif",
  default: undefined,
});

export const typography: Record<string, TextStyle> = {
  hero: {
    fontFamily: DISPLAY_FONT,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 36,
  },
  h1: {
    fontFamily: DISPLAY_FONT,
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 31,
  },
  h2: {
    fontFamily: DISPLAY_FONT,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.1,
    lineHeight: 26,
  },
  h3: {
    fontFamily: DISPLAY_FONT,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  body: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  bodyMedium: {
    fontFamily: BODY_FONT,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  callout: {
    fontFamily: BODY_FONT,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  caption: {
    fontFamily: BODY_FONT,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  captionMedium: {
    fontFamily: BODY_FONT,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
};

export type Typography = typeof typography;
export { DISPLAY_FONT, BODY_FONT };
