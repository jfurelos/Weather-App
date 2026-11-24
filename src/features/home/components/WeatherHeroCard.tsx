import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  MapPin,
  ChevronDown,
  Wind,
  Droplets,
  Thermometer,
  SlidersHorizontal,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import {
  ClaudySvg,
  getClaudyWeatherCopy,
  resolveClaudyWeatherMode,
  useClaudyStore,
} from '@/features/claudy';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { DISPLAY_FONT } from '@/shared/theme/typography';
import { WeatherData } from '../services/weatherApi';
import { City } from '../store/useHomeStore';

interface Props {
  weather: WeatherData;
  city: City;
  onPressCity: () => void;
}

export const WeatherHeroCard: React.FC<Props> = ({ weather, city, onPressCity }) => {
  const { isDark, theme, colors } = useThemeStore();
  const claudyConfig = useClaudyStore((s) => s.config);
  const openCustomizer = useClaudyStore((s) => s.openCustomizer);
  const { current, daily } = weather;

  const weatherMode = resolveClaudyWeatherMode({
    weatherCode: current.weatherCode,
    temperature: current.temperature,
    windSpeed: current.windSpeed,
    precipitation: current.precipitation,
  });
  const claudyCopy = getClaudyWeatherCopy(weatherMode, claudyConfig.name);

  const windPct = Math.min(100, Math.max(12, Math.round((current.windSpeed / 60) * 100)));
  const humidityPct = Math.min(100, Math.max(8, current.humidity));

  const citySelectorPill = (
    <TouchableOpacity
      style={[
        styles.cityPill,
        {
          backgroundColor: colors.pillActiveBg,
          borderColor: 'transparent',
          borderWidth: 1,
        },
        theme.shadows.pillActive,
      ]}
      activeOpacity={0.8}
      onPress={onPressCity}
      accessibilityLabel={`Cambiar ciudad actual (${city.name})`}
    >
      <MapPin size={12} color={colors.pillActiveText} />
      <Typography
        variant="captionMedium"
        numberOfLines={1}
        style={{
          color: colors.pillActiveText,
          fontSize: 11.5,
          maxWidth: 118,
        }}
      >
        {city.name}
      </Typography>
      <ChevronDown size={13} color={colors.pillActiveText} />
    </TouchableOpacity>
  );

  return (
    <Card
      windowTitle={`${city.province} · Ahora`}
      windowRight={citySelectorPill}
      contentStyle={styles.cardBody}
    >
      {/* Bloque Superior: Datos del clima + Mascota Claudy interactiva */}
      <View style={styles.heroRow}>
        <View style={styles.tempColumn}>
          <View
            style={[
              styles.conditionPill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.subcardBorder,
                borderWidth: 1,
              },
            ]}
          >
            <Typography
              variant="captionMedium"
              numberOfLines={1}
              style={{
                color: colors.textPrimary,
                textTransform: 'capitalize',
                fontSize: 11,
                flexShrink: 1,
              }}
            >
              {current.conditionText}
            </Typography>
          </View>

          <View style={styles.tempBaseline}>
            <Typography
              variant="hero"
              style={[styles.mainTemp, { fontFamily: DISPLAY_FONT, color: colors.textPrimary }]}
            >
              {current.temperature}°
            </Typography>
            <Typography variant="h3" color="muted" style={styles.unitC}>
              C
            </Typography>
          </View>

          <Typography variant="captionMedium" color="secondary" style={styles.minMaxText}>
            Mín {daily.tempMin}° · Máx {daily.tempMax}°
          </Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={openCustomizer}
          accessibilityRole="button"
          accessibilityLabel={`Personalizar a ${claudyConfig.name}`}
          style={[
            styles.mascotFrame,
            {
              backgroundColor: isDark ? colors.surface : colors.inputBg,
              borderColor: colors.subcardBorder,
            },
          ]}
        >
          <ClaudySvg weatherMode={weatherMode} config={claudyConfig} size={112} />
          <View
            style={[
              styles.claudyNameTag,
              { backgroundColor: colors.card, borderColor: colors.subcardBorder },
            ]}
          >
            <Typography variant="captionMedium" numberOfLines={1} style={{ fontSize: 10.5 }}>
              {claudyConfig.name}
            </Typography>
            <SlidersHorizontal size={10} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Frase cálida de Claudy */}
      <Typography variant="caption" color="secondary" style={styles.mascotQuote}>
        {claudyCopy.quote}
      </Typography>

      {/* Subtarjetas de métricas atmosféricas */}
      <View style={styles.metricsGrid}>
        <Card variant="subcard" style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Thermometer size={13} color={colors.accent} />
            <Typography variant="caption" color="secondary" style={styles.metricLabel}>
              Sensación
            </Typography>
          </View>
          <Typography variant="h3" style={styles.metricValue}>
            {current.apparentTemperature}°C
          </Typography>
          <View style={[styles.barTrack, { backgroundColor: 'rgba(51, 92, 103, 0.14)' }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.min(100, Math.max(15, Math.round(((current.apparentTemperature + 5) / 45) * 100)))}%`,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>
        </Card>

        <Card variant="subcard" style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Droplets size={13} color={colors.primary} />
            <Typography variant="caption" color="secondary" style={styles.metricLabel}>
              Humedad
            </Typography>
          </View>
          <Typography variant="h3" style={styles.metricValue}>
            {current.humidity}%
          </Typography>
          <View style={[styles.barTrack, { backgroundColor: 'rgba(51, 92, 103, 0.14)' }]}>
            <View
              style={[
                styles.barFill,
                { width: `${humidityPct}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
        </Card>

        <Card variant="subcard" style={styles.metricCard}>
          <View style={styles.metricTop}>
            <Wind size={13} color={colors.textPrimary} />
            <Typography variant="caption" color="secondary" style={styles.metricLabel}>
              Viento
            </Typography>
          </View>
          <Typography variant="h3" style={styles.metricValue}>
            {current.windSpeed} km/h
          </Typography>
          <View style={[styles.barTrack, { backgroundColor: 'rgba(51, 92, 103, 0.14)' }]}>
            <View
              style={[
                styles.barFill,
                { width: `${windPct}%`, backgroundColor: colors.textPrimary },
              ]}
            />
          </View>
        </Card>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBody: {
    gap: spacing.md,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.borderRadiusFull,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tempColumn: {
    flex: 1,
    gap: 4,
  },
  conditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: spacing.borderRadiusFull,
    maxWidth: '100%',
  },
  tempBaseline: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 2,
  },
  mainTemp: {
    fontSize: 54,
    lineHeight: 58,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  unitC: {
    fontSize: 18,
  },
  minMaxText: {
    fontWeight: '700',
  },
  mascotFrame: {
    width: 136,
    minHeight: 142,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 2,
  },
  claudyNameTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
    maxWidth: 122,
  },
  mascotQuote: {
    fontStyle: 'italic',
    lineHeight: 17,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  metricCard: {
    flex: 1,
    padding: spacing.sm + 2,
    gap: 4,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 15,
    lineHeight: 20,
  },
  barTrack: {
    height: 6,
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 2,
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
  },
});
