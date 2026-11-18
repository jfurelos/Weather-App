import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, ChevronRight, AlertCircle, X } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { Comarca } from '../data/provincesData';
import { MAX_FAVORITE_COMARCAS } from '../store/useComarcasForumStore';

interface Props {
  favorites: Comarca[];
  limitMessage?: string | null;
  onDismissLimitMessage?: () => void;
  onSelectComarca: (comarca: Comarca) => void;
  onRemoveFavorite?: (comarca: Comarca) => void;
}

export const FavoriteComarcasBar: React.FC<Props> = ({
  favorites,
  limitMessage,
  onDismissLimitMessage,
  onSelectComarca,
  onRemoveFavorite,
}) => {
  const { theme, colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Star size={14} color={colors.gold} fill={colors.gold} />
          <Typography variant="captionMedium" color="secondary" style={{ fontWeight: '800' }}>
            FAVORITAS
          </Typography>
        </View>
        <Typography variant="caption" color="secondary" style={{ fontWeight: '700' }}>
          {favorites.length}/{MAX_FAVORITE_COMARCAS}
        </Typography>
      </View>

      {limitMessage && (
        <View
          style={[
            styles.limitBanner,
            {
              backgroundColor: colors.gold,
              borderColor: colors.border,
              borderWidth: theme.metrics.subcardBorderWidth,
            },
          ]}
        >
          <AlertCircle size={15} color="#28323E" />
          <Typography
            variant="captionMedium"
            style={{ flex: 1, color: '#28323E', fontSize: 12, fontWeight: '700' }}
          >
            {limitMessage}
          </Typography>
          {onDismissLimitMessage && (
            <TouchableOpacity onPress={onDismissLimitMessage} style={styles.dismissBtn}>
              <X size={14} color="#28323E" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {favorites.length === 0 ? (
        <View
          style={[
            styles.emptyHint,
            {
              backgroundColor: colors.surface,
              borderColor: colors.subcardBorder,
              borderWidth: theme.metrics.subcardBorderWidth,
            },
          ]}
        >
          <Typography variant="caption" color="secondary">
            Marca hasta {MAX_FAVORITE_COMARCAS} comarcas con la estrella ☆ para acceder rápidamente aquí.
          </Typography>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {favorites.map((comarca) => (
            <View
              key={comarca.id}
              style={[
                styles.favRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: theme.metrics.subcardBorderWidth,
                  borderRadius: theme.metrics.subcardRadius - 2,
                },
                theme.shadows.subcard,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.favMainTouch}
                onPress={() => onSelectComarca(comarca)}
              >
                <Star size={15} color={colors.gold} fill={colors.gold} />
                <View style={styles.favInfo}>
                  <Typography
                    variant="bodyMedium"
                    numberOfLines={1}
                    style={{ fontWeight: '700' }}
                  >
                    {comarca.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="secondary"
                    style={{ fontSize: 11 }}
                  >
                    {comarca.provinceName}
                  </Typography>
                </View>
                <ChevronRight size={16} color={colors.textSecondary} />
              </TouchableOpacity>

              {onRemoveFavorite && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.removeBtn, { borderLeftColor: colors.divider }]}
                  onPress={() => onRemoveFavorite(comarca)}
                  accessibilityLabel={`Quitar ${comarca.name} de favoritas`}
                >
                  <X size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs + 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  dismissBtn: {
    padding: 4,
  },
  emptyHint: {
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  listContainer: {
    gap: spacing.xs + 2,
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    overflow: 'hidden',
  },
  favMainTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  favInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  removeBtn: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 4,
    borderLeftWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
