import { create } from 'zustand';
import {
  WeatherBulletin,
  DayOption,
  generateNext7Days,
  fetchBulletinsByDay,
} from '../services/bulletinsApi';

interface WeatherMapState {
  days: DayOption[];
  selectedDayIndex: number;
  bulletins: WeatherBulletin[];
  isLoading: boolean;
  isFullScreenModalVisible: boolean;

  setFullScreenModalVisible: (visible: boolean) => void;
  setSelectedDayIndex: (index: number) => Promise<void>;
  loadInitialData: () => Promise<void>;
}

export const useWeatherMapStore = create<WeatherMapState>((set, get) => ({
  days: generateNext7Days(),
  selectedDayIndex: 0,
  bulletins: [],
  isLoading: true,
  isFullScreenModalVisible: false,

  setFullScreenModalVisible: (visible: boolean) => {
    set({ isFullScreenModalVisible: visible });
  },

  setSelectedDayIndex: async (index: number) => {
    set({ selectedDayIndex: index, isLoading: true });
    const bulletins = await fetchBulletinsByDay(index);
    set({ bulletins, isLoading: false });
  },

  loadInitialData: async () => {
    set({ isLoading: true });
    const { selectedDayIndex } = get();
    const bulletins = await fetchBulletinsByDay(selectedDayIndex);
    set({ bulletins, isLoading: false });
  },
}));
