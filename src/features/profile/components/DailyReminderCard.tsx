import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import {
  BellRing,
  Clock,
  Sparkles,
  Shirt,
  CheckCircle2,
  ShieldAlert,
  Send,
} from 'lucide-react-native';
import { Card } from '@/shared/components/Card';
import { Typography } from '@/shared/components/Typography';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { useClaudyStore } from '@/features/claudy';
import { useHomeStore } from '@/features/home/store/useHomeStore';
import { useProfileStore } from '../store/useProfileStore';
import {
  AFTERNOON_TIME_PRESETS,
  buildClaudyReminderPayload,
  MORNING_TIME_PRESETS,
} from '../data/notificationPreferences';
import {
  getWebNotificationPermission,
  requestWebNotificationPermission,
  syncNativeDailyReminders,
  triggerClaudyReminderNotification,
  WebNotificationPermissionState,
} from '@/shared/services/dailyNotificationService';

export const DailyReminderCard: React.FC = () => {
  const { colors } = useThemeStore();
  const claudyName = useClaudyStore((s) => s.config.name);
  const weather = useHomeStore((s) => s.weather);
  const advice = useHomeStore((s) => s.advice);
  const selectedCity = useHomeStore((s) => s.selectedCity);

  const profile = useProfileStore((s) => s.profile);
  const fixedLocation = useProfileStore((s) => s.fixedLocation);
  const notificationPreferences = useProfileStore((s) => s.notificationPreferences);
  const updateNotificationPreferences = useProfileStore(
    (s) => s.updateNotificationPreferences
  );

  const [permission, setPermission] = useState<WebNotificationPermissionState>(() =>
    getWebNotificationPermission()
  );
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const cityName = fixedLocation.name || selectedCity.name || 'Madrid';

  const previewPayload = useMemo(
    () =>
      buildClaudyReminderPayload({
        claudyName,
        userName: profile.fullName,
        isAuthenticated: profile.isAuthenticated,
        cityName,
        weather,
        advice,
        includeTempAndOutfit: notificationPreferences.includeTempAndOutfit,
      }),
    [
      claudyName,
      profile.fullName,
      profile.isAuthenticated,
      cityName,
      weather,
      advice,
      notificationPreferences.includeTempAndOutfit,
    ]
  );

  const applyPrefsUpdate = async (
    partial: Parameters<typeof updateNotificationPreferences>[0]
  ) => {
    const nextMerged = { ...notificationPreferences, ...partial };
    await updateNotificationPreferences(partial);

    if (partial.enabled === true && Platform.OS === 'web' && permission === 'default') {
      const nextPerm = await requestWebNotificationPermission();
      setPermission(nextPerm);
    }

    if (Platform.OS !== 'web') {
      const updatedPayload = buildClaudyReminderPayload({
        claudyName,
        userName: profile.fullName,
        isAuthenticated: profile.isAuthenticated,
        cityName,
        weather,
        advice,
        includeTempAndOutfit: nextMerged.includeTempAndOutfit,
      });
      await syncNativeDailyReminders(nextMerged, updatedPayload);
    }
  };

  const handleRequestPermission = async () => {
    const nextPerm = await requestWebNotificationPermission();
    setPermission(nextPerm);
    if (nextPerm === 'granted') {
      setFeedbackText('Permiso activado.');
    } else if (nextPerm === 'denied') {
      setFeedbackText('Avisos del navegador bloqueados. Se mostrarán dentro de la app.');
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const result = await triggerClaudyReminderNotification(previewPayload, {
        requestPermissionIfDefault: true,
      });
      setPermission(result.permission);
      setFeedbackText('Toca el aviso para abrir tu outfit de hoy.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.titleRow}>
          <BellRing size={17} color={colors.primary} />
          <Typography variant="h3">Recordatorio Diario de {claudyName}</Typography>
        </View>
        {notificationPreferences.enabled && <Badge label="Activo" tone="warning" />}
      </View>

      {/* 1. Toggle principal de activación */}
      <View
        style={[
          styles.toggleBox,
          { backgroundColor: colors.surface, borderColor: colors.subcardBorder },
        ]}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Typography variant="bodyMedium">Activar recordatorio diario</Typography>
          <Typography variant="caption" color="secondary">
            {notificationPreferences.enabled
              ? `Mañana ${notificationPreferences.morningTime}${
                  notificationPreferences.afternoonEnabled
                    ? ` • Tarde ${notificationPreferences.afternoonTime}`
                    : ''
                }`
              : 'Desactivado'}
          </Typography>
        </View>
        <Switch
          value={notificationPreferences.enabled}
          onValueChange={(enabled) => void applyPrefsUpdate({ enabled })}
          trackColor={{ false: 'rgba(51, 92, 103, 0.22)', true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* 2. Selector horario de Mañana */}
      <View style={styles.sectionBlock}>
        <View style={styles.subHeaderRow}>
          <Clock size={14} color={colors.accent} />
          <Typography variant="captionMedium" color="secondary">
            HORA DE MAÑANA (SALIDA DE CASA)
          </Typography>
        </View>
        <View style={styles.presetsWrap}>
          {MORNING_TIME_PRESETS.map((time) => {
            const active = notificationPreferences.morningTime === time;
            return (
              <TouchableOpacity
                key={time}
                activeOpacity={0.78}
                onPress={() => void applyPrefsUpdate({ morningTime: time })}
                style={[
                  styles.timeChip,
                  {
                    backgroundColor: active ? colors.primary : colors.inputBg,
                    borderColor: active ? colors.primaryDark : colors.subcardBorder,
                  },
                ]}
              >
                <Typography
                  variant="captionMedium"
                  style={{
                    fontSize: 12,
                    color: active ? colors.onPrimary : colors.textPrimary,
                  }}
                >
                  {time}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Horario opcional de Tarde */}
      <View style={styles.sectionBlock}>
        <View style={styles.rowBetween}>
          <View style={styles.subHeaderRow}>
            <Clock size={14} color={colors.textSecondary} />
            <Typography variant="captionMedium" color="secondary">
              AVISO OPCIONAL DE TARDE (VUELTA)
            </Typography>
          </View>
          <Switch
            value={notificationPreferences.afternoonEnabled}
            onValueChange={(afternoonEnabled) => void applyPrefsUpdate({ afternoonEnabled })}
            trackColor={{ false: 'rgba(51, 92, 103, 0.22)', true: colors.accent }}
            thumbColor="#FFFFFF"
          />
        </View>

        {notificationPreferences.afternoonEnabled && (
          <View style={styles.presetsWrap}>
            {AFTERNOON_TIME_PRESETS.map((time) => {
              const active = notificationPreferences.afternoonTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  activeOpacity={0.78}
                  onPress={() => void applyPrefsUpdate({ afternoonTime: time })}
                  style={[
                    styles.timeChip,
                    {
                      backgroundColor: active ? colors.accent : colors.inputBg,
                      borderColor: active ? 'rgba(84,11,14,0.22)' : colors.subcardBorder,
                    },
                  ]}
                >
                  <Typography
                    variant="captionMedium"
                    style={{
                      fontSize: 12,
                      color: active ? colors.onAccent : colors.textPrimary,
                    }}
                  >
                    {time}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 4. Toggle incluir temperatura real + prenda principal */}
      <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      <View style={styles.optionRow}>
        <View style={styles.optionLeft}>
          <Shirt size={17} color={colors.accent} />
          <Typography variant="bodyMedium" style={{ flex: 1 }}>
            Incluir temperatura y prenda clave
          </Typography>
        </View>
        <Switch
          value={notificationPreferences.includeTempAndOutfit}
          onValueChange={(includeTempAndOutfit) =>
            void applyPrefsUpdate({ includeTempAndOutfit })
          }
          trackColor={{ false: 'rgba(51, 92, 103, 0.22)', true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* 5. Vista previa del mensaje */}
      <View
        style={[
          styles.previewBubble,
          {
            backgroundColor: colors.cardHighlight,
            borderColor: 'rgba(224, 159, 62, 0.5)',
          },
        ]}
      >
        <View style={styles.previewHeader}>
          <Sparkles size={13} color={colors.primaryDark} />
          <Typography
            variant="captionMedium"
            style={{ color: colors.primaryDark, fontSize: 11.5 }}
          >
            {previewPayload.title}
          </Typography>
        </View>
        <Typography variant="caption" style={{ color: colors.textPrimary, lineHeight: 18 }}>
          “{previewPayload.body}”
        </Typography>
      </View>

      {/* 6. Permiso Web Notifications + Botón de prueba inmediata */}
      {Platform.OS === 'web' && permission === 'default' && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleRequestPermission}
          style={[
            styles.permissionHintBtn,
            { backgroundColor: colors.inputBg, borderColor: colors.borderStrong },
          ]}
        >
          <CheckCircle2 size={15} color={colors.textPrimary} />
          <Typography variant="captionMedium" style={{ flex: 1, fontSize: 12 }}>
            Permitir notificaciones del navegador
          </Typography>
        </TouchableOpacity>
      )}

      {Platform.OS === 'web' && permission === 'denied' && (
        <View
          style={[
            styles.permissionHintBtn,
            { backgroundColor: colors.surface, borderColor: colors.subcardBorder },
          ]}
        >
          <ShieldAlert size={15} color={colors.textSecondary} />
          <Typography variant="caption" color="secondary" style={{ flex: 1 }}>
            Avisos del navegador bloqueados. Se mostrarán dentro de la app.
          </Typography>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.84}
        disabled={isTesting}
        onPress={handleTestNotification}
        style={[
          styles.testBtn,
          { backgroundColor: colors.primary, opacity: isTesting ? 0.7 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Probar notificación de ${claudyName} ahora`}
      >
        <Send size={15} color={colors.onPrimary} />
        <Typography variant="bodyMedium" style={{ color: colors.onPrimary, fontSize: 14 }}>
          Probar notificación de {claudyName} ahora
        </Typography>
      </TouchableOpacity>

      {feedbackText && (
        <Typography variant="caption" color="emphasis" style={{ lineHeight: 16 }}>
          {feedbackText}
        </Typography>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm + 2,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flexShrink: 1,
  },
  toggleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  sectionBlock: {
    gap: spacing.xs + 2,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  presetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  timeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
  },
  divider: {
    height: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  previewBubble: {
    padding: spacing.md,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    gap: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  permissionHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  testBtn: {
    height: 46,
    borderRadius: spacing.borderRadiusMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
  },
});
