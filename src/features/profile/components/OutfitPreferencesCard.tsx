import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Thermometer, Shirt, Check } from 'lucide-react-native';
import { Card } from '@/shared/components/Card';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import {
  OUTFIT_STYLE_OPTIONS,
  THERMAL_SENSITIVITY_OPTIONS,
} from '../data/outfitPreferences';
import { useProfileStore } from '../store/useProfileStore';

export const OutfitPreferencesCard: React.FC = () => {
  const { isDark, colors } = useThemeStore();
  const outfitPreferences = useProfileStore((s) => s.outfitPreferences);
  const updateOutfitPreferences = useProfileStore((s) => s.updateOutfitPreferences);

  return (
    <Card
      windowTitle="Preferencias de Vestimenta"
      contentStyle={styles.cardBody}
    >
      {/* 1. Sensibilidad térmica */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Thermometer size={14} color={colors.accent} />
          <Typography variant="captionMedium" color="secondary">
            SENSIBILIDAD TÉRMICA
          </Typography>
        </View>

        <View style={styles.thermalGrid}>
          {THERMAL_SENSITIVITY_OPTIONS.map((opt) => {
            const isSelected = outfitPreferences.thermalSensitivity === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => updateOutfitPreferences({ thermalSensitivity: opt.id })}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                style={[
                  styles.thermalOption,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                        ? colors.surface
                        : colors.inputBg,
                    borderColor: isSelected ? colors.primaryDark : colors.subcardBorder,
                  },
                ]}
              >
                <Typography
                  variant="captionMedium"
                  numberOfLines={1}
                  style={{
                    color: isSelected ? colors.onPrimary : colors.textPrimary,
                    fontSize: 12,
                  }}
                >
                  {opt.label}
                </Typography>
                <Typography
                  variant="caption"
                  style={{
                    color: isSelected ? '#FFF3B0' : colors.textSecondary,
                    fontSize: 10.5,
                  }}
                >
                  {opt.shortDelta}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Estilo personal */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Shirt size={14} color={colors.primary} />
          <Typography variant="captionMedium" color="secondary">
            ESTILO PERSONAL
          </Typography>
        </View>

        <View style={styles.stylesList}>
          {OUTFIT_STYLE_OPTIONS.map((opt) => {
            const isSelected = outfitPreferences.style === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.8}
                onPress={() => updateOutfitPreferences({ style: opt.id })}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                style={[
                  styles.styleRow,
                  {
                    backgroundColor: isSelected
                      ? colors.inputBg
                      : isDark
                        ? colors.surface
                        : colors.inputBg,
                    borderColor: isSelected ? colors.primary : colors.subcardBorder,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Typography variant="bodyMedium" style={{ fontSize: 13.5 }}>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" color="secondary" style={{ fontSize: 11 }}>
                    {opt.tagline}
                  </Typography>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    {
                      backgroundColor: isSelected ? colors.accent : 'transparent',
                      borderColor: isSelected ? 'rgba(84,11,14,0.18)' : colors.subcardBorder,
                    },
                  ]}
                >
                  {isSelected && <Check size={12} color={colors.onAccent} strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
  section: {
    gap: spacing.xs + 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  thermalGrid: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  thermalOption: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stylesList: {
    gap: spacing.xs + 2,
  },
  styleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: spacing.borderRadiusMd,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
