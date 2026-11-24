import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { X, Images, Maximize2 } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { ChatMessage } from '../store/useComarcasForumStore';

interface Props {
  visible: boolean;
  roomTitle: string;
  mediaMessages: ChatMessage[];
  onSelectImage: (message: ChatMessage) => void;
  onClose: () => void;
}

export const ChatMediaGalleryModal: React.FC<Props> = ({
  visible,
  roomTitle,
  mediaMessages,
  onSelectImage,
  onClose,
}) => {
  const { isDark, theme, colors } = useThemeStore();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.cardSolid,
              borderColor: colors.border,
              borderTopWidth: theme.metrics.windowBorderWidth,
              borderTopLeftRadius: theme.metrics.windowRadius + 4,
              borderTopRightRadius: theme.metrics.windowRadius + 4,
            },
            theme.shadows.modal,
          ]}
        >
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={styles.headerTitleArea}>
              <View style={styles.titleRow}>
                <Typography variant="h2">Archivos y Fotos</Typography>
                <Badge
                  label={`${mediaMessages.length}`}
                  tone={mediaMessages.length > 0 ? 'warning' : 'neutral'}
                />
              </View>
              <Typography variant="caption" color="secondary" numberOfLines={1}>
                {roomTitle}
              </Typography>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.pillBg,
                  borderColor: colors.subcardBorder,
                },
              ]}
              accessibilityLabel="Cerrar panel de archivos y fotos"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Cuadrícula de archivos compartidos */}
          {mediaMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIconBox,
                  { backgroundColor: colors.surface, borderColor: colors.subcardBorder },
                ]}
              >
                <Images size={28} color={colors.textSecondary} />
              </View>
              <Typography variant="h3" style={{ textAlign: 'center' }}>
                Sin fotos recientes
              </Typography>
              <Typography variant="body" color="secondary" style={{ textAlign: 'center' }}>
                Cuando alguien comparta una foto en esta sala, aparecerá aquí.
              </Typography>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.grid}
            >
              {mediaMessages.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.82}
                  onPress={() => onSelectImage(item)}
                  style={[
                    styles.mediaCard,
                    {
                      backgroundColor: isDark ? colors.surface : colors.inputBg,
                      borderColor: colors.subcardBorder,
                    },
                  ]}
                >
                  <View style={styles.thumbWrapper}>
                    <Image
                      source={{ uri: item.imageUrl! }}
                      style={styles.thumbImage}
                      resizeMode="cover"
                    />
                    <View style={styles.expandOverlay}>
                      <Maximize2 size={12} color="#FFFFFF" />
                    </View>
                  </View>

                  <View style={styles.cardMeta}>
                    <Typography variant="captionMedium" numberOfLines={1} style={{ fontSize: 12 }}>
                      {item.userName}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ fontSize: 10.5 }}>
                      {item.createdAt} · {item.userProvince}
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 34, 40, 0.56)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '84%',
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitleArea: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
    paddingBottom: spacing.base,
  },
  mediaCard: {
    width: '48%',
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbWrapper: {
    width: '100%',
    height: 132,
    position: 'relative',
    backgroundColor: 'rgba(51, 92, 103, 0.12)',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  expandOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(18, 34, 40, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(18, 34, 40, 0.72)',
  },
  cardMeta: {
    padding: spacing.sm,
    gap: 2,
  },
});
