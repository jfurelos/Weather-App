import { create } from 'zustand';
import { WeatherData, fetchWeatherData } from '../services/weatherApi';
import { DailyAdvice, evaluateDailyAdvice } from '../services/rulesEngine';
import { FeaturedNews, fetchFeaturedNews } from '../services/newsService';
import type { MockStormUser } from '@/shared/data/mockStormUsers';
import {
  DEFAULT_OUTFIT_PREFERENCES,
  OutfitPreferences,
} from '@/features/profile/data/outfitPreferences';

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
  { name: 'Bilbao', province: 'Vizcaya', latitude: 43.2630, longitude: -2.9350 },
  { name: 'Zaragoza', province: 'Zaragoza', latitude: 41.6488, longitude: -0.8891 },
  { name: 'Málaga', province: 'Málaga', latitude: 36.7213, longitude: -4.4214 },
  { name: 'Palma', province: 'Baleares', latitude: 39.5696, longitude: 2.6502 },
  { name: 'A Coruña', province: 'A Coruña', latitude: 43.3623, longitude: -8.4115 },
  { name: 'Valladolid', province: 'Valladolid', latitude: 41.6523, longitude: -4.7245 },
];

export interface ActiveMockScenario {
  userId: string;
  userName: string;
  stormTitle: string;
  stormBadge: string;
}

interface HomeState {
  selectedCity: City;
  weather: WeatherData | null;
  advice: DailyAdvice | null;
  outfitPreferences: OutfitPreferences;
  news: FeaturedNews[];
  activeMockScenario: ActiveMockScenario | null;
  scrollToOutfitRequestId: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  setSelectedCity: (city: City) => Promise<void>;
  recomputeAdvice: (prefs?: OutfitPreferences) => void;
  requestScrollToOutfit: () => void;
  applyMockStormScenario: (mockUser: MockStormUser) => void;
  clearMockStormScenario: () => Promise<void>;
  loadHomeData: () => Promise<void>;
  refreshHomeData: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  selectedCity: SPANISH_CITIES[0],
  weather: null,
  advice: null,
  outfitPreferences: DEFAULT_OUTFIT_PREFERENCES,
  news: [],
  activeMockScenario: null,
  scrollToOutfitRequestId: 0,
  isLoading: true,
  isRefreshing: false,
  error: null,

  setSelectedCity: async (city: City) => {
    set({ selectedCity: city, activeMockScenario: null, isLoading: true, error: null });
    await get().loadHomeData();
  },

  recomputeAdvice: (prefs?: OutfitPreferences) => {
    const { weather, outfitPreferences } = get();
    const nextPrefs = prefs ?? outfitPreferences;
    if (!weather) {
      set({ outfitPreferences: nextPrefs });
      return;
    }
    const advice = evaluateDailyAdvice(weather, nextPrefs);
    set({ outfitPreferences: nextPrefs, advice });
  },

  requestScrollToOutfit: () => {
    set((state) => ({ scrollToOutfitRequestId: state.scrollToOutfitRequestId + 1 }));
  },

  applyMockStormScenario: (mockUser: MockStormUser) => {
    const { outfitPreferences } = get();
    const advice = evaluateDailyAdvice(mockUser.weather, outfitPreferences);
    set({
      selectedCity: {
        name: mockUser.location.name,
        province: mockUser.location.province,
        latitude: mockUser.location.latitude,
        longitude: mockUser.location.longitude,
      },
      weather: mockUser.weather,
      advice,
      news: mockUser.news,
      activeMockScenario: {
        userId: mockUser.id,
        userName: mockUser.fullName,
        stormTitle: mockUser.stormTitle,
        stormBadge: mockUser.stormBadge,
      },
      isLoading: false,
      isRefreshing: false,
      error: null,
    });
  },

  clearMockStormScenario: async () => {
    set({ activeMockScenario: null });
    await get().loadHomeData();
  },

  loadHomeData: async () => {
    const { selectedCity, activeMockScenario, outfitPreferences } = get();
    if (activeMockScenario) {
      set({ isLoading: false });
      return;
    }
    try {
      set({ isLoading: true, error: null });
      const [weatherData, newsData] = await Promise.all([
        fetchWeatherData(selectedCity.latitude, selectedCity.longitude),
        fetchFeaturedNews(),
      ]);

      const advice = evaluateDailyAdvice(weatherData, outfitPreferences);

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
    const { selectedCity, activeMockScenario, outfitPreferences } = get();
    if (activeMockScenario) {
      set({ isRefreshing: false });
      return;
    }
    try {
      set({ isRefreshing: true, error: null });
      const [weatherData, newsData] = await Promise.all([
        fetchWeatherData(selectedCity.latitude, selectedCity.longitude),
        fetchFeaturedNews(),
      ]);

      const advice = evaluateDailyAdvice(weatherData, outfitPreferences);

      set({
        weather: weatherData,
        advice,
        news: newsData,
        isRefreshing: false,
      });
    } catch {
      set({ isRefreshing: false });
    }
  },
}));
