import { WeatherData } from '@/features/home/services/weatherApi';
import { FeaturedNews } from '@/features/home/services/newsService';
import { FixedLocation } from '@/features/profile/data/locationsData';
import { AlertCategory } from '@/features/profile/store/useProfileStore';

export interface MockStormUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  province: string;
  avatarColor: string;
  location: FixedLocation;
  stormTitle: string;
  stormSummary: string;
  stormBadge: string;
  weather: WeatherData;
  news: FeaturedNews[];
}

export interface MockAlertScenario {
  id: string;
  category: AlertCategory;
  title: string;
  shortLabel: string;
  severityLabel: string;
  description: string;
  // Valores usados para evaluar contra los umbrales del usuario
  rainLevel?: 'yellow' | 'orange' | 'red';
  rainMmH?: number;
  windKmh?: number;
  heatC?: number;
}

export const MOCK_ALERT_SCENARIOS: MockAlertScenario[] = [
  {
    id: 'mock-rain-yellow',
    category: 'rain',
    title: 'Lluvia intensa (Nivel Amarillo)',
    shortLabel: 'Lluvia 20 mm/h',
    severityLabel: 'Aviso Amarillo',
    description: 'Chubascos localmente fuertes de 20 mm/h en la próxima hora.',
    rainLevel: 'yellow',
    rainMmH: 20,
  },
  {
    id: 'mock-rain-red',
    category: 'rain',
    title: 'Lluvia torrencial (Nivel Rojo)',
    shortLabel: 'Lluvia 68 mm/h',
    severityLabel: 'Aviso Rojo',
    description: 'Acumulados torrenciales de 68 mm/h con riesgo de balsas de agua.',
    rainLevel: 'red',
    rainMmH: 68,
  },
  {
    id: 'mock-wind-62',
    category: 'wind',
    title: 'Rachas fuertes de viento',
    shortLabel: 'Viento 62 km/h',
    severityLabel: 'Temporal',
    description: 'Rachas sostenidas de 62 km/h en zonas abiertas y costas.',
    windKmh: 62,
  },
  {
    id: 'mock-wind-95',
    category: 'wind',
    title: 'Temporal extremo de viento',
    shortLabel: 'Viento 95 km/h',
    severityLabel: 'Aviso Rojo',
    description: 'Rachas huracanadas de hasta 95 km/h. Evita zonas arboladas.',
    windKmh: 95,
  },
  {
    id: 'mock-heat-35',
    category: 'heat',
    title: 'Calor intenso',
    shortLabel: 'Calor 35°C',
    severityLabel: 'Aviso Amarillo',
    description: 'Temperaturas máximas de 35°C en horas centrales del día.',
    heatC: 35,
  },
  {
    id: 'mock-heat-41',
    category: 'heat',
    title: 'Ola de calor extremo',
    shortLabel: 'Calor 41°C',
    severityLabel: 'Aviso Rojo',
    description: 'Picos de 41°C y noches tropicales. Hidratación constante recomendada.',
    heatC: 41,
  },
];

function buildHourly(
  baseTemp: number,
  precipProb: number,
  weatherCode: number,
  variation: number[]
): WeatherData['hourly'] {
  const startHour = new Date().getHours();
  return Array.from({ length: 12 }, (_, idx) => {
    const h = (startHour + idx) % 24;
    const delta = variation[idx % variation.length];
    return {
      time: `${String(h).padStart(2, '0')}:00`,
      temperature: Math.round(baseTemp + delta),
      precipitationProbability: precipProb,
      weatherCode,
    };
  });
}

export const MOCK_STORM_USERS: MockStormUser[] = [
  {
    id: 'mock-user-dana',
    fullName: 'Marta Soler',
    username: 'marta_dana',
    email: 'marta.soler@demo.es',
    province: 'Valencia',
    avatarColor: '#4A7F9F',
    location: {
      name: 'Valencia',
      province: 'Valencia',
      latitude: 39.4699,
      longitude: -0.3763,
    },
    stormTitle: 'DANA y Lluvia Torrencial',
    stormSummary: 'Chubascos muy fuertes de 48 mm/h y aparato eléctrico en el litoral',
    stormBadge: 'Lluvia torrencial',
    weather: {
      current: {
        temperature: 16,
        apparentTemperature: 15,
        humidity: 92,
        precipitation: 48,
        weatherCode: 65,
        windSpeed: 58,
        conditionText: 'Lluvia fuerte',
      },
      hourly: buildHourly(16, 95, 65, [0, 0, -1, -1, 0, 1, 1, 0, -1, -2, -2, -1]),
      daily: { tempMax: 18, tempMin: 13, weatherCode: 65 },
    },
    news: [
      {
        id: 'mock-news-dana-1',
        source: 'AEMET Valencia',
        title: 'Aviso rojo por lluvias torrenciales y DANA en el litoral valenciano',
        summary: 'Acumulados superiores a 60 mm/h en l\'Horta y la Ribera. Evitar pasos subterráneos y ramblas.',
        tag: 'Aviso Rojo',
        timeAgo: 'Hace 15 min',
      },
    ],
  },
  {
    id: 'mock-user-wind',
    fullName: 'Iago Fernández',
    username: 'iago_atlantico',
    email: 'iago.fernandez@demo.es',
    province: 'A Coruña',
    avatarColor: '#3B526E',
    location: {
      name: 'A Coruña',
      province: 'A Coruña',
      latitude: 43.3623,
      longitude: -8.4115,
    },
    stormTitle: 'Temporal de Viento y Oleaje',
    stormSummary: 'Borrasca atlántica profunda con rachas de 86 km/h y mar combinada',
    stormBadge: 'Viento 86 km/h',
    weather: {
      current: {
        temperature: 13,
        apparentTemperature: 8,
        humidity: 84,
        precipitation: 12,
        weatherCode: 81,
        windSpeed: 86,
        conditionText: 'Chubascos',
      },
      hourly: buildHourly(13, 80, 81, [0, 1, 1, 0, -1, -1, -2, -2, -1, 0, 0, -1]),
      daily: { tempMax: 15, tempMin: 10, weatherCode: 81 },
    },
    news: [
      {
        id: 'mock-news-wind-1',
        source: 'MeteoGalicia / AEMET',
        title: 'Temporal atlántico con rachas de 85-95 km/h en la costa coruñesa',
        summary: 'Olas de hasta 7 metros en el litoral noroeste y fuertes rachas de componente oeste.',
        tag: 'Aviso Naranja',
        timeAgo: 'Hace 25 min',
      },
    ],
  },
  {
    id: 'mock-user-heat',
    fullName: 'Rocío Delgado',
    username: 'rocio_sur',
    email: 'rocio.delgado@demo.es',
    province: 'Sevilla',
    avatarColor: '#DC4C4E',
    location: {
      name: 'Sevilla',
      province: 'Sevilla',
      latitude: 37.3891,
      longitude: -5.9845,
    },
    stormTitle: 'Ola de Calor Extremo',
    stormSummary: 'Masa de aire sahariano con máximas de 42°C y viento seco en el valle',
    stormBadge: 'Calor 42°C',
    weather: {
      current: {
        temperature: 42,
        apparentTemperature: 44,
        humidity: 18,
        precipitation: 0,
        weatherCode: 0,
        windSpeed: 22,
        conditionText: 'Despejado',
      },
      hourly: buildHourly(41, 0, 0, [1, 1, 0, -1, -3, -5, -7, -9, -10, -11, -9, -6]),
      daily: { tempMax: 42, tempMin: 26, weatherCode: 0 },
    },
    news: [
      {
        id: 'mock-news-heat-1',
        source: 'AEMET Andalucía',
        title: 'Aviso rojo por temperaturas extremas superiores a 41°C en la campiña sevillana',
        summary: 'Se recomienda evitar exposición solar entre las 13:00 y 19:00 horas y extremar hidratación.',
        tag: 'Aviso Rojo',
        timeAgo: 'Hace 30 min',
      },
    ],
  },
  {
    id: 'mock-user-snow',
    fullName: 'Javier Montes',
    username: 'javier_sierra',
    email: 'javier.montes@demo.es',
    province: 'Madrid',
    avatarColor: '#2A9D8F',
    location: {
      name: 'Collado Villalba',
      province: 'Madrid',
      latitude: 40.6351,
      longitude: -4.0067,
    },
    stormTitle: 'Temporal de Nieve y Helada',
    stormSummary: 'Nevadas intensas desde 900m, -2°C y uso obligatorio de cadenas',
    stormBadge: 'Nevada -2°C',
    weather: {
      current: {
        temperature: -2,
        apparentTemperature: -7,
        humidity: 88,
        precipitation: 18,
        weatherCode: 75,
        windSpeed: 45,
        conditionText: 'Nevada',
      },
      hourly: buildHourly(-2, 90, 75, [0, -1, -1, -2, -2, -3, -3, -2, -1, 0, 1, 0]),
      daily: { tempMax: 1, tempMin: -6, weatherCode: 75 },
    },
    news: [
      {
        id: 'mock-news-snow-1',
        source: 'AEMET Madrid',
        title: 'Aviso naranja por nevadas copiosas en la Sierra de Guadarrama',
        summary: 'Espesores de 20 cm en puertos de montaña (Navacerrada y Cotos). Cadenas obligatorias.',
        tag: 'Aviso Naranja',
        timeAgo: 'Hace 20 min',
      },
    ],
  },
  {
    id: 'mock-user-hail',
    fullName: 'Laia Puig',
    username: 'laia_costa',
    email: 'laia.puig@demo.es',
    province: 'Barcelona',
    avatarColor: '#DF6D49',
    location: {
      name: 'Barcelona',
      province: 'Barcelona',
      latitude: 41.3879,
      longitude: 2.1699,
    },
    stormTitle: 'Tormenta Eléctrica y Granizo',
    stormSummary: 'Células convectivas muy activas con granizo y rachas de 65 km/h',
    stormBadge: 'Granizo y Rayos',
    weather: {
      current: {
        temperature: 18,
        apparentTemperature: 17,
        humidity: 86,
        precipitation: 32,
        weatherCode: 96,
        windSpeed: 65,
        conditionText: 'Tormenta con granizo',
      },
      hourly: buildHourly(18, 90, 96, [0, -1, -1, 0, 1, 1, 0, -1, -1, -2, -2, -1]),
      daily: { tempMax: 21, tempMin: 14, weatherCode: 96 },
    },
    news: [
      {
        id: 'mock-news-hail-1',
        source: 'Meteocat',
        title: 'Aviso por tormenta fuerte acompañada de granizo en el Barcelonès y Vallès',
        summary: 'Descargas eléctricas frecuentes y rachas convectivas intensas durante las próximas 2 horas.',
        tag: 'Aviso Naranja',
        timeAgo: 'Hace 10 min',
      },
    ],
  },
];
