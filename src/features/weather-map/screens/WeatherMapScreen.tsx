import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { useWeatherMapStore } from '../store/useWeatherMapStore';
import { WeekDaySelector } from '../components/WeekDaySelector';
import { RadarMapView } from '../components/RadarMapView';
import { FullScreenMapModal } from '../components/FullScreenMapModal';
import { OfficialBulletinsList } from '../components/OfficialBulletinsList';

export const WeatherMapScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const {
    days,
    selectedDayIndex,
    bulletins,
    isLoading,
    setSelectedDayIndex,
    loadInitialData,
  } = useWeatherMapStore();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const selectedDay = days.find((d) => d.index === selectedDayIndex);
  const selectedDayLabel = selectedDay
    ? `${selectedDay.label} (${selectedDay.dateFormatted})`
    : 'Hoy';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadInitialData}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="hero" style={styles.title}>
            Noticias & Mapa
          </Typography>
        </View>

        {/* 7-Day Selector */}
        <WeekDaySelector
          days={days}
          selectedIndex={selectedDayIndex}
          onSelectDay={(idx) => {
            setSelectedDayIndex(idx);
          }}
        />

        {/* Interactive Radar Leaflet Map Card */}
        <RadarMapView />

        {/* Official Bulletins */}
        <OfficialBulletinsList
          bulletins={bulletins}
          isLoading={isLoading}
          selectedDayLabel={selectedDayLabel}
        />
      </ScrollView>

      {/* Fullscreen Map Modal */}
      <FullScreenMapModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 90, // safe distance from 80px bottom tab bar
    gap: spacing.base,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    marginTop: spacing.xs,
  },
});
