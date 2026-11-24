import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  Modal,
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
  BellRing,
  CloudLightning,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/ScreenBackground';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import {
  CLAUDY_EXPRESSIONS,
  ClaudySvg,
  resolveClaudyWeatherMode,
  useClaudyStore,
} from '@/features/claudy';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import { AlertCategory, useProfileStore } from '../store/useProfileStore';
import { getRainThresholdLabel, getToneLabel } from '../data/locationsData';
import { ThemeSelectorCard } from '../components/ThemeSelectorCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { EditLocationModal } from '../components/EditLocationModal';
import { AlertSettingsModal } from '../components/AlertSettingsModal';
import { AuthModal } from '../components/AuthModal';
import { MOCK_ALERT_SCENARIOS, MOCK_STORM_USERS } from '@/shared/data/mockStormUsers';

export const ProfileScreen: React.FC = () => {
  const { isDark, theme, colors } = useThemeStore();
  const claudyConfig = useClaudyStore((s) => s.config);
  const openClaudyCustomizer = useClaudyStore((s) => s.openCustomizer);
  const reopenClaudyGreeting = useClaudyStore((s) => s.reopenGreeting);
  const homeWeather = useHomeStore((s) => s.weather);
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
    triggerMockAlert,
    enterAsMockStormUser,
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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
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

  const handleConfirmSignOut = async () => {
    setShowSignOutConfirm(false);
    await signOut();
  };

  const initials = (profile.fullName.trim() || 'U').charAt(0).toUpperCase();
  const hasAvatarImage = Boolean(profile.avatarUrl && !avatarLoadError);
  const claudyWeatherMode = homeWeather
    ? resolveClaudyWeatherMode({
        weatherCode: homeWeather.current.weatherCode,
        temperature: homeWeather.current.temperature,
        windSpeed: homeWeather.current.windSpeed,
        precipitation: homeWeather.current.precipitation,
      })
    : 'sunny';
  const expressionLabel =
    CLAUDY_EXPRESSIONS.find((e) => e.id === claudyConfig.expression)?.label ?? 'Feliz';

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="hero" color="onBackground" style={styles.title}>
            Perfil
          </Typography>
        </View>

        {/* 1. Tarjeta de Usuario */}
        <Card style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarPlaceholder,
                {
                  backgroundColor: profile.avatarColor || colors.primary,
                  borderColor: colors.border,
                  borderWidth: theme.metrics.subcardBorderWidth,
                },
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
                  ? `${profile.province} • Visible en foro`
                  : `${profile.province} • Modo invitado (sin acceso a foros)`}
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
            {!profile.isAuthenticated && (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => {
                  clearAuthError();
                  setShowAuthModal(true);
                }}
                style={[
                  styles.authPillBtn,
                  {
                    backgroundColor: colors.pillActiveBg,
                    borderColor: colors.border,
                    borderWidth: theme.metrics.subcardBorderWidth,
                  },
                  theme.shadows.pillActive,
                ]}
                accessibilityLabel="Iniciar sesión o crear cuenta"
              >
                <LogIn size={15} color={colors.pillActiveText} />
                <Typography
                  variant="captionMedium"
                  style={{ color: colors.pillActiveText, fontWeight: '800' }}
                >
                  Acceder
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* 2. Tu Mascota Claudy: Personalización y Saludo */}
        <Card
          windowTitle={`Tu Nube · ${claudyConfig.name}`}
          windowRight={<Badge label={expressionLabel} tone="warning" />}
          contentStyle={styles.claudyCardBody}
        >
          <View style={styles.claudyProfileRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={openClaudyCustomizer}
              style={[
                styles.claudyThumb,
                {
                  backgroundColor: isDark ? colors.surface : colors.inputBg,
                  borderColor: colors.subcardBorder,
                },
              ]}
              accessibilityLabel={`Personalizar a ${claudyConfig.name}`}
            >
              <ClaudySvg weatherMode={claudyWeatherMode} config={claudyConfig} size={86} />
            </TouchableOpacity>
            <View style={{ flex: 1, gap: 4 }}>
              <Typography variant="h3">{claudyConfig.name}</Typography>
              <Typography variant="caption" color="secondary" style={{ lineHeight: 17 }}>
                Se viste automáticamente según el clima de {fixedLocation.name} y refleja tus accesorios favoritos.
              </Typography>
            </View>
          </View>

          <View style={styles.claudyActionsRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={openClaudyCustomizer}
              style={[
                styles.claudyPrimaryBtn,
                { backgroundColor: colors.accent, borderColor: 'rgba(84,11,14,0.16)' },
              ]}
            >
              <SlidersHorizontal size={15} color={colors.onAccent} />
              <Typography variant="captionMedium" style={{ color: colors.onAccent, fontSize: 13 }}>
                Personalizar
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={reopenClaudyGreeting}
              style={[
                styles.claudySecondaryBtn,
                { backgroundColor: colors.inputBg, borderColor: colors.borderStrong },
              ]}
            >
              <Sparkles size={15} color={colors.textPrimary} />
              <Typography variant="captionMedium" style={{ fontSize: 13 }}>
                Ver saludo
              </Typography>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 3. Selector Modo Oscuro / Modo Claro */}
        <ThemeSelectorCard />

        {/* 3. Ubicación Fija Única para Alertas */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <View style={styles.tagWrapper}>
              <MapPin size={16} color={colors.primary} />
              <Typography variant="h3">Ubicación Fija</Typography>
            </View>
            <Badge label="Activa" tone="rain" />
          </View>

          <Typography variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
            Recibes alertas meteorológicas en tu zona asignada.
          </Typography>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setShowEditLocation(true)}
            style={[
              styles.locationBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
                borderRadius: theme.metrics.subcardRadius,
              },
              theme.shadows.subcard,
            ]}
          >
            <View style={{ flex: 1 }}>
              <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                {fixedLocation.name}
              </Typography>
              <Typography variant="caption" color="secondary">
                {fixedLocation.province}
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
              trackColor={{ false: 'rgba(51, 92, 103, 0.22)', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

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
              trackColor={{ false: 'rgba(51, 92, 103, 0.22)', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Toggle Calor */}
          <View style={styles.alertOptionRow}>
            <TouchableOpacity
              style={styles.alertInfo}
              activeOpacity={0.7}
              onPress={() => openAlertSettingsOn('heat')}
            >
              <Sun size={18} color={colors.warning} />
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
              trackColor={{ false: 'rgba(51, 92, 103, 0.22)', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

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

        {/* 5. Simulador de Alertas (Mock) */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <View style={styles.tagWrapper}>
              <BellRing size={16} color={colors.primary} />
              <Typography variant="h3">Simulador de Alertas</Typography>
            </View>
            <Badge label="Mock" tone="neutral" />
          </View>
          <Typography variant="caption" color="secondary" style={{ marginTop: 2, marginBottom: spacing.xs }}>
            Pulsa un evento para comprobar si notifica y reproduce tu tono según tus umbrales activos.
          </Typography>

          <View style={styles.mockGrid}>
            {MOCK_ALERT_SCENARIOS.map((scenario) => {
              const accent =
                scenario.category === 'rain'
                  ? colors.rain
                  : scenario.category === 'wind'
                    ? colors.wind
                    : colors.plum;
              return (
                <TouchableOpacity
                  key={scenario.id}
                  activeOpacity={0.75}
                  onPress={() => triggerMockAlert(scenario)}
                  style={[
                    styles.mockChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.subcardBorder,
                      borderWidth: theme.metrics.subcardBorderWidth,
                    },
                    theme.shadows.subcard,
                  ]}
                >
                  <View style={[styles.mockDot, { backgroundColor: accent }]} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="captionMedium" style={{ fontWeight: '700' }} numberOfLines={1}>
                      {scenario.shortLabel}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={{ fontSize: 11 }} numberOfLines={1}>
                      {scenario.severityLabel}
                    </Typography>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* 6. Usuarios Mock con Diferentes Temporales */}
        <Card style={styles.settingCard}>
          <View style={styles.rowBetween}>
            <View style={styles.tagWrapper}>
              <CloudLightning size={16} color={colors.warning} />
              <Typography variant="h3">Usuarios con Temporales</Typography>
            </View>
            <Badge label="Mock" tone="neutral" />
          </View>
          <Typography variant="caption" color="secondary" style={{ marginTop: 2, marginBottom: spacing.xs }}>
            Cambia de usuario demo para ver distintos temporales en Inicio, Perfil y Comunidad.
          </Typography>

          <View style={styles.stormUsersList}>
            {MOCK_STORM_USERS.map((mock) => {
              const isActive = profile.id === mock.id;
              return (
                <TouchableOpacity
                  key={mock.id}
                  activeOpacity={0.75}
                  onPress={() => enterAsMockStormUser(mock)}
                  style={[
                    styles.stormUserRow,
                    {
                      backgroundColor: isActive ? colors.primaryMuted : colors.surface,
                      borderColor: isActive ? colors.primary : colors.subcardBorder,
                      borderWidth: isActive ? 2 : theme.metrics.subcardBorderWidth,
                    },
                    !isActive && theme.shadows.subcard,
                  ]}
                >
                  <View style={[styles.stormAvatar, { backgroundColor: mock.avatarColor }]}>
                    <Typography variant="captionMedium" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                      {mock.fullName.charAt(0)}
                    </Typography>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                      {mock.fullName}
                    </Typography>
                    <Typography variant="caption" color="secondary" numberOfLines={1}>
                      {mock.province} • {mock.stormTitle}
                    </Typography>
                  </View>
                  <Badge label={mock.stormBadge} tone={isActive ? 'brand' : 'warning'} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* 7. Botón de Cerrar Sesión abajo */}
        {profile.isAuthenticated && (
          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() => setShowSignOutConfirm(true)}
            style={[
              styles.signOutButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                borderWidth: 1.5,
              },
              theme.shadows.subcard,
            ]}
          >
            <LogOut size={18} color={colors.primary} />
            <Typography variant="bodyMedium" style={{ color: colors.primary }}>
              Cerrar sesión
            </Typography>
          </TouchableOpacity>
        )}
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

      {/* Pop-up de confirmación de cierre de sesión */}
      <Modal
        visible={showSignOutConfirm}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSignOutConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View
            style={[
              styles.confirmCard,
              {
                backgroundColor: colors.cardSolid,
                borderColor: colors.border,
                borderWidth: theme.metrics.windowBorderWidth,
                borderRadius: theme.metrics.windowRadius,
              },
              theme.shadows.window,
              getGlassStyle(theme),
            ]}
          >
            <View
              style={[
                styles.confirmIcon,
                { backgroundColor: colors.pillBg, borderColor: colors.subcardBorder, borderWidth: 1.5 },
              ]}
            >
              <LogOut size={22} color={colors.plum} />
            </View>
            <Typography variant="h3" style={{ textAlign: 'center' }}>
              ¿Cerrar sesión?
            </Typography>
            <Typography variant="body" color="secondary" style={{ textAlign: 'center' }}>
              Volverás a la pantalla de acceso y tendrás que iniciar sesión para entrar en los foros.
            </Typography>
            <View style={styles.confirmActions}>
              <Button
                title="Cancelar"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => setShowSignOutConfirm(false)}
              />
              <Button
                title="Cerrar sesión"
                variant="primary"
                style={{ flex: 1 }}
                onPress={handleConfirmSignOut}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  header: {
    gap: spacing.xs,
    marginBottom: 2,
  },
  title: {
    marginTop: 2,
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
    paddingHorizontal: spacing.md + 2,
    borderRadius: spacing.borderRadiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  settingCard: {
    gap: spacing.xs,
  },
  claudyCardBody: {
    gap: spacing.md,
  },
  claudyProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  claudyThumb: {
    width: 96,
    height: 96,
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claudyActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  claudyPrimaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  claudySecondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  mockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  mockChip: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: 14,
  },
  mockDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  stormUsersList: {
    gap: spacing.xs + 2,
  },
  stormUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: 14,
  },
  stormAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    height: 50,
    borderRadius: spacing.borderRadiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 24, 34, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.xs,
  },
});
