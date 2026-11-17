import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { spacing } from '../theme/spacing';
import { Typography } from './Typography';

export type BadgeTone = 'neutral' | 'brand' | 'warning' | 'rain' | 'heat' | 'wind';

interface BadgeProps extends ViewProps {
  label: string;
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'neutral',
  style,
  ...rest
}) => {
  const { colors } = useThemeStore();

  const getColors = () => {
    switch (tone) {
      case 'brand':
        return { bg: colors.primaryMuted, text: colors.primary };
      case 'warning':
        return { bg: colors.surface, text: colors.warning };
      case 'rain':
        return { bg: colors.surface, text: colors.rain };
      case 'heat':
        return { bg: colors.surface, text: colors.heat };
      case 'wind':
        return { bg: colors.surface, text: colors.wind };
      case 'neutral':
      default:
        return { bg: colors.surface, text: colors.textSecondary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: colors.border,
        },
        style,
      ]}
      {...rest}
    >
      <Typography
        variant="captionMedium"
        style={{ color: text }}
      >
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
