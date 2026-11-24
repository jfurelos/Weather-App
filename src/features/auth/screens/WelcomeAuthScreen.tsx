import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  MapPin,
  Check,
  Search,
  UserRound,
  Eye,
  EyeOff,
  CloudLightning,
  ChevronRight,
} from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/ScreenBackground';
import { CloudMascotSvg } from '@/shared/components/CloudMascotSvg';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { FONT_BODY_BOLD } from '@/shared/theme/typography';
import { SPANISH_PROVINCES } from '@/features/community/data/provincesData';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { MOCK_STORM_USERS } from '@/shared/data/mockStormUsers';

type AuthStep = 'welcome' | 'login' | 'register';

export const WelcomeAuthScreen: React.FC = () => {
  const { theme, colors } = useThemeStore();
  const {
    profile,
    isLoadingAuth,
    authError,
    signIn,
    signUp,
    continueAsGuest,
    enterAsMockStormUser,
    clearAuthError,
  } = useProfileStore();

  const [step, setStep] = useState<AuthStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [province, setProvince] = useState(profile.province || 'Madrid');
  const [showProvinces, setShowProvinces] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState('');
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const filteredProvinces = SPANISH_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(provinceFilter.trim().toLowerCase())
  );

  const goToStep = (next: AuthStep) => {
    setStep(next);
    setLocalError(null);
    clearAuthError();
    setShowProvinces(false);
    setShowPassword(false);
  };

  const handleLogin = async () => {
    setLocalError(null);
    clearAuthError();

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Introduce un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    await signIn(email, password);
  };

  const handleRegister = async () => {
    setLocalError(null);
    clearAuthError();

    if (!fullName.trim() || !username.trim()) {
      setLocalError('Completa tu nombre y nombre de usuario.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Introduce un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    await signUp({
      email,
      password,
      fullName,
      username,
      province,
    });
  };

  const activeError = localError || authError;

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'welcome' ? (
            <View style={styles.welcomeWrapper}>
              <View style={styles.brandHeader}>
                <View
                  style={[
                    styles.mascotBox,
                    {
                      backgroundColor: colors.cardHighlight,
                      borderColor: colors.border,
                      borderWidth: theme.metrics.windowBorderWidth,
                    },
                    theme.shadows.window,
                  ]}
                >
                  <CloudMascotSvg state="soleado" size={96} />
                </View>
                <Typography variant="hero" color="onBackground" style={styles.centerText}>
                  Clima & Comunidad
                </Typography>
                <Typography
                  variant="body"
                  color="onBackgroundSecondary"
                  style={[styles.centerText, styles.subtitle]}
                >
                  Pronósticos precisos, radar en tiempo real y foros locales de España.
                </Typography>
              </View>

              <Card windowTitle="Acceso a la App" contentStyle={styles.actionsCard}>
                <Button
                  title="Iniciar sesión"
                  variant="primary"
                  onPress={() => goToStep('login')}
                />

                <Button
                  title="Registrarse"
                  variant="secondary"
                  onPress={() => goToStep('register')}
                />

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Typography variant="caption" color="secondary">
                    o
                  </Typography>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={continueAsGuest}
                  style={[
                    styles.guestButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.subcardBorder,
                      borderWidth: theme.metrics.subcardBorderWidth,
                      borderRadius: theme.metrics.subcardRadius,
                    },
                    theme.shadows.subcard,
                  ]}
                >
                  <View style={styles.guestTitleRow}>
                    <UserRound size={16} color={colors.textPrimary} />
                    <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                      Continuar como invitado
                    </Typography>
                  </View>
                  <Typography variant="caption" color="secondary">
                    Sin acceso a los foros comunitarios
                  </Typography>
                </TouchableOpacity>
              </Card>

              {/* Selector de Usuarios Mock con Temporales */}
              <Card style={styles.demoCard}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setShowDemoUsers((prev) => !prev)}
                  style={styles.demoHeader}
                >
                  <View style={styles.demoTitleRow}>
                    <CloudLightning size={16} color={colors.warning} />
                    <View>
                      <Typography variant="bodyMedium" style={{ fontWeight: '700' }}>
                        Probar usuarios con temporales (Mock)
                      </Typography>
                      <Typography variant="caption" color="secondary">
                        5 perfiles con distintos fenómenos extremos
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="captionMedium" color="brand">
                    {showDemoUsers ? 'Ocultar' : 'Ver'}
                  </Typography>
                </TouchableOpacity>

                {showDemoUsers && (
                  <View style={styles.demoList}>
                    {MOCK_STORM_USERS.map((mock) => (
                      <TouchableOpacity
                        key={mock.id}
                        activeOpacity={0.75}
                        onPress={() => enterAsMockStormUser(mock)}
                        style={[
                          styles.demoUserRow,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.subcardBorder,
                            borderWidth: theme.metrics.subcardBorderWidth,
                          },
                          theme.shadows.subcard,
                        ]}
                      >
                        <View
                          style={[
                            styles.demoAvatar,
                            { backgroundColor: mock.avatarColor },
                          ]}
                        >
                          <Typography variant="captionMedium" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                            {mock.fullName.charAt(0)}
                          </Typography>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.demoUserTop}>
                            <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                              {mock.fullName}
                            </Typography>
                            <Badge label={mock.stormBadge} tone="warning" />
                          </View>
                          <Typography variant="caption" color="secondary" numberOfLines={1}>
                            {mock.province} • {mock.stormTitle}
                          </Typography>
                        </View>
                        <ChevronRight size={15} color={colors.textSecondary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </Card>
            </View>
          ) : (
            <View style={styles.formWrapper}>
              {/* Volver */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => goToStep('welcome')}
                style={[
                  styles.backButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                accessibilityLabel="Volver al inicio de acceso"
              >
                <ArrowLeft size={18} color={colors.textPrimary} />
                <Typography variant="captionMedium">Volver</Typography>
              </TouchableOpacity>

              <View style={styles.formHeader}>
                <Typography variant="hero" color="onBackground">
                  {step === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </Typography>
                <Typography variant="body" color="onBackgroundSecondary">
                  {step === 'login'
                    ? 'Accede con tu cuenta para usar todas las funciones y los foros.'
                    : 'Crea tu perfil para participar en los foros de tu provincia y comarcas.'}
                </Typography>
              </View>

              <Card style={styles.formCard}>
                {step === 'register' && (
                  <>
                    <View style={styles.field}>
                      <Typography variant="captionMedium" color="secondary">
                        NOMBRE
                      </Typography>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            fontFamily: FONT_BODY_BOLD,
                          },
                        ]}
                        placeholder="Ej. Laura García"
                        placeholderTextColor={colors.textMuted}
                        value={fullName}
                        onChangeText={setFullName}
                        maxLength={80}
                      />
                    </View>

                    <View style={styles.field}>
                      <Typography variant="captionMedium" color="secondary">
                        USUARIO
                      </Typography>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                            fontFamily: FONT_BODY_BOLD,
                          },
                        ]}
                        placeholder="Ej. laura_meteo"
                        placeholderTextColor={colors.textMuted}
                        value={username}
                        onChangeText={setUsername}
                        maxLength={40}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>

                    <View style={styles.field}>
                      <Typography variant="captionMedium" color="secondary">
                        PROVINCIA
                      </Typography>
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => setShowProvinces((prev) => !prev)}
                        style={[
                          styles.provinceBtn,
                          { backgroundColor: colors.inputBg, borderColor: colors.border },
                        ]}
                      >
                        <View style={styles.provinceLeft}>
                          <MapPin size={16} color={colors.primary} />
                          <Typography variant="bodyMedium">{province}</Typography>
                        </View>
                        <Typography variant="captionMedium" color="brand">
                          {showProvinces ? 'Ocultar' : 'Cambiar'}
                        </Typography>
                      </TouchableOpacity>

                      {showProvinces && (
                        <View
                          style={[
                            styles.provinceBox,
                            { backgroundColor: colors.inputBg, borderColor: colors.border },
                          ]}
                        >
                          <View
                            style={[
                              styles.provinceSearch,
                              { backgroundColor: colors.surface, borderColor: colors.subcardBorder },
                            ]}
                          >
                            <Search size={14} color={colors.textSecondary} />
                            <TextInput
                              style={[
                                styles.provinceSearchInput,
                                { color: colors.textPrimary, fontFamily: FONT_BODY_BOLD },
                              ]}
                              placeholder="Buscar provincia..."
                              placeholderTextColor={colors.textMuted}
                              value={provinceFilter}
                              onChangeText={setProvinceFilter}
                            />
                          </View>
                          <ScrollView style={styles.provinceList} nestedScrollEnabled>
                            {filteredProvinces.map((p) => {
                              const selected = p.name === province;
                              return (
                                <TouchableOpacity
                                  key={p.id}
                                  activeOpacity={0.7}
                                  onPress={() => {
                                    setProvince(p.name);
                                    setShowProvinces(false);
                                    setProvinceFilter('');
                                  }}
                                  style={[
                                    styles.provinceItem,
                                    { borderBottomColor: colors.divider },
                                  ]}
                                >
                                  <Typography
                                    variant="body"
                                    style={{
                                      color: selected ? colors.primary : colors.textPrimary,
                                    }}
                                  >
                                    {p.name}
                                  </Typography>
                                  {selected && <Check size={15} color={colors.primary} />}
                                </TouchableOpacity>
                              );
                            })}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  </>
                )}

                <View style={styles.field}>
                  <Typography variant="captionMedium" color="secondary">
                    EMAIL
                  </Typography>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        fontFamily: FONT_BODY_BOLD,
                      },
                    ]}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    maxLength={120}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.field}>
                  <Typography variant="captionMedium" color="secondary">
                    CONTRASEÑA
                  </Typography>
                  <View
                    style={[
                      styles.passwordWrapper,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.passwordInput,
                        { color: colors.textPrimary, fontFamily: FONT_BODY_BOLD },
                      ]}
                      placeholder="Mínimo 6 caracteres"
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={styles.eyeButton}
                      accessibilityLabel={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={colors.textSecondary} />
                      ) : (
                        <Eye size={18} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {activeError && (
                  <View
                    style={[
                      styles.errorBox,
                      { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                    ]}
                  >
                    <Typography variant="captionMedium" color="emphasis">
                      {activeError}
                    </Typography>
                  </View>
                )}

                <Button
                  title={step === 'login' ? 'Entrar' : 'Crear cuenta'}
                  variant="primary"
                  loading={isLoadingAuth}
                  onPress={step === 'login' ? handleLogin : handleRegister}
                  style={{ marginTop: spacing.xs }}
                />
              </Card>

              {/* Accesos alternativos */}
              <View style={styles.footerLinks}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => goToStep(step === 'login' ? 'register' : 'login')}
                >
                  <Typography variant="captionMedium" color="onBackgroundAccent">
                    {step === 'login'
                      ? '¿No tienes cuenta? Regístrate'
                      : '¿Ya tienes cuenta? Inicia sesión'}
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={continueAsGuest}>
                  <Typography variant="caption" color="onBackgroundSecondary">
                    Continuar como invitado (sin foros)
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  welcomeWrapper: {
    gap: spacing.lg,
  },
  brandHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  mascotBox: {
    width: 118,
    height: 118,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    padding: 6,
  },
  centerText: {
    textAlign: 'center',
  },
  subtitle: {
    maxWidth: 300,
  },
  actionsCard: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  guestButton: {
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    gap: 4,
  },
  guestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  demoCard: {
    gap: spacing.sm,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  demoList: {
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  demoUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  demoAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoUserTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  formWrapper: {
    gap: spacing.base,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: spacing.borderRadiusFull,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
  },
  formHeader: {
    gap: spacing.xs,
  },
  formCard: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    height: 46,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  passwordWrapper: {
    height: 46,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  eyeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provinceBtn: {
    height: 46,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  provinceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  provinceBox: {
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  provinceSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: spacing.borderRadiusFull,
    paddingHorizontal: spacing.sm,
    height: 36,
  },
  provinceSearchInput: {
    flex: 1,
    fontSize: 13,
  },
  provinceList: {
    maxHeight: 150,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.sm,
  },
  footerLinks: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
});
