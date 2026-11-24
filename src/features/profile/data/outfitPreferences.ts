export type ThermalSensitivity = 'cold_sensitive' | 'neutral' | 'heat_sensitive';

export type OutfitStyle = 'casual' | 'streetwear' | 'sporty' | 'smart';

export interface OutfitPreferences {
  thermalSensitivity: ThermalSensitivity;
  style: OutfitStyle;
}

export const DEFAULT_OUTFIT_PREFERENCES: OutfitPreferences = {
  thermalSensitivity: 'neutral',
  style: 'casual',
};

export interface ThermalSensitivityOption {
  id: ThermalSensitivity;
  label: string;
  shortDelta: string;
  description: string;
  /** Ajuste aplicado a la temperatura efectiva percibida en el motor (±2.5°C) */
  tempOffsetC: number;
}

export const THERMAL_SENSITIVITY_OPTIONS: ThermalSensitivityOption[] = [
  {
    id: 'cold_sensitive',
    label: 'Friolero/a',
    shortDelta: '-2.5°C',
    description: 'Sugiere abrigo y capas antes',
    tempOffsetC: -2.5,
  },
  {
    id: 'neutral',
    label: 'Neutro',
    shortDelta: '0°C',
    description: 'Umbrales térmicos estándar',
    tempOffsetC: 0,
  },
  {
    id: 'heat_sensitive',
    label: 'Caluroso/a',
    shortDelta: '+2.5°C',
    description: 'Prioriza prendas más ligeras',
    tempOffsetC: 2.5,
  },
];

export interface OutfitStyleOption {
  id: OutfitStyle;
  label: string;
  shortLabel: string;
  tagline: string;
}

export const OUTFIT_STYLE_OPTIONS: OutfitStyleOption[] = [
  {
    id: 'casual',
    label: 'Casual',
    shortLabel: 'Casual',
    tagline: 'Cómodo, versátil y diario',
  },
  {
    id: 'streetwear',
    label: 'Urbano / Streetwear',
    shortLabel: 'Urbano',
    tagline: 'Oversize, capas y sneakers',
  },
  {
    id: 'sporty',
    label: 'Deportivo',
    shortLabel: 'Deportivo',
    tagline: 'Técnico, ligero y activo',
  },
  {
    id: 'smart',
    label: 'Arreglado',
    shortLabel: 'Arreglado',
    tagline: 'Limpio, pulido y editorial',
  },
];

export function getThermalOption(id: ThermalSensitivity): ThermalSensitivityOption {
  return (
    THERMAL_SENSITIVITY_OPTIONS.find((opt) => opt.id === id) ??
    THERMAL_SENSITIVITY_OPTIONS[1]
  );
}

export function getOutfitStyleOption(id: OutfitStyle): OutfitStyleOption {
  return OUTFIT_STYLE_OPTIONS.find((opt) => opt.id === id) ?? OUTFIT_STYLE_OPTIONS[0];
}

export function sanitizeOutfitPreferences(raw: unknown): OutfitPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_OUTFIT_PREFERENCES };
  }
  const obj = raw as Record<string, unknown>;

  const thermalSensitivity: ThermalSensitivity = THERMAL_SENSITIVITY_OPTIONS.some(
    (o) => o.id === obj.thermalSensitivity
  )
    ? (obj.thermalSensitivity as ThermalSensitivity)
    : DEFAULT_OUTFIT_PREFERENCES.thermalSensitivity;

  const style: OutfitStyle = OUTFIT_STYLE_OPTIONS.some((o) => o.id === obj.style)
    ? (obj.style as OutfitStyle)
    : DEFAULT_OUTFIT_PREFERENCES.style;

  return { thermalSensitivity, style };
}
