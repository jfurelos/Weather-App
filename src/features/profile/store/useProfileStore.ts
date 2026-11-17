import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/shared/api/supabaseClient';
import { useComarcasForumStore } from '@/features/community/store/useComarcasForumStore';
import {
  AlertToneId,
  AVATAR_COLORS,
  FixedLocation,
  HeatThreshold,
  RainThreshold,
  WindThreshold,
} from '../data/locationsData';

const PROFILE_STORAGE_KEY = '@clima_comunidad_profile_v1';

export interface UserProfileData {
  id: string;
  fullName: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
  avatarColor: string;
  province: string;
  isAuthenticated: boolean;
}

export interface AlertsPreferences {
  rain: {
    enabled: boolean;
    threshold: RainThreshold;
    toneId: AlertToneId;
  };
  wind: {
    enabled: boolean;
    thresholdKmh: WindThreshold;
    toneId: AlertToneId;
  };
  heat: {
    enabled: boolean;
    thresholdC: HeatThreshold;
    toneId: AlertToneId;
  };
}

interface PersistedProfilePayload {
  profile: UserProfileData;
  fixedLocation: FixedLocation;
  alerts: AlertsPreferences;
}

export type AlertCategory = 'rain' | 'wind' | 'heat';

interface ProfileState {
  profile: UserProfileData;
  fixedLocation: FixedLocation;
  alerts: AlertsPreferences;
  isLoadingAuth: boolean;
  authError: string | null;
  hasHydrated: boolean;

  loadProfileState: () => Promise<void>;
  updateProfile: (updates: {
    fullName?: string;
    province: string;
    avatarColor: string;
    avatarUrl: string | null;
  }) => Promise<void>;
  updateFixedLocation: (location: FixedLocation) => Promise<void>;
  toggleAlert: (category: AlertCategory, enabled: boolean) => Promise<void>;
  setRainThreshold: (threshold: RainThreshold) => Promise<void>;
  setWindThreshold: (thresholdKmh: WindThreshold) => Promise<void>;
  setHeatThreshold: (thresholdC: HeatThreshold) => Promise<void>;
  setAlertTone: (category: AlertCategory, toneId: AlertToneId) => Promise<void>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    province: string;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const DEFAULT_PROFILE: UserProfileData = {
  id: 'usr-current',
  fullName: 'Usuario Invitado',
  username: 'invitado',
  email: null,
  avatarUrl: null,
  avatarColor: AVATAR_COLORS[0],
  province: 'Madrid',
  isAuthenticated: false,
};

const DEFAULT_LOCATION: FixedLocation = {
  name: 'Madrid',
  province: 'Madrid',
  latitude: 40.4168,
  longitude: -3.7038,
};

const DEFAULT_ALERTS: AlertsPreferences = {
  rain: {
    enabled: true,
    threshold: 'yellow',
    toneId: 'rain_drops',
  },
  wind: {
    enabled: true,
    thresholdKmh: 50,
    toneId: 'wind_gust',
  },
  heat: {
    enabled: false,
    thresholdC: 36,
    toneId: 'heat_pulse',
  },
};

async function persistLocalState(payload: PersistedProfilePayload): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignorar error de almacenamiento local
  }
}

function syncProfileToForum(profile: UserProfileData): void {
  useComarcasForumStore.getState().syncCurrentUser({
    id: profile.id,
    name: profile.isAuthenticated ? profile.fullName : profile.fullName === 'Usuario Invitado' ? 'Tú' : profile.fullName,
    province: profile.province,
  });
}

async function syncSingleLocationToSupabase(
  profile: UserProfileData,
  location: FixedLocation,
  alerts: AlertsPreferences
): Promise<void> {
  if (!profile.isAuthenticated) return;
  try {
    // Mantener estrictamente 1 ubicación fija por usuario en Supabase
    await supabase.from('user_locations').delete().eq('user_id', profile.id);
    await supabase.from('user_locations').insert([
      {
        user_id: profile.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        notify_rain: alerts.rain.enabled,
        notify_wind: alerts.wind.enabled,
        notify_heat: alerts.heat.enabled,
      },
    ]);
  } catch {
    // Tolerar offline o tabla sin sesión remota
  }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  fixedLocation: DEFAULT_LOCATION,
  alerts: DEFAULT_ALERTS,
  isLoadingAuth: false,
  authError: null,
  hasHydrated: false,

  loadProfileState: async () => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      let nextProfile = DEFAULT_PROFILE;
      let nextLocation = DEFAULT_LOCATION;
      let nextAlerts = DEFAULT_ALERTS;

      if (stored) {
        const parsed: Partial<PersistedProfilePayload> = JSON.parse(stored);
        if (parsed.profile) nextProfile = { ...DEFAULT_PROFILE, ...parsed.profile };
        if (parsed.fixedLocation) nextLocation = { ...DEFAULT_LOCATION, ...parsed.fixedLocation };
        if (parsed.alerts) {
          nextAlerts = {
            rain: { ...DEFAULT_ALERTS.rain, ...parsed.alerts.rain },
            wind: { ...DEFAULT_ALERTS.wind, ...parsed.alerts.wind },
            heat: { ...DEFAULT_ALERTS.heat, ...parsed.alerts.heat },
          };
        }
      }

      // Verificar si hay sesión activa de Supabase
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (user) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url, province')
            .eq('id', user.id)
            .maybeSingle();

          nextProfile = {
            ...nextProfile,
            id: user.id,
            email: user.email ?? nextProfile.email,
            fullName: dbProfile?.full_name || user.user_metadata?.full_name || nextProfile.fullName,
            username: dbProfile?.username || user.user_metadata?.username || nextProfile.username,
            avatarUrl: dbProfile?.avatar_url ?? nextProfile.avatarUrl,
            province: dbProfile?.province || user.user_metadata?.province || nextProfile.province,
            isAuthenticated: true,
          };
        }
      } catch {
        // Continuar con perfil local si Supabase no responde
      }

      set({
        profile: nextProfile,
        fixedLocation: nextLocation,
        alerts: nextAlerts,
        hasHydrated: true,
      });

      syncProfileToForum(nextProfile);
    } catch {
      set({ hasHydrated: true });
    }
  },

  updateProfile: async ({ fullName, province, avatarColor, avatarUrl }) => {
    const { profile, fixedLocation, alerts } = get();
    const cleanedUrl = avatarUrl && avatarUrl.trim().length > 0 ? avatarUrl.trim() : null;

    const updatedProfile: UserProfileData = {
      ...profile,
      // El nombre completo es inmutable para cuentas registradas; en invitado puede editarse
      fullName:
        !profile.isAuthenticated && fullName !== undefined && fullName.trim().length > 0
          ? fullName.trim()
          : profile.fullName,
      province,
      avatarColor,
      avatarUrl: cleanedUrl,
    };

    set({ profile: updatedProfile });
    syncProfileToForum(updatedProfile);
    await persistLocalState({ profile: updatedProfile, fixedLocation, alerts });

    if (updatedProfile.isAuthenticated) {
      try {
        await supabase
          .from('profiles')
          .update({
            avatar_url: updatedProfile.avatarUrl,
            province: updatedProfile.province,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedProfile.id);
      } catch {
        // Tolerar fallo de red
      }
    }
  },

  updateFixedLocation: async (location: FixedLocation) => {
    const { profile, alerts } = get();
    set({ fixedLocation: location });
    await persistLocalState({ profile, fixedLocation: location, alerts });
    await syncSingleLocationToSupabase(profile, location, alerts);
  },

  toggleAlert: async (category: AlertCategory, enabled: boolean) => {
    const { profile, fixedLocation, alerts } = get();
    const nextAlerts: AlertsPreferences = {
      ...alerts,
      [category]: {
        ...alerts[category],
        enabled,
      },
    };
    set({ alerts: nextAlerts });
    await persistLocalState({ profile, fixedLocation, alerts: nextAlerts });
    await syncSingleLocationToSupabase(profile, fixedLocation, nextAlerts);
  },

  setRainThreshold: async (threshold: RainThreshold) => {
    const { profile, fixedLocation, alerts } = get();
    const nextAlerts: AlertsPreferences = {
      ...alerts,
      rain: { ...alerts.rain, threshold },
    };
    set({ alerts: nextAlerts });
    await persistLocalState({ profile, fixedLocation, alerts: nextAlerts });
  },

  setWindThreshold: async (thresholdKmh: WindThreshold) => {
    const { profile, fixedLocation, alerts } = get();
    const nextAlerts: AlertsPreferences = {
      ...alerts,
      wind: { ...alerts.wind, thresholdKmh },
    };
    set({ alerts: nextAlerts });
    await persistLocalState({ profile, fixedLocation, alerts: nextAlerts });
  },

  setHeatThreshold: async (thresholdC: HeatThreshold) => {
    const { profile, fixedLocation, alerts } = get();
    const nextAlerts: AlertsPreferences = {
      ...alerts,
      heat: { ...alerts.heat, thresholdC },
    };
    set({ alerts: nextAlerts });
    await persistLocalState({ profile, fixedLocation, alerts: nextAlerts });
  },

  setAlertTone: async (category: AlertCategory, toneId: AlertToneId) => {
    const { profile, fixedLocation, alerts } = get();
    const nextAlerts: AlertsPreferences = {
      ...alerts,
      [category]: {
        ...alerts[category],
        toneId,
      },
    };
    set({ alerts: nextAlerts });
    await persistLocalState({ profile, fixedLocation, alerts: nextAlerts });
  },

  signIn: async (email: string, password: string) => {
    set({ isLoadingAuth: true, authError: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        set({
          isLoadingAuth: false,
          authError: error?.message || 'Credenciales incorrectas. Revisa tu email y contraseña.',
        });
        return false;
      }

      const { profile, fixedLocation, alerts } = get();
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, province')
        .eq('id', data.user.id)
        .maybeSingle();

      const nextProfile: UserProfileData = {
        ...profile,
        id: data.user.id,
        email: data.user.email ?? email.trim(),
        fullName: dbProfile?.full_name || data.user.user_metadata?.full_name || 'Usuario',
        username: dbProfile?.username || data.user.user_metadata?.username || email.split('@')[0],
        avatarUrl: dbProfile?.avatar_url ?? null,
        province: dbProfile?.province || data.user.user_metadata?.province || profile.province,
        isAuthenticated: true,
      };

      set({ profile: nextProfile, isLoadingAuth: false, authError: null });
      syncProfileToForum(nextProfile);
      await persistLocalState({ profile: nextProfile, fixedLocation, alerts });
      return true;
    } catch {
      set({
        isLoadingAuth: false,
        authError: 'No se pudo conectar con el servicio de autenticación.',
      });
      return false;
    }
  },

  signUp: async ({ email, password, fullName, username, province }) => {
    set({ isLoadingAuth: true, authError: null });
    try {
      const cleanEmail = email.trim();
      const cleanName = fullName.trim();
      const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_');

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            username: cleanUsername,
            province,
          },
        },
      });

      if (error || !data.user) {
        set({
          isLoadingAuth: false,
          authError: error?.message || 'No se pudo crear la cuenta. Inténtalo de nuevo.',
        });
        return false;
      }

      // Intentar crear registro en tabla profiles si hay sesión inmediata
      if (data.session) {
        try {
          await supabase.from('profiles').upsert([
            {
              id: data.user.id,
              username: cleanUsername,
              full_name: cleanName,
              province,
            },
          ]);
        } catch {
          // Tolerar si requiere confirmación por correo primero
        }
      }

      const { profile, fixedLocation, alerts } = get();
      const nextProfile: UserProfileData = {
        ...profile,
        id: data.user.id,
        email: cleanEmail,
        fullName: cleanName,
        username: cleanUsername,
        province,
        isAuthenticated: true,
      };

      set({ profile: nextProfile, isLoadingAuth: false, authError: null });
      syncProfileToForum(nextProfile);
      await persistLocalState({ profile: nextProfile, fixedLocation, alerts });
      await syncSingleLocationToSupabase(nextProfile, fixedLocation, alerts);
      return true;
    } catch {
      set({
        isLoadingAuth: false,
        authError: 'No se pudo completar el registro en este momento.',
      });
      return false;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Continuar con limpieza local
    }

    const { fixedLocation, alerts } = get();
    const guestProfile: UserProfileData = {
      ...DEFAULT_PROFILE,
      province: fixedLocation.province,
    };

    set({ profile: guestProfile, authError: null });
    syncProfileToForum(guestProfile);
    await persistLocalState({ profile: guestProfile, fixedLocation, alerts });
  },

  clearAuthError: () => set({ authError: null }),
}));
