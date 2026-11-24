import { WeatherData } from './weatherApi';
import {
  DEFAULT_OUTFIT_PREFERENCES,
  getThermalOption,
  OutfitPreferences,
  OutfitStyle,
  ThermalSensitivity,
} from '@/features/profile/data/outfitPreferences';

export type OutfitAlertLevel =
  | 'normal'
  | 'warm_notice'
  | 'rain_alert'
  | 'cold_alert'
  | 'wind_alert';

export type OutfitLayerIcon =
  | 'shirt'
  | 'layers'
  | 'footprints'
  | 'umbrella'
  | 'glasses'
  | 'wind'
  | 'sparkles';

export interface OutfitLayerItem {
  id: 'top' | 'bottom' | 'footwear' | 'accessories';
  categoryLabel: string;
  title: string;
  detail: string;
  badge?: string;
  badgeTone?: 'warning' | 'rain' | 'brand' | 'neutral';
  icon: OutfitLayerIcon;
  isAlert?: boolean;
}

export interface DayPeriodSlot {
  id: 'morning' | 'afternoon' | 'night';
  label: 'Mañana' | 'Tarde' | 'Noche';
  temp: number;
  rainProb: number;
  note: string;
  needsLayer: boolean;
}

export interface OutfitRecommendation {
  style: OutfitStyle;
  thermalSensitivity: ThermalSensitivity;
  effectiveTemp: number;
  vibeTag: string;
  alertLevel: OutfitAlertLevel;
  alertBanner?: string;
  headline: string;
  top: OutfitLayerItem;
  bottom: OutfitLayerItem;
  footwear: OutfitLayerItem;
  accessories: OutfitLayerItem;
  periods: DayPeriodSlot[];
  returnHomeTip: string;
}

export interface DailyAdvice {
  title: string;
  outfitAdvice: string;
  planAdvice: string;
  highlightBadge: string;
  badgeTone: 'neutral' | 'brand' | 'warning' | 'rain' | 'heat' | 'wind';
  outfit: OutfitRecommendation;
}

type ThermalBand = 'freezing' | 'cold' | 'cool' | 'mild' | 'hot';

function classifyThermalBand(effectiveTemp: number): ThermalBand {
  if (effectiveTemp <= 7) return 'freezing';
  if (effectiveTemp <= 14) return 'cold';
  if (effectiveTemp <= 20) return 'cool';
  if (effectiveTemp <= 27) return 'mild';
  return 'hot';
}

function parseHour(timeStr: string): number {
  const parsed = parseInt(timeStr.split(':')[0], 10);
  return Number.isNaN(parsed) ? 12 : parsed;
}

function buildDayPeriods(
  weather: WeatherData,
  offsetC: number
): { periods: DayPeriodSlot[]; coolsAtNight: boolean; rainLater: boolean; returnHomeTip: string } {
  const morningItems = weather.hourly.filter((h) => {
    const hr = parseHour(h.time);
    return hr >= 7 && hr <= 13;
  });
  const afternoonItems = weather.hourly.filter((h) => {
    const hr = parseHour(h.time);
    return hr >= 14 && hr <= 20;
  });
  const nightItems = weather.hourly.filter((h) => {
    const hr = parseHour(h.time);
    return hr >= 21 || hr <= 5;
  });

  const avgTemp = (items: typeof weather.hourly, fallback: number) =>
    items.length > 0
      ? Math.round(items.reduce((acc, i) => acc + i.temperature, 0) / items.length)
      : fallback;

  const maxRain = (items: typeof weather.hourly) =>
    items.length > 0 ? Math.max(...items.map((i) => i.precipitationProbability)) : 0;

  const morningTemp = avgTemp(
    morningItems,
    Math.round((weather.daily.tempMin + weather.current.temperature) / 2)
  );
  const afternoonTemp = avgTemp(afternoonItems, weather.daily.tempMax);
  const nightTemp = avgTemp(nightItems, weather.daily.tempMin);

  const morningRain = maxRain(morningItems);
  const afternoonRain = maxRain(afternoonItems);
  const nightRain = maxRain(nightItems);

  const slotNote = (temp: number, rain: number): { note: string; needsLayer: boolean } => {
    const eff = temp + offsetC;
    if (rain >= 55) return { note: 'Lluvia probable', needsLayer: true };
    if (eff <= 11) return { note: 'Abrigo fuerte', needsLayer: true };
    if (eff <= 16.5) return { note: 'Lleva chaqueta', needsLayer: true };
    if (eff >= 28) return { note: 'Calor alto', needsLayer: false };
    return { note: 'Agradable', needsLayer: false };
  };

  const mInfo = slotNote(morningTemp, morningRain);
  const aInfo = slotNote(afternoonTemp, afternoonRain);
  const nInfo = slotNote(nightTemp, nightRain);

  const tempDrop = afternoonTemp - nightTemp;
  const coolsAtNight = tempDrop >= 5 || nightTemp + offsetC <= 15.5;
  const rainLater = nightRain >= 45 || afternoonRain >= 45;

  let returnHomeTip: string;
  if (rainLater && nightRain >= 50) {
    returnHomeTip = `Probabilidad de lluvia del ${nightRain}% al volver: lleva capa impermeable o paraguas compacto.`;
  } else if (tempDrop >= 6 && nightTemp + offsetC <= 16) {
    returnHomeTip = `Baja ${tempDrop}°C de la tarde a la noche (${nightTemp}°C): lleva chaqueta ligera para la vuelta a casa.`;
  } else if (nightTemp + offsetC <= 13) {
    returnHomeTip = `Noche fría (${nightTemp}°C): no salgas sin prenda exterior abrigada para el regreso.`;
  } else if (afternoonTemp + offsetC >= 29) {
    returnHomeTip = `Pico cálido por la tarde (${afternoonTemp}°C): prioriza tejidos transpirables y agua a mano.`;
  } else {
    returnHomeTip = `Temperatura estable entre ${weather.daily.tempMin}°C y ${weather.daily.tempMax}°C: outfit cómodo todo el día.`;
  }

  return {
    periods: [
      {
        id: 'morning',
        label: 'Mañana',
        temp: morningTemp,
        rainProb: morningRain,
        note: mInfo.note,
        needsLayer: mInfo.needsLayer,
      },
      {
        id: 'afternoon',
        label: 'Tarde',
        temp: afternoonTemp,
        rainProb: afternoonRain,
        note: aInfo.note,
        needsLayer: aInfo.needsLayer,
      },
      {
        id: 'night',
        label: 'Noche',
        temp: nightTemp,
        rainProb: nightRain,
        note: coolsAtNight && !nInfo.needsLayer ? 'Refresca al volver' : nInfo.note,
        needsLayer: nInfo.needsLayer || coolsAtNight,
      },
    ],
    coolsAtNight,
    rainLater,
    returnHomeTip,
  };
}

interface StyleGarmentTemplates {
  top: Record<ThermalBand, { title: string; detail: string }>;
  bottom: Record<ThermalBand, { title: string; detail: string }>;
  footwear: Record<ThermalBand, { title: string; detail: string }>;
}

const STYLE_TEMPLATES: Record<OutfitStyle, StyleGarmentTemplates> = {
  casual: {
    top: {
      freezing: {
        title: 'Abrigo térmico + jersey grueso',
        detail: 'Camiseta interior de algodón, punto cálido y abrigo acolchado.',
      },
      cold: {
        title: 'Sudadera o jersey + chaqueta',
        detail: 'Capa media cómoda con cazadora o sobrecamisa estructurada.',
      },
      cool: {
        title: 'Camiseta + sobrecamisa ligera',
        detail: 'Combinación en capas fácil de quitar al mediodía.',
      },
      mild: {
        title: 'Camiseta de algodón o polo',
        detail: 'Corte relajado y transpirable para moverte con comodidad.',
      },
      hot: {
        title: 'Camiseta ligera o camisa de lino',
        detail: 'Tejido muy fresco y colores claros que reflejen el calor.',
      },
    },
    bottom: {
      freezing: {
        title: 'Vaquero grueso o pantalón térmico',
        detail: 'Tejido denso que bloquee el aire frío en piernas.',
      },
      cold: {
        title: 'Jeans rectos o chinos',
        detail: 'Pantalón largo versátil de gramaje medio.',
      },
      cool: {
        title: 'Vaqueros cómodos o chinos',
        detail: 'Equilibrio perfecto entre frescura y abrigo suave.',
      },
      mild: {
        title: 'Pantalón fluido o denim ligero',
        detail: 'Algodón ligero, chino relajado o bermuda si hace sol.',
      },
      hot: {
        title: 'Shorts o pantalón ancho de lino',
        detail: 'Máxima ventilación para las horas centrales del día.',
      },
    },
    footwear: {
      freezing: {
        title: 'Botas forradas con suela gruesa',
        detail: 'Aíslan del suelo frío y dan agarre seguro.',
      },
      cold: {
        title: 'Botines o zapatillas de piel',
        detail: 'Calzado cerrado cómodo con calcetín medio.',
      },
      cool: {
        title: 'Zapatillas casual diarias',
        detail: 'Sneakers limpias o mocasines cómodos para caminar.',
      },
      mild: {
        title: 'Sneakers ligeras de lona o piel',
        detail: 'Transpirables y aptas para todo el día.',
      },
      hot: {
        title: 'Sandalias cómodas o zapatillas frescas',
        detail: 'Calzado abierto o tejido mesh ultraligero.',
      },
    },
  },

  streetwear: {
    top: {
      freezing: {
        title: 'Puffer oversize + hoodie pesado',
        detail: 'Plumífero corto de alto volumen sobre sudadera con capucha.',
      },
      cold: {
        title: 'Hoodie + bomber o cazadora denim',
        detail: 'Layering urbano con silueta amplia y cuello protegido.',
      },
      cool: {
        title: 'Camiseta boxy + sobrecamisa',
        detail: 'Juego de capas abierto que funciona genial de tarde.',
      },
      mild: {
        title: 'Tee oversize de algodón grueso',
        detail: 'Fit relajado y limpio; lleva sudadera a la cintura si refresca.',
      },
      hot: {
        title: 'Camiseta boxy ligera o tank top',
        detail: 'Algodón fresco con caída amplia y máxima ventilación.',
      },
    },
    bottom: {
      freezing: {
        title: 'Cargo grueso o baggy denim',
        detail: 'Pantalón ancho de sarga resistente al frío.',
      },
      cold: {
        title: 'Pantalón cargo o wide-leg jeans',
        detail: 'Corte ancho cómodo con caída estructurada.',
      },
      cool: {
        title: 'Baggy jeans o parachute pants',
        detail: 'Tejido medio con movimiento ligero.',
      },
      mild: {
        title: 'Cargo ligero o bermuda jort',
        detail: 'Silueta relajada con buena circulación de aire.',
      },
      hot: {
        title: 'Shorts cargo o bermudas amplias',
        detail: 'Corte holgado en nylon ligero o algodón fresco.',
      },
    },
    footwear: {
      freezing: {
        title: 'Botas chunky con suela track',
        detail: 'Presencia urbana con aislamiento térmico y tracción.',
      },
      cold: {
        title: 'Sneakers high-top o botas bajas',
        detail: 'Protegen el tobillo del aire frío.',
      },
      cool: {
        title: 'Sneakers retro o skate shoes',
        detail: 'Cómodas para patear la ciudad todo el día.',
      },
      mild: {
        title: 'Sneakers low-top limpias',
        detail: 'Suela ligera y estilo versátil.',
      },
      hot: {
        title: 'Sneakers mesh o zuecos urbanos',
        detail: 'Frescos, ligeros y listos para el calor.',
      },
    },
  },

  sporty: {
    top: {
      freezing: {
        title: 'Térmica + forro polar + plumífero',
        detail: 'Sistema de 3 capas técnicas que retienen calor sin sudar.',
      },
      cold: {
        title: 'Sudadera tech + chaleco o cortavientos',
        detail: 'Tejido técnico cálido con protección frontal.',
      },
      cool: {
        title: 'Camiseta técnica + zip ligero',
        detail: 'Chaqueta de media cremallera ideal para regular temperatura.',
      },
      mild: {
        title: 'Camiseta transpirable dry-fit',
        detail: 'Evacúa humedad y mantiene frescura en movimiento.',
      },
      hot: {
        title: 'Camiseta sin mangas o mesh técnico',
        detail: 'Secado rápido con protección UV ligera.',
      },
    },
    bottom: {
      freezing: {
        title: 'Joggers térmicos o mallas afelpadas',
        detail: 'Interior cepillado que mantiene el calor corporal.',
      },
      cold: {
        title: 'Joggers de felpa o pantalón técnico',
        detail: 'Ajuste cómodo con puño cerrado contra el aire.',
      },
      cool: {
        title: 'Pantalón jogger ligero o leggings',
        detail: 'Flexibles y cómodos para caminar o entrenar.',
      },
      mild: {
        title: 'Shorts técnicos o jogger fino',
        detail: 'Tejido elástico de secado rápido.',
      },
      hot: {
        title: 'Shorts deportivos ultraligeros',
        detail: 'Malla interior fresca y libertad total de movimiento.',
      },
    },
    footwear: {
      freezing: {
        title: 'Zapatillas trail impermeables',
        detail: 'Suela con taco y membrana que protege del frío.',
      },
      cold: {
        title: 'Running acolchadas cerradas',
        detail: 'Upper denso con calcetín deportivo alto.',
      },
      cool: {
        title: 'Zapatillas running o training',
        detail: 'Amortiguación ligera para largas caminatas.',
      },
      mild: {
        title: 'Zapatillas deportivas transpirables',
        detail: 'Malla ventilada de uso diario.',
      },
      hot: {
        title: 'Running ultraligeras de malla',
        detail: 'Máxima ventilación para evitar recalentamiento.',
      },
    },
  },

  smart: {
    top: {
      freezing: {
        title: 'Abrigo de paño + cuello alto',
        detail: 'Jersey de lana fina bajo abrigo largo estructurado.',
      },
      cold: {
        title: 'Camisa + punto fino + gabardina',
        detail: 'Capas pulidas con abrigo ligero o blazer de lana.',
      },
      cool: {
        title: 'Camisa o polo + blazer ligera',
        detail: 'Aspecto impecable adaptable a cambios de temperatura.',
      },
      mild: {
        title: 'Camisa de popelín o punto calado',
        detail: 'Elegancia relajada en tejidos naturales.',
      },
      hot: {
        title: 'Camisa de lino o blusa fluida',
        detail: 'Caída fresca en tonos crema, arena o blanco.',
      },
    },
    bottom: {
      freezing: {
        title: 'Pantalón de pinzas de lana',
        detail: 'Corte recto abrigado y sofisticado.',
      },
      cold: {
        title: 'Pantalón sastre o chino oscuro',
        detail: 'Tejido estructurado con caída impecable.',
      },
      cool: {
        title: 'Chino sastre o pantalón recto',
        detail: 'Cómodo para oficina, citas o paseos.',
      },
      mild: {
        title: 'Pantalón fluido de algodón o tencel',
        detail: 'Líneas limpias con sensación ligera.',
      },
      hot: {
        title: 'Pantalón de lino o bermuda sastre',
        detail: 'Fresco y arreglado para altas temperaturas.',
      },
    },
    footwear: {
      freezing: {
        title: 'Botines Chelsea de piel',
        detail: 'Elegantes, cerrados y resistentes al frío.',
      },
      cold: {
        title: 'Mocasines de suela gruesa o botines',
        detail: 'Acabado pulido con calcetín cálido.',
      },
      cool: {
        title: 'Mocasines o sneakers minimalistas',
        detail: 'Piel limpia en tono neutro para elevar el look.',
      },
      mild: {
        title: 'Mocasines suaves o derby ligero',
        detail: 'Estilo sobrio y cómodo todo el día.',
      },
      hot: {
        title: 'Alpargatas pulidas o sandalias de piel',
        detail: 'Frescas y elegantes sin perder compostura.',
      },
    },
  },
};

export function evaluateOutfitRecommendation(
  weather: WeatherData,
  prefs: OutfitPreferences = DEFAULT_OUTFIT_PREFERENCES
): OutfitRecommendation {
  const { temperature, apparentTemperature, windSpeed, precipitation, weatherCode } = weather.current;
  const thermalOpt = getThermalOption(prefs.thermalSensitivity);
  const maxRainProb12h = Math.max(
    ...weather.hourly.slice(0, 12).map((h) => h.precipitationProbability),
    0
  );

  // Temperatura efectiva cruzando real + sensación térmica + sensibilidad del usuario (±2.5°C)
  const baseFeels = Math.round((temperature * 0.55 + apparentTemperature * 0.45) * 10) / 10;
  const effectiveTemp = Math.round((baseFeels + thermalOpt.tempOffsetC) * 10) / 10;
  const band = classifyThermalBand(effectiveTemp);

  const isStorm = weatherCode >= 95;
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isRain =
    isStorm ||
    [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode) ||
    precipitation >= 0.5 ||
    maxRainProb12h >= 50;
  const isWindy = windSpeed >= 34;
  const isSunny = weatherCode <= 2 && !isRain;

  const { periods, coolsAtNight, returnHomeTip } = buildDayPeriods(weather, thermalOpt.tempOffsetC);
  const tpl = STYLE_TEMPLATES[prefs.style];

  // 1. Parte superior (+ capa extra si llueve, hay viento o refresca a la noche)
  const topBase = tpl.top[band];
  let topTitle = topBase.title;
  let topDetail = topBase.detail;
  let topBadge: string | undefined;
  let topBadgeTone: OutfitLayerItem['badgeTone'] = 'warning';
  let topIsAlert = false;

  if (isRain) {
    topTitle =
      prefs.style === 'smart'
        ? 'Gabardina impermeable + capa media'
        : prefs.style === 'sporty'
          ? 'Chubasquero técnico sellado'
          : 'Impermeable con capucha + base cómoda';
    topDetail = isStorm
      ? 'Lluvia fuerte/tormenta: prioriza tejido 100% repelente al agua.'
      : `Lluvia prevista (${Math.max(maxRainProb12h, precipitation > 0 ? 75 : 50)}%): capa exterior impermeable clave.`;
    topBadge = 'Impermeable';
    topBadgeTone = 'rain';
    topIsAlert = true;
  } else if (isWindy) {
    topTitle = `${topBase.title.split('+')[0].trim()} + cortavientos`;
    topDetail = `Rachas de ${windSpeed} km/h: cierra bien la capa exterior contra el viento.`;
    topBadge = 'Cortavientos';
    topBadgeTone = 'rain';
    topIsAlert = true;
  } else if (band === 'freezing') {
    topBadge = 'Abrigo fuerte';
    topBadgeTone = 'rain';
    topIsAlert = true;
  } else if (coolsAtNight && (band === 'mild' || band === 'cool')) {
    topDetail = `${topBase.detail} Suma una chaqueta ligera si vuelves tarde.`;
    topBadge = 'Capa extra noche';
    topBadgeTone = 'warning';
  } else if (band === 'hot') {
    topBadge = 'Tejido fresco';
    topBadgeTone = 'warning';
  }

  // 2. Parte inferior
  const bottomBase = tpl.bottom[band];
  const bottom: OutfitLayerItem = {
    id: 'bottom',
    categoryLabel: 'Parte inferior',
    title: bottomBase.title,
    detail: isRain
      ? `${bottomBase.detail} Evita bajos arrastrando por charcos.`
      : bottomBase.detail,
    badge: band === 'hot' ? 'Ventilado' : undefined,
    badgeTone: 'warning',
    icon: 'layers',
  };

  // 3. Calzado
  const footBase = tpl.footwear[band];
  let footTitle = footBase.title;
  let footDetail = footBase.detail;
  let footBadge: string | undefined;
  let footBadgeTone: OutfitLayerItem['badgeTone'] = 'neutral';
  let footIsAlert = false;

  if (isRain || isSnow) {
    footTitle =
      prefs.style === 'smart'
        ? 'Botines de piel impermeables'
        : prefs.style === 'sporty'
          ? 'Zapatillas con membrana Gore-Tex'
          : 'Botas o sneakers resistentes al agua';
    footDetail = 'Suela antideslizante para aceras mojadas; evita lona o ante hoy.';
    footBadge = 'Antilluvia';
    footBadgeTone = 'rain';
    footIsAlert = true;
  } else if (band === 'freezing') {
    footBadge = 'Térmico';
    footBadgeTone = 'brand';
  }

  // 4. Accesorios
  let accTitle = 'Bolso o mochila ligera';
  let accDetail = 'Día tranquilo: lleva solo tus básicos y crema labial.';
  let accBadge: string | undefined = 'Clave hoy';
  let accBadgeTone: OutfitLayerItem['badgeTone'] = 'warning';
  let accIcon: OutfitLayerIcon = 'sparkles';
  let accIsAlert = false;

  if (isRain) {
    accTitle = isWindy ? 'Capucha fija + bolsa estanca' : 'Paraguas compacto resistente';
    accDetail = isWindy
      ? 'Con viento fuerte mejor capucha que paraguas frágil.'
      : 'Imprescindible en la mochila ante chubascos hoy.';
    accBadge = 'No lo olvides';
    accBadgeTone = 'rain';
    accIcon = 'umbrella';
    accIsAlert = true;
  } else if (band === 'freezing' || isSnow) {
    accTitle = 'Bufanda cálida y gorro de punto';
    accDetail = 'Protege cuello y orejas, sobre todo a primera hora y de noche.';
    accBadge = 'Abrigo extra';
    accBadgeTone = 'rain';
    accIcon = 'wind';
    accIsAlert = true;
  } else if (band === 'hot' || (isSunny && effectiveTemp >= 23)) {
    accTitle = band === 'hot' ? 'Gafas de sol + gorra + agua' : 'Gafas de sol';
    accDetail =
      band === 'hot'
        ? 'Protección solar esencial entre las 12:00 y las 17:00.'
        : 'Luz intensa en horas centrales: gafas con filtro UV.';
    accBadge = band === 'hot' ? 'Aviso calor' : 'Sol hoy';
    accBadgeTone = 'warning';
    accIcon = 'glasses';
  } else if (isWindy) {
    accTitle = 'Braga de cuello o pañuelo';
    accDetail = 'Evita que el viento fresco enfríe la garganta.';
    accBadge = `${windSpeed} km/h`;
    accBadgeTone = 'brand';
    accIcon = 'wind';
  } else if (band === 'cold') {
    accTitle = 'Bufanda ligera de entretiempo';
    accDetail = 'Marca la diferencia al salir temprano o volver al anochecer.';
    accBadge = 'Tip confort';
    accBadgeTone = 'warning';
  }

  // Nivel de alerta y VibeTag
  let alertLevel: OutfitAlertLevel = 'normal';
  let alertBanner: string | undefined;
  let vibeTag = 'Look equilibrado';
  let headline = 'Capas ligeras y cómodas para disfrutar el día sin imprevistos.';

  if (isStorm) {
    alertLevel = 'rain_alert';
    alertBanner = 'Alerta de tormenta: prioriza chubasquero impermeable y calzado con agarre.';
    vibeTag = 'Modo tormenta';
    headline = 'Protección impermeable total con estilo y seguridad.';
  } else if (isRain) {
    alertLevel = 'rain_alert';
    alertBanner = 'Lluvia a la vista: lleva impermeable o paraguas antes de salir.';
    vibeTag = 'A prueba de lluvia';
    headline = 'Prendas repelentes al agua y calzado seco para todo el día.';
  } else if (band === 'freezing' || isSnow) {
    alertLevel = 'cold_alert';
    alertBanner = `Frío intenso (${Math.round(effectiveTemp)}°C percibidos): abrigo fuerte y bufanda.`;
    vibeTag = 'Abrigo total';
    headline = 'Capas térmicas cálidas para mantener el confort desde la mañana.';
  } else if (isWindy) {
    alertLevel = 'wind_alert';
    alertBanner = `Viento fuerte (${windSpeed} km/h): mejor chaqueta cortavientos ajustada.`;
    vibeTag = 'Cortavientos ON';
    headline = 'Prendas que corten las rachas sin perder movilidad.';
  } else if (band === 'hot') {
    alertLevel = 'warm_notice';
    alertBanner = `Aviso de calor (${Math.round(effectiveTemp)}°C percibidos): tejidos muy frescos e hidratación.`;
    vibeTag = 'Fresh & ligero';
    headline = 'Ropa suelta y transpirable para sobrellevar el sol con estilo.';
  } else if (band === 'cold') {
    vibeTag = 'Capas con flow';
    headline = 'Combina una base cómoda con prenda exterior abrigada.';
  } else if (band === 'cool') {
    vibeTag = 'Entretiempo smart';
    headline = 'La regla de oro hoy: capas fáciles de quitar al mediodía.';
  } else {
    vibeTag = 'Clima ideal';
    headline = 'Temperatura top: look ligero y una capa fina solo si vuelves tarde.';
  }

  return {
    style: prefs.style,
    thermalSensitivity: prefs.thermalSensitivity,
    effectiveTemp,
    vibeTag,
    alertLevel,
    alertBanner,
    headline,
    top: {
      id: 'top',
      categoryLabel: 'Parte superior',
      title: topTitle,
      detail: topDetail,
      badge: topBadge,
      badgeTone: topBadgeTone,
      icon: 'shirt',
      isAlert: topIsAlert,
    },
    bottom,
    footwear: {
      id: 'footwear',
      categoryLabel: 'Calzado',
      title: footTitle,
      detail: footDetail,
      badge: footBadge,
      badgeTone: footBadgeTone,
      icon: 'footprints',
      isAlert: footIsAlert,
    },
    accessories: {
      id: 'accessories',
      categoryLabel: 'Accesorios',
      title: accTitle,
      detail: accDetail,
      badge: accBadge,
      badgeTone: accBadgeTone,
      icon: accIcon,
      isAlert: accIsAlert,
    },
    periods,
    returnHomeTip,
  };
}

export function evaluateDailyAdvice(
  weather: WeatherData,
  prefs: OutfitPreferences = DEFAULT_OUTFIT_PREFERENCES
): DailyAdvice {
  const outfit = evaluateOutfitRecommendation(weather, prefs);
  const { temperature, apparentTemperature, windSpeed, precipitation, weatherCode } = weather.current;
  const maxRainProb = Math.max(
    ...weather.hourly.slice(0, 12).map((h) => h.precipitationProbability),
    0
  );

  const isRainingOrStorm =
    [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode) ||
    precipitation > 0.5 ||
    maxRainProb > 50;

  let title = 'Condiciones óptimas y templadas';
  let planAdvice = 'Día idóneo para planes al aire libre, terrazas y deporte suave en parques.';
  let highlightBadge = outfit.vibeTag;
  let badgeTone: DailyAdvice['badgeTone'] = 'brand';

  if (isRainingOrStorm) {
    if (weatherCode >= 95) {
      title = 'Tormentas eléctricas activas';
      planAdvice =
        'Prioriza actividades de interior. Evita zonas arboladas o espacios abiertos si hay aparato eléctrico.';
      highlightBadge = 'Alerta tormenta';
      badgeTone = 'rain';
    } else {
      title = 'Día lluvioso por delante';
      planAdvice =
        'Ideal para museos, cine o cafés acogedores. Precaución por pavimento mojado.';
      highlightBadge = 'Lluvia probable';
      badgeTone = 'rain';
    }
  } else if (windSpeed > 35) {
    title = 'Rachas de viento notables';
    planAdvice = 'Evita parques arbolados y actividades expuestas al viento fuerte.';
    highlightBadge = `${windSpeed} km/h viento`;
    badgeTone = 'wind';
  } else if (temperature <= 4 || [71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    title = 'Ambiente gélido invernal';
    planAdvice =
      'Perfecto para planes al calor de una cafetería o interior. Atención al frío nocturno.';
    highlightBadge = 'Frío intenso';
    badgeTone = 'rain';
  } else if (temperature >= 30 || apparentTemperature >= 32) {
    title = 'Jornada calurosa';
    planAdvice =
      'Mantente hidratado y evita esfuerzo físico intenso entre las 12:00 y las 17:00.';
    highlightBadge = 'Aviso calor';
    badgeTone = 'warning';
  } else if (temperature < 18) {
    title = 'Ambiente fresco de entretiempo';
    planAdvice = 'Excelente para pasear por la ciudad o rutas suaves con calzado cómodo.';
    highlightBadge = 'Entretiempo';
    badgeTone = 'warning';
  }

  return {
    title,
    outfitAdvice: `${outfit.top.title} · ${outfit.bottom.title} · ${outfit.footwear.title}.`,
    planAdvice,
    highlightBadge,
    badgeTone,
    outfit,
  };
}
