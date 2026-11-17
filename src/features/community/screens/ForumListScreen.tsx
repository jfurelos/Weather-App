import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';

const CATEGORIES_DEMO = [
  { id: '1', name: 'Avisos y Temporales', desc: 'Seguimiento de tormentas, DANA y avisos oficiales', count: 48 },
  { id: '2', name: 'Previsión General', desc: 'Modelos meteorológicos y predicción a medio plazo', count: 120 },
  { id: '3', name: 'Nieve y Montaña', desc: 'Estado de puertos, espesores y cordilleras', count: 19 },
  { id: '4', name: 'Fotografía y Caza-Tormentas', desc: 'Capturas de rayos y fenómenos atmosféricos', count: 64 },
  { id: '5', name: 'Consultas Locales', desc: 'Preguntas sobre el tiempo en pueblos y comarcas', count: 85 },
];

export const ForumListScreen: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="caption" color="secondary">
            COMUNIDAD LOCAL
          </Typography>
          <Typography variant="hero" style={styles.title}>
            Foros
          </Typography>
        </View>

        <Typography variant="body" color="secondary" style={{ marginBottom: spacing.xs }}>
          Categorías oficiales para debatir, reportar incidencias y consultar previsiones en tu zona.
        </Typography>

        {CATEGORIES_DEMO.map((cat) => (
          <Card key={cat.id} style={styles.forumCard}>
            <View style={styles.rowBetween}>
              <Typography variant="h3">{cat.name}</Typography>
              <Badge label={`${cat.count} debates`} tone="neutral" />
            </View>
            <Typography variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
              {cat.desc}
            </Typography>
          </Card>
        ))}
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
  forumCard: {
    gap: spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
