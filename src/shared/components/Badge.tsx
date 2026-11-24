import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { spacing } from '../theme/spacing';
import { FONT_BODY_BOLD } from '../theme/typography';
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
        return {
          bg: colors.borderStrong, // #335C67
          text: '#FFF3B0',
          border: 'transparent',
        };
      case 'warning':
      case 'heat':
        return {
          bg: colors.accent, // #E09F3E
          text: colors.onAccent, // #540B0E (contraste 6.48:1)
          border: 'rgba(84, 11, 14, 0.14)',
        };
      case 'rain':
        return {
          bg: colors.primary, // #9E2A2B (alertas lluvia/incidencias)
          text: colors.onPrimary, // #FFFFFF (contraste 7.45:1)
          border: 'transparent',
        };
      case 'wind':
        return {
          bg: 'rgba(51, 92, 103, 0.12)',
          text: colors.textPrimary, // #335C67
          border: 'rgba(51, 92, 103, 0.25)',
        };
      case 'neutral':
      default:
        return {
          bg: colors.pillBg,
          text: colors.textPrimary, // #335C67
          border: colors.subcardBorder,
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
          borderWidth: 1,
        },
        style,
      ]}
      {...rest}
    >
      <Typography
        variant="captionMedium"
        style={{
          color: text,
          fontFamily: FONT_BODY_BOLD,
          fontWeight: '700',
          fontSize: 11,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm + 3,
    paddingVertical: 4,
    borderRadius: spacing.borderRadiusFull,
    alignSelf: 'flex-start',
  },
});
