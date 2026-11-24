import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Shirt,
  Layers,
  Footprints,
  Umbrella,
  Glasses,
  Wind,
  Sparkles,
  Sunrise,
  Sun,
  Moon,
  AlertTriangle,
  Compass,
  Droplets,
  Thermometer,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { FONT_DISPLAY_BOLD } from '@/shared/theme/typography';
import {
  ClaudySvg,
  resolveClaudyWeatherMode,
  useClaudyStore,
} from '@/features/claudy';
import {
  getThermalOption,
  OUTFIT_STYLE_OPTIONS,
  OutfitStyle,
} from '@/features/profile/data/outfitPreferences';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { WeatherData } from '../services/weatherApi';
import {
  DailyAdvice,
  DayPeriodSlot,
  OutfitLayerIcon,
  OutfitLayerItem,
} from '../services/rulesEngine';

interface Props {
  weather: WeatherData;
  advice: DailyAdvice;
}

export const OutfitRecommenderCard: React.FC<Props> = ({ weather, advice }) => {
  const { isDark, colors } = useThemeStore();
  const outfitPreferences = useProfileStore((s) => s.outfitPreferences);
  const updateOutfitPreferences = useProfileStore((s) => s.updateOutfitPreferences);

  const claudyConfig = useClaudyStore((s) => s.config);
  const openClaudyCustomizer = useClaudyStore((s) => s.openCustomizer);

  const { outfit } = advice;
  const thermalOpt = getThermalOption(outfit.thermalSensitivity);

  const weatherMode = resolveClaudyWeatherMode({
    weatherCode: weather.current.weatherCode,
    temperature: weather.current.temperature,
    windSpeed: weather.current.windSpeed,
    precipitation: weather.current.precipitation,
  });

  const handleSelectStyle = (style: OutfitStyle) => {
    if (style === outfitPreferences.style) return;
    updateOutfitPreferences({ style });
  };

  const renderLayerIcon = (icon: OutfitLayerIcon, color: string) => {
    const size = 17;
    switch (icon) {
      case 'shirt':
        return <Shirt size={size} color={color} />;
      case 'layers':
        return <Layers size={size} color={color} />;
      case 'footprints':
        return <Footprints size={size} color={color} />;
      case 'umbrella':
        return <Umbrella size={size} color={color} />;
      case 'glasses':
        return <Glasses size={size} color={color} />;
      case 'wind':
        return <Wind size={size} color={color} />;
      case 'sparkles':
      default:
        return <Sparkles size={size} color={color} />;
    }
  };

  const renderPeriodIcon = (id: DayPeriodSlot['id'], color: string) => {
    switch (id) {
      case 'morning':
        return <Sunrise size={15} color={color} />;
      case 'afternoon':
        return <Sun size={15} color={color} />;
      case 'night':
        return <Moon size={15} color={color} />;
    }
  };

  const layers: OutfitLayerItem[] = [
    outfit.top,
    outfit.bottom,
    outfit.footwear,
    outfit.accessories,
  ];

  const isSevereAlert =
    outfit.alertLevel === 'rain_alert' ||
    outfit.alertLevel === 'cold_alert' ||
    outfit.alertLevel === 'wind_alert';

  const isWarmNotice = outfit.alertLevel === 'warm_notice';

  const vibeBadgeTone = isSevereAlert ? 'rain' : 'warning';

  return (
    <Card style={styles.card}>
      {/* 1. Cabecera editorial Jost + Claudy vestida para el día */}
      <View style={styles.heroHeader}>
        <View style={styles.headerTextCol}>
          <View style={styles.eyebrowRow}>
            <Badge label={outfit.vibeTag} tone={vibeBadgeTone} />
            <View
              style={[
                styles.thermalPill,
                { backgroundColor: colors.surface, borderColor: colors.subcardBorder },
              ]}
            >
              <Thermometer size={11} color={colors.textPrimary} />
              <Typography variant="captionMedium" style={{ fontSize: 10.5 }}>
                {thermalOpt.label}
                {thermalOpt.tempOffsetC !== 0 ? ` (${thermalOpt.shortDelta})` : ''}
              </Typography>
            </View>
          </View>

          <Typography
            variant="h1"
            style={[styles.mainHeading, { fontFamily: FONT_DISPLAY_BOLD }]}
          >
            ¿Qué me pongo hoy?
          </Typography>

          <Typography variant="caption" color="secondary" style={styles.headlineCopy}>
            {outfit.headline}
          </Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={openClaudyCustomizer}
          accessibilityRole="button"
          accessibilityLabel={`Personalizar a ${claudyConfig.name}`}
          style={[
            styles.miniClaudyBox,
            {
              backgroundColor: isDark ? colors.surface : colors.inputBg,
              borderColor: colors.subcardBorder,
            },
          ]}
        >
          <ClaudySvg weatherMode={weatherMode} config={claudyConfig} size={74} />
        </TouchableOpacity>
      </View>

      {/* 2. Selector rápido inline de estilo (recalcula al instante) */}
      <View style={styles.styleSelectorSection}>
        <Typography variant="captionMedium" color="secondary" style={styles.sectionMicroLabel}>
          TU ESTILO HOY
        </Typography>
        <View style={styles.stylePillsRow}>
          {OUTFIT_STYLE_OPTIONS.map((opt) => {
            const isSelected = outfitPreferences.style === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => handleSelectStyle(opt.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.stylePill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.inputBg,
                    borderColor: isSelected ? colors.primaryDark : colors.subcardBorder,
                  },
                ]}
              >
                <Typography
                  variant="captionMedium"
                  numberOfLines={1}
                  style={{
                    fontSize: 11.5,
                    color: isSelected ? colors.onPrimary : colors.textPrimary,
                  }}
                >
                  {opt.shortLabel}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Banner de alerta térmica / lluvia / impermeable si aplica */}
      {outfit.alertBanner && (
        <View
          style={[
            styles.alertStrip,
            {
              backgroundColor: isWarmNotice ? colors.accent : colors.primary,
              borderColor: isWarmNotice ? 'rgba(84,11,14,0.16)' : colors.primaryDark,
            },
          ]}
        >
          <AlertTriangle
            size={15}
            color={isWarmNotice ? colors.onAccent : colors.onPrimary}
          />
          <Typography
            variant="captionMedium"
            style={{
              flex: 1,
              fontSize: 12,
              lineHeight: 16,
              color: isWarmNotice ? colors.onAccent : colors.onPrimary,
            }}
          >
            {outfit.alertBanner}
          </Typography>
        </View>
      )}

      {/* 4. Cuadrícula visual 2x2 por prenda/capa */}
      <View style={styles.layersGrid}>
        {layers.map((item) => {
          const iconBg = item.isAlert
            ? colors.primary
            : item.badgeTone === 'warning'
              ? colors.accent
              : colors.borderStrong;
          const iconColor = item.isAlert
            ? colors.onPrimary
            : item.badgeTone === 'warning'
              ? colors.onAccent
              : '#FFF3B0';

          return (
            <View
              key={item.id}
              style={[
                styles.layerTile,
                {
                  backgroundColor: isDark ? colors.surface : colors.inputBg,
                  borderColor: item.isAlert ? colors.primary : colors.subcardBorder,
                  borderWidth: item.isAlert ? 1.5 : 1,
                },
              ]}
            >
              <View style={styles.tileTopRow}>
                <View style={[styles.iconBadge, { backgroundColor: iconBg }]}>
                  {renderLayerIcon(item.icon, iconColor)}
                </View>
                {item.badge && (
                  <View
                    style={[
                      styles.microBadge,
                      {
                        backgroundColor:
                          item.badgeTone === 'rain'
                            ? colors.primary
                            : item.badgeTone === 'warning'
                              ? colors.accent
                              : colors.pillBg,
                      },
                    ]}
                  >
                    <Typography
                      variant="captionMedium"
                      numberOfLines={1}
                      style={{
                        fontSize: 9.5,
                        lineHeight: 12,
                        color:
                          item.badgeTone === 'rain'
                            ? colors.onPrimary
                            : item.badgeTone === 'warning'
                              ? colors.onAccent
                              : colors.textPrimary,
                      }}
                    >
                      {item.badge}
                    </Typography>
                  </View>
                )}
              </View>

              <Typography variant="captionMedium" color="muted" style={styles.tileCategory}>
                {item.categoryLabel.toUpperCase()}
              </Typography>

              <Typography variant="bodyMedium" style={styles.tileTitle}>
                {item.title}
              </Typography>

              <Typography variant="caption" color="secondary" style={styles.tileDetail}>
                {item.detail}
              </Typography>
            </View>
          );
        })}
      </View>

      {/* 5. Evolución por franjas: Mañana / Tarde / Noche */}
      <View
        style={[
          styles.periodsContainer,
          {
            backgroundColor: isDark ? colors.inputBg : colors.surface,
            borderColor: colors.subcardBorder,
          },
        ]}
      >
        <Typography variant="captionMedium" color="secondary" style={styles.sectionMicroLabel}>
          EVOLUCIÓN DEL DÍA · MAÑANA / TARDE / NOCHE
        </Typography>

        <View style={styles.periodsRow}>
          {outfit.periods.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.periodSlot,
                {
                  backgroundColor: isDark ? colors.card : colors.inputBg,
                  borderColor: slot.needsLayer ? colors.accent : colors.subcardBorder,
                },
              ]}
            >
              <View style={styles.periodTop}>
                {renderPeriodIcon(
                  slot.id,
                  slot.id === 'afternoon' ? colors.accent : colors.textPrimary
                )}
                <Typography variant="captionMedium" style={{ fontSize: 11 }}>
                  {slot.label}
                </Typography>
              </View>

              <Typography
                variant="h3"
                style={{ fontSize: 17, lineHeight: 21, color: colors.textPrimary }}
              >
                {slot.temp}°
              </Typography>

              {slot.rainProb >= 20 ? (
                <View style={styles.periodRainRow}>
                  <Droplets size={10} color={colors.primary} />
                  <Typography
                    variant="captionMedium"
                    style={{ fontSize: 10, color: colors.primary }}
                  >
                    {slot.rainProb}%
                  </Typography>
                </View>
              ) : null}

              <View
                style={[
                  styles.periodNotePill,
                  {
                    backgroundColor: slot.needsLayer ? colors.accent : colors.pillBg,
                  },
                ]}
              >
                <Typography
                  variant="captionMedium"
                  numberOfLines={1}
                  style={{
                    fontSize: 9.5,
                    color: slot.needsLayer ? colors.onAccent : colors.textSecondary,
                  }}
                >
                  {slot.needsLayer ? '+ Capa' : 'Ligero'}
                </Typography>
              </View>
            </View>
          ))}
        </View>

        <Typography variant="caption" color="primary" style={styles.returnTip}>
          {outfit.returnHomeTip}
        </Typography>
      </View>

      {/* 6. Plan recomendado del día (resumen compacto) */}
      <View
        style={[
          styles.planStrip,
          { borderTopColor: colors.divider },
        ]}
      >
        <Compass size={16} color={colors.accent} />
        <View style={{ flex: 1, gap: 2 }}>
          <Typography variant="captionMedium" color="secondary" style={{ fontSize: 11 }}>
            PLAN DEL DÍA
          </Typography>
          <Typography variant="caption" color="primary" style={{ lineHeight: 17 }}>
            {advice.planAdvice}
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerTextCol: {
    flex: 1,
    gap: 5,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  thermalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  mainHeading: {
    fontSize: 23,
    lineHeight: 28,
    marginTop: 2,
  },
  headlineCopy: {
    lineHeight: 17,
  },
  miniClaudyBox: {
    width: 82,
    height: 82,
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  styleSelectorSection: {
    gap: 6,
  },
  sectionMicroLabel: {
    fontSize: 10.5,
    letterSpacing: 0.6,
  },
  stylePillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stylePill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  layersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.sm + 2,
  },
  layerTile: {
    width: '48.4%',
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.md,
    gap: 4,
  },
  tileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: 2,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  microBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: spacing.borderRadiusFull,
    maxWidth: 94,
  },
  tileCategory: {
    fontSize: 9.5,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  tileTitle: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  tileDetail: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  periodsContainer: {
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  periodsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  periodSlot: {
    flex: 1,
    borderRadius: spacing.borderRadiusSm + 2,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
  },
  periodTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  periodRainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  periodNotePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: spacing.borderRadiusFull,
    marginTop: 1,
  },
  returnTip: {
    fontSize: 12,
    lineHeight: 17,
  },
  planStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderTopWidth: 1,
    paddingTop: spacing.sm + 2,
  },
});
