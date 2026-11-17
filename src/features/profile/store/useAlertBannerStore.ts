import { create } from 'zustand';
import { AlertCategory } from './useProfileStore';

export interface ActiveAlertBanner {
  id: string;
  status: 'triggered' | 'filtered';
  category: AlertCategory;
  title: string;
  locationName: string;
  body: string;
  toneLabel: string;
  soundPlayed: boolean;
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
    }, 6000);
  },
  dismissBanner: () => {
    if (autoDismissTimer) {
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
    set({ banner: null });
  },
}));
