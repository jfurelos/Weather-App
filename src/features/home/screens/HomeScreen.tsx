import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { useHomeStore } from '../store/useHomeStore';
import { WeatherHeroCard } from '../components/WeatherHeroCard';
import { HourlyTimeline } from '../components/HourlyTimeline';
import { AdviceCard } from '../components/AdviceCard';
import { FeaturedNewsCard } from '../components/FeaturedNewsCard';
import { CitySelectorModal } from '../components/CitySelectorModal';

export const HomeScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation<any>();

  const {
    selectedCity,
    weather,
    advice,
    news,
    activeMockScenario,
    isLoading,
    isRefreshing,
    error,
    loadHomeData,
    refreshHomeData,
    setSelectedCity,
    clearMockStormScenario,
  } = useHomeStore();

  const [isCityModalVisible, setCityModalVisible] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshHomeData}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Encabezado Principal Airbnb */}
        <View style={styles.header}>
          <Typography variant="hero" style={styles.title}>
            El Tiempo Hoy
          </Typography>
        </View>

        {activeMockScenario && (
          <View
            style={[
              styles.mockBanner,
              { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Typography variant="captionMedium" color="brand" style={{ fontWeight: '700' }}>
                Temporal demo: {activeMockScenario.stormTitle}
              </Typography>
              <Typography variant="caption" color="secondary">
                Perfil {activeMockScenario.userName} • {selectedCity.name}
              </Typography>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={clearMockStormScenario}
              style={[styles.mockResetBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Typography variant="captionMedium" style={{ fontWeight: '600' }}>
                Clima real
              </Typography>
            </TouchableOpacity>
          </View>
        )}

        {/* Estado de Carga Inicial */}
        {isLoading && !weather ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Typography variant="body" color="secondary" style={{ marginTop: spacing.md }}>
              Consultando previsiones para {selectedCity.name}...
            </Typography>
          </View>
        ) : error && !weather ? (
          /* Estado de Error */
          <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
            <Typography variant="h3" style={{ textAlign: 'center' }}>
              No se pudo cargar el pronóstico
            </Typography>
            <Typography variant="body" color="secondary" style={{ textAlign: 'center', marginTop: spacing.xs }}>
              {error}
            </Typography>
            <Button
              title="Reintentar"
              variant="primary"
              style={{ marginTop: spacing.base }}
              onPress={loadHomeData}
            />
          </View>
        ) : weather ? (
          /* Contenido Principal */
          <>
            {/* 1. Tarjeta Clima Actual */}
            <WeatherHeroCard
              weather={weather}
              city={selectedCity}
              onPressCity={() => setCityModalVisible(true)}
            />

            {/* 2. Timeline de pronóstico por horas */}
            <HourlyTimeline hourly={weather.hourly} />

            {/* 3. Consejo del Día (Rules Engine) */}
            {advice && <AdviceCard advice={advice} />}

            {/* 4. Resumen de Noticias y Avisos Oficiales */}
            <FeaturedNewsCard
              news={news}
              onPressSeeAll={() => navigation.navigate('WeatherMap')}
            />
          </>
        ) : null}
      </ScrollView>

      {/* Modal Selector de Ciudad */}
      <CitySelectorModal
        visible={isCityModalVisible}
        selectedCity={selectedCity}
        onClose={() => setCityModalVisible(false)}
        onSelectCity={(city) => setSelectedCity(city)}
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
    gap: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  mockResetBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  loadingContainer: {
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: spacing.xl,
    borderRadius: spacing.borderRadiusLg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
});
