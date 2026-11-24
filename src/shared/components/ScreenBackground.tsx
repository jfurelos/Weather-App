import React from 'react';
import { SafeAreaView, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children, style }) => {
  const { colors } = useThemeStore();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
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
