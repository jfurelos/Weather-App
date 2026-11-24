export type ClaudyExpression = 'happy' | 'wink' | 'sleepy' | 'chill' | 'surprised';

export type ClaudyWeatherMode =
  | 'sunny'
  | 'hot'
  | 'rainy'
  | 'storm'
  | 'cold'
  | 'windy'
  | 'snowy'
  | 'cloudy';

export type ClaudyGlassesStyle = 'auto' | 'none' | 'round_honey' | 'classic_slate' | 'star_gold';
export type ClaudyHeadwearStyle = 'auto' | 'none' | 'beanie' | 'beret' | 'sunhat';
export type ClaudyScarfStyle = 'auto' | 'none' | 'knit_honey' | 'burgundy_wrap' | 'slate_cozy';
export type ClaudyUmbrellaStyle = 'auto' | 'classic_burgundy' | 'striped_editorial' | 'clear_honey';
export type ClaudyDetailTone = 'honey' | 'burgundy' | 'slate' | 'vanilla';

export const CLAUDY_FIXED_NAME = 'Claudy' as const;

export interface ClaudyConfig {
  name: string;
  expression: ClaudyExpression;
  glassesStyle: ClaudyGlassesStyle;
  headwearStyle: ClaudyHeadwearStyle;
  scarfStyle: ClaudyScarfStyle;
  umbrellaStyle: ClaudyUmbrellaStyle;
  detailTone: ClaudyDetailTone;
}

export const DEFAULT_CLAUDY_CONFIG: ClaudyConfig = {
  name: CLAUDY_FIXED_NAME,
  expression: 'happy',
  glassesStyle: 'auto',
  headwearStyle: 'auto',
  scarfStyle: 'auto',
  umbrellaStyle: 'auto',
  detailTone: 'honey',
};

export interface ClaudyOption<T extends string> {
  id: T;
  label: string;
  hint?: string;
}

export const CLAUDY_EXPRESSIONS: ClaudyOption<ClaudyExpression>[] = [
  { id: 'happy', label: 'Feliz' },
  { id: 'wink', label: 'Guiño' },
  { id: 'sleepy', label: 'Dormilona' },
  { id: 'chill', label: 'Chill' },
  { id: 'surprised', label: 'Sorprendida' },
];

export const CLAUDY_GLASSES_OPTIONS: ClaudyOption<ClaudyGlassesStyle>[] = [
  { id: 'auto', label: 'Auto (sol)' },
  { id: 'none', label: 'Sin gafas' },
  { id: 'round_honey', label: 'Miel redondas' },
  { id: 'classic_slate', label: 'Pizarra' },
  { id: 'star_gold', label: 'Sol miel' },
];

export const CLAUDY_HEADWEAR_OPTIONS: ClaudyOption<ClaudyHeadwearStyle>[] = [
  { id: 'auto', label: 'Auto (clima)' },
  { id: 'none', label: 'Sin gorro' },
  { id: 'beanie', label: 'Gorro lana' },
  { id: 'beret', label: 'Boina burdeos' },
  { id: 'sunhat', label: 'Sombrero sol' },
];

export const CLAUDY_SCARF_OPTIONS: ClaudyOption<ClaudyScarfStyle>[] = [
  { id: 'auto', label: 'Auto (frío)' },
  { id: 'none', label: 'Sin bufanda' },
  { id: 'knit_honey', label: 'Punto miel' },
  { id: 'burgundy_wrap', label: 'Burdeos' },
  { id: 'slate_cozy', label: 'Pizarra' },
];

export const CLAUDY_UMBRELLA_OPTIONS: ClaudyOption<ClaudyUmbrellaStyle>[] = [
  { id: 'auto', label: 'Burdeos clásico' },
  { id: 'classic_burgundy', label: 'Burdeos vino' },
  { id: 'striped_editorial', label: 'Rayas crema' },
  { id: 'clear_honey', label: 'Ribete miel' },
];

export const CLAUDY_DETAIL_TONES: {
  id: ClaudyDetailTone;
  label: string;
  hex: string;
  softHex: string;
  cheekHex: string;
}[] = [
  {
    id: 'honey',
    label: 'Miel',
    hex: '#E09F3E',
    softHex: 'rgba(224, 159, 62, 0.24)',
    cheekHex: '#E8AE68',
  },
  {
    id: 'burgundy',
    label: 'Burdeos',
    hex: '#9E2A2B',
    softHex: 'rgba(158, 42, 43, 0.20)',
    cheekHex: '#C96B6C',
  },
  {
    id: 'slate',
    label: 'Pizarra',
    hex: '#335C67',
    softHex: 'rgba(51, 92, 103, 0.18)',
    cheekHex: '#7A9EA8',
  },
  {
    id: 'vanilla',
    label: 'Vainilla',
    hex: '#FFF3B0',
    softHex: 'rgba(255, 243, 176, 0.45)',
    cheekHex: '#ECC882',
  },
];

export function getDetailTonePalette(tone: ClaudyDetailTone) {
  return CLAUDY_DETAIL_TONES.find((t) => t.id === tone) ?? CLAUDY_DETAIL_TONES[0];
}

export function sanitizeClaudyConfig(raw: unknown): ClaudyConfig {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CLAUDY_CONFIG };
  }
  const obj = raw as Record<string, unknown>;

  // El nombre de Claudy es definitivo e inmutable
  const name = CLAUDY_FIXED_NAME;

  const expression = CLAUDY_EXPRESSIONS.some((o) => o.id === obj.expression)
    ? (obj.expression as ClaudyExpression)
    : DEFAULT_CLAUDY_CONFIG.expression;

  const glassesStyle = CLAUDY_GLASSES_OPTIONS.some((o) => o.id === obj.glassesStyle)
    ? (obj.glassesStyle as ClaudyGlassesStyle)
    : DEFAULT_CLAUDY_CONFIG.glassesStyle;

  const headwearStyle = CLAUDY_HEADWEAR_OPTIONS.some((o) => o.id === obj.headwearStyle)
    ? (obj.headwearStyle as ClaudyHeadwearStyle)
    : DEFAULT_CLAUDY_CONFIG.headwearStyle;

  const scarfStyle = CLAUDY_SCARF_OPTIONS.some((o) => o.id === obj.scarfStyle)
    ? (obj.scarfStyle as ClaudyScarfStyle)
    : DEFAULT_CLAUDY_CONFIG.scarfStyle;

  const umbrellaStyle = CLAUDY_UMBRELLA_OPTIONS.some((o) => o.id === obj.umbrellaStyle)
    ? (obj.umbrellaStyle as ClaudyUmbrellaStyle)
    : DEFAULT_CLAUDY_CONFIG.umbrellaStyle;

  const detailTone = CLAUDY_DETAIL_TONES.some((o) => o.id === obj.detailTone)
    ? (obj.detailTone as ClaudyDetailTone)
    : DEFAULT_CLAUDY_CONFIG.detailTone;

  return {
    name,
    expression,
    glassesStyle,
    headwearStyle,
    scarfStyle,
    umbrellaStyle,
    detailTone,
  };
}

export function resolveClaudyWeatherMode(params?: {
  weatherCode?: number;
  temperature?: number;
  windSpeed?: number;
  precipitation?: number;
}): ClaudyWeatherMode {
  if (!params) return 'sunny';
  const {
    weatherCode = 0,
    temperature = 20,
    windSpeed = 8,
    precipitation = 0,
  } = params;

  if (weatherCode >= 95) return 'storm';
  if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
    return 'snowy';
  }
  if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    precipitation >= 1.5
  ) {
    return 'rainy';
  }
  if (windSpeed >= 36) return 'windy';
  if (temperature <= 11) return 'cold';
  if (temperature >= 29) return 'hot';
  if (weatherCode >= 2 && weatherCode <= 48) return 'cloudy';
  return 'sunny';
}

export interface ClaudyWeatherCopy {
  label: string;
  quote: string;
  outfitNote: string;
}

export function getClaudyWeatherCopy(mode: ClaudyWeatherMode, claudyName: string): ClaudyWeatherCopy {
  switch (mode) {
    case 'storm':
      return {
        label: 'Tormenta',
        quote: `${claudyName} ya sacó su chubasquero y paraguas burdeos. Mejor ir con calma hoy.`,
        outfitNote: 'Chubasquero + paraguas burdeos',
      };
    case 'rainy':
      return {
        label: 'Lluvia',
        quote: `Día de lluvia tranquila: ${claudyName} te recuerda llevar paraguas y disfrutar el aroma a tierra mojada.`,
        outfitNote: 'Chubasquero + paraguas',
      };
    case 'hot':
      return {
        label: 'Calor',
        quote: `Sol radiante y calor. ${claudyName} lleva gafas miel y te recomienda hidratarte bien.`,
        outfitNote: 'Gafas de sol miel + frescura',
      };
    case 'sunny':
      return {
        label: 'Soleado',
        quote: `Cielo despejado y luz cálida. Un gran momento para salir a caminar con ${claudyName}.`,
        outfitNote: 'Gafas con acento miel',
      };
    case 'snowy':
      return {
        label: 'Nieve',
        quote: `Copos a la vista: ${claudyName} se abrigó con gorro y bufanda para acompañarte.`,
        outfitNote: 'Abrigo, gorro y bufanda',
      };
    case 'cold':
      return {
        label: 'Fresco / Frío',
        quote: `Aire fresco hoy. ${claudyName} eligió abrigo y bufanda calentita para empezar bien el día.`,
        outfitNote: 'Abrigo + bufanda y gorro',
      };
    case 'windy':
      return {
        label: 'Ventoso',
        quote: `Rachas de viento en tu zona. ${claudyName} sujeta bien la bufanda: lleva una prenda cortavientos.`,
        outfitNote: 'Abrigo cortavientos + bufanda',
      };
    case 'cloudy':
    default:
      return {
        label: 'Nublado',
        quote: `Cielo suave entre nubes. ${claudyName} está lista para acompañarte en tus planes de hoy.`,
        outfitNote: 'Estilo cómodo de entretiempo',
      };
  }
}

export function getTimeGreeting(params: {
  hour: number;
  userName?: string | null;
  isAuthenticated: boolean;
}): { headline: string; dateLabel: string } {
  const { hour, userName, isAuthenticated } = params;
  const firstName =
    isAuthenticated && userName && userName.trim() && userName !== 'Usuario Invitado'
      ? userName.trim().split(/\s+/)[0]
      : null;

  let period = 'Hola';
  if (hour >= 5 && hour < 13) {
    period = 'Buenos días';
  } else if (hour >= 13 && hour < 20) {
    period = 'Buenas tardes';
  } else {
    period = 'Buenas noches';
  }

  const headline = firstName ? `${period}, ${firstName}` : `Hola · ${period}`;

  const now = new Date();
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ];
  const dateLabel = `${weekdays[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;

  return { headline, dateLabel };
}
