import { create } from 'zustand';
import { WeatherData, fetchWeatherData } from '../services/weatherApi';
import { DailyAdvice, evaluateDailyAdvice } from '../services/rulesEngine';
import { FeaturedNews, fetchFeaturedNews } from '../services/newsService';

export interface City {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

export const SPANISH_CITIES: City[] = [
  { name: 'Madrid', province: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Barcelona', province: 'Barcelona', latitude: 41.3879, longitude: 2.1699 },
  { name: 'Valencia', province: 'Valencia', latitude: 39.4699, longitude: -0.3763 },
  { name: 'Sevilla', province: 'Sevilla', latitude: 37.3891, longitude: -5.9845 },
  { name: 'Bilbao', province: 'Bizkaia', latitude: 43.2630, longitude: -2.9350 },
  { name: 'Zaragoza', province: 'Zaragoza', latitude: 41.6488, longitude: -0.8891 },
  { name: 'Málaga', province: 'Málaga', latitude: 36.7213, longitude: -4.4214 },
  { name: 'Palma', province: 'Illes Balears', latitude: 39.5696, longitude: 2.6502 },
  { name: 'A Coruña', province: 'A Coruña', latitude: 43.3623, longitude: -8.4115 },
  { name: 'Valladolid', province: 'Valladolid', latitude: 41.6523, longitude: -4.7245 },
];

interface HomeState {
  selectedCity: City;
  weather: WeatherData | null;
  advice: DailyAdvice | null;
  news: FeaturedNews[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  setSelectedCity: (city: City) => Promise<void>;
  loadHomeData: () => Promise<void>;
  refreshHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  selectedCity: SPANISH_CITIES[0], // Madrid por defecto
  weather: null,
  advice: null,
  news: [],
  isLoading: true,
  isRefreshing: false,
  error: null,

  setSelectedCity: async (city: City) => {
    set({ selectedCity: city, isLoading: true, error: null });
    await get().loadHomeData();
  },

  loadHomeData: async () => {
    const { selectedCity } = get();
    try {
      set({ isLoading: true, error: null });
      const [weatherData, newsData] = await Promise.all([
        fetchWeatherData(selectedCity.latitude, selectedCity.longitude),
        fetchFeaturedNews(),
      ]);

      const advice = evaluateDailyAdvice(weatherData);

      set({
        weather: weatherData,
        advice,
        news: newsData,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('[useHomeStore] Error cargando datos del inicio:', err);
      set({
        error: err.message || 'No se pudieron actualizar los datos meteorológicos.',
        isLoading: false,
      });
    }
  },

  refreshHomeData: async () => {
    const { selectedCity } = get();
    try {
      set({ isRefreshing: true, error: null });
      const [weatherData, newsData] = await Promise.all([
        fetchWeatherData(selectedCity.latitude, selectedCity.longitude),
        fetchFeaturedNews(),
      ]);

      const advice = evaluateDailyAdvice(weatherData);

      set({
        weather: weatherData,
        advice,
        news: newsData,
        isRefreshing: false,
      });
    } catch (err: any) {
      set({ isRefreshing: false });
    }
  },
}));
