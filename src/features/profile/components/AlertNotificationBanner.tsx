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
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle, OFFICIAL_PALETTE } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { ClaudySvg, useClaudyStore } from '@/features/claudy';
import { useAlertBannerStore } from '../store/useAlertBannerStore';

export const AlertNotificationBanner: React.FC = () => {
  const { theme, colors } = useThemeStore();
  const { banner, dismissBanner } = useAlertBannerStore();
  const claudyConfig = useClaudyStore((s) => s.config);

  if (!banner) return null;

  const isTriggered = banner.status === 'triggered';
  const isClaudyReminder = banner.category === 'claudy_outfit';

  const getCategoryColor = () => {
    if (!isTriggered) return colors.textSecondary;
    switch (banner.category) {
      case 'rain':
        return colors.rain;
      case 'wind':
        return colors.wind;
      case 'heat':
        return colors.heat;
      case 'claudy_outfit':
        return OFFICIAL_PALETTE.burgundy;
    }
  };

  const accentColor = getCategoryColor();

  const handleCardPress = () => {
    if (banner.onPress) {
      const action = banner.onPress;
      dismissBanner();
      action();
    }
  };

  const renderIcon = () => {
    if (isClaudyReminder) {
      return (
        <ClaudySvg
          weatherMode={banner.claudyWeatherMode ?? 'sunny'}
          config={claudyConfig}
          size={44}
        />
      );
    }
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

  const innerContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isClaudyReminder ? OFFICIAL_PALETTE.offWhite : colors.cardSolid,
          borderColor: isTriggered ? accentColor : colors.border,
          borderWidth: isClaudyReminder ? 2 : theme.metrics.windowBorderWidth,
          borderRadius: theme.metrics.windowRadius,
        },
        theme.shadows.window,
        getGlassStyle(theme),
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          isClaudyReminder && styles.claudyAvatarBox,
          {
            backgroundColor: isClaudyReminder ? OFFICIAL_PALETTE.vanilla : colors.surface,
            borderColor: isClaudyReminder ? 'rgba(224,159,62,0.55)' : colors.subcardBorder,
            borderWidth: theme.metrics.subcardBorderWidth,
          },
        ]}
      >
        {renderIcon()}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Typography
            variant="captionMedium"
            style={{
              color: isClaudyReminder ? OFFICIAL_PALETTE.burgundyDeep : accentColor,
              fontWeight: '700',
              flex: 1,
            }}
            numberOfLines={1}
          >
            {isClaudyReminder
              ? banner.title
              : isTriggered
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

        <Typography
          variant="caption"
          style={{
            color: isClaudyReminder ? OFFICIAL_PALETTE.slate : colors.textPrimary,
            lineHeight: 17,
          }}
        >
          {banner.body}
        </Typography>

        {isClaudyReminder ? (
          <View style={styles.claudyFooterRow}>
            <View style={styles.ctaPill}>
              <Sparkles size={11} color={OFFICIAL_PALETTE.burgundyDeep} />
              <Typography
                variant="captionMedium"
                style={{ fontSize: 11, color: OFFICIAL_PALETTE.burgundyDeep }}
              >
                {banner.ctaLabel || 'Ver mi outfit'}
              </Typography>
              <ArrowRight size={11} color={OFFICIAL_PALETTE.burgundyDeep} />
            </View>
          </View>
        ) : (
          isTriggered && (
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
          )
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {banner.onPress ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleCardPress}
          accessibilityRole="button"
          accessibilityLabel={banner.ctaLabel || 'Abrir notificación de Claudy'}
        >
          {innerContent}
        </TouchableOpacity>
      ) : (
        innerContent
      )}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claudyAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  content: {
    flex: 1,
    gap: 4,
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
  claudyFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 4,
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: OFFICIAL_PALETTE.honey,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: spacing.borderRadiusFull,
  },
});
