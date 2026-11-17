import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Star, ChevronRight } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { Comarca } from '../data/provincesData';

interface Props {
  favorites: Comarca[];
  onSelectComarca: (comarca: Comarca) => void;
}

export const FavoriteComarcasBar: React.FC<Props> = ({
  favorites,
  onSelectComarca,
}) => {
  const { colors } = useThemeStore();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Star size={14} color="#F59E0B" fill="#F59E0B" />
        <Typography variant="captionMedium" color="secondary" style={{ fontWeight: '700' }}>
          ACCESO RÁPIDO • COMARCAS FAVORITAS
        </Typography>
      </View>

      {favorites.length === 0 ? (
        <View
          style={[
            styles.emptyHint,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Typography variant="caption" color="secondary">
            Marca cualquier comarca con la estrella ☆ para tener acceso directo aquí.
          </Typography>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {favorites.map((comarca) => (
            <TouchableOpacity
              key={comarca.id}
              activeOpacity={0.75}
              style={[
                styles.favCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onSelectComarca(comarca)}
            >
              <View style={styles.favTopRow}>
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <Typography
                  variant="caption"
                  color="secondary"
                  style={{ fontSize: 10, fontWeight: '600' }}
                >
                  {comarca.provinceName}
                </Typography>
              </View>

              <View style={styles.favBottomRow}>
                <Typography
                  variant="bodyMedium"
                  numberOfLines={1}
                  style={{ fontWeight: '700', flex: 1 }}
                >
                  {comarca.name}
                </Typography>
                <ChevronRight size={14} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    gap: 6,
  },
  emptyHint: {
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  favCard: {
    width: 175,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  favTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  favBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
});
