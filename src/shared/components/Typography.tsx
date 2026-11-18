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

export type TypographyColor = 'primary' | 'secondary' | 'muted' | 'brand' | 'onPrimary';

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
    onPrimary: colors.onPrimary,
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
