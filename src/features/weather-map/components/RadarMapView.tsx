import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Maximize2 } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { getLeafletMapHtml } from '../webview/leafletMapHtml';
import { useWeatherMapStore } from '../store/useWeatherMapStore';

export const RadarMapView: React.FC = () => {
  const { colors, mode } = useThemeStore();
  const { setFullScreenModalVisible } = useWeatherMapStore();
  const htmlContent = getLeafletMapHtml(mode);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Typography variant="h3">Radar de Precipitaciones</Typography>
          <Typography variant="caption" color="secondary">
            Satélite y lluvia en tiempo real
          </Typography>
        </View>
      </View>

      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {Platform.OS === 'web' ? (
          React.createElement('iframe', {
            srcDoc: htmlContent,
            style: {
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: spacing.borderRadiusMd,
            },
            title: 'Radar Map Web',
          })
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webView}
            scrollEnabled={false}
          />
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.expandButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setFullScreenModalVisible(true)}
      >
        <Maximize2 size={16} color={colors.textPrimary} />
        <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
          Ver radar a pantalla completa
        </Typography>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    gap: 2,
  },
  mapContainer: {
    height: 240,
    borderRadius: spacing.borderRadiusMd,
    overflow: 'hidden',
    borderWidth: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
});
