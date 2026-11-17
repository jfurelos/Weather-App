export const lightPalette = {
  background: '#FBF8F3', // Crema suave / nube cálida
  surface: '#F2ECE1', // Arena crema sutil
  card: '#FFFDF9', // Blanco nube cálido
  textPrimary: '#2A2623', // Carbón cálido
  textSecondary: '#746C64', // Piedra cálida
  textMuted: '#A89F95',
  border: '#EAE2D4',
  borderStrong: '#DBD0BE',
  primary: '#E6535E', // Coral cálido armonioso con crema
  primaryMuted: '#FBECEB',
  accent: '#2A9D8F',
  warning: '#DF6D49',
  info: '#3B6478',
  rain: '#4A7F9F',
  wind: '#3B526E',
  heat: '#DC4C4E',
  cardShadow: 'rgba(60, 48, 35, 0.06)',
};

export const darkPalette = {
  background: '#181614', // Nube nocturna cálida
  surface: '#23201D',
  card: '#26221F',
  textPrimary: '#F7F3EC',
  textSecondary: '#B2A99E',
  textMuted: '#756D65',
  border: '#36312C',
  borderStrong: '#474039',
  primary: '#F06470',
  primaryMuted: '#341F22',
  accent: '#2EC4B6',
  warning: '#F4A261',
  info: '#6EA8D6',
  rain: '#68A4B8',
  wind: '#95A2B8',
  heat: '#EB5E60',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
};

export type ThemeColors = typeof lightPalette;
