import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/shared/api/supabaseClient';
import { useComarcasForumStore } from '@/features/community/store/useComarcasForumStore';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import {
  ALERT_TONES,
  AlertToneId,
  AVATAR_COLORS,
  FixedLocation,
  getToneLabel,
  HeatThreshold,
  RainThreshold,
  WindThreshold,
} from '../data/locationsData';
import type { MockAlertScenario, MockStormUser } from '@/shared/data/mockStormUsers';
import { playAlertTonePreview } from '../services/alertSoundService';
import { useAlertBannerStore } from './useAlertBannerStore';

const PROFILE_STORAGE_KEY = '@clima_comunidad_profile_v1';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  hasEnteredApp: boolean;
  isLoadingAuth: boolean;
  authError: string | null;
  hasHydrated: boolean;

  loadProfileState: () => Promise<void>;
  continueAsGuest: () => void;
  enterAsMockStormUser: (mockUser: MockStormUser) => Promise<void>;
  triggerMockAlert: (scenario: MockAlertScenario) => Promise<void>;
  returnToAuthGate: () => void;
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

function isValidToneId(value: unknown, fallback: AlertToneId): AlertToneId {
  if (typeof value === 'string' && ALERT_TONES.some((t) => t.id === value)) {
    return value as AlertToneId;
  }
  return fallback;
}

function isValidRainThreshold(value: unknown, fallback: RainThreshold): RainThreshold {
  if (value === 'yellow' || value === 'orange' || value === 'red') return value;
  return fallback;
}

function isValidWindThreshold(value: unknown, fallback: WindThreshold): WindThreshold {
  if (value === 50 || value === 70 || value === 90) return value;
  return fallback;
}

function isValidHeatThreshold(value: unknown, fallback: HeatThreshold): HeatThreshold {
  if (value === 34 || value === 36 || value === 40) return value;
  return fallback;
}

async function getActiveSessionUserId(expectedId?: string): Promise<string | null> {
  if (expectedId && !UUID_REGEX.test(expectedId)) {
    return null;
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return null;
    const sessionUid = data.session.user.id;
    if (expectedId && sessionUid !== expectedId) return null;
    return sessionUid;
  } catch {
    return null;
  }
}

async function persistLocalState(payload: PersistedProfilePayload): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignorar error de almacenamiento local
  }
}

function syncProfileToForum(profile: UserProfileData, syncActiveProvince = false): void {
  const forumStore = useComarcasForumStore.getState();
  forumStore.syncCurrentUser({
    id: profile.id,
    name: profile.isAuthenticated
      ? profile.fullName
      : profile.fullName === 'Usuario Invitado'
        ? 'Tú'
        : profile.fullName,
    province: profile.province,
  });
  if (syncActiveProvince && profile.province) {
    forumStore.setSelectedProvince(profile.province);
  }
}

function syncLocationToHome(location: FixedLocation): void {
  const homeStore = useHomeStore.getState();
  if (
    homeStore.selectedCity.name !== location.name ||
    homeStore.selectedCity.province !== location.province
  ) {
    homeStore.setSelectedCity({
      name: location.name,
      province: location.province,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }
}

async function fetchLocationAndAlertsFromSupabase(
  userId: string,
  fallbackLocation: FixedLocation,
  fallbackAlerts: AlertsPreferences
): Promise<{ location: FixedLocation; alerts: AlertsPreferences }> {
  try {
    const { data, error } = await supabase
      .from('user_locations')
      .select(
        'name, province, latitude, longitude, notify_rain, notify_wind, notify_heat, sound_rain, sound_wind, sound_heat, rain_threshold, wind_threshold_kmh, heat_threshold_c'
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[useProfileStore] Error leyendo user_locations:', error.message);
      return { location: fallbackLocation, alerts: fallbackAlerts };
    }

    if (!data) {
      return { location: fallbackLocation, alerts: fallbackAlerts };
    }

    return {
      location: {
        name: data.name || fallbackLocation.name,
        province: data.province || fallbackLocation.province,
        latitude: typeof data.latitude === 'number' ? data.latitude : fallbackLocation.latitude,
        longitude: typeof data.longitude === 'number' ? data.longitude : fallbackLocation.longitude,
      },
      alerts: {
        rain: {
          enabled: typeof data.notify_rain === 'boolean' ? data.notify_rain : fallbackAlerts.rain.enabled,
          threshold: isValidRainThreshold(data.rain_threshold, fallbackAlerts.rain.threshold),
          toneId: isValidToneId(data.sound_rain, fallbackAlerts.rain.toneId),
        },
        wind: {
          enabled: typeof data.notify_wind === 'boolean' ? data.notify_wind : fallbackAlerts.wind.enabled,
          thresholdKmh: isValidWindThreshold(data.wind_threshold_kmh, fallbackAlerts.wind.thresholdKmh),
          toneId: isValidToneId(data.sound_wind, fallbackAlerts.wind.toneId),
        },
        heat: {
          enabled: typeof data.notify_heat === 'boolean' ? data.notify_heat : fallbackAlerts.heat.enabled,
          thresholdC: isValidHeatThreshold(data.heat_threshold_c, fallbackAlerts.heat.thresholdC),
          toneId: isValidToneId(data.sound_heat, fallbackAlerts.heat.toneId),
        },
      },
    };
  } catch (err) {
    console.warn('[useProfileStore] Excepción leyendo user_locations:', err);
    return { location: fallbackLocation, alerts: fallbackAlerts };
  }
}

async function syncSingleLocationToSupabase(
  profile: UserProfileData,
  location: FixedLocation,
  alerts: AlertsPreferences
): Promise<void> {
  if (!profile.isAuthenticated) return;
  const sessionUid = await getActiveSessionUserId(profile.id);
  if (!sessionUid) return;

  try {
    // UPSERT atómico respaldado por UNIQUE (user_id) en BBDD
    const { error } = await supabase.from('user_locations').upsert(
      {
        user_id: sessionUid,
        name: location.name,
        province: location.province,
        latitude: location.latitude,
        longitude: location.longitude,
        notify_rain: alerts.rain.enabled,
        notify_wind: alerts.wind.enabled,
        notify_heat: alerts.heat.enabled,
        sound_rain: alerts.rain.toneId,
        sound_wind: alerts.wind.toneId,
        sound_heat: alerts.heat.toneId,
        rain_threshold: alerts.rain.threshold,
        wind_threshold_kmh: alerts.wind.thresholdKmh,
        heat_threshold_c: alerts.heat.thresholdC,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      console.error('[useProfileStore] Error guardando user_locations en Supabase:', error.message);
    }
  } catch (err) {
    console.error('[useProfileStore] Excepción guardando user_locations:', err);
  }
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  fixedLocation: DEFAULT_LOCATION,
  alerts: DEFAULT_ALERTS,
  hasEnteredApp: false,
  isLoadingAuth: false,
  authError: null,
  hasHydrated: false,

  continueAsGuest: () => {
    const { profile } = get();
    const guestProfile: UserProfileData = {
      ...profile,
      isAuthenticated: false,
    };
    set({ profile: guestProfile, hasEnteredApp: true, authError: null });
    syncProfileToForum(guestProfile);
  },

  enterAsMockStormUser: async (mockUser: MockStormUser) => {
    const { alerts } = get();
    const mockProfile: UserProfileData = {
      id: mockUser.id,
      fullName: mockUser.fullName,
      username: mockUser.username,
      email: mockUser.email,
      avatarUrl: null,
      avatarColor: mockUser.avatarColor,
      province: mockUser.province,
      isAuthenticated: true,
    };

    set({
      profile: mockProfile,
      fixedLocation: mockUser.location,
      hasEnteredApp: true,
      authError: null,
    });

    syncProfileToForum(mockProfile, true);
    useHomeStore.getState().applyMockStormScenario(mockUser);
    await persistLocalState({
      profile: mockProfile,
      fixedLocation: mockUser.location,
      alerts,
    });
  },

  triggerMockAlert: async (scenario: MockAlertScenario) => {
    const { alerts, fixedLocation } = get();
    const rainRank: Record<RainThreshold, number> = { yellow: 1, orange: 2, red: 3 };
    const rainLabels: Record<RainThreshold, string> = {
      yellow: 'Amarillo (≥ 15 mm/h)',
      orange: 'Naranja (≥ 30 mm/h)',
      red: 'Rojo (≥ 60 mm/h)',
    };

    let shouldTrigger = false;
    let filterReason = '';
    let toneId: AlertToneId = 'classic_chime';

    if (scenario.category === 'rain') {
      toneId = alerts.rain.toneId;
      if (!alerts.rain.enabled) {
        filterReason = 'Alerta de lluvia torrencial desactivada en tus ajustes.';
      } else {
        const scenarioRank = rainRank[scenario.rainLevel ?? 'yellow'];
        const userRank = rainRank[alerts.rain.threshold];
        if (scenarioRank >= userRank) {
          shouldTrigger = true;
        } else {
          filterReason = `Tu umbral de lluvia es ${rainLabels[alerts.rain.threshold]} y el evento simulado es inferior (${scenario.rainMmH ?? 20} mm/h).`;
        }
      }
    } else if (scenario.category === 'wind') {
      toneId = alerts.wind.toneId;
      if (!alerts.wind.enabled) {
        filterReason = 'Alerta de viento y temporales desactivada en tus ajustes.';
      } else if ((scenario.windKmh ?? 0) >= alerts.wind.thresholdKmh) {
        shouldTrigger = true;
      } else {
        filterReason = `Tu umbral de viento es > ${alerts.wind.thresholdKmh} km/h (simulado: ${scenario.windKmh} km/h).`;
      }
    } else if (scenario.category === 'heat') {
      toneId = alerts.heat.toneId;
      if (!alerts.heat.enabled) {
        filterReason = 'Alerta de calor extremo desactivada en tus ajustes.';
      } else if ((scenario.heatC ?? 0) >= alerts.heat.thresholdC) {
        shouldTrigger = true;
      } else {
        filterReason = `Tu umbral de calor es > ${alerts.heat.thresholdC}°C (simulado: ${scenario.heatC}°C).`;
      }
    }

    const toneLabel = getToneLabel(toneId);
    let soundPlayed = false;

    if (shouldTrigger) {
      soundPlayed = await playAlertTonePreview(toneId);
    }

    useAlertBannerStore.getState().showBanner({
      id: `alert-${Date.now()}`,
      status: shouldTrigger ? 'triggered' : 'filtered',
      category: scenario.category,
      title: scenario.title,
      locationName: fixedLocation.name,
      body: shouldTrigger ? scenario.description : filterReason,
      toneLabel,
      soundPlayed,
    });
  },

  returnToAuthGate: () => {
    set({ hasEnteredApp: false, authError: null });
  },

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
        const { data, error: sessionErr } = await supabase.auth.getSession();
        const user = !sessionErr ? data.session?.user : null;
        if (user) {
          const { data: dbProfile, error: profileErr } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url, province')
            .eq('id', user.id)
            .maybeSingle();

          if (profileErr) {
            console.warn('[useProfileStore] Error leyendo profiles:', profileErr.message);
          }

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

          const remoteData = await fetchLocationAndAlertsFromSupabase(
            user.id,
            nextLocation,
            nextAlerts
          );
          nextLocation = remoteData.location;
          nextAlerts = remoteData.alerts;
        } else {
          nextProfile = {
            ...nextProfile,
            isAuthenticated: false,
          };
        }
      } catch {
        nextProfile = {
          ...nextProfile,
          isAuthenticated: false,
        };
      }

      set({
        profile: nextProfile,
        fixedLocation: nextLocation,
        alerts: nextAlerts,
        hasEnteredApp: nextProfile.isAuthenticated,
        hasHydrated: true,
      });

      syncProfileToForum(nextProfile, true);
      syncLocationToHome(nextLocation);
    } catch {
      set({ hasHydrated: true });
    }
  },

  updateProfile: async ({ fullName, province, avatarColor, avatarUrl }) => {
    const { profile, fixedLocation, alerts } = get();
    const trimmedUrl = avatarUrl && avatarUrl.trim().length > 0 ? avatarUrl.trim() : null;
    const isSafeUrl =
      trimmedUrl !== null &&
      trimmedUrl.length <= 145_000 &&
      (trimmedUrl.startsWith('data:image/') ||
        trimmedUrl.startsWith('https://') ||
        trimmedUrl.startsWith('http://'));
    const cleanedUrl = isSafeUrl ? trimmedUrl : null;

    const updatedProfile: UserProfileData = {
      ...profile,
      fullName:
        !profile.isAuthenticated && fullName !== undefined && fullName.trim().length > 0
          ? fullName.trim().slice(0, 80)
          : profile.fullName,
      province: province.trim().slice(0, 60) || profile.province,
      avatarColor,
      avatarUrl: cleanedUrl,
    };

    set({ profile: updatedProfile });
    syncProfileToForum(updatedProfile, true);
    await persistLocalState({ profile: updatedProfile, fixedLocation, alerts });

    if (updatedProfile.isAuthenticated) {
      const sessionUid = await getActiveSessionUserId(updatedProfile.id);
      if (sessionUid) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              avatar_url: updatedProfile.avatarUrl,
              province: updatedProfile.province,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionUid);

          if (error) {
            console.error('[useProfileStore] Error actualizando profiles:', error.message);
          }
        } catch (err) {
          console.error('[useProfileStore] Excepción actualizando profiles:', err);
        }
      }
    }
  },

  updateFixedLocation: async (location: FixedLocation) => {
    const { profile, alerts } = get();
    set({ fixedLocation: location });
    syncLocationToHome(location);
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
    await syncSingleLocationToSupabase(profile, fixedLocation, nextAlerts);
  },

  setWindThreshold: async (thresholdKmh: WindThreshold) => {
    const { profile, fixedLocation, alerts } = get();
    const nextAlerts: AlertsPreferences = {
      ...alerts,
      wind: { ...alerts.wind, thresholdKmh },
    };
    set({ alerts: nextAlerts });
    await persistLocalState({ profile, fixedLocation, alerts: nextAlerts });
    await syncSingleLocationToSupabase(profile, fixedLocation, nextAlerts);
  },

  setHeatThreshold: async (thresholdC: HeatThreshold) => {
    const { profile, fixedLocation, alerts } = get();
    const nextAlerts: AlertsPreferences = {
      ...alerts,
      heat: { ...alerts.heat, thresholdC },
    };
    set({ alerts: nextAlerts });
    await persistLocalState({ profile, fixedLocation, alerts: nextAlerts });
    await syncSingleLocationToSupabase(profile, fixedLocation, nextAlerts);
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
    await syncSingleLocationToSupabase(profile, fixedLocation, nextAlerts);
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
      const { data: dbProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, province')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileErr) {
        console.warn('[useProfileStore] Error leyendo perfil al iniciar sesión:', profileErr.message);
      }

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

      const remoteData = await fetchLocationAndAlertsFromSupabase(
        data.user.id,
        fixedLocation,
        alerts
      );

      set({
        profile: nextProfile,
        fixedLocation: remoteData.location,
        alerts: remoteData.alerts,
        hasEnteredApp: true,
        isLoadingAuth: false,
        authError: null,
      });

      syncProfileToForum(nextProfile, true);
      syncLocationToHome(remoteData.location);
      await persistLocalState({
        profile: nextProfile,
        fixedLocation: remoteData.location,
        alerts: remoteData.alerts,
      });
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
      const cleanEmail = email.trim().slice(0, 120);
      const cleanName = fullName.trim().slice(0, 80);
      const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '_').slice(0, 40);

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

      // El trigger DB `on_auth_user_created` crea la fila en `profiles` y `user_locations`.
      // Si hay sesión activa inmediata, reforzamos además con upsert explícito verificando errores.
      if (data.session) {
        const { error: upsertErr } = await supabase.from('profiles').upsert(
          {
            id: data.user.id,
            username: cleanUsername,
            full_name: cleanName,
            province,
          },
          { onConflict: 'id' }
        );
        if (upsertErr) {
          console.error('[useProfileStore] Error en upsert de profiles tras signUp:', upsertErr.message);
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

      const nextLocation: FixedLocation = {
        ...fixedLocation,
        name: province,
        province,
      };

      set({
        profile: nextProfile,
        fixedLocation: nextLocation,
        hasEnteredApp: true,
        isLoadingAuth: false,
        authError: null,
      });

      syncProfileToForum(nextProfile, true);
      await persistLocalState({ profile: nextProfile, fixedLocation: nextLocation, alerts });
      await syncSingleLocationToSupabase(nextProfile, nextLocation, alerts);
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

    set({ profile: guestProfile, hasEnteredApp: false, authError: null });
    syncProfileToForum(guestProfile);
    useHomeStore.getState().clearMockStormScenario();
    await persistLocalState({ profile: guestProfile, fixedLocation, alerts });
  },

  clearAuthError: () => set({ authError: null }),
}));
