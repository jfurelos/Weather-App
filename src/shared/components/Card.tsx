import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { spacing } from '../theme/spacing';
import { getGlassStyle } from '../theme/themes';
import { Typography } from './Typography';

interface CardProps extends ViewProps {
  elevated?: boolean;
  outlined?: boolean;
  variant?: 'window' | 'subcard';
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
  showWindowDots = false,
  contentStyle,
  style,
  children,
  ...rest
}) => {
  const { theme, colors } = useThemeStore();
  const isSubcard = variant === 'subcard';
  const hasTitleBar = Boolean(windowTitle || windowRight || showWindowDots);

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

  const glassStyle = !isSubcard ? getGlassStyle(theme) : undefined;

  if (hasTitleBar) {
    return (
      <View
        style={[
          styles.windowFrame,
          {
            backgroundColor: isSubcard ? colors.surface : colors.card,
            borderColor,
            borderWidth,
            borderRadius,
          },
          shadowStyle,
          glassStyle,
          style,
        ]}
        {...rest}
      >
        <View
          style={[
            styles.titleBar,
            {
              backgroundColor: colors.headerBg,
              borderBottomColor: colors.border,
              borderBottomWidth: theme.metrics.windowBorderWidth,
              borderTopLeftRadius: Math.max(0, borderRadius - borderWidth),
              borderTopRightRadius: Math.max(0, borderRadius - borderWidth),
            },
          ]}
        >
          <View style={styles.titleLeft}>
            {showWindowDots && (
              <View style={styles.dotsRow}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colors.gold, borderColor: 'rgba(40,50,62,0.35)' },
                  ]}
                />
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colors.turquoise, borderColor: 'rgba(40,50,62,0.35)' },
                  ]}
                />
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colors.sky, borderColor: 'rgba(40,50,62,0.35)' },
                  ]}
                />
              </View>
            )}
            {windowTitle ? (
              <Typography variant="h3" numberOfLines={1} style={styles.titleText}>
                {windowTitle}
              </Typography>
            ) : null}
          </View>
          {windowRight ? <View style={styles.titleRight}>{windowRight}</View> : null}
        </View>
        <View style={[styles.windowBody, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View
      style={[
        isSubcard ? styles.subcardBase : styles.base,
        {
          backgroundColor: isSubcard ? colors.surface : colors.card,
          borderColor,
          borderWidth,
          borderRadius,
        },
        shadowStyle,
        glassStyle,
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
    padding: spacing.base,
  },
  subcardBase: {
    padding: spacing.md,
  },
  windowFrame: {
    padding: 0,
    overflow: 'hidden',
  },
  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  titleRight: {
    flexShrink: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
  },
  titleText: {
    fontSize: 15,
    flexShrink: 1,
  },
  windowBody: {
    padding: spacing.base,
  },
});
