import { Platform } from 'react-native';
import {
  ClaudyReminderNotificationPayload,
  NotificationPreferences,
} from '@/features/profile/data/notificationPreferences';
import { useAlertBannerStore } from '@/features/profile/store/useAlertBannerStore';
import { navigateToHomeOutfitRecommender } from '@/app/navigation/navigationRef';

export type WebNotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

/**
 * Interfaz compatible con `expo-notifications` para builds nativos (iOS/Android).
 * Se mantiene desacoplada para no incluir módulos nativos en `npx expo export -p web`.
 */
export interface ExpoNotificationsLike {
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  scheduleNotificationAsync: (request: {
    identifier?: string;
    content: {
      title: string;
      body: string;
      sound?: boolean | string;
      data?: Record<string, unknown>;
    };
    trigger: {
      hour: number;
      minute: number;
      repeats: boolean;
    };
  }) => Promise<string>;
  cancelScheduledNotificationAsync: (identifier: string) => Promise<void>;
  addNotificationResponseReceivedListener?: (
    listener: (response: {
      notification?: { request?: { content?: { data?: Record<string, unknown> } } };
    }) => void
  ) => { remove: () => void };
}

let nativeExpoNotifications: ExpoNotificationsLike | null = null;
const NATIVE_MORNING_ID = 'claudy-daily-morning';
const NATIVE_AFTERNOON_ID = 'claudy-daily-afternoon';
const WEB_LAST_FIRED_STORAGE_KEY = 'clima_claudy_reminder_last_fired_v1';

/**
 * Registra el módulo `expo-notifications` únicamente en builds nativos (Platform.OS !== 'web').
 */
export function registerNativeExpoNotifications(moduleRef: ExpoNotificationsLike | null): void {
  if (Platform.OS === 'web') return;
  nativeExpoNotifications = moduleRef;

  if (nativeExpoNotifications?.addNotificationResponseReceivedListener) {
    nativeExpoNotifications.addNotificationResponseReceivedListener((response) => {
      const target = response?.notification?.request?.content?.data?.target;
      if (target === 'home_outfit') {
        navigateToHomeOutfitRecommender();
      }
    });
  }
}

export function getWebNotificationPermission(): WebNotificationPermissionState {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return 'unsupported';
  }
  if (!('Notification' in window) || typeof window.Notification === 'undefined') {
    return 'unsupported';
  }
  const perm = window.Notification.permission;
  if (perm === 'granted' || perm === 'denied' || perm === 'default') {
    return perm;
  }
  return 'unsupported';
}

export async function requestWebNotificationPermission(): Promise<WebNotificationPermissionState> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return 'unsupported';
  }
  if (!('Notification' in window) || typeof window.Notification === 'undefined') {
    return 'unsupported';
  }

  if (window.Notification.permission === 'granted') {
    return 'granted';
  }
  if (window.Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const result = await window.Notification.requestPermission();
    if (result === 'granted' || result === 'denied' || result === 'default') {
      return result;
    }
    return 'unsupported';
  } catch {
    return getWebNotificationPermission();
  }
}

export interface TriggerReminderResult {
  deliveredViaBrowser: boolean;
  deliveredViaBanner: boolean;
  permission: WebNotificationPermissionState;
}

/**
 * Dispara el recordatorio de Claudy en WebApp (Web Notifications API si hay permiso
 * + banner push in-app interactivo que navega al recomendador de ropa en Home).
 */
export async function triggerClaudyReminderNotification(
  payload: ClaudyReminderNotificationPayload,
  options?: { requestPermissionIfDefault?: boolean }
): Promise<TriggerReminderResult> {
  let permission = getWebNotificationPermission();

  if (options?.requestPermissionIfDefault && permission === 'default') {
    permission = await requestWebNotificationPermission();
  }

  let deliveredViaBrowser = false;

  if (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    'Notification' in window &&
    permission === 'granted'
  ) {
    try {
      const browserNotif = new window.Notification(payload.title, {
        body: payload.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'claudy-daily-outfit',
      });

      browserNotif.onclick = () => {
        try {
          window.focus();
        } catch {
          // Ignorar restricciones de foco
        }
        browserNotif.close();
        navigateToHomeOutfitRecommender();
      };

      deliveredViaBrowser = true;
    } catch {
      deliveredViaBrowser = false;
    }
  }

  // Mostrar siempre el banner in-app estilo push para ofrecer feedback inmediato y toque directo a Home
  useAlertBannerStore.getState().showBanner({
    id: `claudy-reminder-${Date.now()}`,
    status: 'triggered',
    category: 'claudy_outfit',
    title: payload.title,
    locationName: payload.cityName,
    body: payload.body,
    toneLabel: deliveredViaBrowser ? 'Push navegador + in-app' : 'Banner in-app',
    soundPlayed: false,
    claudyWeatherMode: payload.weatherMode,
    ctaLabel: 'Ver mi outfit hoy',
    onPress: () => {
      navigateToHomeOutfitRecommender();
    },
  });

  return {
    deliveredViaBrowser,
    deliveredViaBanner: true,
    permission,
  };
}

function parseTimeHHMM(time: string): { hour: number; minute: number } {
  const [hStr, mStr] = time.split(':');
  const hour = Math.min(23, Math.max(0, parseInt(hStr || '7', 10) || 7));
  const minute = Math.min(59, Math.max(0, parseInt(mStr || '30', 10) || 0));
  return { hour, minute };
}

/**
 * Sincroniza la programación nativa con `expo-notifications` (exclusivamente fuera de web).
 */
export async function syncNativeDailyReminders(
  prefs: NotificationPreferences,
  samplePayload: ClaudyReminderNotificationPayload
): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!nativeExpoNotifications) return;

  try {
    await Promise.allSettled([
      nativeExpoNotifications.cancelScheduledNotificationAsync(NATIVE_MORNING_ID),
      nativeExpoNotifications.cancelScheduledNotificationAsync(NATIVE_AFTERNOON_ID),
    ]);

    if (!prefs.enabled) return;

    const currentPerm = await nativeExpoNotifications.getPermissionsAsync();
    let status = currentPerm.status;
    if (status !== 'granted') {
      const req = await nativeExpoNotifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') return;

    const morning = parseTimeHHMM(prefs.morningTime);
    await nativeExpoNotifications.scheduleNotificationAsync({
      identifier: NATIVE_MORNING_ID,
      content: {
        title: samplePayload.title,
        body: samplePayload.body,
        sound: true,
        data: { target: 'home_outfit', slot: 'morning' },
      },
      trigger: {
        hour: morning.hour,
        minute: morning.minute,
        repeats: true,
      },
    });

    if (prefs.afternoonEnabled) {
      const afternoon = parseTimeHHMM(prefs.afternoonTime);
      await nativeExpoNotifications.scheduleNotificationAsync({
        identifier: NATIVE_AFTERNOON_ID,
        content: {
          title: samplePayload.title,
          body: samplePayload.body,
          sound: true,
          data: { target: 'home_outfit', slot: 'afternoon' },
        },
        trigger: {
          hour: afternoon.hour,
          minute: afternoon.minute,
          repeats: true,
        },
      });
    }
  } catch (err) {
    console.warn('[dailyNotificationService] Error sincronizando expo-notifications:', err);
  }
}

/**
 * Comprueba en segundo plano (mientras la pestaña web/PWA está abierta) si coincide
 * la hora configurada del recordatorio para dispararlo una vez por franja y día.
 */
export function checkAndFireDueWebReminder(
  prefs: NotificationPreferences,
  buildPayload: () => ClaudyReminderNotificationPayload
): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !prefs.enabled) return;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const currentHHMM = `${hh}:${mm}`;
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  let slot: 'morning' | 'afternoon' | null = null;
  if (currentHHMM === prefs.morningTime) {
    slot = 'morning';
  } else if (prefs.afternoonEnabled && currentHHMM === prefs.afternoonTime) {
    slot = 'afternoon';
  }

  if (!slot) return;

  const dedupValue = `${dateKey}:${slot}:${currentHHMM}`;
  try {
    if (window.localStorage.getItem(WEB_LAST_FIRED_STORAGE_KEY) === dedupValue) {
      return;
    }
    window.localStorage.setItem(WEB_LAST_FIRED_STORAGE_KEY, dedupValue);
  } catch {
    // Continuar si localStorage no está disponible
  }

  const payload = buildPayload();
  void triggerClaudyReminderNotification(payload, { requestPermissionIfDefault: false });
}
