import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Switch } from 'react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';

export const ProfileScreen: React.FC = () => {
  const { colors, mode, toggleTheme } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="caption" color="secondary">
            AJUSTES Y PRIVACIDAD
          </Typography>
          <Typography variant="hero" style={styles.title}>
            Perfil
          </Typography>
        </View>

        {/* Tarjeta de Usuario estilo Airbnb */}
        <Card style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
              <Typography variant="h2" color="brand">
                U
              </Typography>
            </View>
            <View style={{ flex: 1 }}>
              <Typography variant="h2">Usuario Invitado</Typography>
              <Typography variant="caption" color="secondary">
                Provincia: Madrid • Visible en foro
              </Typography>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.privacyRow}>
            <Typography variant="caption" color="secondary">
              Email y contraseña protegidos (100% privados).
            </Typography>
          </View>
          <Button
            title="Editar Datos"
            variant="outline"
            style={{ marginTop: spacing.xs }}
            onPress={() => console.log('Editar perfil')}
          />
        </Card>

        {/* Ajustes de Tema: Claro / Oscuro */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <View>
              <Typography variant="h3">Modo Oscuro</Typography>
              <Typography variant="caption" color="secondary">
                {mode === 'dark' ? 'Activado' : 'Desactivado'}
              </Typography>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Ubicaciones fijas para alertas */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <Typography variant="h3">Ubicaciones fijas</Typography>
            <Badge label="2 registradas" tone="neutral" />
          </View>
          <Typography variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
            Recibe notificaciones automáticas ante temporales de lluvia, viento o calor extremo.
          </Typography>
        </Card>

        {/* Sonidos de alertas */}
        <Card style={styles.settingCard}>
          <Typography variant="h3">Sonidos de Alertas (ES-Alert)</Typography>
          <Typography variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
            Tonos diferenciados para lluvia torrencial, vendaval y olas de calor.
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
  userCard: {
    gap: spacing.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: spacing.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyRow: {
    paddingVertical: spacing.xs,
  },
  settingCard: {
    gap: spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginVertical: spacing.xs,
  },
});
