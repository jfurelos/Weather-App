import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { getLeafletMapHtml } from '../webview/leafletMapHtml';
import { useWeatherMapStore } from '../store/useWeatherMapStore';

export const FullScreenMapModal: React.FC = () => {
  const { themeId, theme, colors } = useThemeStore();
  const { isFullScreenModalVisible, setFullScreenModalVisible } = useWeatherMapStore();
  const htmlContent = getLeafletMapHtml(theme);

  return (
    <Modal
      visible={isFullScreenModalVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setFullScreenModalVisible(false)}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Mapa Leaflet Fullscreen */}
        <View style={styles.mapContainer}>
          {Platform.OS === 'web' ? (
            React.createElement('iframe', {
              key: `radar-full-${themeId}`,
              srcDoc: htmlContent,
              style: {
                width: '100%',
                height: '100%',
                border: 'none',
              },
              title: 'Radar Map Fullscreen',
            })
          ) : (
            <WebView
              key={`radar-full-native-${themeId}`}
              originWhitelist={['*']}
              source={{ html: htmlContent }}
              style={styles.webView}
            />
          )}
        </View>

        {/* Floating Top Bar */}
        <SafeAreaView style={styles.topBarContainer}>
          <View
            style={[
              styles.floatingHeader,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: theme.metrics.windowBorderWidth,
                borderRadius: theme.metrics.windowRadius,
              },
              theme.shadows.window,
              getGlassStyle(theme),
            ]}
          >
            <View style={styles.headerInfo}>
              <Typography variant="h3">Radar Meteorológico</Typography>
              <Typography variant="caption" color="secondary">
                Precipitaciones sobre España
              </Typography>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.pillBg,
                  borderColor: colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                },
              ]}
              onPress={() => setFullScreenModalVisible(false)}
            >
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBarContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 16 : 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: spacing.lg,
  },
  floatingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    marginTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  headerInfo: {
    gap: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
