import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Switch,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  MapPin,
  CloudRain,
  Wind,
  Sun,
  ChevronRight,
  Bell,
  Volume2,
  LogIn,
  LogOut,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { AlertCategory, useProfileStore } from '../store/useProfileStore';
import { getRainThresholdLabel, getToneLabel } from '../data/locationsData';
import { EditProfileModal } from '../components/EditProfileModal';
import { EditLocationModal } from '../components/EditLocationModal';
import { AlertSettingsModal } from '../components/AlertSettingsModal';
import { AuthModal } from '../components/AuthModal';

export const ProfileScreen: React.FC = () => {
  const { colors, mode, toggleTheme } = useThemeStore();
  const {
    profile,
    fixedLocation,
    alerts,
    hasHydrated,
    isLoadingAuth,
    authError,
    loadProfileState,
    updateProfile,
    updateFixedLocation,
    toggleAlert,
    setRainThreshold,
    setWindThreshold,
    setHeatThreshold,
    setAlertTone,
    signIn,
    signUp,
    signOut,
    clearAuthError,
  } = useProfileStore();

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alertModalTab, setAlertModalTab] = useState<AlertCategory>('rain');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      loadProfileState();
    }
  }, [hasHydrated, loadProfileState]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [profile.avatarUrl]);

  const openAlertSettingsOn = (tab: AlertCategory) => {
    setAlertModalTab(tab);
    setShowAlertSettings(true);
  };

  const initials = (profile.fullName.trim() || 'U').charAt(0).toUpperCase();
  const hasAvatarImage = Boolean(profile.avatarUrl && !avatarLoadError);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="hero" style={styles.title}>
            Perfil
          </Typography>
        </View>

        {/* 1. Tarjeta de Usuario */}
        <Card style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: profile.avatarColor || colors.primary },
              ]}
            >
              {hasAvatarImage ? (
                <Image
                  source={{ uri: profile.avatarUrl! }}
                  style={styles.avatarImage}
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <Typography variant="h2" style={{ color: '#FFFFFF' }}>
                  {initials}
                </Typography>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Typography variant="h2" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {profile.fullName}
                </Typography>
                {profile.isAuthenticated && (
                  <Badge label={`@${profile.username}`} tone="neutral" />
                )}
              </View>
              <Typography variant="caption" color="secondary">
                {profile.isAuthenticated
                  ? `Provincia: ${profile.province} • Visible en foro`
                  : `Provincia: ${profile.province} • Modo invitado (sin acceso a foros)`}
              </Typography>
            </View>
          </View>

          <View style={styles.userActionsRow}>
            <Button
              title="Editar Datos"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => setShowEditProfile(true)}
            />
            {profile.isAuthenticated ? (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={signOut}
                style={[
                  styles.authIconBtn,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                accessibilityLabel="Cerrar sesión"
              >
                <LogOut size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  clearAuthError();
                  setShowAuthModal(true);
                }}
                style={[
                  styles.authPillBtn,
                  { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                ]}
                accessibilityLabel="Iniciar sesión o crear cuenta"
              >
                <LogIn size={15} color={colors.primary} />
                <Typography variant="captionMedium" color="brand" style={{ fontWeight: '600' }}>
                  Acceder
                </Typography>
              </TouchableOpacity>
            )}
          </View>
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

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowEditLocation(true)}
            style={[
              styles.locationBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                {fixedLocation.name}
              </Typography>
              <Typography variant="caption" color="secondary">
                Provincia de {fixedLocation.province}
              </Typography>
            </View>

            <View style={styles.changeLocationButton}>
              <Typography variant="captionMedium" color="brand">
                Modificar
              </Typography>
              <ChevronRight size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* 4. Configuración de Alertas y Sonidos */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <View style={styles.tagWrapper}>
              <Bell size={16} color={colors.warning} />
              <Typography variant="h3">Alertas y Notificaciones</Typography>
            </View>
          </View>
          <Typography
            variant="caption"
            color="secondary"
            style={{ marginTop: spacing.xs, marginBottom: spacing.sm }}
          >
            Configura qué tipos de temporal deseas recibir, sus umbrales y tonos asociados.
          </Typography>

          {/* Toggle Lluvia */}
          <View style={styles.alertOptionRow}>
            <TouchableOpacity
              style={styles.alertInfo}
              activeOpacity={0.7}
              onPress={() => openAlertSettingsOn('rain')}
            >
              <CloudRain size={18} color={colors.rain} />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">Lluvia torrencial</Typography>
                <Typography variant="caption" color="secondary">
                  {getRainThresholdLabel(alerts.rain.threshold)} • {getToneLabel(alerts.rain.toneId)}
                </Typography>
              </View>
            </TouchableOpacity>
            <Switch
              value={alerts.rain.enabled}
              onValueChange={(val) => toggleAlert('rain', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Toggle Viento */}
          <View style={styles.alertOptionRow}>
            <TouchableOpacity
              style={styles.alertInfo}
              activeOpacity={0.7}
              onPress={() => openAlertSettingsOn('wind')}
            >
              <Wind size={18} color={colors.wind} />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">Viento y temporales</Typography>
                <Typography variant="caption" color="secondary">
                  Rachas &gt; {alerts.wind.thresholdKmh} km/h • {getToneLabel(alerts.wind.toneId)}
                </Typography>
              </View>
            </TouchableOpacity>
            <Switch
              value={alerts.wind.enabled}
              onValueChange={(val) => toggleAlert('wind', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Toggle Calor */}
          <View style={styles.alertOptionRow}>
            <TouchableOpacity
              style={styles.alertInfo}
              activeOpacity={0.7}
              onPress={() => openAlertSettingsOn('heat')}
            >
              <Sun size={18} color={colors.heat} />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">Calor extremo</Typography>
                <Typography variant="caption" color="secondary">
                  Temperaturas &gt; {alerts.heat.thresholdC}°C • {getToneLabel(alerts.heat.toneId)}
                </Typography>
              </View>
            </TouchableOpacity>
            <Switch
              value={alerts.heat.enabled}
              onValueChange={(val) => toggleAlert('heat', val)}
              trackColor={{ false: colors.borderStrong, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Umbrales y Tonos de Sonido */}
          <TouchableOpacity
            style={styles.soundRow}
            activeOpacity={0.7}
            onPress={() => openAlertSettingsOn('rain')}
          >
            <View style={styles.alertInfo}>
              <Volume2 size={18} color={colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium">Umbrales y Tonos de Alerta</Typography>
                <Typography variant="caption" color="secondary">
                  Personaliza y prueba el sonido de cada aviso
                </Typography>
              </View>
            </View>
            <ChevronRight size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Modales interactivos */}
      <EditProfileModal
        visible={showEditProfile}
        profile={profile}
        onSave={updateProfile}
        onClose={() => setShowEditProfile(false)}
      />

      <EditLocationModal
        visible={showEditLocation}
        currentLocation={fixedLocation}
        onSelectLocation={updateFixedLocation}
        onClose={() => setShowEditLocation(false)}
      />

      <AlertSettingsModal
        key={alertModalTab}
        visible={showAlertSettings}
        alerts={alerts}
        initialTab={alertModalTab}
        onChangeRainThreshold={setRainThreshold}
        onChangeWindThreshold={setWindThreshold}
        onChangeHeatThreshold={setHeatThreshold}
        onChangeTone={setAlertTone}
        onClose={() => setShowAlertSettings(false)}
      />

      <AuthModal
        visible={showAuthModal}
        defaultProvince={profile.province}
        isLoading={isLoadingAuth}
        errorMessage={authError}
        onSignIn={signIn}
        onSignUp={signUp}
        onClearError={clearAuthError}
        onClose={() => setShowAuthModal(false)}
      />
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
    gap: spacing.md,
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  userActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  authPillBtn: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  authIconBtn: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
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
    gap: spacing.sm,
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
    gap: spacing.sm,
  },
  alertInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs,
  },
});
