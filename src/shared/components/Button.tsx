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
import { FONT_BODY_BOLD } from '../theme/typography';
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
  const { colors } = useThemeStore();

  const getBackgroundColor = () => {
    if (disabled) return colors.pillBg;
    switch (variant) {
      case 'primary':
        return colors.primary; // #9E2A2B
      case 'secondary':
        return colors.accent; // #E09F3E
      case 'outline':
        return colors.inputBg; // #FFFFFF limpio con borde #335C67
      case 'ghost':
        return 'transparent';
    }
  };

  const getBorderColor = () => {
    if (disabled) return colors.subcardBorder;
    switch (variant) {
      case 'primary':
        return colors.primaryDark; // #540B0E
      case 'secondary':
        return 'rgba(84, 11, 14, 0.16)';
      case 'outline':
        return colors.borderStrong; // #335C67
      case 'ghost':
        return 'transparent';
    }
  };

  const getBorderWidth = () => {
    if (variant === 'ghost') return 0;
    if (variant === 'outline') return 1.5;
    return 1;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary':
        return colors.onPrimary; // #FFFFFF
      case 'secondary':
        return colors.onAccent; // #540B0E
      case 'outline':
      case 'ghost':
        return colors.textPrimary; // #335C67
    }
  };

  const getShadowStyle = (): ViewStyle | undefined => {
    if (disabled || variant === 'ghost' || variant === 'outline') return undefined;
    if (variant === 'primary') {
      return Platform.select({
        web: { boxShadow: '0 4px 12px rgba(84, 11, 14, 0.24)' } as unknown as ViewStyle,
        ios: {
          shadowColor: '#540B0E',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.22,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
        default: {},
      });
    }
    return Platform.select({
      web: { boxShadow: '0 3px 10px rgba(224, 159, 62, 0.26)' } as unknown as ViewStyle,
      ios: {
        shadowColor: '#E09F3E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.84}
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
          color={getTextColor()}
        />
      ) : (
        <Typography
          variant="bodyMedium"
          style={{
            color: getTextColor(),
            fontFamily: FONT_BODY_BOLD,
            fontWeight: '700',
            fontSize: 14.5,
            letterSpacing: 0.15,
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
    height: 50,
    borderRadius: spacing.borderRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
