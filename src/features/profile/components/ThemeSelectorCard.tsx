import React from 'react';
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Moon, Sun, Check } from 'lucide-react-native';
import { Card } from '@/shared/components/Card';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { THEME_LIST } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { FONT_DISPLAY_SEMIBOLD } from '@/shared/theme/typography';

export const ThemeSelectorCard: React.FC = () => {
  const { mode, isDark, colors, setMode, toggleTheme } = useThemeStore();

  return (
    <Card
      windowTitle="Apariencia"
      windowRight={
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: 'rgba(51, 92, 103, 0.25)', true: colors.borderStrong }}
          thumbColor={isDark ? colors.accent : '#FFFFFF'}
          accessibilityLabel="Alternar entre modo oscuro y modo claro"
        />
      }
      contentStyle={styles.cardBody}
    >
      <View style={styles.optionsRow}>
        {THEME_LIST.map((item) => {
          const isActive = item.id === mode;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.82}
              onPress={() => setMode(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel={item.meta.name}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: isActive ? colors.inputBg : colors.surface,
                  borderColor: isActive ? colors.primary : colors.subcardBorder,
                  borderWidth: isActive ? 2 : 1,
                },
              ]}
            >
              {/* Vista previa de la paleta oficial */}
              <View
                style={[
                  styles.previewStrip,
                  {
                    backgroundColor: item.meta.swatchBg,
                    borderColor: colors.subcardBorder,
                  },
                ]}
              >
                <View style={[styles.previewCard, { backgroundColor: item.meta.swatchCard }]} />
                <View style={styles.previewDots}>
                  <View style={[styles.previewDot, { backgroundColor: item.meta.swatchAccent }]} />
                  <View style={[styles.previewDot, { backgroundColor: item.meta.swatchPrimary }]} />
                </View>
              </View>

              <View style={styles.optionHeader}>
                <View style={styles.optionLabelRow}>
                  {item.isDark ? (
                    <Moon size={15} color={colors.textPrimary} />
                  ) : (
                    <Sun size={15} color={colors.accent} />
                  )}
                  <Typography
                    variant="bodyMedium"
                    style={{
                      fontFamily: FONT_DISPLAY_SEMIBOLD,
                      fontWeight: '600',
                      fontSize: 15,
                      color: colors.textPrimary,
                    }}
                  >
                    {item.meta.shortName}
                  </Typography>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                      borderColor: isActive ? colors.primary : colors.subcardBorder,
                    },
                  ]}
                >
                  {isActive && <Check size={12} color={colors.onPrimary} strokeWidth={3} />}
                </View>
              </View>

              <Typography variant="caption" color="secondary" numberOfLines={2} style={styles.optionSubtitle}>
                {item.meta.subtitle}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBody: {
    gap: spacing.md,
  },
  helperText: {
    lineHeight: 18,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  optionBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    gap: spacing.sm,
  },
  previewStrip: {
    height: 44,
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 1,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  previewCard: {
    flex: 1,
    height: '100%',
    borderRadius: 6,
  },
  previewDots: {
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSubtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
});
