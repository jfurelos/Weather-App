import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  X,
  Moon,
  Sun,
  ExternalLink,
  Copy,
  Check,
  Code2,
  LayoutGrid,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { ThemeMode } from '@/shared/theme/themes';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import {
  buildWidgetEmbedUrl,
  buildWidgetPayload,
  createFallbackWidgetPayload,
  persistWidgetPayload,
  WidgetSizeFormat,
} from '@/shared/services/widgetDataSync';
import { useClaudyStore } from '../store/useClaudyStore';
import {
  ClaudyLockscreenWidget,
  ClaudyMediumWidget,
  ClaudySmallWidget,
} from './ClaudyWidgetPreviews';

const SIZE_OPTIONS: { id: WidgetSizeFormat; label: string }[] = [
  { id: 'small', label: '2×2 Pequeño' },
  { id: 'medium', label: '4×2 Mediano' },
  { id: 'lockscreen', label: 'Bloqueo' },
];

async function copyTextWebSafe(text: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback textarea abajo
    }
  }
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
  return false;
}

export const ClaudyWidgetGalleryModal: React.FC = () => {
  const { isDark, theme, colors } = useThemeStore();
  const claudyConfig = useClaudyStore((s) => s.config);
  const isVisible = useClaudyStore((s) => s.isWidgetGalleryVisible);
  const closeWidgetGallery = useClaudyStore((s) => s.closeWidgetGallery);

  const weather = useHomeStore((s) => s.weather);
  const advice = useHomeStore((s) => s.advice);
  const selectedCity = useHomeStore((s) => s.selectedCity);
  const fixedLocation = useProfileStore((s) => s.fixedLocation);

  const [widgetTheme, setWidgetTheme] = useState<ThemeMode>(isDark ? 'dark' : 'light');
  const [selectedSize, setSelectedSize] = useState<WidgetSizeFormat>('medium');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showJsonPayload, setShowJsonPayload] = useState(false);

  const payload = useMemo(() => {
    const cityName = selectedCity.name || fixedLocation.name || 'Madrid';
    const province = selectedCity.province || fixedLocation.province || 'Madrid';
    if (!weather) {
      return createFallbackWidgetPayload({
        claudyConfig,
        cityName,
        province,
        themeMode: widgetTheme,
      });
    }
    return buildWidgetPayload({
      claudyConfig,
      cityName,
      province,
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      weather,
      advice,
      themeMode: widgetTheme,
    });
  }, [claudyConfig, selectedCity, fixedLocation, weather, advice, widgetTheme]);

  const embedUrl = useMemo(
    () =>
      buildWidgetEmbedUrl({
        size: selectedSize,
        theme: widgetTheme,
      }),
    [selectedSize, widgetTheme]
  );

  const handleOpenWidgetMode = async () => {
    await persistWidgetPayload(payload);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(embedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyUrl = async () => {
    await persistWidgetPayload(payload);
    const ok = await copyTextWebSafe(embedUrl);
    if (ok) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2400);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeWidgetGallery}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.cardSolid,
              borderColor: colors.border,
              borderTopWidth: theme.metrics.windowBorderWidth,
              borderTopLeftRadius: theme.metrics.windowRadius + 4,
              borderTopRightRadius: theme.metrics.windowRadius + 4,
            },
            theme.shadows.modal,
          ]}
        >
          {/* Cabecera */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerTitleRow}>
                <LayoutGrid size={18} color={colors.primary} />
                <Typography variant="h2">Widgets de {claudyConfig.name}</Typography>
              </View>
              <Typography variant="caption" color="secondary">
                Datos reales de Open-Meteo · Listos para Web `/widget`, WidgetKit y Glance
              </Typography>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={closeWidgetGallery}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.pillBg, borderColor: colors.subcardBorder },
              ]}
              accessibilityLabel="Cerrar galería de widgets"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Selector de Tema del Widget (Oscuro / Claro) */}
            <View style={styles.controlsRow}>
              <Typography variant="captionMedium" color="secondary">
                TEMA DEL WIDGET
              </Typography>
              <View style={styles.themeToggleRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setWidgetTheme('dark')}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor:
                        widgetTheme === 'dark' ? colors.primary : colors.inputBg,
                      borderColor:
                        widgetTheme === 'dark' ? colors.primaryDark : colors.subcardBorder,
                    },
                  ]}
                >
                  <Moon
                    size={13}
                    color={widgetTheme === 'dark' ? colors.onPrimary : colors.textPrimary}
                  />
                  <Typography
                    variant="captionMedium"
                    style={{
                      fontSize: 12,
                      color: widgetTheme === 'dark' ? colors.onPrimary : colors.textPrimary,
                    }}
                  >
                    Oscuro
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setWidgetTheme('light')}
                  style={[
                    styles.themeChip,
                    {
                      backgroundColor:
                        widgetTheme === 'light' ? colors.accent : colors.inputBg,
                      borderColor:
                        widgetTheme === 'light' ? 'rgba(84,11,14,0.2)' : colors.subcardBorder,
                    },
                  ]}
                >
                  <Sun
                    size={13}
                    color={widgetTheme === 'light' ? colors.onAccent : colors.textPrimary}
                  />
                  <Typography
                    variant="captionMedium"
                    style={{
                      fontSize: 12,
                      color: widgetTheme === 'light' ? colors.onAccent : colors.textPrimary,
                    }}
                  >
                    Claro
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Formato 1: Pequeño (2x2) */}
            <View style={styles.previewSection}>
              <View style={styles.previewLabelRow}>
                <Typography variant="captionMedium" color="secondary">
                  PEQUEÑO (2×2)
                </Typography>
                <Badge label="Inicio rápido" tone="neutral" />
              </View>
              <View
                style={[
                  styles.stage,
                  {
                    backgroundColor:
                      widgetTheme === 'dark' ? 'rgba(36,67,75,0.12)' : 'rgba(51,92,103,0.08)',
                    borderColor: colors.subcardBorder,
                  },
                ]}
              >
                <ClaudySmallWidget
                  payload={payload}
                  widgetTheme={widgetTheme}
                  onPress={() => setSelectedSize('small')}
                />
              </View>
            </View>

            {/* Formato 2: Mediano (4x2) */}
            <View style={styles.previewSection}>
              <View style={styles.previewLabelRow}>
                <Typography variant="captionMedium" color="secondary">
                  MEDIANO (4×2)
                </Typography>
                <Badge label="Recomendado" tone="warning" />
              </View>
              <View
                style={[
                  styles.stage,
                  {
                    backgroundColor:
                      widgetTheme === 'dark' ? 'rgba(36,67,75,0.12)' : 'rgba(51,92,103,0.08)',
                    borderColor: colors.subcardBorder,
                  },
                ]}
              >
                <ClaudyMediumWidget
                  payload={payload}
                  widgetTheme={widgetTheme}
                  onPress={() => setSelectedSize('medium')}
                />
              </View>
            </View>

            {/* Formato 3: Compacto / Pantalla de Bloqueo */}
            <View style={styles.previewSection}>
              <View style={styles.previewLabelRow}>
                <Typography variant="captionMedium" color="secondary">
                  COMPACTO / PANTALLA DE BLOQUEO
                </Typography>
                <Badge label="Lock Screen" tone="neutral" />
              </View>
              <View
                style={[
                  styles.stage,
                  {
                    backgroundColor:
                      widgetTheme === 'dark' ? 'rgba(36,67,75,0.12)' : 'rgba(51,92,103,0.08)',
                    borderColor: colors.subcardBorder,
                  },
                ]}
              >
                <ClaudyLockscreenWidget
                  payload={payload}
                  widgetTheme={widgetTheme}
                  onPress={() => setSelectedSize('lockscreen')}
                />
              </View>
            </View>

            {/* Modo Widget Web embebible (/widget) */}
            <View
              style={[
                styles.embedCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.subcardBorder,
                },
              ]}
            >
              <Typography variant="h3">Modo Widget Web (`/widget`)</Typography>
              <Typography variant="caption" color="secondary" style={{ lineHeight: 17 }}>
                Elige un tamaño y ábrelo en una vista minimalista para fijar en tu escritorio o probar en Vercel.
              </Typography>

              <View style={styles.sizeRow}>
                {SIZE_OPTIONS.map((opt) => {
                  const active = selectedSize === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      activeOpacity={0.78}
                      onPress={() => setSelectedSize(opt.id)}
                      style={[
                        styles.sizeChip,
                        {
                          backgroundColor: active ? colors.primary : colors.inputBg,
                          borderColor: active ? colors.primaryDark : colors.subcardBorder,
                        },
                      ]}
                    >
                      <Typography
                        variant="captionMedium"
                        style={{
                          fontSize: 11.5,
                          color: active ? colors.onPrimary : colors.textPrimary,
                        }}
                      >
                        {opt.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View
                style={[
                  styles.urlPreviewBox,
                  { backgroundColor: colors.inputBg, borderColor: colors.subcardBorder },
                ]}
              >
                <Typography
                  variant="caption"
                  color="secondary"
                  numberOfLines={1}
                  style={{ flex: 1, fontSize: 11 }}
                >
                  {embedUrl}
                </Typography>
              </View>

              <View style={styles.embedActions}>
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={handleCopyUrl}
                  style={[
                    styles.secondaryActionBtn,
                    { backgroundColor: colors.inputBg, borderColor: colors.borderStrong },
                  ]}
                >
                  {copiedUrl ? (
                    <Check size={15} color={colors.primary} />
                  ) : (
                    <Copy size={15} color={colors.textPrimary} />
                  )}
                  <Typography variant="captionMedium" style={{ fontSize: 12.5 }}>
                    {copiedUrl ? '¡Enlace copiado!' : 'Copiar enlace'}
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.84}
                  onPress={handleOpenWidgetMode}
                  style={[
                    styles.primaryActionBtn,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <ExternalLink size={15} color={colors.onPrimary} />
                  <Typography
                    variant="captionMedium"
                    style={{ color: colors.onPrimary, fontSize: 12.5 }}
                  >
                    Abrir `/widget`
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Inspector opcional del Payload JSON (WidgetKit / Android Glance) */}
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => setShowJsonPayload((prev) => !prev)}
              style={[
                styles.jsonToggleRow,
                { backgroundColor: colors.inputBg, borderColor: colors.subcardBorder },
              ]}
            >
              <Code2 size={15} color={colors.textSecondary} />
              <Typography variant="captionMedium" color="secondary" style={{ flex: 1 }}>
                {showJsonPayload
                  ? 'Ocultar payload JSON nativo (widgetDataSync)'
                  : 'Ver payload JSON preparado para WidgetKit / Glance'}
              </Typography>
            </TouchableOpacity>

            {showJsonPayload && (
              <View
                style={[
                  styles.jsonBox,
                  { backgroundColor: '#24434B', borderColor: colors.border },
                ]}
              >
                <Typography
                  variant="caption"
                  style={{
                    color: '#FFF3B0',
                    fontSize: 10.5,
                    lineHeight: 15,
                  }}
                >
                  {JSON.stringify(
                    {
                      claudyName: payload.claudyName,
                      cityName: payload.cityName,
                      temperature: payload.temperature,
                      condition: payload.condition,
                      topOutfitTip: payload.topOutfitTip,
                      themeMode: payload.themeMode,
                      updatedAt: payload.updatedAt,
                    },
                    null,
                    2
                  )}
                </Typography>
              </View>
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
    backgroundColor: 'rgba(18, 34, 40, 0.56)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '93%',
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    gap: spacing.base,
    paddingBottom: spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  previewSection: {
    gap: spacing.xs + 2,
  },
  previewLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stage: {
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    padding: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  embedCard: {
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  sizeChip: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  urlPreviewBox: {
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  embedActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primaryActionBtn: {
    flex: 1,
    height: 44,
    borderRadius: spacing.borderRadiusMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  jsonToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  jsonBox: {
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    padding: spacing.md,
  },
});
