import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  X,
  CloudRain,
  Wind,
  Sun,
  Volume2,
  VolumeX,
  Check,
  Play,
} from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import {
  ALERT_TONES,
  AlertToneId,
  HEAT_THRESHOLDS,
  HeatThreshold,
  RAIN_THRESHOLDS,
  RainThreshold,
  WIND_THRESHOLDS,
  WindThreshold,
} from '../data/locationsData';
import { AlertCategory, AlertsPreferences } from '../store/useProfileStore';
import { playAlertTonePreview } from '../services/alertSoundService';

interface Props {
  visible: boolean;
  alerts: AlertsPreferences;
  initialTab?: AlertCategory;
  onChangeRainThreshold: (threshold: RainThreshold) => Promise<void>;
  onChangeWindThreshold: (threshold: WindThreshold) => Promise<void>;
  onChangeHeatThreshold: (threshold: HeatThreshold) => Promise<void>;
  onChangeTone: (category: AlertCategory, toneId: AlertToneId) => Promise<void>;
  onClose: () => void;
}

export const AlertSettingsModal: React.FC<Props> = ({
  visible,
  alerts,
  initialTab = 'rain',
  onChangeRainThreshold,
  onChangeWindThreshold,
  onChangeHeatThreshold,
  onChangeTone,
  onClose,
}) => {
  const { colors } = useThemeStore();
  const [activeTab, setActiveTab] = useState<AlertCategory>(initialTab);
  const [playingToneId, setPlayingToneId] = useState<AlertToneId | null>(null);

  const handleSelectTone = async (toneId: AlertToneId) => {
    await onChangeTone(activeTab, toneId);
    if (toneId !== 'silent') {
      setPlayingToneId(toneId);
      await playAlertTonePreview(toneId);
      setTimeout(() => setPlayingToneId((curr) => (curr === toneId ? null : curr)), 700);
    }
  };

  const handlePreviewTone = async (toneId: AlertToneId) => {
    if (toneId === 'silent') return;
    setPlayingToneId(toneId);
    await playAlertTonePreview(toneId);
    setTimeout(() => setPlayingToneId((curr) => (curr === toneId ? null : curr)), 700);
  };

  const currentToneId = alerts[activeTab].toneId;

  const tabs: { key: AlertCategory; label: string; color: string }[] = [
    { key: 'rain', label: 'Lluvia', color: colors.rain },
    { key: 'wind', label: 'Viento', color: colors.wind },
    { key: 'heat', label: 'Calor', color: colors.heat },
  ];

  const renderTabIcon = (key: AlertCategory, active: boolean) => {
    const iconColor = active ? '#FFFFFF' : colors.textSecondary;
    switch (key) {
      case 'rain':
        return <CloudRain size={15} color={iconColor} />;
      case 'wind':
        return <Wind size={15} color={iconColor} />;
      case 'heat':
        return <Sun size={15} color={iconColor} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Typography variant="h3">Umbrales y Tonos de Alerta</Typography>
              <Typography variant="caption" color="secondary">
                Personaliza sensibilidad y sonido por tipo de fenómeno
              </Typography>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.closeButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={onClose}
              accessibilityLabel="Cerrar ajustes de alertas"
            >
              <X size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Selector de categoría */}
          <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {tabs.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab(t.key)}
                  style={[
                    styles.tabItem,
                    {
                      backgroundColor: isActive ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {renderTabIcon(t.key, isActive)}
                  <Typography
                    variant="captionMedium"
                    style={{
                      color: isActive ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isActive ? '700' : '500',
                    }}
                  >
                    {t.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* Sección Umbral */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                UMBRAL DE DISPARO
              </Typography>

              {activeTab === 'rain' && (
                <View style={styles.pillsRow}>
                  {RAIN_THRESHOLDS.map((opt) => {
                    const selected = alerts.rain.threshold === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.75}
                        onPress={() => onChangeRainThreshold(opt.value)}
                        style={[
                          styles.thresholdPill,
                          {
                            backgroundColor: selected ? colors.primaryMuted : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Typography
                          variant="bodyMedium"
                          style={{
                            color: selected ? colors.primary : colors.textPrimary,
                            fontWeight: selected ? '700' : '500',
                          }}
                        >
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" color="secondary">
                          {opt.detail}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeTab === 'wind' && (
                <View style={styles.pillsRow}>
                  {WIND_THRESHOLDS.map((opt) => {
                    const selected = alerts.wind.thresholdKmh === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.75}
                        onPress={() => onChangeWindThreshold(opt.value)}
                        style={[
                          styles.thresholdPill,
                          {
                            backgroundColor: selected ? colors.primaryMuted : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Typography
                          variant="bodyMedium"
                          style={{
                            color: selected ? colors.primary : colors.textPrimary,
                            fontWeight: selected ? '700' : '500',
                          }}
                        >
                          {opt.label}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {activeTab === 'heat' && (
                <View style={styles.pillsRow}>
                  {HEAT_THRESHOLDS.map((opt) => {
                    const selected = alerts.heat.thresholdC === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        activeOpacity={0.75}
                        onPress={() => onChangeHeatThreshold(opt.value)}
                        style={[
                          styles.thresholdPill,
                          {
                            backgroundColor: selected ? colors.primaryMuted : colors.surface,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Typography
                          variant="bodyMedium"
                          style={{
                            color: selected ? colors.primary : colors.textPrimary,
                            fontWeight: selected ? '700' : '500',
                          }}
                        >
                          {opt.label}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Sección Tonos */}
            <View style={styles.section}>
              <Typography variant="captionMedium" color="secondary">
                TONO ASOCIADO
              </Typography>

              <View style={styles.tonesList}>
                {ALERT_TONES.map((tone) => {
                  const isSelected = currentToneId === tone.id;
                  const isPlaying = playingToneId === tone.id;
                  return (
                    <TouchableOpacity
                      key={tone.id}
                      activeOpacity={0.75}
                      onPress={() => handleSelectTone(tone.id)}
                      style={[
                        styles.toneRow,
                        {
                          backgroundColor: isSelected ? colors.primaryMuted : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <View style={styles.toneLeft}>
                        {tone.id === 'silent' ? (
                          <VolumeX
                            size={17}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                        ) : (
                          <Volume2
                            size={17}
                            color={isSelected ? colors.primary : colors.textSecondary}
                          />
                        )}
                        <View style={{ flex: 1 }}>
                          <Typography
                            variant="bodyMedium"
                            style={{
                              color: isSelected ? colors.primary : colors.textPrimary,
                              fontWeight: isSelected ? '700' : '500',
                            }}
                          >
                            {tone.label}
                          </Typography>
                          <Typography variant="caption" color="secondary">
                            {tone.description}
                          </Typography>
                        </View>
                      </View>

                      <View style={styles.toneActions}>
                        {tone.id !== 'silent' && (
                          <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => handlePreviewTone(tone.id)}
                            style={[
                              styles.playBtn,
                              {
                                backgroundColor: isPlaying ? colors.primary : colors.card,
                                borderColor: isPlaying ? colors.primary : colors.border,
                              },
                            ]}
                            accessibilityLabel={`Probar tono ${tone.label}`}
                          >
                            <Play
                              size={12}
                              color={isPlaying ? '#FFFFFF' : colors.textPrimary}
                              fill={isPlaying ? '#FFFFFF' : 'transparent'}
                            />
                          </TouchableOpacity>
                        )}
                        {isSelected && <Check size={17} color={colors.primary} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <Button title="Listo" variant="primary" onPress={onClose} />
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
    maxHeight: '88%',
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
  tabBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: spacing.borderRadiusFull,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    height: 36,
    borderRadius: spacing.borderRadiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  body: {
    gap: spacing.lg,
    paddingBottom: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  thresholdPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tonesList: {
    gap: spacing.xs + 2,
  },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  toneLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
