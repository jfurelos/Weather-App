import { create } from 'zustand';
import type { AlertCategory } from './useProfileStore';
import type { ClaudyWeatherMode } from '@/features/claudy/types';

export type BannerCategory = AlertCategory | 'claudy_outfit';

export interface ActiveAlertBanner {
  id: string;
  status: 'triggered' | 'filtered';
  category: BannerCategory;
  title: string;
  locationName: string;
  body: string;
  toneLabel: string;
  soundPlayed: boolean;
  claudyWeatherMode?: ClaudyWeatherMode;
  ctaLabel?: string;
  onPress?: () => void;
}

interface AlertBannerState {
  banner: ActiveAlertBanner | null;
  showBanner: (banner: ActiveAlertBanner) => void;
  dismissBanner: () => void;
}

let autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

export const useAlertBannerStore = create<AlertBannerState>((set) => ({
  banner: null,
  showBanner: (banner: ActiveAlertBanner) => {
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
    }
    set({ banner });
    autoDismissTimer = setTimeout(() => {
      set((state) => (state.banner?.id === banner.id ? { banner: null } : state));
    }, banner.category === 'claudy_outfit' ? 8500 : 6000);
  },
  dismissBanner: () => {
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
    set({ banner: null });
  },
}));
