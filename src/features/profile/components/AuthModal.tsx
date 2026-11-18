import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, MapPin, Check, Eye, EyeOff } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { SPANISH_PROVINCES } from '@/features/community/data/provincesData';

interface Props {
  visible: boolean;
  defaultProvince: string;
  isLoading: boolean;
  errorMessage: string | null;
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (params: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    province: string;
  }) => Promise<boolean>;
  onClearError: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({
  visible,
  defaultProvince,
  isLoading,
  errorMessage,
  onSignIn,
  onSignUp,
  onClearError,
  onClose,
}) => {
  const { theme, colors } = useThemeStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [province, setProvince] = useState(defaultProvince);
  const [showProvinces, setShowProvinces] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setLocalError(null);
    onClearError();
  };

  const handleSubmit = async () => {
    setLocalError(null);
    onClearError();

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Introduce un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (mode === 'login') {
      const ok = await onSignIn(email, password);
      if (ok) {
        setPassword('');
        onClose();
      }
      return;
    }

    if (!fullName.trim() || !username.trim()) {
      setLocalError('Completa tu nombre y nombre de usuario.');
      return;
    }

    const ok = await onSignUp({
      email,
      password,
      fullName,
      username,
      province,
    });
    if (ok) {
      setPassword('');
      onClose();
    }
  };

  const activeError = localError || errorMessage;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.cardSolid,
              borderColor: colors.border,
              borderTopWidth: theme.metrics.windowBorderWidth,
              borderTopLeftRadius: theme.metrics.windowRadius,
              borderTopRightRadius: theme.metrics.windowRadius,
            },
            theme.shadows.modal,
            getGlassStyle(theme),
          ]}
        >
          <View style={styles.header}>
            <Typography variant="h3">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </Typography>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.pillBg,
                  borderColor: colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                },
              ]}
              onPress={onClose}
              accessibilityLabel="Cerrar autenticación"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Selector Login / Registro */}
          <View
            style={[
              styles.modeBar,
              {
                backgroundColor: colors.pillBg,
                borderColor: colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => switchMode('login')}
              style={[
                styles.modeBtn,
                { backgroundColor: mode === 'login' ? colors.pillActiveBg : 'transparent' },
                mode === 'login' && theme.shadows.pillActive,
              ]}
            >
              <Typography
                variant="captionMedium"
                style={{
                  color: mode === 'login' ? colors.pillActiveText : colors.textPrimary,
                  fontWeight: mode === 'login' ? '800' : '600',
                }}
              >
                Acceder
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => switchMode('register')}
              style={[
                styles.modeBtn,
                { backgroundColor: mode === 'register' ? colors.pillActiveBg : 'transparent' },
                mode === 'register' && theme.shadows.pillActive,
              ]}
            >
              <Typography
                variant="captionMedium"
                style={{
                  color: mode === 'register' ? colors.pillActiveText : colors.textPrimary,
                  fontWeight: mode === 'register' ? '800' : '600',
                }}
              >
                Registrarse
              </Typography>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
            {mode === 'register' && (
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
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="Ej. laura_meteo"
                    placeholderTextColor={colors.textSecondary}
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
                    activeOpacity={0.7}
                    onPress={() => setShowProvinces((p) => !p)}
                    style={[
                      styles.provinceBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.provinceLeft}>
                      <MapPin size={15} color={colors.primary} />
                      <Typography variant="bodyMedium">{province}</Typography>
                    </View>
                    <Typography variant="captionMedium" color="brand">
                      {showProvinces ? 'Ocultar' : 'Elegir'}
                    </Typography>
                  </TouchableOpacity>

                  {showProvinces && (
                    <ScrollView
                      style={[
                        styles.provinceList,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                      ]}
                      nestedScrollEnabled
                    >
                      {SPANISH_PROVINCES.map((p) => {
                        const selected = p.name === province;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            activeOpacity={0.7}
                            onPress={() => {
                              setProvince(p.name);
                              setShowProvinces(false);
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.textPrimary }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.textSecondary}
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
              <View style={[styles.errorBox, { backgroundColor: colors.primaryMuted, borderColor: colors.primary }]}>
                <Typography variant="captionMedium" color="brand">
                  {activeError}
                </Typography>
              </View>
            )}
          </ScrollView>

          <Button
            title={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            variant="primary"
            loading={isLoading}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: spacing.borderRadiusXl,
    borderTopRightRadius: spacing.borderRadiusXl,
    borderTopWidth: 1,
    maxHeight: '88%',
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: spacing.borderRadiusFull,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    height: 36,
    borderRadius: spacing.borderRadiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  input: {
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  passwordWrapper: {
    height: 44,
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
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provinceBtn: {
    height: 44,
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
  provinceList: {
    maxHeight: 140,
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    paddingHorizontal: spacing.sm,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.sm,
  },
});
