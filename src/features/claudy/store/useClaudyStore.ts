import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/shared/api/supabaseClient';
import {
  ClaudyConfig,
  DEFAULT_CLAUDY_CONFIG,
  sanitizeClaudyConfig,
} from '../types';

const CLAUDY_LOCAL_STORAGE_KEY = '@clima_comunidad_claudy_config_v1';
const GREETING_SESSION_KEY = 'clima_claudy_greeting_seen_v1';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fallback en memoria para entornos nativos donde no existe sessionStorage
let memoryGreetingSeen = false;

function hasSeenGreetingInSession(): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      return window.sessionStorage.getItem(GREETING_SESSION_KEY) === '1';
    } catch {
      return memoryGreetingSeen;
    }
  }
  return memoryGreetingSeen;
}

function markGreetingSeenInSession(): void {
  memoryGreetingSeen = true;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(GREETING_SESSION_KEY, '1');
    } catch {
      // Ignorar si sessionStorage está restringido
    }
  }
}

async function persistClaudyLocal(config: ClaudyConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(CLAUDY_LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignorar error de escritura local
  }
}

async function readClaudyLocal(): Promise<ClaudyConfig> {
  try {
    const raw = await AsyncStorage.getItem(CLAUDY_LOCAL_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CLAUDY_CONFIG };
    return sanitizeClaudyConfig(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_CLAUDY_CONFIG };
  }
}

interface ClaudyState {
  config: ClaudyConfig;
  hasHydrated: boolean;
  isSaving: boolean;
  isGreetingVisible: boolean;
  isCustomizerVisible: boolean;
  isWidgetGalleryVisible: boolean;

  loadClaudyConfig: () => Promise<void>;
  hydrateFromRemoteConfig: (remoteRaw: unknown) => Promise<void>;
  saveClaudyConfig: (
    nextConfig: Partial<ClaudyConfig>,
    options?: { userId?: string; isAuthenticated?: boolean }
  ) => Promise<void>;
  resetClaudyConfig: (options?: { userId?: string; isAuthenticated?: boolean }) => Promise<void>;

  initGreetingForSession: () => void;
  dismissGreeting: () => void;
  reopenGreeting: () => void;

  openCustomizer: () => void;
  closeCustomizer: () => void;

  openWidgetGallery: () => void;
  closeWidgetGallery: () => void;
}

export const useClaudyStore = create<ClaudyState>((set, get) => ({
  config: { ...DEFAULT_CLAUDY_CONFIG },
  hasHydrated: false,
  isSaving: false,
  isGreetingVisible: false,
  isCustomizerVisible: false,
  isWidgetGalleryVisible: false,

  loadClaudyConfig: async () => {
    const localConfig = await readClaudyLocal();
    set({ config: localConfig, hasHydrated: true });
  },

  hydrateFromRemoteConfig: async (remoteRaw: unknown) => {
    if (!remoteRaw || typeof remoteRaw !== 'object') {
      const localConfig = await readClaudyLocal();
      set({ config: localConfig, hasHydrated: true });
      return;
    }
    const sanitized = sanitizeClaudyConfig(remoteRaw);
    set({ config: sanitized, hasHydrated: true });
    await persistClaudyLocal(sanitized);
  },

  saveClaudyConfig: async (nextPartial, options) => {
    const current = get().config;
    const sanitized = sanitizeClaudyConfig({ ...current, ...nextPartial });

    set({ config: sanitized, isSaving: true });
    await persistClaudyLocal(sanitized);

    try {
      const isAuthenticated = Boolean(options?.isAuthenticated);
      const userId = options?.userId;

      if (isAuthenticated && userId && UUID_REGEX.test(userId)) {
        const { data } = await supabase.auth.getSession();
        const sessionUid = data.session?.user?.id;

        if (sessionUid && sessionUid === userId) {
          const { error } = await supabase
            .from('profiles')
            .update({
              claudy_config: sanitized,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionUid);

          if (error) {
            console.warn(
              '[useClaudyStore] No se pudo sincronizar claudy_config en Supabase (¿migración 05 pendiente?):',
              error.message
            );
          }
        }
      }
    } catch (err) {
      console.warn('[useClaudyStore] Error sincronizando claudy_config:', err);
    } finally {
      set({ isSaving: false });
    }
  },

  resetClaudyConfig: async (options) => {
    await get().saveClaudyConfig(DEFAULT_CLAUDY_CONFIG, options);
  },

  initGreetingForSession: () => {
    if (!hasSeenGreetingInSession()) {
      set({ isGreetingVisible: true });
    }
  },

  dismissGreeting: () => {
    markGreetingSeenInSession();
    set({ isGreetingVisible: false });
  },

  reopenGreeting: () => {
    set({ isGreetingVisible: true });
  },

  openCustomizer: () => set({ isCustomizerVisible: true }),
  closeCustomizer: () => set({ isCustomizerVisible: false }),

  openWidgetGallery: () => set({ isWidgetGalleryVisible: true }),
  closeWidgetGallery: () => set({ isWidgetGalleryVisible: false }),
}));
