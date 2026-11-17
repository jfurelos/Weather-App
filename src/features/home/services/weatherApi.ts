export interface WeatherData {
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    precipitation: number;
    weatherCode: number;
    windSpeed: number;
    conditionText: string;
  };
  hourly: Array<{
    time: string; // "14:00"
    temperature: number;
    precipitationProbability: number;
    weatherCode: number;
  }>;
  daily: {
    tempMax: number;
    tempMin: number;
    weatherCode: number;
  };
}

// Mapeo oficial de códigos WMO (World Meteorological Organization)
export function getWMOCondition(code: number): { text: string; iconName: string } {
  switch (code) {
    case 0:
      return { text: 'Despejado', iconName: 'Sun' };
    case 1:
      return { text: 'Mayormente despejado', iconName: 'Sun' };
    case 2:
      return { text: 'Parcialmente nublado', iconName: 'CloudSun' };
    case 3:
      return { text: 'Nublado', iconName: 'Cloud' };
    case 45:
    case 48:
      return { text: 'Niebla o bruma', iconName: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { text: 'Llovizna suave', iconName: 'CloudDrizzle' };
    case 61:
      return { text: 'Lluvia ligera', iconName: 'CloudRain' };
    case 63:
      return { text: 'Lluvia moderada', iconName: 'CloudRain' };
    case 65:
      return { text: 'Lluvia fuerte', iconName: 'CloudRain' };
    case 71:
    case 73:
    case 75:
      return { text: 'Nevada', iconName: 'Snowflake' };
    case 77:
      return { text: 'Granizo menudo', iconName: 'Snowflake' };
    case 80:
    case 81:
    case 82:
      return { text: 'Chubascos', iconName: 'CloudRain' };
    case 85:
    case 86:
      return { text: 'Chubascos de nieve', iconName: 'Snowflake' };
    case 95:
      return { text: 'Tormenta', iconName: 'CloudLightning' };
    case 96:
    case 99:
      return { text: 'Tormenta con granizo', iconName: 'CloudLightning' };
    default:
      return { text: 'Variable', iconName: 'CloudSun' };
  }
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FMadrid&forecast_days=2`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error en API de Open-Meteo: ${response.statusText}`);
  }

  const data = await response.json();

  const currentCondition = getWMOCondition(data.current.weather_code);

  // Filtrar las siguientes 24 horas a partir de la hora actual
  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"

  const hourlyIndices: number[] = [];
  data.hourly.time.forEach((t: string, idx: number) => {
    if (t >= currentHourISO && hourlyIndices.length < 24) {
      hourlyIndices.push(idx);
    }
  });

  const formattedHourly = hourlyIndices.map((idx) => {
    const rawTime = data.hourly.time[idx];
    const hourPart = rawTime.split('T')[1].slice(0, 5); // "HH:MM"
    return {
      time: hourPart,
      temperature: Math.round(data.hourly.temperature_2m[idx]),
      precipitationProbability: data.hourly.precipitation_probability[idx] ?? 0,
      weatherCode: data.hourly.weather_code[idx],
    };
  });

  return {
    current: {
      temperature: Math.round(data.current.temperature_2m),
      apparentTemperature: Math.round(data.current.apparent_temperature),
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      windSpeed: Math.round(data.current.wind_speed_10m),
      conditionText: currentCondition.text,
    },
    hourly: formattedHourly,
    daily: {
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
      weatherCode: data.daily.weather_code[0],
    },
  };
}
