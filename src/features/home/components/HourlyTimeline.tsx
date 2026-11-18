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
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
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
  const { theme, colors } = useThemeStore();

  const renderSmallIcon = (code: number, isNow: boolean) => {
    const { iconName } = getWMOCondition(code);
    const size = 20;
    const override = isNow ? colors.pillActiveText : null;
    switch (iconName) {
      case 'Sun':
        return <Sun size={size} color={override ?? colors.warning} />;
      case 'CloudSun':
        return <CloudSun size={size} color={override ?? colors.gold} />;
      case 'CloudRain':
      case 'CloudDrizzle':
        return <CloudRain size={size} color={override ?? colors.rain} />;
      case 'Snowflake':
        return <Snowflake size={size} color={override ?? colors.sky} />;
      case 'CloudLightning':
        return <CloudLightning size={size} color={override ?? colors.plum} />;
      case 'CloudFog':
        return <CloudFog size={size} color={override ?? colors.textMuted} />;
      case 'Cloud':
      default:
        return <Cloud size={size} color={override ?? colors.primary} />;
    }
  };

  return (
    <Card
      windowTitle="☁️ Pronóstico por Horas"
      windowRight={<Badge label="Hoy · 24h" tone="neutral" />}
      contentStyle={styles.cardBody}
    >
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
                  backgroundColor: isNow ? colors.pillActiveBg : colors.surface,
                  borderColor: isNow ? colors.border : colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                  borderRadius: theme.metrics.subcardRadius - 2,
                },
                isNow ? theme.shadows.pillActive : theme.shadows.subcard,
              ]}
            >
              <Typography
                variant="caption"
                style={{
                  color: isNow ? colors.pillActiveText : colors.textMuted,
                  fontWeight: isNow ? '800' : '700',
                }}
              >
                {isNow ? 'Ahora' : item.time}
              </Typography>

              <View style={styles.iconWrapper}>{renderSmallIcon(item.weatherCode, isNow)}</View>

              <Typography
                variant="h3"
                style={{
                  fontSize: 16,
                  color: isNow ? colors.pillActiveText : colors.textPrimary,
                }}
              >
                {item.temperature}°
              </Typography>

              {item.precipitationProbability > 0 ? (
                <View style={styles.rainProbRow}>
                  <Droplets
                    size={10}
                    color={isNow ? colors.pillActiveText : colors.turquoise}
                  />
                  <Typography
                    variant="caption"
                    style={{
                      color: isNow ? colors.pillActiveText : colors.turquoise,
                      fontSize: 10,
                      fontWeight: '800',
                    }}
                  >
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
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBody: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  scrollList: {
    gap: spacing.sm,
    paddingVertical: 3,
    paddingRight: 4,
  },
  hourlyItem: {
    width: 70,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    gap: 5,
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
