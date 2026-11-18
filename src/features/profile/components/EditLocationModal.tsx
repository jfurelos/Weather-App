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
import { FixedLocation, SPANISH_ALERT_LOCATIONS } from '../data/locationsData';

interface Props {
  visible: boolean;
  currentLocation: FixedLocation;
  onSelectLocation: (location: FixedLocation) => Promise<void>;
  onClose: () => void;
}

export const EditLocationModal: React.FC<Props> = ({
  visible,
  currentLocation,
  onSelectLocation,
  onClose,
}) => {
  const { theme, colors } = useThemeStore();
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const filteredLocations = SPANISH_ALERT_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(normalized) ||
      loc.province.toLowerCase().includes(normalized)
  );

  const handleChoose = async (loc: FixedLocation) => {
    await onSelectLocation(loc);
    setQuery('');
    onClose();
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
            <View style={{ flex: 1 }}>
              <Typography variant="h3">Modificar Ubicación Fija</Typography>
              <Typography variant="caption" color="secondary">
                Reemplaza tu zona actual para recibir alertas meteorológicas
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
              accessibilityLabel="Cerrar selector de ubicación"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Buscador */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
            ]}
          >
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar municipio o provincia..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Listado */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filteredLocations.length === 0 ? (
              <View style={styles.emptyBox}>
                <Typography variant="body" color="secondary" style={{ textAlign: 'center' }}>
                  No encontramos coincidencias para "{query}".
                </Typography>
              </View>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected =
                  loc.name === currentLocation.name && loc.province === currentLocation.province;
                return (
                  <TouchableOpacity
                    key={`${loc.name}-${loc.province}`}
                    activeOpacity={0.7}
                    style={[
                      styles.itemRow,
                      {
                        backgroundColor: isSelected ? colors.primaryMuted : 'transparent',
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={() => handleChoose(loc)}
                  >
                    <View style={styles.itemLeft}>
                      <MapPin
                        size={16}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                      <View>
                        <Typography
                          variant="bodyMedium"
                          style={{
                            color: isSelected ? colors.primary : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          }}
                        >
                          {loc.name}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          Provincia de {loc.province}
                        </Typography>
                      </View>
                    </View>
                    {isSelected && <Check size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })
            )}
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
    maxHeight: '82%',
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
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
  emptyBox: {
    paddingVertical: spacing.xl,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderRadius: spacing.borderRadiusSm,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
