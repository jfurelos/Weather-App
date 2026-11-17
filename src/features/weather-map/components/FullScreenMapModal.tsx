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
import { X, Radio } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { getLeafletMapHtml } from '../webview/leafletMapHtml';
import { useWeatherMapStore } from '../store/useWeatherMapStore';

export const FullScreenMapModal: React.FC = () => {
  const { colors, mode } = useThemeStore();
  const { isFullScreenModalVisible, setFullScreenModalVisible } = useWeatherMapStore();
  const htmlContent = getLeafletMapHtml(mode);

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
              },
            ]}
          >
            <View style={styles.headerInfo}>
              <View style={styles.liveIndicator}>
                <View style={styles.pulsingDot} />
                <Typography variant="caption" style={{ fontWeight: '700', color: '#008489' }}>
                  EN DIRECTO
                </Typography>
              </View>
              <Typography variant="h3">Radar Meteorológico</Typography>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
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
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#008489',
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
