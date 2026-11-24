import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { MapPin, Sparkles, SlidersHorizontal } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import { spacing } from '@/shared/theme/spacing';
import { FONT_DISPLAY_BOLD } from '@/shared/theme/typography';
import { useClaudyStore } from '../store/useClaudyStore';
import { ClaudySvg } from './ClaudySvg';
import {
  getClaudyWeatherCopy,
  getTimeGreeting,
  resolveClaudyWeatherMode,
} from '../types';

export const ClaudyGreetingOverlay: React.FC = () => {
  const { isDark, colors } = useThemeStore();
  const hasEnteredApp = useProfileStore((s) => s.hasEnteredApp);
  const profile = useProfileStore((s) => s.profile);
  const fixedLocation = useProfileStore((s) => s.fixedLocation);

  const weather = useHomeStore((s) => s.weather);
  const isLoadingWeather = useHomeStore((s) => s.isLoading);
  const loadHomeData = useHomeStore((s) => s.loadHomeData);

  const {
    config,
    isGreetingVisible,
    dismissGreeting,
    openCustomizer,
  } = useClaudyStore();

  useEffect(() => {
    if (hasEnteredApp && isGreetingVisible && !weather) {
      loadHomeData();
    }
  }, [hasEnteredApp, isGreetingVisible, weather, loadHomeData]);

  if (!hasEnteredApp || !isGreetingVisible) {
    return null;
  }

  const currentHour = new Date().getHours();
  const { headline, dateLabel } = getTimeGreeting({
    hour: currentHour,
    userName: profile.fullName,
    isAuthenticated: profile.isAuthenticated,
  });

  const weatherMode = weather
    ? resolveClaudyWeatherMode({
        weatherCode: weather.current.weatherCode,
        temperature: weather.current.temperature,
        windSpeed: weather.current.windSpeed,
        precipitation: weather.current.precipitation,
      })
    : 'sunny';

  const copy = getClaudyWeatherCopy(weatherMode, config.name);

  return (
    <View style={[styles.backdrop, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera editorial 5 Minute Journal */}
          <View style={styles.headerBlock}>
            <View style={styles.brandBadgeRow}>
              <Image
                source={require('../../../../assets/hoy_que_logo.png')}
                style={styles.brandIcon}
                resizeMode="cover"
              />
              <Typography variant="captionMedium" color="onBackgroundAccent" style={styles.brandName}>
                Hoy qué?
              </Typography>
            </View>
            <Typography variant="captionMedium" color="onBackgroundAccent" style={styles.dateEyebrow}>
              {dateLabel.toUpperCase()}
            </Typography>
            <Typography variant="hero" color="onBackground" style={styles.headline}>
              {headline}
            </Typography>
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.onBackgroundAccent} />
              <Typography variant="caption" color="onBackgroundSecondary">
                {fixedLocation.name}, {fixedLocation.province}
              </Typography>
            </View>
          </View>

          {/* Tarjeta protagonista de Claudy */}
          <Card variant="window" style={styles.heroCard}>
            <View style={styles.cardTopRow}>
              <Badge label={config.name} tone="brand" />
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={openCustomizer}
                style={[
                  styles.customizePill,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.subcardBorder,
                  },
                ]}
                accessibilityLabel={`Personalizar a ${config.name}`}
              >
                <SlidersHorizontal size={13} color={colors.textPrimary} />
                <Typography variant="captionMedium" style={{ fontSize: 11.5 }}>
                  Personalizar
                </Typography>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.claudyStage,
                {
                  backgroundColor: isDark ? colors.surface : colors.inputBg,
                  borderColor: colors.subcardBorder,
                },
              ]}
            >
              <ClaudySvg weatherMode={weatherMode} config={config} size={184} />
            </View>

            {/* Temperatura actual + resumen climático */}
            <View style={styles.weatherStrip}>
              {isLoadingWeather && !weather ? (
                <View style={styles.loadingWeather}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Typography variant="caption" color="secondary">
                    Consultando el cielo en {fixedLocation.name}...
                  </Typography>
                </View>
              ) : weather ? (
                <View style={styles.tempRow}>
                  <Typography
                    variant="hero"
                    style={[
                      styles.tempValue,
                      { fontFamily: FONT_DISPLAY_BOLD, color: colors.textPrimary },
                    ]}
                  >
                    {weather.current.temperature}°C
                  </Typography>
                  <View style={styles.tempMeta}>
                    <Badge
                      label={weather.current.conditionText}
                      tone={weatherMode === 'rainy' || weatherMode === 'storm' ? 'rain' : 'warning'}
                    />
                    <Typography variant="caption" color="secondary">
                      Mín {weather.daily.tempMin}° · Máx {weather.daily.tempMax}°
                    </Typography>
                  </View>
                </View>
              ) : (
                <View style={styles.tempMeta}>
                  <Badge label={copy.label} tone="warning" />
                </View>
              )}
            </View>

            {/* Frase corta cálida */}
            <View style={[styles.quoteBox, { backgroundColor: colors.surface, borderColor: colors.subcardBorder }]}>
              <View style={styles.quoteTitleRow}>
                <Sparkles size={13} color={colors.accent} />
                <Typography variant="captionMedium" color="brand" style={{ fontSize: 11 }}>
                  {copy.outfitNote.toUpperCase()}
                </Typography>
              </View>
              <Typography variant="body" style={styles.quoteText}>
                {copy.quote}
              </Typography>
            </View>
          </Card>

          {/* Botón principal burdeos/rojo para entrar a Home */}
          <View style={styles.ctaContainer}>
            <Button
              title="Entrar a Inicio"
              variant="primary"
              onPress={dismissGreeting}
              style={styles.ctaButton}
              accessibilityLabel="Entrar a la página principal"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 900,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  headerBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  brandIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
  },
  brandName: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  dateEyebrow: {
    letterSpacing: 1.2,
    fontSize: 11,
  },
  headline: {
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  heroCard: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  customizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  claudyStage: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  weatherStrip: {
    alignItems: 'center',
  },
  loadingWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  tempValue: {
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -1,
  },
  tempMeta: {
    gap: 4,
    alignItems: 'flex-start',
  },
  quoteBox: {
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    padding: spacing.md,
    gap: 5,
  },
  quoteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  quoteText: {
    lineHeight: 20,
  },
  ctaContainer: {
    gap: spacing.sm + 2,
  },
  ctaButton: {
    width: '100%',
  },
  skipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
  },
});
