import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
  MapPin,
  ChevronDown,
  Wind,
  Droplets,
  Thermometer,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { WeatherData, getWMOCondition } from '../services/weatherApi';
import { City } from '../store/useHomeStore';

interface Props {
  weather: WeatherData;
  city: City;
  onPressCity: () => void;
}

export const WeatherHeroCard: React.FC<Props> = ({ weather, city, onPressCity }) => {
  const { colors } = useThemeStore();
  const { current, daily } = weather;

  const renderWeatherIcon = (code: number, size = 48) => {
    const { iconName } = getWMOCondition(code);
    switch (iconName) {
      case 'Sun':
        return <Sun size={size} color="#F4A261" />;
      case 'CloudSun':
        return <CloudSun size={size} color="#E76F51" />;
      case 'CloudRain':
      case 'CloudDrizzle':
        return <CloudRain size={size} color="#457B9D" />;
      case 'Snowflake':
        return <Snowflake size={size} color="#A8DADC" />;
      case 'CloudLightning':
        return <CloudLightning size={size} color="#E63946" />;
      case 'CloudFog':
        return <CloudFog size={size} color="#8D99AE" />;
      case 'Cloud':
      default:
        return <Cloud size={size} color="#6C757D" />;
    }
  };

  return (
    <Card style={styles.card}>
      {/* Selector de Ciudad */}
      <TouchableOpacity
        style={styles.cityRow}
        activeOpacity={0.7}
        onPress={onPressCity}
      >
        <MapPin size={16} color={colors.primary} />
        <Typography variant="h2" style={styles.cityName}>
          {city.name}
        </Typography>
        <ChevronDown size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      <Typography variant="caption" color="secondary">
        {city.province} • Península y Baleares
      </Typography>

      {/* Bloque Principal: Temperatura y Condición */}
      <View style={styles.mainBlock}>
        <View style={styles.tempColumn}>
          <Typography variant="hero" style={styles.mainTemp}>
            {current.temperature}°
          </Typography>
          <Typography variant="h3" style={{ textTransform: 'capitalize' }}>
            {current.conditionText}
          </Typography>
          <Typography variant="callout" color="secondary" style={styles.minMaxText}>
            Mín: {daily.tempMin}° • Máx: {daily.tempMax}°
          </Typography>
        </View>

        <View style={styles.iconContainer}>
          {renderWeatherIcon(current.weatherCode, 64)}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Métricas rápidas: Sensación, Humedad, Viento */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Thermometer size={16} color={colors.textSecondary} />
          <Typography variant="caption" color="secondary">
            Sensación
          </Typography>
          <Typography variant="bodyMedium">
            {current.apparentTemperature}°
          </Typography>
        </View>

        <View style={styles.metricItem}>
          <Droplets size={16} color={colors.textSecondary} />
          <Typography variant="caption" color="secondary">
            Humedad
          </Typography>
          <Typography variant="bodyMedium">
            {current.humidity}%
          </Typography>
        </View>

        <View style={styles.metricItem}>
          <Wind size={16} color={colors.textSecondary} />
          <Typography variant="caption" color="secondary">
            Viento
          </Typography>
          <Typography variant="bodyMedium">
            {current.windSpeed} km/h
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  cityName: {
    marginRight: 2,
  },
  mainBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tempColumn: {
    gap: 2,
  },
  mainTemp: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  minMaxText: {
    marginTop: 2,
  },
  iconContainer: {
    paddingRight: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 2,
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
});
