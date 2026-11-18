import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Check, MapPin } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { City, SPANISH_CITIES } from '../store/useHomeStore';

interface Props {
  visible: boolean;
  selectedCity: City;
  onClose: () => void;
  onSelectCity: (city: City) => void;
}

export const CitySelectorModal: React.FC<Props> = ({
  visible,
  selectedCity,
  onClose,
  onSelectCity,
}) => {
  const { theme, colors } = useThemeStore();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
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
              {/* Barra superior de arrastre */}
              <View style={[styles.dragHandle, { backgroundColor: colors.borderStrong }]} />

              {/* Cabecera */}
              <View style={styles.header}>
                <Typography variant="h2">Seleccionar Ciudad</Typography>
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: colors.pillBg,
                      borderColor: colors.subcardBorder,
                      borderWidth: theme.metrics.subcardBorderWidth,
                    },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={18} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Lista de Ciudades */}
              <ScrollView
                style={styles.cityList}
                showsVerticalScrollIndicator={false}
              >
                {SPANISH_CITIES.map((city) => {
                  const isSelected = city.name === selectedCity.name;
                  return (
                    <TouchableOpacity
                      key={city.name}
                      style={[
                        styles.cityItem,
                        {
                          backgroundColor: isSelected ? colors.primaryMuted : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.subcardBorder,
                          borderWidth: isSelected ? 2 : theme.metrics.subcardBorderWidth,
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        onSelectCity(city);
                        onClose();
                      }}
                    >
                      <View style={styles.cityInfoRow}>
                        <MapPin
                          size={18}
                          color={isSelected ? colors.primary : colors.textSecondary}
                        />
                        <View>
                          <Typography
                            variant="bodyMedium"
                            style={{ fontWeight: isSelected ? '600' : '400' }}
                          >
                            {city.name}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {city.province}
                          </Typography>
                        </View>
                      </View>

                      {isSelected && (
                        <Check size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: spacing.borderRadiusXl,
    borderTopRightRadius: spacing.borderRadiusXl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    maxHeight: '75%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityList: {
    gap: spacing.sm,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  cityInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
