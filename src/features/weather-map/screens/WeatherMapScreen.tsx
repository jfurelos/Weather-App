import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';

export const WeatherMapScreen: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="caption" color="secondary">
            PARTES Y RADAR
          </Typography>
          <Typography variant="hero" style={styles.title}>
            Noticias & Mapa
          </Typography>
        </View>

        {/* Visor de Mapa / Radar Container Placeholder */}
        <Card style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <View>
              <Typography variant="h3">Radar Peninsular</Typography>
              <Typography variant="caption" color="secondary">
                Lluvia y nubosidad en tiempo real
              </Typography>
            </View>
            <Badge label="En directo" tone="rain" />
          </View>

          {/* Placeholder para el WebView de Leaflet */}
          <View style={[styles.mapPlaceholder, { backgroundColor: colors.surface }]}>
            <Typography variant="callout" color="secondary" style={{ textAlign: 'center' }}>
              🗺️ Visor Leaflet.js / RainViewer (Se activará en Fase 4)
            </Typography>
          </View>

          <Button
            title="Ver a Pantalla Completa"
            variant="outline"
            style={{ marginTop: spacing.sm }}
            onPress={() => console.log('Fullscreen map')}
          />
        </Card>

        {/* Feed de noticias oficiales */}
        <View style={styles.sectionHeader}>
          <Typography variant="h2">Boletines Oficiales</Typography>
        </View>

        <Card>
          <Badge label="AEMET" tone="neutral" style={{ marginBottom: spacing.xs }} />
          <Typography variant="h3" style={{ marginBottom: spacing.xs }}>
            Boletín general de la Península y Baleares
          </Typography>
          <Typography variant="body" color="secondary">
            Bajas presiones atlánticas aproximándose por el oeste peninsular. Vientos del suroeste moderados a fuertes en litorales gallegos.
          </Typography>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.base,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
  },
  mapCard: {
    gap: spacing.sm,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapPlaceholder: {
    height: 220,
    borderRadius: spacing.borderRadiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  sectionHeader: {
    marginTop: spacing.sm,
  },
});
