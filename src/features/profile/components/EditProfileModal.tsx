import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { X, Check, MapPin, Lock, Search } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { SPANISH_PROVINCES } from '@/features/community/data/provincesData';
import { AVATAR_COLORS } from '../data/locationsData';
import { UserProfileData } from '../store/useProfileStore';

interface Props {
  visible: boolean;
  profile: UserProfileData;
  onSave: (updates: {
    fullName?: string;
    province: string;
    avatarColor: string;
    avatarUrl: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

export const EditProfileModal: React.FC<Props> = ({
  visible,
  profile,
  onSave,
  onClose,
}) => {
  const { colors } = useThemeStore();

  const [fullName, setFullName] = useState(profile.fullName);
  const [province, setProvince] = useState(profile.province);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [provinceQuery, setProvinceQuery] = useState('');
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (visible) {
      setFullName(profile.fullName);
      setProvince(profile.province);
      setAvatarColor(profile.avatarColor);
      setAvatarUrl(profile.avatarUrl ?? '');
      setProvinceQuery('');
      setShowProvincePicker(false);
      setImageFailed(false);
    }
  }, [visible, profile]);

  const filteredProvinces = SPANISH_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(provinceQuery.trim().toLowerCase())
  );

  const initials = (fullName.trim() || 'U').charAt(0).toUpperCase();
  const hasValidUrl = avatarUrl.trim().startsWith('http') && !imageFailed;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        fullName: profile.isAuthenticated ? undefined : fullName,
        province,
        avatarColor,
        avatarUrl: avatarUrl.trim() ? avatarUrl.trim() : null,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Typography variant="h3">Editar Datos</Typography>
              <Typography variant="caption" color="secondary">
                Foto y provincia visibles en el foro
              </Typography>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onClose}
              accessibilityLabel="Cerrar edición de perfil"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Vista previa del Avatar */}
            <View style={styles.avatarPreviewRow}>
              <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                {hasValidUrl ? (
                  <Image
                    source={{ uri: avatarUrl.trim() }}
                    style={styles.avatarImage}
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <Typography variant="h1" style={{ color: '#FFFFFF' }}>
                    {initials}
                  </Typography>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>
                  {fullName.trim() || 'Usuario Invitado'}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Provincia de {province}
                </Typography>
              </View>
            </View>

            {/* Color de Avatar */}
            <View style={styles.fieldGroup}>
              <Typography variant="captionMedium" color="secondary">
                COLOR DE AVATAR
              </Typography>
              <View style={styles.colorGrid}>
                {AVATAR_COLORS.map((hex) => {
                  const selected = hex === avatarColor;
                  return (
                    <TouchableOpacity
                      key={hex}
                      activeOpacity={0.8}
                      onPress={() => setAvatarColor(hex)}
                      style={[
                        styles.colorSwatch,
                        {
                          backgroundColor: hex,
                          borderColor: selected ? colors.textPrimary : 'transparent',
                        },
                      ]}
                      accessibilityLabel={`Color de avatar ${hex}`}
                    >
                      {selected && <Check size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* URL opcional de foto */}
            <View style={styles.fieldGroup}>
              <Typography variant="captionMedium" color="secondary">
                FOTO DE PERFIL (URL OPCIONAL)
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
                placeholder="https://ejemplo.com/tu-foto.jpg"
                placeholderTextColor={colors.textSecondary}
                value={avatarUrl}
                onChangeText={(val) => {
                  setImageFailed(false);
                  setAvatarUrl(val);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Nombre */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Typography variant="captionMedium" color="secondary">
                  NOMBRE VISIBLE
                </Typography>
                {profile.isAuthenticated && (
                  <View style={styles.lockedTag}>
                    <Lock size={11} color={colors.textSecondary} />
                    <Typography variant="caption" color="secondary">
                      Inmutable
                    </Typography>
                  </View>
                )}
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: profile.isAuthenticated ? colors.textSecondary : colors.textPrimary,
                    opacity: profile.isAuthenticated ? 0.7 : 1,
                  },
                ]}
                placeholder="Tu nombre en comunidad"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
                editable={!profile.isAuthenticated}
              />
            </View>

            {/* Email (solo lectura si autenticado) */}
            {profile.isAuthenticated && profile.email && (
              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Typography variant="captionMedium" color="secondary">
                    CORREO ELECTRÓNICO
                  </Typography>
                  <View style={styles.lockedTag}>
                    <Lock size={11} color={colors.textSecondary} />
                    <Typography variant="caption" color="secondary">
                      Inmutable
                    </Typography>
                  </View>
                </View>
                <View
                  style={[
                    styles.readonlyBox,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Typography variant="body" color="secondary">
                    {profile.email}
                  </Typography>
                </View>
              </View>
            )}

            {/* Provincia */}
            <View style={styles.fieldGroup}>
              <Typography variant="captionMedium" color="secondary">
                PROVINCIA
              </Typography>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowProvincePicker((prev) => !prev)}
                style={[
                  styles.provinceTrigger,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.provinceLeft}>
                  <MapPin size={16} color={colors.primary} />
                  <Typography variant="bodyMedium">{province}</Typography>
                </View>
                <Typography variant="captionMedium" color="brand">
                  {showProvincePicker ? 'Ocultar' : 'Cambiar'}
                </Typography>
              </TouchableOpacity>

              {showProvincePicker && (
                <View
                  style={[
                    styles.pickerBox,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.pickerSearch,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Search size={14} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.pickerSearchInput, { color: colors.textPrimary }]}
                      placeholder="Filtrar provincia..."
                      placeholderTextColor={colors.textSecondary}
                      value={provinceQuery}
                      onChangeText={setProvinceQuery}
                    />
                  </View>
                  <ScrollView style={styles.pickerList} nestedScrollEnabled>
                    {filteredProvinces.map((item) => {
                      const isSelected = item.name === province;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.7}
                          onPress={() => {
                            setProvince(item.name);
                            setShowProvincePicker(false);
                            setProvinceQuery('');
                          }}
                          style={[
                            styles.pickerRow,
                            {
                              borderBottomColor: colors.border,
                              backgroundColor: isSelected ? colors.primaryMuted : 'transparent',
                            },
                          ]}
                        >
                          <Typography
                            variant="body"
                            style={{
                              color: isSelected ? colors.primary : colors.textPrimary,
                              fontWeight: isSelected ? '600' : '400',
                            }}
                          >
                            {item.name}
                          </Typography>
                          {isSelected && <Check size={16} color={colors.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Guardar cambios"
              variant="primary"
              loading={isSaving}
              onPress={handleSave}
            />
          </View>
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
  body: {
    gap: spacing.base,
    paddingBottom: spacing.sm,
  },
  avatarPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 60,
    height: 60,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  readonlyBox: {
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    opacity: 0.75,
  },
  provinceTrigger: {
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
    gap: spacing.sm,
  },
  pickerBox: {
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    padding: spacing.sm,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: spacing.borderRadiusFull,
    paddingHorizontal: spacing.sm,
    height: 36,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 13,
  },
  pickerList: {
    maxHeight: 160,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderRadius: spacing.borderRadiusSm,
  },
  footer: {
    paddingTop: spacing.xs,
  },
});
