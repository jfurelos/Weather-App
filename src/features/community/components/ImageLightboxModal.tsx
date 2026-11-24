import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { X, MapPin } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { spacing } from '@/shared/theme/spacing';
import { ChatMessage } from '../store/useComarcasForumStore';

interface Props {
  message: ChatMessage | null;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<Props> = ({ message, onClose }) => {
  if (!message || !message.imageUrl) return null;

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          {/* Cabecera */}
          <View style={styles.topBar}>
            <View style={styles.authorMeta}>
              <Typography variant="h3" style={{ color: '#FFFFFF' }} numberOfLines={1}>
                {message.userName}
              </Typography>
              <View style={styles.subRow}>
                <MapPin size={11} color="#FFF3B0" />
                <Typography variant="caption" style={{ color: '#FFF3B0', fontSize: 11 }}>
                  {message.userProvince} · {message.createdAt}
                </Typography>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.78}
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel="Cerrar visor de imagen"
            >
              <X size={20} color="#335C67" />
            </TouchableOpacity>
          </View>

          {/* Imagen a pantalla completa */}
          <View style={styles.imageStage}>
            <Image
              source={{ uri: message.imageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>

          {/* Pie con texto opcional */}
          {message.content ? (
            <View style={styles.footer}>
              <Typography variant="body" style={styles.caption}>
                {message.content}
              </Typography>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 34, 40, 0.95)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  authorMeta: {
    flex: 1,
    gap: 2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FAF6E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.borderRadiusMd,
  },
  footer: {
    gap: spacing.xs + 2,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 243, 176, 0.16)',
  },
  caption: {
    color: '#FFFFFF',
    lineHeight: 20,
  },
  ephemeralRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
