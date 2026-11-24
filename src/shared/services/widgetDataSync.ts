import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeatherData } from '@/features/home/services/weatherApi';
import type { DailyAdvice, OutfitAlertLevel } from '@/features/home/services/rulesEngine';
import {
  ClaudyConfig,
  ClaudyWeatherMode,
  DEFAULT_CLAUDY_CONFIG,
  resolveClaudyWeatherMode,
  sanitizeClaudyConfig,
} from '@/features/claudy/types';
import type { ThemeMode } from '@/shared/theme/themes';

export const WIDGET_PAYLOAD_STORAGE_KEY = '@clima_comunidad_widget_payload_v1';
export const WIDGET_PREFS_STORAGE_KEY = '@clima_comunidad_widget_prefs_v1';

export type WidgetSizeFormat = 'small' | 'medium' | 'lockscreen';

export interface ClaudyWidgetPayload {
  version: 1;
  claudyName: string;
  claudyConfig: ClaudyConfig;
  cityName: string;
  province: string;
  latitude: number;
  longitude: number;
  temperature: number;
  apparentTemperature: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  weatherCode: number;
  weatherMode: ClaudyWeatherMode;
  windSpeed: number;
  precipitation: number;
  topOutfitTip: string;
  outfitHeadline: string;
  alertLevel: OutfitAlertLevel;
  alertBanner?: string;
  themeMode: ThemeMode;
  updatedAt: string; // ISO 8601
}

export interface NativeWidgetStorageBridge {
  /**
   * Escribe el payload JSON en almacenamiento compartido nativo:
   * - iOS: App Groups UserDefaults (suiteName: "group.com.climacomunidad.widgets") + WidgetCenter.reloadAllTimelines()
   * - Android: SharedPreferences ("claudy_widget_prefs") + GlanceAppWidgetManager updateAll()
   */
  writeSharedPayload: (key: string, jsonPayload: string) => Promise<void>;
}

let nativeWidgetBridge: NativeWidgetStorageBridge | null = null;

/**
 * Permite inyectar un puente nativo (WidgetKit / Android Glance) en builds nativos
 * sin romper el bundle web de Vercel.
 */
export function registerNativeWidgetBridge(bridge: NativeWidgetStorageBridge | null): void {
  nativeWidgetBridge = bridge;
}

export function buildWidgetPayload(params: {
  claudyConfig: ClaudyConfig;
  cityName: string;
  province: string;
  latitude: number;
  longitude: number;
  weather: WeatherData;
  advice: DailyAdvice | null;
  themeMode?: ThemeMode;
}): ClaudyWidgetPayload {
  const {
    claudyConfig,
    cityName,
    province,
    latitude,
    longitude,
    weather,
    advice,
    themeMode = 'dark',
  } = params;

  const safeConfig = sanitizeClaudyConfig(claudyConfig);
  const weatherMode = resolveClaudyWeatherMode({
    weatherCode: weather.current.weatherCode,
    temperature: weather.current.temperature,
    windSpeed: weather.current.windSpeed,
    precipitation: weather.current.precipitation,
  });

  const topOutfitTip =
    advice?.outfit.top.title ||
    advice?.outfit.accessories.title ||
    'Look cómodo de entretiempo';

  const outfitHeadline =
    advice?.outfit.headline ||
    `${Math.round(weather.current.temperature)}°C • ${weather.current.conditionText}`;

  return {
    version: 1,
    claudyName: safeConfig.name,
    claudyConfig: safeConfig,
    cityName: cityName || 'Madrid',
    province: province || 'Madrid',
    latitude,
    longitude,
    temperature: Math.round(weather.current.temperature),
    apparentTemperature: Math.round(weather.current.apparentTemperature),
    tempMin: Math.round(weather.daily.tempMin),
    tempMax: Math.round(weather.daily.tempMax),
    condition: weather.current.conditionText || 'Variable',
    weatherCode: weather.current.weatherCode,
    weatherMode,
    windSpeed: Math.round(weather.current.windSpeed),
    precipitation: Number(weather.current.precipitation.toFixed(1)),
    topOutfitTip,
    outfitHeadline,
    alertLevel: advice?.outfit.alertLevel ?? 'normal',
    alertBanner: advice?.outfit.alertBanner,
    themeMode,
    updatedAt: new Date().toISOString(),
  };
}

export function createFallbackWidgetPayload(params?: {
  claudyConfig?: ClaudyConfig;
  cityName?: string;
  province?: string;
  themeMode?: ThemeMode;
}): ClaudyWidgetPayload {
  const safeConfig = sanitizeClaudyConfig(params?.claudyConfig ?? DEFAULT_CLAUDY_CONFIG);
  return {
    version: 1,
    claudyName: safeConfig.name,
    claudyConfig: safeConfig,
    cityName: params?.cityName || 'Madrid',
    province: params?.province || 'Madrid',
    latitude: 40.4168,
    longitude: -3.7038,
    temperature: 19,
    apparentTemperature: 19,
    tempMin: 12,
    tempMax: 23,
    condition: 'Parcialmente nublado',
    weatherCode: 2,
    weatherMode: 'sunny',
    windSpeed: 10,
    precipitation: 0,
    topOutfitTip: 'Chaqueta ligera + camiseta básica',
    outfitHeadline: 'Entretiempo agradable con capa fina',
    alertLevel: 'normal',
    themeMode: params?.themeMode ?? 'dark',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Persiste el payload estándar del widget en AsyncStorage, localStorage (Web)
 * y en el puente nativo (WidgetKit / Android Glance) si existe y Platform.OS !== 'web'.
 */
export async function persistWidgetPayload(payload: ClaudyWidgetPayload): Promise<ClaudyWidgetPayload> {
  const serialized = JSON.stringify(payload);

  try {
    await AsyncStorage.setItem(WIDGET_PAYLOAD_STORAGE_KEY, serialized);
  } catch {
    // Ignorar errores de almacenamiento local
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(WIDGET_PAYLOAD_STORAGE_KEY, serialized);
    } catch {
      // Ignorar si localStorage está bloqueado en modo incógnito estricto
    }
  } else if (Platform.OS !== 'web' && nativeWidgetBridge) {
    try {
      await nativeWidgetBridge.writeSharedPayload(WIDGET_PAYLOAD_STORAGE_KEY, serialized);
    } catch (err) {
      console.warn('[widgetDataSync] Error sincronizando con widget nativo:', err);
    }
  }

  return payload;
}

export async function readPersistedWidgetPayload(): Promise<ClaudyWidgetPayload | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        raw = window.localStorage.getItem(WIDGET_PAYLOAD_STORAGE_KEY);
      } catch {
        raw = null;
      }
    }
    if (!raw) {
      raw = await AsyncStorage.getItem(WIDGET_PAYLOAD_STORAGE_KEY);
    }
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ClaudyWidgetPayload>;
    if (!parsed || typeof parsed.temperature !== 'number') return null;

    const safeConfig = sanitizeClaudyConfig(parsed.claudyConfig);
    return {
      ...createFallbackWidgetPayload({
        claudyConfig: safeConfig,
        cityName: parsed.cityName,
        province: parsed.province,
        themeMode: parsed.themeMode === 'light' ? 'light' : 'dark',
      }),
      ...parsed,
      version: 1,
      claudyConfig: safeConfig,
      claudyName: safeConfig.name,
    };
  } catch {
    return null;
  }
}

/**
 * Suscribe a cambios del payload en otras pestañas (ideal para `/widget` abierto en paralelo).
 */
export function subscribeToWidgetPayloadChanges(
  onPayload: (payload: ClaudyWidgetPayload) => void
): () => void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: StorageEvent) => {
    if (event.key === WIDGET_PAYLOAD_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as ClaudyWidgetPayload;
        if (parsed && typeof parsed.temperature === 'number') {
          onPayload({
            ...parsed,
            claudyConfig: sanitizeClaudyConfig(parsed.claudyConfig),
          });
        }
      } catch {
        // Ignorar JSON malformado
      }
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/**
 * Construye la URL absoluta o relativa del modo Widget Web embebible (`/widget`).
 */
export function buildWidgetEmbedUrl(options: {
  size: WidgetSizeFormat;
  theme: ThemeMode;
  embedOnly?: boolean;
}): string {
  const params = new URLSearchParams();
  params.set('size', options.size);
  params.set('theme', options.theme);
  if (options.embedOnly) {
    params.set('embed', '1');
  }

  const path = `/widget?${params.toString()}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}
