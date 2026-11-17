import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Search, ChevronDown, Layers } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { getComarcasForProvince, Comarca } from '../data/provincesData';
import { useComarcasForumStore } from '../store/useComarcasForumStore';
import { ProvinceSelectorModal } from '../components/ProvinceSelectorModal';
import { FavoriteComarcasBar } from '../components/FavoriteComarcasBar';
import { ComarcaCard } from '../components/ComarcaCard';
import { RootStackParamList } from '@/app/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ForumListScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();

  const {
    selectedProvince,
    searchQuery,
    favoriteComarcas,
    loadPersistedState,
    setSelectedProvince,
    setSearchQuery,
    toggleFavoriteComarca,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header principal */}
        <View style={styles.header}>
          <Typography variant="caption" color="secondary">
            FOROS PROVINCIALES Y COMARCAS
          </Typography>
          <Typography variant="hero" style={styles.title}>
            Foro Comunitario
          </Typography>
          <Typography variant="body" color="secondary">
            Debates hiperlocales organizados por provincia y comarca.
          </Typography>
        </View>

        {/* Tarjeta de Provincia Activa y Selector */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.provinceSelectorCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => setProvinceModalVisible(true)}
        >
          <View style={styles.provinceCardLeft}>
            <View style={[styles.pinCircle, { backgroundColor: colors.primaryMuted }]}>
              <MapPin size={20} color={colors.primary} />
            </View>
            <View>
              <Typography variant="caption" color="secondary">
                FORO PROVINCIAL ACTIVO
              </Typography>
              <Typography variant="h2" style={{ fontWeight: '800' }}>
                {selectedProvince}
              </Typography>
            </View>
          </View>

          <View style={[styles.changePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Typography variant="captionMedium" style={{ fontWeight: '700', color: colors.textPrimary }}>
              Cambiar
            </Typography>
            <ChevronDown size={14} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        {/* Sección de Comarcas Favoritas (Acceso Rápido) */}
        <FavoriteComarcasBar
          favorites={favoriteComarcas}
          onSelectComarca={handleOpenComarca}
        />

        {/* Buscador de Subforums (Comarcas) */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: colors.card, borderColor: colors.border },
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 90, // Margen de seguridad con la barra de navegación de 80px
    gap: spacing.base,
  },
  header: {
    gap: 4,
  },
  title: {
    marginTop: 2,
  },
  provinceSelectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md + 2,
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
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
