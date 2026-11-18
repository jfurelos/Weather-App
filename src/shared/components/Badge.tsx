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
  const { themeId, isDark, colors } = useThemeStore();

  const getColors = () => {
    switch (tone) {
      case 'brand':
        return isDark
          ? { bg: colors.sky, text: '#1E2733', border: colors.border }
          : { bg: colors.sky, text: '#28323E', border: themeId === 'ilustrada' ? '#28323E' : colors.subcardBorder };
      case 'warning':
        return {
          bg: colors.gold,
          text: '#28323E',
          border: themeId === 'ilustrada' ? '#28323E' : 'transparent',
        };
      case 'rain':
        return {
          bg: colors.turquoise,
          text: '#FFFFFF',
          border: themeId === 'ilustrada' ? '#28323E' : 'transparent',
        };
      case 'heat':
        return {
          bg: colors.plum,
          text: isDark ? '#1E2733' : '#FFFFFF',
          border: themeId === 'ilustrada' ? '#28323E' : 'transparent',
        };
      case 'wind':
        return {
          bg: colors.primaryMuted,
          text: isDark ? colors.sky : colors.textPrimary,
          border: themeId === 'ilustrada' ? '#28323E' : colors.subcardBorder,
        };
      case 'neutral':
      default:
        return {
          bg: colors.pillBg,
          text: colors.textSecondary,
          border: themeId === 'ilustrada' ? '#28323E' : colors.subcardBorder,
        };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: themeId === 'ilustrada' ? 1.5 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Typography
        variant="captionMedium"
        style={{ color: text, fontWeight: '800', fontSize: 11 }}
      >
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: spacing.borderRadiusFull,
    alignSelf: 'flex-start',
  },
});
