import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  CloudRain,
  Wind,
  Sun,
  Volume2,
  VolumeX,
  BellOff,
  X,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { useAlertBannerStore } from '../store/useAlertBannerStore';

export const AlertNotificationBanner: React.FC = () => {
  const { colors } = useThemeStore();
  const { banner, dismissBanner } = useAlertBannerStore();

  if (!banner) return null;

  const isTriggered = banner.status === 'triggered';

  const getCategoryColor = () => {
    if (!isTriggered) return colors.textSecondary;
    switch (banner.category) {
      case 'rain':
        return colors.rain;
      case 'wind':
        return colors.wind;
      case 'heat':
        return colors.heat;
    }
  };

  const accentColor = getCategoryColor();

  const renderIcon = () => {
    if (!isTriggered) return <BellOff size={18} color={accentColor} />;
    switch (banner.category) {
      case 'rain':
        return <CloudRain size={18} color={accentColor} />;
      case 'wind':
        return <Wind size={18} color={accentColor} />;
      case 'heat':
        return <Sun size={18} color={accentColor} />;
    }
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isTriggered ? accentColor : colors.borderStrong,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          {renderIcon()}
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Typography
              variant="captionMedium"
              style={{ color: accentColor, fontWeight: '700', flex: 1 }}
              numberOfLines={1}
            >
              {isTriggered
                ? `${banner.title} • ${banner.locationName}`
                : `Alerta filtrada • ${banner.locationName}`}
            </Typography>
            <TouchableOpacity
              onPress={dismissBanner}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Cerrar notificación"
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Typography variant="caption" style={{ color: colors.textPrimary }}>
            {banner.body}
          </Typography>

          {isTriggered && (
            <View style={styles.soundMeta}>
              {banner.soundPlayed ? (
                <Volume2 size={12} color={accentColor} />
              ) : (
                <VolumeX size={12} color={colors.textSecondary} />
              )}
              <Typography variant="caption" color="secondary" style={{ fontSize: 11 }}>
                Tono: {banner.toneLabel}
              </Typography>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 14 : 46,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  soundMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
});
