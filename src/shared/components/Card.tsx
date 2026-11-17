import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { spacing } from '../theme/spacing';

interface CardProps extends ViewProps {
  elevated?: boolean;
  outlined?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  elevated = true,
  outlined = true,
  style,
  children,
  ...rest
}) => {
  const { colors, mode } = useThemeStore();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          borderColor: outlined ? colors.border : 'transparent',
          borderWidth: outlined ? 1 : 0,
        },
        elevated && (mode === 'light' ? styles.lightShadow : styles.darkShadow),
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.base,
  },
  lightShadow: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  darkShadow: Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
});
