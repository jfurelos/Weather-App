import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, ChevronRight, Layers } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { Comarca } from '../data/provincesData';

interface Props {
  comarca: Comarca;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

export const ComarcaCard: React.FC<Props> = ({
  comarca,
  isFavorite,
  onToggleFavorite,
  onPress,
}) => {
  const { theme, colors } = useThemeStore();

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.mainTouchable}
      >
        <View style={styles.topRow}>
          <View style={styles.titleArea}>
            <Typography variant="h3">{comarca.name}</Typography>
            <View style={styles.subforumsTag}>
              <Layers size={12} color={colors.primary} />
              <Typography
                variant="captionMedium"
                style={{ color: colors.primary, fontSize: 11 }}
              >
                3 chats: General • Incidentes • Paisajes
              </Typography>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.starButton,
              {
                backgroundColor: isFavorite ? colors.gold : colors.pillBg,
                borderColor: isFavorite ? colors.border : colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
            ]}
            onPress={onToggleFavorite}
            accessibilityLabel={
              isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'
            }
          >
            <Star
              size={18}
              color={isFavorite ? '#28323E' : colors.textSecondary}
              fill={isFavorite ? '#28323E' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <Typography
          variant="body"
          color="secondary"
          numberOfLines={2}
          style={styles.description}
        >
          {comarca.description}
        </Typography>

        <View style={[styles.footerRow, { borderTopColor: colors.divider }]}>
          <View style={styles.enterAction}>
            <Typography variant="captionMedium" style={{ color: colors.primary, fontWeight: '700' }}>
              Entrar al forum
            </Typography>
            <ChevronRight size={14} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
  },
  mainTouchable: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleArea: {
    flex: 1,
    gap: 3,
  },
  subforumsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    marginTop: 2,
  },
  enterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
