import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shirt, Compass, Sparkles } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { DailyAdvice } from '../services/rulesEngine';

interface Props {
  advice: DailyAdvice;
}

export const AdviceCard: React.FC<Props> = ({ advice }) => {
  const { colors } = useThemeStore();

  return (
    <Card style={styles.card}>
      {/* Header con badge y título */}
      <View style={styles.headerRow}>
        <View style={styles.tagWrapper}>
          <Sparkles size={14} color={colors.primary} />
          <Typography variant="captionMedium" color="brand">
            CONSEJO DEL DÍA
          </Typography>
        </View>
        <Badge label={advice.highlightBadge} tone={advice.badgeTone} />
      </View>

      <Typography variant="h3" style={styles.title}>
        {advice.title}
      </Typography>

      {/* Bloque 1: Recomendación de Ropa (Outfit) */}
      <View style={[styles.adviceBlock, { backgroundColor: colors.surface }]}>
        <View style={styles.iconCircle}>
          <Shirt size={18} color={colors.primary} />
        </View>
        <View style={styles.textBlock}>
          <Typography variant="captionMedium" color="secondary">
            Qué vestir hoy
          </Typography>
          <Typography variant="body" style={styles.bodyText}>
            {advice.outfitAdvice}
          </Typography>
        </View>
      </View>

      {/* Bloque 2: Recomendación de Planes (Activities) */}
      <View style={[styles.adviceBlock, { backgroundColor: colors.surface }]}>
        <View style={styles.iconCircle}>
          <Compass size={18} color={colors.accent} />
        </View>
        <View style={styles.textBlock}>
          <Typography variant="captionMedium" color="secondary">
            Planes recomendados
          </Typography>
          <Typography variant="body" style={styles.bodyText}>
            {advice.planAdvice}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    marginTop: 2,
  },
  adviceBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
  },
  iconCircle: {
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  bodyText: {
    marginTop: 2,
  },
});
