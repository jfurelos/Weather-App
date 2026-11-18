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
import { X, Check, MapPin, Lock, Search, ImagePlus, Trash2 } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { SPANISH_PROVINCES } from '@/features/community/data/provincesData';
import { AVATAR_COLORS } from '../data/locationsData';
import { UserProfileData } from '../store/useProfileStore';
import { pickProfileImageFromGallery } from '../services/imagePickerService';

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
  const { theme, colors } = useThemeStore();

  const [fullName, setFullName] = useState(profile.fullName);
  const [province, setProvince] = useState(profile.province);
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl ?? null);
  const [provinceQuery, setProvinceQuery] = useState('');
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    if (visible) {
      setFullName(profile.fullName);
      setProvince(profile.province);
      setAvatarColor(profile.avatarColor);
      setAvatarUrl(profile.avatarUrl ?? null);
      setProvinceQuery('');
      setShowProvincePicker(false);
      setImageFailed(false);
    }
  }, [visible, profile]);

  const filteredProvinces = SPANISH_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(provinceQuery.trim().toLowerCase())
  );

  const initials = (fullName.trim() || 'U').charAt(0).toUpperCase();
  const hasValidImage = Boolean(avatarUrl && !imageFailed);

  const handlePickFromGallery = async () => {
    setIsPickingImage(true);
    try {
      const picked = await pickProfileImageFromGallery();
      if (picked) {
        setImageFailed(false);
        setAvatarUrl(picked);
      }
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        fullName: profile.isAuthenticated ? undefined : fullName,
        province,
        avatarColor,
        avatarUrl,
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
              style={[
                styles.closeButton,
                {
                  backgroundColor: colors.pillBg,
                  borderColor: colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                },
              ]}
              onPress={onClose}
              accessibilityLabel="Cerrar edición de perfil"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Vista previa del Avatar y Botón de Galería */}
            <View style={styles.avatarPreviewRow}>
              <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
                {hasValidImage ? (
                  <Image
                    source={{ uri: avatarUrl! }}
                    style={styles.avatarImage}
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <Typography variant="h1" style={{ color: '#FFFFFF' }}>
                    {initials}
                  </Typography>
                )}
              </View>
              <View style={styles.photoActions}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handlePickFromGallery}
                  disabled={isPickingImage}
                  style={[
                    styles.galleryBtn,
                    { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                  ]}
                >
                  <ImagePlus size={16} color={colors.primary} />
                  <Typography variant="captionMedium" color="brand" style={{ fontWeight: '600' }}>
                    {isPickingImage ? 'Abriendo galería...' : 'Elegir foto de galería'}
                  </Typography>
                </TouchableOpacity>

                {hasValidImage && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => {
                      setAvatarUrl(null);
                      setImageFailed(false);
                    }}
                    style={[
                      styles.removePhotoBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Trash2 size={14} color={colors.textSecondary} />
                    <Typography variant="caption" color="secondary">
                      Quitar foto
                    </Typography>
                  </TouchableOpacity>
                )}
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
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 68,
    height: 68,
  },
  photoActions: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
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
