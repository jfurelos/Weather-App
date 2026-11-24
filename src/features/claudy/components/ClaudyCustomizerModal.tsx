import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { X, RotateCcw, Check, CloudSun, Sun, CloudRain, Snowflake, LayoutGrid } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { useProfileStore } from '@/features/profile/store/useProfileStore';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import { spacing } from '@/shared/theme/spacing';
import { FONT_BODY_BOLD } from '@/shared/theme/typography';
import { useClaudyStore } from '../store/useClaudyStore';
import { ClaudySvg } from './ClaudySvg';
import {
  CLAUDY_DETAIL_TONES,
  CLAUDY_EXPRESSIONS,
  CLAUDY_GLASSES_OPTIONS,
  CLAUDY_HEADWEAR_OPTIONS,
  CLAUDY_SCARF_OPTIONS,
  CLAUDY_UMBRELLA_OPTIONS,
  ClaudyConfig,
  ClaudyWeatherMode,
  DEFAULT_CLAUDY_CONFIG,
  resolveClaudyWeatherMode,
} from '../types';

type PreviewWeatherOption = 'real' | 'sunny' | 'rainy' | 'cold';

export const ClaudyCustomizerModal: React.FC = () => {
  const { isDark, theme, colors } = useThemeStore();
  const profile = useProfileStore((s) => s.profile);
  const weather = useHomeStore((s) => s.weather);

  const {
    config,
    isCustomizerVisible,
    isSaving,
    saveClaudyConfig,
    closeCustomizer,
    openWidgetGallery,
  } = useClaudyStore();

  const [draft, setDraft] = useState<ClaudyConfig>(config);
  const [previewWeather, setPreviewWeather] = useState<PreviewWeatherOption>('real');
  const [highlightUmbrella, setHighlightUmbrella] = useState(false);

  useEffect(() => {
    if (isCustomizerVisible) {
      setDraft(config);
      setPreviewWeather('real');
      setHighlightUmbrella(false);
    }
  }, [isCustomizerVisible, config]);

  const realWeatherMode: ClaudyWeatherMode = weather
    ? resolveClaudyWeatherMode({
        weatherCode: weather.current.weatherCode,
        temperature: weather.current.temperature,
        windSpeed: weather.current.windSpeed,
        precipitation: weather.current.precipitation,
      })
    : 'sunny';

  const activeWeatherMode: ClaudyWeatherMode =
    previewWeather === 'real' ? realWeatherMode : previewWeather;

  const handleSave = async () => {
    await saveClaudyConfig(draft, {
      userId: profile.id,
      isAuthenticated: profile.isAuthenticated,
    });
    closeCustomizer();
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_CLAUDY_CONFIG });
    setHighlightUmbrella(false);
  };

  const renderChipGroup = <T extends string>(
    options: { id: T; label: string }[],
    selected: T,
    onSelect: (val: T) => void
  ) => (
    <View style={styles.chipsWrap}>
      {options.map((opt) => {
        const isSelected = opt.id === selected;
        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.78}
            onPress={() => onSelect(opt.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.primary : colors.inputBg,
                borderColor: isSelected ? colors.primaryDark : colors.subcardBorder,
              },
            ]}
          >
            <Typography
              variant="captionMedium"
              style={{
                color: isSelected ? colors.onPrimary : colors.textPrimary,
                fontSize: 12,
              }}
            >
              {opt.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const previewModes: { id: PreviewWeatherOption; label: string; icon: React.ReactNode }[] = [
    { id: 'real', label: 'Actual', icon: <CloudSun size={13} color={previewWeather === 'real' ? colors.onAccent : colors.textPrimary} /> },
    { id: 'sunny', label: 'Sol', icon: <Sun size={13} color={previewWeather === 'sunny' ? colors.onAccent : colors.textPrimary} /> },
    { id: 'rainy', label: 'Lluvia', icon: <CloudRain size={13} color={previewWeather === 'rainy' ? colors.onAccent : colors.textPrimary} /> },
    { id: 'cold', label: 'Frío', icon: <Snowflake size={13} color={previewWeather === 'cold' ? colors.onAccent : colors.textPrimary} /> },
  ];

  return (
    <Modal
      visible={isCustomizerVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={closeCustomizer}
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
              <Typography variant="h2">Personalizar a {draft.name.trim() || 'Claudy'}</Typography>
              <Typography variant="caption" color="secondary">
                {profile.isAuthenticated
                  ? 'Se guarda en tu perfil de Supabase'
                  : 'Se guarda localmente en tu navegador'}
              </Typography>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                closeCustomizer();
                openWidgetGallery();
              }}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.cardHighlight, borderColor: 'rgba(224,159,62,0.5)' },
              ]}
              accessibilityLabel="Abrir galería de widgets de Claudy"
            >
              <LayoutGrid size={16} color={colors.primaryDark} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleReset}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.pillBg, borderColor: colors.subcardBorder },
              ]}
              accessibilityLabel="Restablecer valores por defecto"
            >
              <RotateCcw size={16} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={closeCustomizer}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.pillBg, borderColor: colors.subcardBorder },
              ]}
              accessibilityLabel="Cerrar personalizador de Claudy"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Escenario de vista previa en vivo */}
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: isDark ? colors.surface : colors.card,
                  borderColor: colors.subcardBorder,
                },
              ]}
            >
              <ClaudySvg
                weatherMode={activeWeatherMode}
                config={draft}
                size={156}
                forceShowUmbrella={highlightUmbrella}
              />

              {/* Selector rápido de clima de prueba */}
              <View style={styles.previewWeatherRow}>
                {previewModes.map((pm) => {
                  const active = previewWeather === pm.id;
                  return (
                    <TouchableOpacity
                      key={pm.id}
                      activeOpacity={0.78}
                      onPress={() => {
                        setPreviewWeather(pm.id);
                        setHighlightUmbrella(false);
                      }}
                      style={[
                        styles.previewWeatherChip,
                        {
                          backgroundColor: active ? colors.accent : colors.inputBg,
                          borderColor: active ? 'rgba(84,11,14,0.18)' : colors.subcardBorder,
                        },
                      ]}
                    >
                      {pm.icon}
                      <Typography
                        variant="captionMedium"
                        style={{
                          fontSize: 11,
                          color: active ? colors.onAccent : colors.textPrimary,
                        }}
                      >
                        {pm.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 1. Nombre visible */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                NOMBRE DE TU NUBE
              </Typography>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    fontFamily: FONT_BODY_BOLD,
                  },
                ]}
                placeholder="Claudy"
                placeholderTextColor={colors.textMuted}
                value={draft.name}
                onChangeText={(text) => setDraft((prev) => ({ ...prev, name: text }))}
                maxLength={24}
              />
            </View>

            {/* 2. Expresión facial */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                EXPRESIÓN FACIAL
              </Typography>
              {renderChipGroup(CLAUDY_EXPRESSIONS, draft.expression, (expression) => {
                setHighlightUmbrella(false);
                setDraft((prev) => ({ ...prev, expression }));
              })}
            </View>

            {/* 3. Gafas */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                GAFAS
              </Typography>
              {renderChipGroup(CLAUDY_GLASSES_OPTIONS, draft.glassesStyle, (glassesStyle) => {
                setHighlightUmbrella(false);
                setDraft((prev) => ({ ...prev, glassesStyle }));
              })}
            </View>

            {/* 4. Gorro / Sombrero */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                GORRO / SOMBRERO
              </Typography>
              {renderChipGroup(CLAUDY_HEADWEAR_OPTIONS, draft.headwearStyle, (headwearStyle) => {
                setHighlightUmbrella(false);
                setDraft((prev) => ({ ...prev, headwearStyle }));
              })}
            </View>

            {/* 5. Bufanda */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                BUFANDA
              </Typography>
              {renderChipGroup(CLAUDY_SCARF_OPTIONS, draft.scarfStyle, (scarfStyle) => {
                setHighlightUmbrella(false);
                setDraft((prev) => ({ ...prev, scarfStyle }));
              })}
            </View>

            {/* 6. Estilo de paraguas */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                ESTILO DE PARAGUAS (LLUVIA / TORMENTA)
              </Typography>
              {renderChipGroup(CLAUDY_UMBRELLA_OPTIONS, draft.umbrellaStyle, (umbrellaStyle) => {
                setHighlightUmbrella(true);
                setDraft((prev) => ({ ...prev, umbrellaStyle }));
              })}
            </View>

            {/* 7. Tono sutil de detalles */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                TONO SUTIL DE DETALLES
              </Typography>
              <View style={styles.tonesRow}>
                {CLAUDY_DETAIL_TONES.map((tone) => {
                  const selected = draft.detailTone === tone.id;
                  const checkColor =
                    tone.id === 'vanilla' || tone.id === 'honey' ? '#540B0E' : '#FFFFFF';
                  return (
                    <TouchableOpacity
                      key={tone.id}
                      activeOpacity={0.8}
                      onPress={() => setDraft((prev) => ({ ...prev, detailTone: tone.id }))}
                      style={[
                        styles.toneBtn,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: selected ? colors.primary : colors.subcardBorder,
                          borderWidth: selected ? 2 : 1,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.toneDot,
                          {
                            backgroundColor: tone.hex,
                            borderColor: 'rgba(51, 92, 103, 0.25)',
                          },
                        ]}
                      >
                        {selected && <Check size={12} color={checkColor} strokeWidth={3} />}
                      </View>
                      <Typography variant="captionMedium" style={{ fontSize: 11.5 }}>
                        {tone.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.divider }]}>
            <Button
              title="Cancelar"
              variant="outline"
              style={{ flex: 1 }}
              onPress={closeCustomizer}
            />
            <Button
              title="Guardar cambios"
              variant="primary"
              loading={isSaving}
              style={{ flex: 1.5 }}
              onPress={handleSave}
            />
          </View>
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
    maxHeight: '92%',
    padding: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
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
    paddingBottom: spacing.sm,
  },
  previewBox: {
    alignItems: 'center',
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  previewWeatherRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs + 2,
  },
  previewWeatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  section: {
    gap: spacing.xs + 2,
  },
  nameInput: {
    height: 46,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  tonesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  toneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: spacing.borderRadiusFull,
  },
  toneDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
});
