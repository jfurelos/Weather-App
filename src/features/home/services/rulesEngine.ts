import { WeatherData } from './weatherApi';

export interface DailyAdvice {
  title: string;
  outfitAdvice: string;
  planAdvice: string;
  highlightBadge: string;
  badgeTone: 'neutral' | 'brand' | 'warning' | 'rain' | 'heat' | 'wind';
}

export function evaluateDailyAdvice(weather: WeatherData): DailyAdvice {
  const { temperature, apparentTemperature, windSpeed, precipitation, weatherCode } = weather.current;
  const maxRainProb = Math.max(...weather.hourly.slice(0, 12).map((h) => h.precipitationProbability), 0);

  // 1. Escenario de Lluvia / Tormenta
  const isRainingOrStorm = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode) || precipitation > 0.5 || maxRainProb > 50;

  if (isRainingOrStorm) {
    if (weatherCode >= 95) {
      return {
        title: 'Tormentas eléctricas activas',
        outfitAdvice: 'Calzado impermeable, impermeable con capucha y paraguas robusto.',
        planAdvice: 'Prioriza actividades de interior. Evita zonas arboladas o espacios abiertos si hay aparato eléctrico.',
        highlightBadge: 'Alerta por tormenta',
        badgeTone: 'warning',
      };
    }

    return {
      title: 'Día lluvioso por delante',
      outfitAdvice: 'Lleva chubasquero o paraguas compacto. Calzado resistente al agua.',
      planAdvice: 'Ideal para museos, cine o cafés. Precaución en carretera por pavimento mojado.',
      highlightBadge: 'Lluvia probable',
      badgeTone: 'rain',
    };
  }

  // 2. Escenario de Viento Fuerte
  if (windSpeed > 35) {
    return {
      title: 'Rachas de viento notables',
      outfitAdvice: 'Chaqueta cortavientos bien ajustada. Evita paraguas frágiles.',
      planAdvice: 'Evita paseos por parques arbolados o actividades náuticas/ciclismo de carretera.',
      highlightBadge: `${windSpeed} km/h viento`,
      badgeTone: 'wind',
    };
  }

  // 3. Escenario de Nieve / Helada
  if (temperature <= 2 || [71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return {
      title: 'Ambiente gélido invernal',
      outfitAdvice: 'Abrigo térmico pesado, bufanda, gorro y calzado con buena suela antideslizante.',
      planAdvice: 'Día perfecto para planes al calor del hogar o cafeterías. Atención a placas de hielo a primeras horas.',
      highlightBadge: 'Bajas temperaturas',
      badgeTone: 'neutral',
    };
  }

  // 4. Escenario de Calor Intenso
  if (temperature >= 30 || apparentTemperature >= 32) {
    return {
      title: 'Jornada calurosa',
      outfitAdvice: 'Ropa holgada de tejidos frescos (lino/algodón), gafas de sol y gorra.',
      planAdvice: 'Mantente hidratado y evita el ejercicio intenso al aire libre en las horas centrales (12:00 a 17:00).',
      highlightBadge: 'Calor elevado',
      badgeTone: 'heat',
    };
  }

  // 5. Escenario Fresco / Entretiempo (10°C - 18°C)
  if (temperature < 18) {
    return {
      title: 'Ambiente fresco de entretiempo',
      outfitAdvice: 'Viste por capas: camiseta, jersey o sudadera fina, y una chaqueta ligera para la mañana y noche.',
      planAdvice: 'Excelente para pasear por la ciudad o rutas suaves de senderismo con calzado cómodo.',
      highlightBadge: 'Entretiempo',
      badgeTone: 'brand',
    };
  }

  // 6. Escenario Templado y Agradable (18°C - 29°C)
  return {
    title: 'Condiciones óptimas y templadas',
    outfitAdvice: 'Ropa cómoda y ligera. Bastará con una chaqueta muy fina por si refresca al anochecer.',
    planAdvice: 'Día idóneo para planes al aire libre, terrazas y deporte suave en parques.',
    highlightBadge: 'Clima ideal',
    badgeTone: 'brand',
  };
}
