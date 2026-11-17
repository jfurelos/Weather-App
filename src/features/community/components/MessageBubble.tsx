import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Flag, MapPin } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { ChatMessage } from '../store/useComarcasForumStore';

interface Props {
  message: ChatMessage;
  isOwnMessage: boolean;
  onReport: (message: ChatMessage) => void;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  isOwnMessage,
  onReport,
}) => {
  const { colors } = useThemeStore();

  const initial = message.userName ? message.userName.charAt(0).toUpperCase() : 'U';

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {!isOwnMessage && (
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Typography
            variant="captionMedium"
            style={{ fontWeight: '700', color: colors.textPrimary }}
          >
            {initial}
          </Typography>
        </View>
      )}

      <View style={styles.bubbleWrapper}>
        <View style={styles.headerRow}>
          <Typography
            variant="captionMedium"
            style={{ fontWeight: '700', color: colors.textPrimary }}
          >
            {isOwnMessage ? 'Tú' : message.userName}
          </Typography>

          <View style={styles.provinceBadge}>
            <MapPin size={10} color={colors.textSecondary} />
            <Typography variant="caption" color="secondary" style={{ fontSize: 11 }}>
              {message.userProvince}
            </Typography>
          </View>

          <Typography variant="caption" color="secondary" style={styles.timestamp}>
            {message.createdAt}
          </Typography>

          {!isOwnMessage && (
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.reportBtn}
              onPress={() => onReport(message)}
              accessibilityLabel="Reportar mensaje"
            >
              <Flag size={13} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isOwnMessage ? colors.primaryMuted : colors.surface,
              borderColor: isOwnMessage ? colors.primary : colors.border,
            },
          ]}
        >
          <Typography variant="body" style={styles.messageText}>
            {message.content}
          </Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs + 2,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  ownContainer: {
    justifyContent: 'flex-end',
  },
  otherContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubbleWrapper: {
    maxWidth: '82%',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  provinceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: spacing.borderRadiusFull,
  },
  timestamp: {
    fontSize: 10,
    marginLeft: 2,
  },
  reportBtn: {
    padding: 3,
    marginLeft: 'auto',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: spacing.borderRadiusLg,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
