import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Shirt, CloudRain, Sun, Wind, Sparkles } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { OFFICIAL_PALETTE, ThemeMode } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import type { ClaudyWidgetPayload } from '@/shared/services/widgetDataSync';
import { ClaudySvg } from './ClaudySvg';

interface WidgetRenderProps {
  payload: ClaudyWidgetPayload;
  widgetTheme: ThemeMode;
  onPress?: () => void;
}

function getWidgetColors(widgetTheme: ThemeMode) {
  const isDark = widgetTheme === 'dark';
  return {
    isDark,
    bg: isDark ? OFFICIAL_PALETTE.slate : OFFICIAL_PALETTE.vanilla,
    bgSecondary: isDark ? OFFICIAL_PALETTE.slateDeep : OFFICIAL_PALETTE.white,
    cardInset: isDark ? 'rgba(255, 243, 176, 0.14)' : 'rgba(255, 255, 255, 0.85)',
    border: isDark ? 'rgba(255, 243, 176, 0.28)' : 'rgba(51, 92, 103, 0.2)',
    titleText: isDark ? OFFICIAL_PALETTE.white : OFFICIAL_PALETTE.slate,
    accentText: isDark ? OFFICIAL_PALETTE.vanilla : OFFICIAL_PALETTE.burgundyDeep,
    mutedText: isDark ? 'rgba(250, 246, 232, 0.82)' : OFFICIAL_PALETTE.slateSecondary,
    pillBg: isDark ? OFFICIAL_PALETTE.vanilla : OFFICIAL_PALETTE.slate,
    pillText: isDark ? OFFICIAL_PALETTE.slate : OFFICIAL_PALETTE.vanilla,
    alertBg: OFFICIAL_PALETTE.burgundy,
    alertText: OFFICIAL_PALETTE.white,
    honeyBg: OFFICIAL_PALETTE.honey,
    honeyText: OFFICIAL_PALETTE.burgundyDeep,
  };
}

function formatUpdatedClock(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Ahora';
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Ahora';
  }
}

/**
 * 1. Widget Pequeño (2x2)
 */
export const ClaudySmallWidget: React.FC<WidgetRenderProps> = ({
  payload,
  widgetTheme,
  onPress,
}) => {
  const w = getWidgetColors(widgetTheme);
  const isAlert =
    payload.alertLevel === 'rain_alert' || payload.alertLevel === 'cold_alert';

  const content = (
    <View
      style={[
        styles.smallCard,
        {
          backgroundColor: w.bg,
          borderColor: w.border,
        },
      ]}
    >
      {/* Cabecera: nombre personalizado + temp */}
      <View style={styles.smallTopRow}>
        <View style={{ flex: 1 }}>
          <Typography
            variant="captionMedium"
            style={{ color: w.accentText, fontSize: 11, letterSpacing: 0.2 }}
            numberOfLines={1}
          >
            {payload.claudyName}
          </Typography>
          <Typography
            variant="caption"
            style={{ color: w.mutedText, fontSize: 10 }}
            numberOfLines={1}
          >
            {payload.cityName}
          </Typography>
        </View>
        <Typography
          variant="h2"
          style={{ color: w.titleText, fontSize: 24, lineHeight: 26 }}
        >
          {payload.temperature}°
        </Typography>
      </View>

      {/* Centro: Claudy vestida para el clima */}
      <View style={styles.smallCenter}>
        <ClaudySvg
          weatherMode={payload.weatherMode}
          config={payload.claudyConfig}
          size={72}
        />
      </View>

      {/* Pie: micro-recomendación de ropa */}
      <View
        style={[
          styles.smallTipPill,
          {
            backgroundColor: isAlert ? w.alertBg : w.honeyBg,
          },
        ]}
      >
        <Shirt size={11} color={isAlert ? w.alertText : w.honeyText} />
        <Typography
          variant="captionMedium"
          style={{
            color: isAlert ? w.alertText : w.honeyText,
            fontSize: 10.5,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {payload.topOutfitTip}
        </Typography>
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress}>
      {content}
    </TouchableOpacity>
  );
};

/**
 * 2. Widget Mediano (4x2)
 */
export const ClaudyMediumWidget: React.FC<WidgetRenderProps> = ({
  payload,
  widgetTheme,
  onPress,
}) => {
  const w = getWidgetColors(widgetTheme);
  const isAlert =
    payload.alertLevel === 'rain_alert' || payload.alertLevel === 'cold_alert';

  const content = (
    <View
      style={[
        styles.mediumCard,
        {
          backgroundColor: w.bg,
          borderColor: w.border,
        },
      ]}
    >
      {/* Izquierda: Claudy protagonista + insignia */}
      <View
        style={[
          styles.mediumLeft,
          {
            backgroundColor: w.cardInset,
            borderColor: w.border,
          },
        ]}
      >
        <ClaudySvg
          weatherMode={payload.weatherMode}
          config={payload.claudyConfig}
          size={86}
        />
        <View style={[styles.namePill, { backgroundColor: w.pillBg }]}>
          <Typography
            variant="captionMedium"
            style={{ color: w.pillText, fontSize: 10 }}
            numberOfLines={1}
          >
            {payload.claudyName}
          </Typography>
        </View>
      </View>

      {/* Derecha: Clima real + micro-recomendación de ropa */}
      <View style={styles.mediumRight}>
        <View style={styles.mediumHeader}>
          <View style={styles.cityRow}>
            <MapPin size={11} color={w.accentText} />
            <Typography
              variant="captionMedium"
              style={{ color: w.accentText, fontSize: 11.5 }}
              numberOfLines={1}
            >
              {payload.cityName}
            </Typography>
          </View>
          <Typography
            variant="caption"
            style={{ color: w.mutedText, fontSize: 10 }}
          >
            {formatUpdatedClock(payload.updatedAt)}
          </Typography>
        </View>

        <View style={styles.mediumTempRow}>
          <Typography
            variant="hero"
            style={{ color: w.titleText, fontSize: 32, lineHeight: 36 }}
          >
            {payload.temperature}°
          </Typography>
          <View style={{ flex: 1 }}>
            <Typography
              variant="captionMedium"
              style={{ color: w.titleText, fontSize: 12 }}
              numberOfLines={1}
            >
              {payload.condition}
            </Typography>
            <Typography
              variant="caption"
              style={{ color: w.mutedText, fontSize: 10.5 }}
            >
              Min {payload.tempMin}° · Max {payload.tempMax}°
            </Typography>
          </View>
        </View>

        <View
          style={[
            styles.mediumOutfitBox,
            {
              backgroundColor: isAlert ? w.alertBg : w.honeyBg,
            },
          ]}
        >
          {payload.alertLevel === 'rain_alert' ? (
            <CloudRain size={13} color={w.alertText} />
          ) : payload.alertLevel === 'warm_notice' ? (
            <Sun size={13} color={w.honeyText} />
          ) : payload.alertLevel === 'wind_alert' ? (
            <Wind size={13} color={w.honeyText} />
          ) : (
            <Sparkles size={13} color={isAlert ? w.alertText : w.honeyText} />
          )}
          <Typography
            variant="captionMedium"
            style={{
              color: isAlert ? w.alertText : w.honeyText,
              fontSize: 11,
              flex: 1,
              lineHeight: 14,
            }}
            numberOfLines={2}
          >
            {payload.topOutfitTip}
          </Typography>
        </View>
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={{ width: '100%' }}>
      {content}
    </TouchableOpacity>
  );
};

/**
 * 3. Widget Compacto / Pantalla de Bloqueo
 */
export const ClaudyLockscreenWidget: React.FC<WidgetRenderProps> = ({
  payload,
  widgetTheme,
  onPress,
}) => {
  const isDark = widgetTheme === 'dark';
  const bg = isDark ? 'rgba(36, 67, 75, 0.94)' : 'rgba(255, 243, 176, 0.95)';
  const border = isDark ? 'rgba(255, 243, 176, 0.34)' : 'rgba(51, 92, 103, 0.25)';
  const primaryInk = isDark ? OFFICIAL_PALETTE.white : OFFICIAL_PALETTE.slate;
  const secondaryInk = isDark ? OFFICIAL_PALETTE.vanilla : OFFICIAL_PALETTE.burgundyDeep;
  const isAlert =
    payload.alertLevel === 'rain_alert' || payload.alertLevel === 'cold_alert';

  const content = (
    <View
      style={[
        styles.lockCard,
        {
          backgroundColor: bg,
          borderColor: border,
        },
      ]}
    >
      <View style={styles.lockClaudyWrap}>
        <ClaudySvg
          weatherMode={payload.weatherMode}
          config={payload.claudyConfig}
          size={44}
        />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.lockTopLine}>
          <Typography
            variant="captionMedium"
            style={{ color: primaryInk, fontSize: 12.5 }}
            numberOfLines={1}
          >
            {payload.temperature}° · {payload.condition}
          </Typography>
          <View
            style={[
              styles.lockNameChip,
              {
                backgroundColor: isAlert
                  ? OFFICIAL_PALETTE.burgundy
                  : OFFICIAL_PALETTE.honey,
              },
            ]}
          >
            <Typography
              variant="captionMedium"
              style={{
                fontSize: 9.5,
                color: isAlert ? OFFICIAL_PALETTE.white : OFFICIAL_PALETTE.burgundyDeep,
              }}
            >
              {payload.claudyName}
            </Typography>
          </View>
        </View>
        <Typography
          variant="caption"
          style={{ color: secondaryInk, fontSize: 11.5 }}
          numberOfLines={1}
        >
          {payload.topOutfitTip} · {payload.cityName}
        </Typography>
      </View>
    </View>
  );

  if (!onPress) return content;
  return (
    <TouchableOpacity activeOpacity={0.86} onPress={onPress} style={{ width: '100%' }}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Small 2x2
  smallCard: {
    width: 170,
    height: 170,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 13,
    justifyContent: 'space-between',
    shadowColor: '#132429',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },
  smallTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 4,
  },
  smallCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: -6,
  },
  smallTipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: spacing.borderRadiusFull,
  },

  // Medium 4x2
  mediumCard: {
    width: '100%',
    maxWidth: 352,
    minHeight: 162,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#132429',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 6,
  },
  mediumLeft: {
    width: 108,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    gap: 4,
  },
  namePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: spacing.borderRadiusFull,
  },
  mediumRight: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 6,
  },
  mediumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  mediumTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mediumOutfitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
  },

  // Lockscreen Compact
  lockCard: {
    width: '100%',
    maxWidth: 352,
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#132429',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  lockClaudyWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  lockNameChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: spacing.borderRadiusFull,
  },
});
