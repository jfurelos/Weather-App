import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ScreenBackground } from '@/shared/components/ScreenBackground';
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
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadInitialData}
            tintColor={colors.onBackgroundAccent}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="hero" color="onBackground" style={styles.title}>
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
    marginBottom: 2,
  },
  title: {
    marginTop: 2,
  },
});
