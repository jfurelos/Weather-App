import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { spacing } from '../theme/spacing';
import { Typography } from './Typography';

interface CardProps extends ViewProps {
  elevated?: boolean;
  outlined?: boolean;
  variant?: 'window' | 'subcard' | 'highlight';
  windowTitle?: string;
  windowRight?: React.ReactNode;
  showWindowDots?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  elevated = true,
  outlined = true,
  variant = 'window',
  windowTitle,
  windowRight,
  showWindowDots: _showWindowDots = false,
  contentStyle,
  style,
  children,
  ...rest
}) => {
  const { theme, colors } = useThemeStore();
  const isSubcard = variant === 'subcard';
  const isHighlight = variant === 'highlight';
  const hasHeader = Boolean(windowTitle || windowRight);

  const backgroundColor = isSubcard
    ? colors.surface
    : isHighlight
      ? colors.cardHighlight
      : colors.card;

  const borderRadius = isSubcard ? theme.metrics.subcardRadius : theme.metrics.windowRadius;
  const borderWidth = outlined
    ? isSubcard
      ? theme.metrics.subcardBorderWidth
      : theme.metrics.windowBorderWidth
    : 0;
  const borderColor = outlined
    ? isSubcard
      ? colors.subcardBorder
      : colors.border
    : 'transparent';

  const shadowStyle = elevated
    ? isSubcard
      ? theme.shadows.subcard
      : theme.shadows.window
    : undefined;

  if (hasHeader) {
    return (
      <View
        style={[
          styles.editorialFrame,
          {
            backgroundColor,
            borderColor,
            borderWidth,
            borderRadius,
          },
          shadowStyle,
          style,
        ]}
        {...rest}
      >
        <View
          style={[
            styles.editorialHeader,
            {
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <View style={styles.headerLeft}>
            {windowTitle ? (
              <Typography variant="h3" numberOfLines={1} style={styles.headerTitle}>
                {windowTitle}
              </Typography>
            ) : null}
          </View>
          {windowRight ? <View style={styles.headerRight}>{windowRight}</View> : null}
        </View>
        <View style={[styles.editorialBody, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        isSubcard ? styles.subcardBase : styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth,
          borderRadius,
        },
        shadowStyle,
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
    padding: spacing.lg,
  },
  subcardBase: {
    padding: spacing.md,
  },
  editorialFrame: {
    padding: 0,
    overflow: 'hidden',
  },
  editorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerRight: {
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 16,
    flexShrink: 1,
  },
  editorialBody: {
    padding: spacing.lg,
  },
});
