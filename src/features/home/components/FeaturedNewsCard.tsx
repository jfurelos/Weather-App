import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, ChevronRight } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { FeaturedNews } from '../services/newsService';

interface Props {
  news: FeaturedNews[];
  onPressSeeAll?: () => void;
}

export const FeaturedNewsCard: React.FC<Props> = ({ news, onPressSeeAll }) => {
  const { colors } = useThemeStore();

  if (news.length === 0) return null;

  const topNews = news[0];

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.tagWrapper}>
          <Bell size={14} color={colors.primary} />
          <Typography variant="captionMedium" color="brand">
            AVISO DESTACADO
          </Typography>
        </View>
        <Badge label={topNews.source} tone="neutral" />
      </View>

      <Typography variant="h3" style={styles.title}>
        {topNews.title}
      </Typography>

      <Typography variant="body" color="secondary" numberOfLines={3}>
        {topNews.summary}
      </Typography>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <TouchableOpacity
        style={styles.footerRow}
        activeOpacity={0.7}
        onPress={onPressSeeAll}
      >
        <Typography variant="callout" style={{ color: colors.primary, fontWeight: '600' }}>
          Consultar partes meteorológicos completos
        </Typography>
        <ChevronRight size={16} color={colors.primary} />
      </TouchableOpacity>
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
  divider: {
    height: 1,
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
});
