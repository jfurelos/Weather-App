export interface FixedLocation {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

export type RainThreshold = 'yellow' | 'orange' | 'red';
export type WindThreshold = 50 | 70 | 90;
export type HeatThreshold = 34 | 36 | 40;

export type AlertToneId =
  | 'rain_drops'
  | 'wind_gust'
  | 'heat_pulse'
  | 'classic_chime'
  | 'soft_ping'
  | 'silent';

export interface AlertToneOption {
  id: AlertToneId;
  label: string;
  description: string;
}

export const ALERT_TONES: AlertToneOption[] = [
  {
    id: 'rain_drops',
    label: 'Gotas de lluvia',
    description: 'Secuencia acuática descendente',
  },
  {
    id: 'wind_gust',
    label: 'Ráfaga intensa',
    description: 'Pulso grave con barrido ascendente',
  },
  {
    id: 'heat_pulse',
    label: 'Pulso térmico',
    description: 'Doble tono cálido sostenido',
  },
  {
    id: 'classic_chime',
    label: 'Campana clara',
    description: 'Acorde breve de alta claridad',
  },
  {
    id: 'soft_ping',
    label: 'Aviso discreto',
    description: 'Tono suave de baja intrusión',
  },
  {
    id: 'silent',
    label: 'Silencio (solo visual)',
    description: 'Sin reproducción de sonido',
  },
];

export const RAIN_THRESHOLDS: { value: RainThreshold; label: string; detail: string }[] = [
  { value: 'yellow', label: 'Amarillo', detail: '≥ 15 mm/h' },
  { value: 'orange', label: 'Naranja', detail: '≥ 30 mm/h' },
  { value: 'red', label: 'Rojo', detail: '≥ 60 mm/h' },
];

export const WIND_THRESHOLDS: { value: WindThreshold; label: string }[] = [
  { value: 50, label: '> 50 km/h' },
  { value: 70, label: '> 70 km/h' },
  { value: 90, label: '> 90 km/h' },
];

export const HEAT_THRESHOLDS: { value: HeatThreshold; label: string }[] = [
  { value: 34, label: '> 34°C' },
  { value: 36, label: '> 36°C' },
  { value: 40, label: '> 40°C' },
];

export const AVATAR_COLORS: string[] = [
  '#FF385C',
  '#2A9D8F',
  '#457B9D',
  '#E76F51',
  '#264653',
  '#6C5CE7',
  '#D97706',
  '#0D9488',
];

export function getToneLabel(toneId: AlertToneId): string {
  return ALERT_TONES.find((t) => t.id === toneId)?.label ?? 'Campana clara';
}

export function getRainThresholdLabel(threshold: RainThreshold): string {
  const found = RAIN_THRESHOLDS.find((r) => r.value === threshold);
  return found ? `Aviso ${found.label.toLowerCase()} (${found.detail})` : 'Aviso amarillo o superior';
}

// Catálogo de municipios y las 50 capitales de provincia en España
export const SPANISH_ALERT_LOCATIONS: FixedLocation[] = [
  // Capitales y grandes núcleos
  { name: 'Madrid', province: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Alcalá de Henares', province: 'Madrid', latitude: 40.4819, longitude: -3.3635 },
  { name: 'Collado Villalba', province: 'Madrid', latitude: 40.6351, longitude: -4.0067 },
  { name: 'Aranjuez', province: 'Madrid', latitude: 40.0311, longitude: -3.6025 },
  { name: 'Barcelona', province: 'Barcelona', latitude: 41.3879, longitude: 2.1699 },
  { name: 'Terrassa', province: 'Barcelona', latitude: 41.5632, longitude: 2.0089 },
  { name: 'Mataró', province: 'Barcelona', latitude: 41.5381, longitude: 2.4447 },
  { name: 'Sitges', province: 'Barcelona', latitude: 41.2372, longitude: 1.8059 },
  { name: 'Valencia', province: 'Valencia', latitude: 39.4699, longitude: -0.3763 },
  { name: 'Torrent', province: 'Valencia', latitude: 39.4371, longitude: -0.4655 },
  { name: 'Gandía', province: 'Valencia', latitude: 38.9680, longitude: -0.1806 },
  { name: 'Sagunto', province: 'Valencia', latitude: 39.6795, longitude: -0.2785 },
  { name: 'Sevilla', province: 'Sevilla', latitude: 37.3891, longitude: -5.9845 },
  { name: 'Dos Hermanas', province: 'Sevilla', latitude: 37.2829, longitude: -5.9209 },
  { name: 'Málaga', province: 'Málaga', latitude: 36.7213, longitude: -4.4214 },
  { name: 'Marbella', province: 'Málaga', latitude: 36.5099, longitude: -4.8864 },
  { name: 'Ronda', province: 'Málaga', latitude: 36.7462, longitude: -5.1612 },
  { name: 'Alicante', province: 'Alicante', latitude: 38.3452, longitude: -0.4810 },
  { name: 'Elche', province: 'Alicante', latitude: 38.2699, longitude: -0.7126 },
  { name: 'Benidorm', province: 'Alicante', latitude: 38.5411, longitude: -0.1225 },
  { name: 'Zaragoza', province: 'Zaragoza', latitude: 41.6488, longitude: -0.8891 },
  { name: 'Oviedo', province: 'Asturias', latitude: 43.3619, longitude: -5.8494 },
  { name: 'Gijón', province: 'Asturias', latitude: 43.5322, longitude: -5.6611 },
  { name: 'A Coruña', province: 'A Coruña', latitude: 43.3623, longitude: -8.4115 },
  { name: 'Santiago de Compostela', province: 'A Coruña', latitude: 42.8782, longitude: -8.5448 },
  { name: 'Palma', province: 'Baleares', latitude: 39.5696, longitude: 2.6502 },
  { name: 'Ibiza', province: 'Baleares', latitude: 38.9067, longitude: 1.4206 },
  { name: 'Mahón', province: 'Baleares', latitude: 39.8885, longitude: 4.2658 },
  { name: 'Granada', province: 'Granada', latitude: 37.1773, longitude: -3.5986 },
  { name: 'Santander', province: 'Cantabria', latitude: 43.4623, longitude: -3.8099 },
  { name: 'Castellón de la Plana', province: 'Castellón', latitude: 39.9864, longitude: -0.0513 },
  { name: 'Toledo', province: 'Toledo', latitude: 39.8628, longitude: -4.0273 },
  { name: 'Murcia', province: 'Murcia', latitude: 37.9922, longitude: -1.1307 },
  { name: 'Cartagena', province: 'Murcia', latitude: 37.6257, longitude: -0.9966 },
  { name: 'Pontevedra', province: 'Pontevedra', latitude: 42.4310, longitude: -8.6444 },
  { name: 'Vigo', province: 'Pontevedra', latitude: 42.2406, longitude: -8.7207 },
  { name: 'Cádiz', province: 'Cádiz', latitude: 36.5271, longitude: -6.2886 },
  { name: 'Jerez de la Frontera', province: 'Cádiz', latitude: 36.6850, longitude: -6.1261 },
  { name: 'Las Palmas de Gran Canaria', province: 'Las Palmas', latitude: 28.1235, longitude: -15.4363 },
  { name: 'Santa Cruz de Tenerife', province: 'Santa Cruz de Tenerife', latitude: 28.4636, longitude: -16.2518 },
  { name: 'Bilbao', province: 'Vizcaya', latitude: 43.2630, longitude: -2.9350 },
  { name: 'San Sebastián', province: 'Guipúzcoa', latitude: 43.3183, longitude: -1.9812 },
  { name: 'Pamplona', province: 'Navarra', latitude: 42.8125, longitude: -1.6458 },
  { name: 'Córdoba', province: 'Córdoba', latitude: 37.8882, longitude: -4.7794 },
  { name: 'Almería', province: 'Almería', latitude: 36.8340, longitude: -2.4637 },
  { name: 'Girona', province: 'Girona', latitude: 41.9794, longitude: 2.8214 },
  { name: 'Tarragona', province: 'Tarragona', latitude: 41.1189, longitude: 1.2445 },
  { name: 'Lleida', province: 'Lleida', latitude: 41.6176, longitude: 0.6200 },
  { name: 'Badajoz', province: 'Badajoz', latitude: 38.8794, longitude: -6.9707 },
  { name: 'Cáceres', province: 'Cáceres', latitude: 39.4753, longitude: -6.3724 },
  { name: 'Jaén', province: 'Jaén', latitude: 37.7796, longitude: -3.7849 },
  { name: 'Huelva', province: 'Huelva', latitude: 37.2614, longitude: -6.9447 },
  { name: 'Valladolid', province: 'Valladolid', latitude: 41.6523, longitude: -4.7245 },
  { name: 'León', province: 'León', latitude: 42.5987, longitude: -5.5671 },
  { name: 'Burgos', province: 'Burgos', latitude: 42.3440, longitude: -3.6969 },
  { name: 'Salamanca', province: 'Salamanca', latitude: 40.9701, longitude: -5.6635 },
  { name: 'Albacete', province: 'Albacete', latitude: 38.9943, longitude: -1.8585 },
  { name: 'Ciudad Real', province: 'Ciudad Real', latitude: 38.9848, longitude: -3.9274 },
  { name: 'Cuenca', province: 'Cuenca', latitude: 40.0704, longitude: -2.1374 },
  { name: 'Guadalajara', province: 'Guadalajara', latitude: 40.6337, longitude: -3.1674 },
  { name: 'Huesca', province: 'Huesca', latitude: 42.1401, longitude: -0.4089 },
  { name: 'Teruel', province: 'Teruel', latitude: 40.3456, longitude: -1.1065 },
  { name: 'Logroño', province: 'La Rioja', latitude: 42.4627, longitude: -2.4450 },
  { name: 'Vitoria-Gasteiz', province: 'Álava', latitude: 42.8467, longitude: -2.6716 },
  { name: 'Ourense', province: 'Ourense', latitude: 42.3358, longitude: -7.8639 },
  { name: 'Lugo', province: 'Lugo', latitude: 43.0097, longitude: -7.5568 },
  { name: 'Palencia', province: 'Palencia', latitude: 42.0096, longitude: -4.5288 },
  { name: 'Segovia', province: 'Segovia', latitude: 40.9429, longitude: -4.1088 },
  { name: 'Soria', province: 'Soria', latitude: 41.7665, longitude: -2.4790 },
  { name: 'Zamora', province: 'Zamora', latitude: 41.5035, longitude: -5.7467 },
  { name: 'Ávila', province: 'Ávila', latitude: 40.6567, longitude: -4.6812 },
];
