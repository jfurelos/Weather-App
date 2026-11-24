import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, Search, MapPin, Check } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { FONT_BODY_BOLD } from '@/shared/theme/typography';
import { SPANISH_PROVINCES } from '../data/provincesData';

interface Props {
  visible: boolean;
  selectedProvince: string;
  onSelectProvince: (provinceName: string) => void;
  onClose: () => void;
}

export const ProvinceSelectorModal: React.FC<Props> = ({
  visible,
  selectedProvince,
  onSelectProvince,
  onClose,
}) => {
  const { theme, colors } = useThemeStore();
  const [filterText, setFilterText] = useState('');

  const filteredProvinces = SPANISH_PROVINCES.filter((p) =>
    p.name.toLowerCase().includes(filterText.trim().toLowerCase())
  );

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
              <Typography variant="h3">Cambiar Provincia</Typography>
              <Typography variant="caption" color="secondary">
                Cada provincia dispone de su propio foro de comarcas
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
              accessibilityLabel="Cerrar selector de provincia"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search input */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
            ]}
          >
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary, fontFamily: FONT_BODY_BOLD }]}
              placeholder="Buscar provincia (ej. Valencia, Barcelona...)"
              placeholderTextColor={colors.textMuted}
              value={filterText}
              onChangeText={setFilterText}
            />
          </View>

          {/* Provinces list */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredProvinces.map((prov) => {
              const isSelected = prov.name === selectedProvince;
              return (
                <TouchableOpacity
                  key={prov.id}
                  activeOpacity={0.7}
                  style={[
                    styles.provinceItem,
                    {
                      backgroundColor: isSelected ? colors.primaryMuted : 'transparent',
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    onSelectProvince(prov.name);
                    setFilterText('');
                    onClose();
                  }}
                >
                  <View style={styles.provinceLeft}>
                    <MapPin
                      size={16}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Typography
                      variant="bodyMedium"
                      style={{
                        color: isSelected ? colors.primary : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {prov.name}
                    </Typography>
                  </View>

                  {isSelected && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    maxHeight: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: spacing.borderRadiusFull,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  list: {
    maxHeight: 400,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderRadius: spacing.borderRadiusSm,
  },
  provinceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
