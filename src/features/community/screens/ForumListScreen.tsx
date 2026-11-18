import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Search, ChevronDown, Layers } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/ScreenBackground';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { getComarcasForProvince, Comarca } from '../data/provincesData';
import { useComarcasForumStore } from '../store/useComarcasForumStore';
import { ProvinceSelectorModal } from '../components/ProvinceSelectorModal';
import { FavoriteComarcasBar } from '../components/FavoriteComarcasBar';
import { ComarcaCard } from '../components/ComarcaCard';
import { RootStackParamList } from '@/app/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ForumListScreen: React.FC = () => {
  const { theme, colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();

  const {
    selectedProvince,
    searchQuery,
    favoriteComarcas,
    favoriteLimitMessage,
    loadPersistedState,
    setSelectedProvince,
    setSearchQuery,
    toggleFavoriteComarca,
    clearFavoriteLimitMessage,
    isFavorite,
  } = useComarcasForumStore();

  const [isProvinceModalVisible, setProvinceModalVisible] = useState(false);

  useEffect(() => {
    loadPersistedState();
  }, [loadPersistedState]);

  // Obtener comarcas de la provincia actual
  const allComarcas = getComarcasForProvince(selectedProvince);

  // Filtrado por buscador de subforums
  const filteredComarcas = allComarcas.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleOpenComarca = (comarca: Comarca) => {
    navigation.navigate('ComarcaDetail', {
      comarcaId: comarca.id,
      comarcaName: comarca.name,
      provinceName: comarca.provinceName,
    });
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header principal */}
        <View style={styles.header}>
          <Typography variant="hero" style={styles.title}>
            Foro Comunitario
          </Typography>
        </View>

        {/* Tarjeta de Provincia Activa y Selector */}
        <TouchableOpacity
          activeOpacity={0.82}
          style={[
            styles.provinceSelectorCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: theme.metrics.windowBorderWidth,
              borderRadius: theme.metrics.windowRadius,
            },
            theme.shadows.window,
            getGlassStyle(theme),
          ]}
          onPress={() => setProvinceModalVisible(true)}
        >
          <View style={styles.provinceCardLeft}>
            <View
              style={[
                styles.pinCircle,
                {
                  backgroundColor: colors.primaryMuted,
                  borderColor: colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                },
              ]}
            >
              <MapPin size={20} color={colors.primary} />
            </View>
            <View>
              <Typography variant="caption" color="secondary">
                FORO PROVINCIAL ACTIVO
              </Typography>
              <Typography variant="h2" style={{ fontWeight: '700' }}>
                {selectedProvince}
              </Typography>
            </View>
          </View>

          <View
            style={[
              styles.changePill,
              {
                backgroundColor: colors.pillActiveBg,
                borderColor: colors.border,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
              theme.shadows.pillActive,
            ]}
          >
            <Typography
              variant="captionMedium"
              style={{ fontWeight: '800', color: colors.pillActiveText }}
            >
              Cambiar
            </Typography>
            <ChevronDown size={14} color={colors.pillActiveText} />
          </View>
        </TouchableOpacity>

        {/* Sección de Comarcas Favoritas (Acceso Rápido - Máximo 3, todas visibles) */}
        <FavoriteComarcasBar
          favorites={favoriteComarcas}
          limitMessage={favoriteLimitMessage}
          onDismissLimitMessage={clearFavoriteLimitMessage}
          onSelectComarca={handleOpenComarca}
          onRemoveFavorite={toggleFavoriteComarca}
        />

        {/* Buscador de Subforums (Comarcas) */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
              theme.shadows.subcard,
              getGlassStyle(theme),
            ]}
          >
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder={`Buscar comarca en ${selectedProvince}...`}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Typography variant="caption" color="secondary" style={{ paddingHorizontal: 6 }}>
                  Limpiar
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Listado de Subforums (Comarcas de la provincia) */}
        <View style={styles.comarcasList}>
          <View style={styles.listHeaderRow}>
            <View style={styles.listHeaderTitle}>
              <Layers size={16} color={colors.primary} />
              <Typography variant="h3">
                Comarcas de {selectedProvince}
              </Typography>
            </View>
            <Typography variant="caption" color="secondary">
              {filteredComarcas.length} {filteredComarcas.length === 1 ? 'subforum' : 'subforums'}
            </Typography>
          </View>

          {filteredComarcas.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Search size={32} color={colors.textSecondary} />
              <Typography variant="h3">No se encontraron comarcas</Typography>
              <Typography variant="body" color="secondary" style={{ textAlign: 'center' }}>
                No hay resultados para "{searchQuery}" en {selectedProvince}.
              </Typography>
            </Card>
          ) : (
            filteredComarcas.map((comarca) => (
              <ComarcaCard
                key={comarca.id}
                comarca={comarca}
                isFavorite={isFavorite(comarca.id)}
                onToggleFavorite={() => toggleFavoriteComarca(comarca)}
                onPress={() => handleOpenComarca(comarca)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal para cambiar provincia */}
      <ProvinceSelectorModal
        visible={isProvinceModalVisible}
        selectedProvince={selectedProvince}
        onSelectProvince={(prov) => setSelectedProvince(prov)}
        onClose={() => setProvinceModalVisible(false)}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.base,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    marginTop: 2,
  },
  provinceSelectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md + 2,
  },
  provinceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  searchSection: {
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: spacing.borderRadiusFull,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  comarcasList: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  listHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
});
