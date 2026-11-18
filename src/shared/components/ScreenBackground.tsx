import React from 'react';
import { SafeAreaView, ViewStyle, StyleProp, StyleSheet, Platform } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children, style }) => {
  const { theme, colors } = useThemeStore();

  const webPatternStyle =
    Platform.OS === 'web'
      ? ({
          backgroundImage: theme.webPattern.backgroundImage,
          backgroundSize: theme.webPattern.backgroundSize,
        } as unknown as ViewStyle)
      : undefined;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
        webPatternStyle,
        style,
      ]}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
