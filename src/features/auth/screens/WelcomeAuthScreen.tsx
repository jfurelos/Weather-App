import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  CloudSun,
  ArrowLeft,
  MapPin,
  Check,
  Search,
  UserRound,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { SPANISH_PROVINCES } from '@/features/community/data/provincesData';
import { useProfileStore } from '@/features/profile/store/useProfileStore';

type AuthStep = 'welcome' | 'login' | 'register';

export const WelcomeAuthScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const {
    profile,
    isLoadingAuth,
    authError,
    signIn,
    signUp,
    continueAsGuest,
    clearAuthError,
  } = useProfileStore();

  const [step, setStep] = useState<AuthStep>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [province, setProvince] = useState(profile.province || 'Madrid');
  const [showProvinces, setShowProvinces] = useState(false);
  const [provinceFilter, setProvinceFilter] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const filteredProvinces = SPANISH_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(provinceFilter.trim().toLowerCase())
  );

  const goToStep = (next: AuthStep) => {
    setStep(next);
    setLocalError(null);
    clearAuthError();
    setShowProvinces(false);
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
                <View style={[styles.logoCircle, { backgroundColor: colors.primaryMuted }]}>
                  <CloudSun size={40} color={colors.primary} />
                </View>
                <Typography variant="hero" style={styles.centerText}>
                  Clima & Comunidad
                </Typography>
                <Typography
                  variant="body"
                  color="secondary"
                  style={[styles.centerText, styles.subtitle]}
                >
                  Pronósticos precisos, radar en tiempo real y foros locales de España.
                </Typography>
              </View>

              <Card style={styles.actionsCard}>
                <Button
                  title="Iniciar sesión"
                  variant="primary"
                  onPress={() => goToStep('login')}
                />

                <Button
                  title="Registrarse"
                  variant="outline"
                  onPress={() => goToStep('register')}
                />

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <Typography variant="caption" color="secondary">
                    o
                  </Typography>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={continueAsGuest}
                  style={[
                    styles.guestButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.guestTitleRow}>
                    <UserRound size={16} color={colors.textPrimary} />
                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                      Continuar como invitado
                    </Typography>
                  </View>
                  <Typography variant="caption" color="secondary">
                    Sin acceso a los foros comunitarios
                  </Typography>
                </TouchableOpacity>
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                accessibilityLabel="Volver al inicio de acceso"
              >
                <ArrowLeft size={18} color={colors.textPrimary} />
                <Typography variant="captionMedium">Volver</Typography>
              </TouchableOpacity>

              <View style={styles.formHeader}>
                <Typography variant="hero">
                  {step === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </Typography>
                <Typography variant="body" color="secondary">
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
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                          },
                        ]}
                        placeholder="Ej. Laura García"
                        placeholderTextColor={colors.textSecondary}
                        value={fullName}
                        onChangeText={setFullName}
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
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            color: colors.textPrimary,
                          },
                        ]}
                        placeholder="Ej. laura_meteo"
                        placeholderTextColor={colors.textSecondary}
                        value={username}
                        onChangeText={setUsername}
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
                          { backgroundColor: colors.surface, borderColor: colors.border },
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
                            { backgroundColor: colors.surface, borderColor: colors.border },
                          ]}
                        >
                          <View
                            style={[
                              styles.provinceSearch,
                              { backgroundColor: colors.card, borderColor: colors.border },
                            ]}
                          >
                            <Search size={14} color={colors.textSecondary} />
                            <TextInput
                              style={[styles.provinceSearchInput, { color: colors.textPrimary }]}
                              placeholder="Buscar provincia..."
                              placeholderTextColor={colors.textSecondary}
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
                                    { borderBottomColor: colors.border },
                                  ]}
                                >
                                  <Typography
                                    variant="body"
                                    style={{
                                      color: selected ? colors.primary : colors.textPrimary,
                                      fontWeight: selected ? '600' : '400',
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
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.field}>
                  <Typography variant="captionMedium" color="secondary">
                    CONTRASEÑA
                  </Typography>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {activeError && (
                  <View
                    style={[
                      styles.errorBox,
                      { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                    ]}
                  >
                    <Typography variant="captionMedium" color="brand">
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
                  <Typography variant="captionMedium" color="brand">
                    {step === 'login'
                      ? '¿No tienes cuenta? Regístrate'
                      : '¿Ya tienes cuenta? Inicia sesión'}
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} onPress={continueAsGuest}>
                  <Typography variant="caption" color="secondary">
                    Continuar como invitado (sin foros)
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  welcomeWrapper: {
    gap: spacing.xl,
  },
  brandHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
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
