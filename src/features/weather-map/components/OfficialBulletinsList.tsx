import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { MapPin, Clock, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge, BadgeTone } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { WeatherBulletin } from '../services/bulletinsApi';

interface Props {
  bulletins: WeatherBulletin[];
  isLoading: boolean;
  selectedDayLabel: string;
}

export const OfficialBulletinsList: React.FC<Props> = ({
  bulletins,
  isLoading,
  selectedDayLabel,
}) => {
  const { colors } = useThemeStore();

  const getSeverityBadge = (severity: WeatherBulletin['severity']) => {
    switch (severity) {
      case 'rojo':
        return { label: 'Aviso Rojo • Extremo', tone: 'heat' as BadgeTone };
      case 'naranja':
        return { label: 'Aviso Naranja • Importante', tone: 'warning' as BadgeTone };
      case 'amarillo':
        return { label: 'Aviso Amarillo • Precaución', tone: 'wind' as BadgeTone };
      case 'verde':
      default:
        return { label: 'Sin Riesgo Significativo', tone: 'neutral' as BadgeTone };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Typography variant="h2">Partes Oficiales</Typography>
        <Typography variant="caption" color="secondary">
          {selectedDayLabel} • AEMET & Meteocat
        </Typography>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Typography variant="callout" color="secondary">
            Cargando boletines oficiales...
          </Typography>
        </View>
      ) : bulletins.length === 0 ? (
        <Card style={styles.emptyCard}>
          <ShieldCheck size={28} color={colors.primary} />
          <Typography variant="h3">Sin avisos para este día</Typography>
          <Typography variant="body" color="secondary" style={{ textAlign: 'center' }}>
            No se han emitido boletines de alerta meteorológica para la fecha seleccionada.
          </Typography>
        </Card>
      ) : (
        <View style={styles.bulletinList}>
          {bulletins.map((item) => {
            const badgeInfo = getSeverityBadge(item.severity);
            return (
              <Card key={item.id} style={styles.bulletinCard}>
                <View style={styles.bulletinHeader}>
                  <View style={styles.sourceRow}>
                    <Badge
                      label={item.source}
                      tone="brand"
                    />
                    <Badge label={badgeInfo.label} tone={badgeInfo.tone} />
                  </View>

                  <View style={styles.regionRow}>
                    <MapPin size={13} color={colors.textSecondary} />
                    <Typography variant="captionMedium" color="secondary">
                      {item.region}
                    </Typography>
                  </View>
                </View>

                <Typography variant="h3" style={styles.bulletinTitle}>
                  {item.title}
                </Typography>

                <Typography variant="body" color="secondary" style={styles.bulletinSummary}>
                  {item.summary}
                </Typography>

                <View style={[styles.bulletinFooter, { borderTopColor: colors.divider }]}>
                  <Clock size={12} color={colors.textSecondary} />
                  <Typography variant="caption" color="secondary">
                    {item.timestamp}
                  </Typography>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  sectionHeader: {
    gap: 2,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  bulletinList: {
    gap: spacing.md,
  },
  bulletinCard: {
    gap: spacing.sm,
  },
  bulletinHeader: {
    gap: spacing.xs,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  bulletinTitle: {
    marginTop: 2,
  },
  bulletinSummary: {
    lineHeight: 20,
  },
  bulletinFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    marginTop: 2,
  },
});
