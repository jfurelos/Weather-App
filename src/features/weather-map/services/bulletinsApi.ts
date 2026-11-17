export interface WeatherBulletin {
  id: string;
  source: 'AEMET' | 'Meteocat';
  title: string;
  summary: string;
  region: string;
  severity: 'verde' | 'amarillo' | 'naranja' | 'rojo';
  dayIndex: number; // 0: hoy, 1: mañana, etc.
  dateText: string;
  timestamp: string;
}

export interface DayOption {
  index: number;
  label: string; // "Hoy", "Mañana", "Jue", "Vie", etc.
  dateFormatted: string; // "17 Nov", "18 Nov"
}

export function generateNext7Days(): DayOption[] {
  const days: DayOption[] = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    let label = '';
    if (i === 0) label = 'Hoy';
    else if (i === 1) label = 'Mañana';
    else label = dayNames[d.getDay()];

    const dateFormatted = `${d.getDate()} ${monthNames[d.getMonth()]}`;

    days.push({
      index: i,
      label,
      dateFormatted,
    });
  }

  return days;
}

export const SAMPLE_BULLETINS: WeatherBulletin[] = [
  {
    id: 'b-1',
    source: 'AEMET',
    title: 'Aviso especial: Frente atlántico activo',
    summary: 'Precipitaciones acumuladas de hasta 60mm en 12 horas en Pontevedra y A Coruña. Viento del suroeste con rachas de 80 km/h en cabos expuestos.',
    region: 'Galicia y Cornisa Cantábrica',
    severity: 'naranja',
    dayIndex: 0,
    dateText: 'Hoy',
    timestamp: 'Actualizado hace 40m',
  },
  {
    id: 'b-2',
    source: 'AEMET',
    title: 'Nubosidad compacta y bancos de niebla matinales',
    summary: 'Nieblas persistentes en las cuencas del Duero y Ebro durante las primeras horas. Viento flojo y temperaturas estables en la meseta central.',
    region: 'Castilla y León, La Rioja, Madrid',
    severity: 'verde',
    dayIndex: 0,
    dateText: 'Hoy',
    timestamp: 'Actualizado hace 2h',
  },
  {
    id: 'b-3',
    source: 'Meteocat',
    title: 'Temporal marítimo en la Costa Brava',
    summary: 'Olas de 2.5 a 3 metros por viento del este/noreste moderado a fuerte. Rachas de tramuntana en el norte del Alt Empordà.',
    region: 'Litoral de Girona y Barcelona',
    severity: 'amarillo',
    dayIndex: 0,
    dateText: 'Hoy',
    timestamp: 'Actualizado hace 1h',
  },
  {
    id: 'b-4',
    source: 'AEMET',
    title: 'Extensión de lluvias al interior peninsular',
    summary: 'El frente avanzará hacia el este dejando chubascos dispersos en Extremadura, Sistema Central y Cantábrico oriental.',
    region: 'Zona Centro y Cantábrico',
    severity: 'amarillo',
    dayIndex: 1,
    dateText: 'Mañana',
    timestamp: 'Previsión D+1',
  },
  {
    id: 'b-5',
    source: 'AEMET',
    title: 'Descenso térmico generalizado y cota de nieve en 1.400m',
    summary: 'Entrada de masa de aire polar marítima con bajada de 4 a 6 grados en las máximas de la mitad norte peninsular.',
    region: 'Pirineos, Cordillera Cantábrica e Ibérica',
    severity: 'amarillo',
    dayIndex: 2,
    dateText: 'D+2',
    timestamp: 'Previsión D+2',
  },
  {
    id: 'b-6',
    source: 'Meteocat',
    title: 'Tiempo estable y ascenso de temperaturas',
    summary: 'Cielos despejados con nieblas matinales en la depresión central catalana y ambiente suave en la costa.',
    region: 'Cataluña y Baleares',
    severity: 'verde',
    dayIndex: 3,
    dateText: 'D+3',
    timestamp: 'Previsión D+3',
  },
];

export async function fetchBulletinsByDay(dayIndex: number): Promise<WeatherBulletin[]> {
  // Filtra por día seleccionado o retorna todos si no hay específicos
  const filtered = SAMPLE_BULLETINS.filter((b) => b.dayIndex === dayIndex);
  if (filtered.length === 0) {
    return [
      {
        id: `gen-${dayIndex}`,
        source: 'AEMET',
        title: 'Predicción general para el territorio peninsular',
        summary: 'Sin avisos meteorológicos de riesgo significativo previstos. Condiciones típicas estacionales con nubosidad variable.',
        region: 'Nacional',
        severity: 'verde',
        dayIndex,
        dateText: 'Previsión',
        timestamp: 'Modelos numéricos ECMWF / AEMET',
      },
    ];
  }
  return filtered;
}
