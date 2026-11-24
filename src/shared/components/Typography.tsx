import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography } from '../theme/typography';
import { useThemeStore } from '../store/useThemeStore';

export type TypographyVariant =
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMedium'
  | 'callout'
  | 'caption'
  | 'captionMedium';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'brand'
  | 'accent'
  | 'emphasis'
  | 'onPrimary'
  | 'onAccent'
  | 'onBackground'
  | 'onBackgroundAccent'
  | 'onBackgroundSecondary';

interface Props extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  children: React.ReactNode;
}

export const Typography: React.FC<Props> = ({
  variant = 'body',
  color = 'primary',
  style,
  children,
  ...rest
}) => {
  const { colors } = useThemeStore();

  const colorStyle = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    brand: colors.primary,
    accent: colors.accent,
    emphasis: colors.primaryDark,
    onPrimary: colors.onPrimary,
    onAccent: colors.onAccent,
    onBackground: colors.onBackground,
    onBackgroundAccent: colors.onBackgroundAccent,
    onBackgroundSecondary: colors.onBackgroundSecondary,
  }[color];

  return (
    <Text
      style={[
        typography[variant],
        { color: colorStyle },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};
