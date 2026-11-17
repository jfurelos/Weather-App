import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldAlert, X, Check } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Button } from '@/shared/components/Button';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { ChatMessage } from '../store/useComarcasForumStore';

interface Props {
  message: ChatMessage | null;
  onClose: () => void;
  onSubmitReport: (reason: string) => Promise<void>;
}

const REPORT_REASONS = [
  { id: 'offensive', label: 'Contenido inapropiado u ofensivo' },
  { id: 'misinformation', label: 'Información falsa o bulo meteorológico' },
  { id: 'spam', label: 'Spam o publicidad no deseada' },
  { id: 'harassment', label: 'Acoso o faltas de respeto' },
];

export const ReportMessageModal: React.FC<Props> = ({
  message,
  onClose,
  onSubmitReport,
}) => {
  const { colors } = useThemeStore();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!message) return null;

  const handleConfirm = async () => {
    const reasonObj = REPORT_REASONS.find((r) => r.id === selectedReason);
    setIsSubmitting(true);
    try {
      await onSubmitReport(reasonObj ? reasonObj.label : 'Otro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={!!message}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.iconTitleRow}>
              <View
                style={[styles.iconCircle, { backgroundColor: colors.heat + '15' }]}
              >
                <ShieldAlert size={20} color={colors.heat} />
              </View>
              <View>
                <Typography variant="h3">Reportar Mensaje</Typography>
                <Typography variant="caption" color="secondary">
                  Moderación comunitaria
                </Typography>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={onClose}
            >
              <X size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Typography variant="body" color="secondary" style={styles.notice}>
            El mensaje se enviará a moderación y desaparecerá de inmediato de tu chat.
          </Typography>

          <View style={styles.reasonsList}>
            {REPORT_REASONS.map((r) => {
              const isSelected = r.id === selectedReason;
              return (
                <TouchableOpacity
                  key={r.id}
                  activeOpacity={0.7}
                  style={[
                    styles.reasonItem,
                    {
                      backgroundColor: isSelected
                        ? colors.primaryMuted
                        : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedReason(r.id)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected
                          ? colors.primary
                          : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Check size={12} color="#FFFFFF" />}
                  </View>
                  <Typography
                    variant="bodyMedium"
                    style={{
                      flex: 1,
                      color: isSelected
                        ? colors.textPrimary
                        : colors.textSecondary,
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {r.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              title="Cancelar"
              variant="outline"
              style={{ flex: 1 }}
              onPress={onClose}
            />
            <Button
              title={isSubmitting ? 'Reportando...' : 'Reportar y Ocultar'}
              variant="primary"
              disabled={isSubmitting}
              style={{
                flex: 1.5,
                backgroundColor: colors.heat,
                borderColor: colors.heat,
              }}
              onPress={handleConfirm}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: spacing.borderRadiusXl,
    borderWidth: 1,
    padding: spacing.xl,
    gap: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    fontSize: 13,
    lineHeight: 18,
  },
  reasonsList: {
    gap: spacing.xs,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    marginTop: spacing.xs,
  },
});
