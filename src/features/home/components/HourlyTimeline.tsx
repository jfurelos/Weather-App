import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  Snowflake,
  CloudLightning,
  CloudFog,
  Droplets,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { getWMOCondition } from '../services/weatherApi';

interface HourlyItem {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
}

interface Props {
  hourly: HourlyItem[];
}

export const HourlyTimeline: React.FC<Props> = ({ hourly }) => {
  const { colors } = useThemeStore();

  const renderSmallIcon = (code: number) => {
    const { iconName } = getWMOCondition(code);
    const size = 20;
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
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Typography variant="h3">Pronóstico por Horas</Typography>
        <Typography variant="caption" color="secondary">
          Próximas 24 horas
        </Typography>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {hourly.map((item, index) => {
          const isNow = index === 0;
          return (
            <View
              key={`${item.time}-${index}`}
              style={[
                styles.hourlyItem,
                {
                  backgroundColor: isNow ? colors.surface : colors.card,
                  borderColor: isNow ? colors.borderStrong : colors.border,
                },
              ]}
            >
              <Typography
                variant="caption"
                color={isNow ? 'brand' : 'secondary'}
                style={{ fontWeight: isNow ? '600' : '400' }}
              >
                {isNow ? 'Ahora' : item.time}
              </Typography>

              <View style={styles.iconWrapper}>{renderSmallIcon(item.weatherCode)}</View>

              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                {item.temperature}°
              </Typography>

              {item.precipitationProbability > 0 ? (
                <View style={styles.rainProbRow}>
                  <Droplets size={10} color={colors.rain} />
                  <Typography variant="caption" style={{ color: colors.rain, fontSize: 10 }}>
                    {item.precipitationProbability}%
                  </Typography>
                </View>
              ) : (
                <View style={styles.rainProbPlaceholder} />
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 2,
  },
  scrollList: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  hourlyItem: {
    width: 68,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconWrapper: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rainProbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 14,
  },
  rainProbPlaceholder: {
    height: 14,
  },
});
