import type { WeatherData } from '@/features/home/services/weatherApi';
import type { DailyAdvice } from '@/features/home/services/rulesEngine';
import { resolveClaudyWeatherMode, ClaudyWeatherMode } from '@/features/claudy/types';

export interface NotificationPreferences {
  enabled: boolean;
  morningTime: string; // Formato "HH:MM", ej. "07:30"
  afternoonEnabled: boolean;
  afternoonTime: string; // Formato "HH:MM", ej. "17:00"
  includeTempAndOutfit: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  morningTime: '07:30',
  afternoonEnabled: false,
  afternoonTime: '17:00',
  includeTempAndOutfit: true,
};

export const MORNING_TIME_PRESETS: string[] = [
  '06:30',
  '07:00',
  '07:30',
  '08:00',
  '08:30',
  '09:00',
];

export const AFTERNOON_TIME_PRESETS: string[] = [
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

const TIME_HHMM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTimeHHMM(value: unknown): value is string {
  return typeof value === 'string' && TIME_HHMM_REGEX.test(value.trim());
}

export function sanitizeNotificationPreferences(raw: unknown): NotificationPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;

  return {
    enabled:
      typeof obj.enabled === 'boolean'
        ? obj.enabled
        : DEFAULT_NOTIFICATION_PREFERENCES.enabled,
    morningTime: isValidTimeHHMM(obj.morningTime)
      ? obj.morningTime.trim()
      : DEFAULT_NOTIFICATION_PREFERENCES.morningTime,
    afternoonEnabled:
      typeof obj.afternoonEnabled === 'boolean'
        ? obj.afternoonEnabled
        : DEFAULT_NOTIFICATION_PREFERENCES.afternoonEnabled,
    afternoonTime: isValidTimeHHMM(obj.afternoonTime)
      ? obj.afternoonTime.trim()
      : DEFAULT_NOTIFICATION_PREFERENCES.afternoonTime,
    includeTempAndOutfit:
      typeof obj.includeTempAndOutfit === 'boolean'
        ? obj.includeTempAndOutfit
        : DEFAULT_NOTIFICATION_PREFERENCES.includeTempAndOutfit,
  };
}

export interface ClaudyReminderNotificationPayload {
  title: string;
  body: string;
  weatherMode: ClaudyWeatherMode;
  cityName: string;
  temperature: number | null;
}

function getDynamicGreetingPrefix(hour: number, userName?: string | null, isAuthenticated?: boolean): string {
  const firstName =
    isAuthenticated && userName && userName.trim() && userName !== 'Usuario Invitado'
      ? userName.trim().split(/\s+/)[0]
      : null;

  let salutation = '¡Hola';
  if (hour >= 5 && hour < 13) {
    salutation = '¡Buenos días';
  } else if (hour >= 13 && hour < 20) {
    salutation = '¡Buenas tardes';
  } else {
    salutation = '¡Buenas noches';
  }

  return firstName ? `${salutation}, ${firstName}!` : `${salutation}!`;
}

/**
 * Construye el copy real y dinámico de la notificación de Claudy
 * usando el clima actual (Open-Meteo) y el outfit calculado por rulesEngine.
 */
export function buildClaudyReminderPayload(params: {
  claudyName: string;
  userName?: string | null;
  isAuthenticated?: boolean;
  cityName: string;
  weather: WeatherData | null;
  advice: DailyAdvice | null;
  includeTempAndOutfit: boolean;
  hour?: number;
}): ClaudyReminderNotificationPayload {
  const {
    claudyName,
    userName,
    isAuthenticated,
    cityName,
    weather,
    advice,
    includeTempAndOutfit,
    hour = new Date().getHours(),
  } = params;

  const safeClaudy = claudyName.trim() || 'Claudy';
  const greeting = getDynamicGreetingPrefix(hour, userName, isAuthenticated);

  if (!weather) {
    return {
      title: `${safeClaudy} • Recordatorio diario`,
      body: `${greeting} Toca para ver el tiempo actual de ${cityName} y tu outfit recomendado.`,
      weatherMode: 'sunny',
      cityName,
      temperature: null,
    };
  }

  const temp = Math.round(weather.current.temperature);
  const conditionLower = (weather.current.conditionText || 'tiempo variable').toLowerCase();
  const weatherMode = resolveClaudyWeatherMode({
    weatherCode: weather.current.weatherCode,
    temperature: weather.current.temperature,
    windSpeed: weather.current.windSpeed,
    precipitation: weather.current.precipitation,
  });

  if (!includeTempAndOutfit) {
    return {
      title: `${safeClaudy} • ${cityName}`,
      body: `${greeting} ${safeClaudy} ya revisó la previsión de hoy en ${cityName}. Toca para ver tu outfit.`,
      weatherMode,
      cityName,
      temperature: temp,
    };
  }

  const topGarment = advice?.outfit.top.title;

  let actionPhrase: string;
  if (weatherMode === 'rainy' || weatherMode === 'storm') {
    actionPhrase = `${safeClaudy} ya sacó el paraguas burdeos${
      topGarment ? ` y sugiere ${topGarment.toLowerCase()}` : ''
    }: toca para ver tu outfit`;
  } else if (weatherMode === 'hot' || weatherMode === 'sunny') {
    actionPhrase = `${safeClaudy} lleva gafas miel${
      topGarment ? ` y te recomienda ${topGarment.toLowerCase()}` : ''
    }: toca para ver tu outfit`;
  } else if (weatherMode === 'cold' || weatherMode === 'snowy' || weatherMode === 'windy') {
    actionPhrase = `${safeClaudy} preparó abrigo${
      topGarment ? ` (${topGarment.toLowerCase()})` : ' y bufanda'
    }: toca para ver tu outfit`;
  } else {
    actionPhrase = topGarment
      ? `${safeClaudy} te recomienda ${topGarment.toLowerCase()}: toca para ver tu outfit`
      : `${safeClaudy} tiene listo tu look de hoy: toca para ver tu outfit`;
  }

  return {
    title: `${safeClaudy} • ${temp}°C en ${cityName}`,
    body: `${greeting} ${temp}°C y ${conditionLower}. ${actionPhrase}`,
    weatherMode,
    cityName,
    temperature: temp,
  };
}
