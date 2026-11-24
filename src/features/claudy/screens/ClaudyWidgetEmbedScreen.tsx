import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RefreshCw, ExternalLink, Moon, Sun } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { OFFICIAL_PALETTE, ThemeMode } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { fetchWeatherData } from '@/features/home/services/weatherApi';
import { evaluateDailyAdvice } from '@/features/home/services/rulesEngine';
import { DEFAULT_OUTFIT_PREFERENCES } from '@/features/profile/data/outfitPreferences';
import {
  buildWidgetPayload,
  ClaudyWidgetPayload,
  createFallbackWidgetPayload,
  persistWidgetPayload,
  readPersistedWidgetPayload,
  subscribeToWidgetPayloadChanges,
  WidgetSizeFormat,
} from '@/shared/services/widgetDataSync';
import {
  ClaudyLockscreenWidget,
  ClaudyMediumWidget,
  ClaudySmallWidget,
} from '../components/ClaudyWidgetPreviews';

function readInitialQueryParams(): {
  size: WidgetSizeFormat;
  theme: ThemeMode;
  embedOnly: boolean;
} {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const rawSize = params.get('size');
    const rawTheme = params.get('theme');
    const rawEmbed = params.get('embed');

    const size: WidgetSizeFormat =
      rawSize === 'small' || rawSize === 'medium' || rawSize === 'lockscreen'
        ? rawSize
        : 'medium';
    const theme: ThemeMode = rawTheme === 'light' ? 'light' : 'dark';
    const embedOnly = rawEmbed === '1' || rawEmbed === 'true';

    return { size, theme, embedOnly };
  }
  return { size: 'medium', theme: 'dark', embedOnly: false };
}

/**
 * Vista web limpia y embebible (`/widget`) para fijar en escritorio, iframe
 * o testear en Vercel con datos reales en vivo de Open-Meteo.
 */
export const ClaudyWidgetEmbedScreen: React.FC = () => {
  const initial = readInitialQueryParams();
  const [size, setSize] = useState<WidgetSizeFormat>(initial.size);
  const [widgetTheme, setWidgetTheme] = useState<ThemeMode>(initial.theme);
  const [embedOnly] = useState<boolean>(initial.embedOnly);

  const [payload, setPayload] = useState<ClaudyWidgetPayload>(() =>
    createFallbackWidgetPayload({ themeMode: initial.theme })
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshLiveWeather = useCallback(async (basePayload?: ClaudyWidgetPayload) => {
    setIsRefreshing(true);
    try {
      const current = basePayload ?? (await readPersistedWidgetPayload()) ?? createFallbackWidgetPayload();
      const weather = await fetchWeatherData(current.latitude, current.longitude);
      const advice = evaluateDailyAdvice(weather, DEFAULT_OUTFIT_PREFERENCES);
      const fresh = buildWidgetPayload({
        claudyConfig: current.claudyConfig,
        cityName: current.cityName,
        province: current.province,
        latitude: current.latitude,
        longitude: current.longitude,
        weather,
        advice,
        themeMode: widgetTheme,
      });
      setPayload(fresh);
      await persistWidgetPayload(fresh);
    } catch {
      // Mantener el último payload persistido si no hay red
    } finally {
      setIsRefreshing(false);
    }
  }, [widgetTheme]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const cached = await readPersistedWidgetPayload();
      if (!active) return;
      if (cached) {
        setPayload(cached);
        void refreshLiveWeather(cached);
      } else {
        void refreshLiveWeather();
      }
    })();

    const unsubscribe = subscribeToWidgetPayloadChanges((updated) => {
      if (active) setPayload(updated);
    });

    const intervalId = setInterval(() => {
      void refreshLiveWeather();
    }, 10 * 60 * 1000);

    return () => {
      active = false;
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [refreshLiveWeather]);

  const handleOpenAppOutfit = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/?section=outfit';
    }
  };

  const pageBg =
    widgetTheme === 'dark' ? OFFICIAL_PALETTE.slateDeep : OFFICIAL_PALETTE.offWhite;
  const subtleInk =
    widgetTheme === 'dark' ? OFFICIAL_PALETTE.vanilla : OFFICIAL_PALETTE.slate;
  const controlBg =
    widgetTheme === 'dark' ? 'rgba(255,243,176,0.12)' : 'rgba(51,92,103,0.08)';
  const controlBorder =
    widgetTheme === 'dark' ? 'rgba(255,243,176,0.28)' : 'rgba(51,92,103,0.2)';

  return (
    <View style={[styles.container, { backgroundColor: pageBg }]}>
      {!embedOnly && (
        <View style={styles.topBar}>
          <Typography variant="captionMedium" style={{ color: subtleInk, fontSize: 12 }}>
            Modo Widget · {payload.claudyName}
          </Typography>
          <View style={styles.topControls}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setWidgetTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              style={[styles.iconChip, { backgroundColor: controlBg, borderColor: controlBorder }]}
              accessibilityLabel="Cambiar tema del widget"
            >
              {widgetTheme === 'dark' ? (
                <Sun size={14} color={OFFICIAL_PALETTE.vanilla} />
              ) : (
                <Moon size={14} color={OFFICIAL_PALETTE.slate} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => void refreshLiveWeather()}
              style={[styles.iconChip, { backgroundColor: controlBg, borderColor: controlBorder }]}
              accessibilityLabel="Actualizar clima del widget"
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color={subtleInk} />
              ) : (
                <RefreshCw size={14} color={subtleInk} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Widget protagonista centrado */}
      <View style={styles.widgetStage}>
        {size === 'small' && (
          <ClaudySmallWidget
            payload={payload}
            widgetTheme={widgetTheme}
            onPress={handleOpenAppOutfit}
          />
        )}
        {size === 'medium' && (
          <ClaudyMediumWidget
            payload={payload}
            widgetTheme={widgetTheme}
            onPress={handleOpenAppOutfit}
          />
        )}
        {size === 'lockscreen' && (
          <ClaudyLockscreenWidget
            payload={payload}
            widgetTheme={widgetTheme}
            onPress={handleOpenAppOutfit}
          />
        )}
      </View>

      {!embedOnly && (
        <View style={styles.bottomBar}>
          <View style={styles.sizeSwitcher}>
            {(
              [
                { id: 'small', label: '2×2' },
                { id: 'medium', label: '4×2' },
                { id: 'lockscreen', label: 'Bloqueo' },
              ] as const
            ).map((opt) => {
              const active = size === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  onPress={() => setSize(opt.id)}
                  style={[
                    styles.sizeBtn,
                    {
                      backgroundColor: active ? OFFICIAL_PALETTE.honey : controlBg,
                      borderColor: active ? OFFICIAL_PALETTE.honey : controlBorder,
                    },
                  ]}
                >
                  <Typography
                    variant="captionMedium"
                    style={{
                      fontSize: 11.5,
                      color: active ? OFFICIAL_PALETTE.burgundyDeep : subtleInk,
                    }}
                  >
                    {opt.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleOpenAppOutfit}
            style={[styles.openAppBtn, { backgroundColor: OFFICIAL_PALETTE.burgundy }]}
          >
            <ExternalLink size={14} color="#FFFFFF" />
            <Typography variant="captionMedium" style={{ color: '#FFFFFF', fontSize: 12.5 }}>
              Ver outfit en la app
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  topBar: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetStage: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: spacing.md,
  },
  sizeSwitcher: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  sizeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  openAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderRadius: spacing.borderRadiusFull,
  },
});
