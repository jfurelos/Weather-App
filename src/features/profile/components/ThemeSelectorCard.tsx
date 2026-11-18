import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { Card } from '@/shared/components/Card';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { THEME_LIST, AppTheme } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { DISPLAY_FONT } from '@/shared/theme/typography';

export const ThemeSelectorCard: React.FC = () => {
  const { themeId, theme, colors, setTheme } = useThemeStore();

  const getOptionActiveStyle = (item: AppTheme, isActive: boolean): ViewStyle => {
    if (!isActive) {
      return {
        backgroundColor: colors.surface,
        borderColor: themeId === 'ilustrada' ? 'rgba(40, 50, 62, 0.25)' : colors.subcardBorder,
        borderWidth: themeId === 'ilustrada' ? 1.5 : 1.5,
      };
    }

    const activeShadow =
      Platform.OS === 'web'
        ? ({ boxShadow: theme.meta.activeOptionShadowWeb } as unknown as ViewStyle)
        : theme.shadows.pillActive;

    return {
      backgroundColor: theme.meta.activeOptionBg,
      borderColor: theme.meta.activeOptionBorder,
      borderWidth: 2,
      ...activeShadow,
    };
  };

  return (
    <Card
      showWindowDots
      windowTitle="Estilo Visual"
      contentStyle={styles.cardBody}
    >
      <Typography variant="caption" color="secondary" style={styles.helperText}>
        Elige la paleta y estética para toda la aplicación.
      </Typography>

      <View style={styles.optionsList}>
        {THEME_LIST.map((item) => {
          const isActive = item.id === themeId;
          const swatchWebStyle =
            Platform.OS === 'web'
              ? ({
                  ...(item.meta.swatchGradientWeb
                    ? { backgroundImage: item.meta.swatchGradientWeb }
                    : {}),
                  ...(item.meta.swatchShadowWeb ? { boxShadow: item.meta.swatchShadowWeb } : {}),
                } as unknown as ViewStyle)
              : undefined;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.82}
              onPress={() => setTheme(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={`Estilo ${item.meta.shortName}`}
              style={[styles.optionBtn, getOptionActiveStyle(item, isActive)]}
            >
              {/* Miniatura visual fiel al HTML de referencia */}
              <View
                style={[
                  styles.swatchBox,
                  {
                    backgroundColor: item.meta.swatchBg,
                    borderColor: item.meta.swatchBorder,
                    borderWidth: item.id === 'ilustrada' ? 2 : 1.5,
                  },
                  swatchWebStyle,
                ]}
              >
                <Typography variant="callout" style={styles.swatchEmoji}>
                  {item.meta.emoji}
                </Typography>
                <View style={styles.swatchDotsRow}>
                  {item.meta.swatchDots.map((dotHex, i) => (
                    <View
                      key={i}
                      style={[
                        styles.swatchDot,
                        {
                          backgroundColor: dotHex,
                          borderColor: item.meta.swatchDotBorder || 'transparent',
                          borderWidth: item.meta.swatchDotBorder ? 1 : 0,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Texto del estilo */}
              <View style={styles.optionInfo}>
                <Typography
                  variant="bodyMedium"
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: '700',
                    fontSize: 14,
                    color: colors.textPrimary,
                  }}
                >
                  {item.meta.shortName}
                </Typography>
                <Typography
                  variant="caption"
                  color="secondary"
                  numberOfLines={2}
                  style={styles.optionSubtitle}
                >
                  {item.meta.subtitle}
                </Typography>
              </View>

              {/* Indicador activo */}
              <View
                style={[
                  styles.checkCircle,
                  {
                    backgroundColor: isActive ? colors.pillActiveBg : 'transparent',
                    borderColor: isActive ? theme.meta.activeOptionBorder : colors.subcardBorder,
                  },
                ]}
              >
                {isActive && <Check size={14} color={colors.pillActiveText} strokeWidth={3} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBody: {
    gap: spacing.sm,
  },
  helperText: {
    lineHeight: 17,
  },
  optionsList: {
    gap: spacing.sm,
    marginTop: 2,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
  },
  swatchBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  swatchEmoji: {
    fontSize: 16,
    lineHeight: 18,
  },
  swatchDotsRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 3,
  },
  swatchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
  },
  optionSubtitle: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
