import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { spacing } from '../theme/spacing';
import { DISPLAY_FONT } from '../theme/typography';
import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  style,
  disabled,
  ...rest
}) => {
  const { themeId, theme, colors } = useThemeStore();

  const getBackgroundColor = () => {
    if (disabled) return colors.pillBg;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.pillBg;
      case 'outline':
        return colors.card;
      case 'ghost':
        return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.subcardBorder;
    if (variant === 'primary') {
      if (themeId === 'ilustrada') return '#28323E';
      if (themeId === 'acuarela') return 'rgba(255, 255, 255, 0.7)';
      return 'transparent';
    }
    if (variant === 'outline' || variant === 'secondary') {
      return colors.borderStrong;
    }
    return 'transparent';
  };

  const getBorderWidth = () => {
    if (variant === 'ghost') return 0;
    if (variant === 'primary') {
      if (themeId === 'ilustrada') return 2;
      if (themeId === 'acuarela') return 1.5;
      return 0;
    }
    return themeId === 'ilustrada' ? 2 : 1.5;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.onPrimary;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return colors.textPrimary;
    }
  };

  const getShadowStyle = (): ViewStyle | undefined => {
    if (disabled || variant === 'ghost') return undefined;
    if (variant === 'primary') {
      if (themeId === 'ilustrada') {
        return Platform.OS === 'web'
          ? ({ boxShadow: '3px 3px 0px #28323E' } as unknown as ViewStyle)
          : {
              shadowColor: '#28323E',
              shadowOffset: { width: 3, height: 3 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 3,
            };
      }
      if (themeId === 'papercut') {
        return Platform.OS === 'web'
          ? ({ boxShadow: '0 4px 0px #362A30' } as unknown as ViewStyle)
          : {
              shadowColor: '#362A30',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.7,
              shadowRadius: 0,
              elevation: 3,
            };
      }
      return theme.shadows.pillActive;
    }
    return undefined;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
        },
        getShadowStyle(),
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.onPrimary : colors.primary}
        />
      ) : (
        <Typography
          variant="bodyMedium"
          style={{
            color: getTextColor(),
            fontFamily: DISPLAY_FONT,
            fontWeight: '600',
            fontSize: 15,
          }}
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: spacing.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
