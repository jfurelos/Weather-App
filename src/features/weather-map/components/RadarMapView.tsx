import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Maximize2 } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { getLeafletMapHtml } from '../webview/leafletMapHtml';
import { useWeatherMapStore } from '../store/useWeatherMapStore';

export const RadarMapView: React.FC = () => {
  const { themeId, theme, colors } = useThemeStore();
  const { setFullScreenModalVisible } = useWeatherMapStore();
  const htmlContent = getLeafletMapHtml(theme);

  return (
    <Card
      showWindowDots
      windowTitle="Radar de Precipitaciones"
      windowRight={<Badge label="En vivo" tone="rain" />}
      contentStyle={styles.cardBody}
    >
      <Typography variant="caption" color="secondary">
        Satélite y lluvia en tiempo real sobre España
      </Typography>

      <View
        style={[
          styles.mapContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.subcardBorder,
            borderWidth: theme.metrics.subcardBorderWidth,
            borderRadius: theme.metrics.subcardRadius - 2,
          },
        ]}
      >
        {Platform.OS === 'web' ? (
          React.createElement('iframe', {
            key: `radar-${themeId}`,
            srcDoc: htmlContent,
            style: {
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: theme.metrics.subcardRadius - 4,
            },
            title: 'Radar Map Web',
          })
        ) : (
          <WebView
            key={`radar-native-${themeId}`}
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
            backgroundColor: colors.accent,
            borderColor: 'rgba(84, 11, 14, 0.14)',
            borderWidth: 1,
          },
          theme.shadows.subcard,
        ]}
        onPress={() => setFullScreenModalVisible(true)}
      >
        <Maximize2 size={16} color={colors.onAccent} />
        <Typography variant="bodyMedium" style={{ color: colors.onAccent }}>
          Ver radar a pantalla completa
        </Typography>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardBody: {
    gap: spacing.sm,
  },
  mapContainer: {
    height: 240,
    overflow: 'hidden',
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
    borderRadius: spacing.borderRadiusFull,
    marginTop: 2,
  },
});
