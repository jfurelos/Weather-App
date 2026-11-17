import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, Switch, TouchableOpacity } from 'react-native';
import {
  MapPin,
  CloudRain,
  Wind,
  Sun,
  ChevronRight,
  Bell,
  Volume2,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';

export const ProfileScreen: React.FC = () => {
  const { colors, mode, toggleTheme } = useThemeStore();

  // Estado interactivo de alertas personalizadas
  const [notifyRain, setNotifyRain] = useState(true);
  const [notifyWind, setNotifyWind] = useState(true);
  const [notifyHeat, setNotifyHeat] = useState(false);

  // Ubicación fija única
  const [fixedLocation, setFixedLocation] = useState({
    name: 'Madrid',
    province: 'Madrid',
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="caption" color="secondary">
            AJUSTES Y PREFERENCIAS
          </Typography>
          <Typography variant="hero" style={styles.title}>
            Perfil
          </Typography>
        </View>

        {/* 1. Tarjeta de Usuario */}
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
                Provincia: {fixedLocation.province} • Visible en foro
              </Typography>
            </View>
          </View>
          <Button
            title="Editar Datos"
            variant="outline"
            style={{ marginTop: spacing.sm }}
            onPress={() => console.log('Editar perfil')}
          />
        </Card>

        {/* 2. Ajuste de Tema: Claro / Oscuro */}
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

        {/* 3. Ubicación Fija Única para Alertas */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <View style={styles.tagWrapper}>
              <MapPin size={16} color={colors.primary} />
              <Typography variant="h3">Ubicación Fija</Typography>
            </View>
            <Badge label="Activa" tone="brand" />
          </View>

          <Typography variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
            Recibes alertas meteorológicas en tu zona asignada.
          </Typography>

          <View style={[styles.locationBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                {fixedLocation.name}
              </Typography>
              <Typography variant="caption" color="secondary">
                Provincia de {fixedLocation.province}
              </Typography>
            </View>

            <TouchableOpacity
              style={styles.changeLocationButton}
              activeOpacity={0.7}
              onPress={() => console.log('Modificar ubicación')}
            >
              <Typography variant="captionMedium" color="brand">
                Modificar
              </Typography>
              <ChevronRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* 4. Configuración de Alertas y Sonidos */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <View style={styles.tagWrapper}>
              <Bell size={16} color={colors.warning} />
              <Typography variant="h3">Alertas y Notificaciones</Typography>
            </View>
          </View>
          <Typography variant="caption" color="secondary" style={{ marginTop: spacing.xs, marginBottom: spacing.sm }}>
            Configura qué tipos de temporal deseas recibir y sus tonos asociados.
          </Typography>

          {/* Toggle Lluvia */}
          <View style={styles.alertOptionRow}>
            <View style={styles.alertInfo}>
              <CloudRain size={18} color={colors.rain} />
              <View>
                <Typography variant="bodyMedium">Lluvia torrencial</Typography>
                <Typography variant="caption" color="secondary">
                  Aviso amarillo o superior
                </Typography>
              </View>
            </View>
            <Switch
              value={notifyRain}
              onValueChange={setNotifyRain}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Toggle Viento */}
          <View style={styles.alertOptionRow}>
            <View style={styles.alertInfo}>
              <Wind size={18} color={colors.wind} />
              <View>
                <Typography variant="bodyMedium">Viento y temporales</Typography>
                <Typography variant="caption" color="secondary">
                  Rachas superiores a 50 km/h
                </Typography>
              </View>
            </View>
            <Switch
              value={notifyWind}
              onValueChange={setNotifyWind}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Toggle Calor */}
          <View style={styles.alertOptionRow}>
            <View style={styles.alertInfo}>
              <Sun size={18} color={colors.heat} />
              <View>
                <Typography variant="bodyMedium">Calor extremo</Typography>
                <Typography variant="caption" color="secondary">
                  Temperaturas sobre 36°C
                </Typography>
              </View>
            </View>
            <Switch
              value={notifyHeat}
              onValueChange={setNotifyHeat}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Tonos de Sonido */}
          <TouchableOpacity
            style={styles.soundRow}
            activeOpacity={0.7}
            onPress={() => console.log('Sonidos')}
          >
            <View style={styles.alertInfo}>
              <Volume2 size={18} color={colors.textSecondary} />
              <View>
                <Typography variant="bodyMedium">Tonos de Alerta</Typography>
                <Typography variant="caption" color="secondary">
                  Tonos diferenciados por tipo de aviso
                </Typography>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
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
    paddingBottom: spacing.xxxl,
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
    width: 56,
    height: 56,
    borderRadius: spacing.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingCard: {
    gap: spacing.xs,
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  changeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  alertOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
});
