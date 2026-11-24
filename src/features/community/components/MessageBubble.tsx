import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { Flag, MapPin, Maximize2 } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { ChatMessage } from '../store/useComarcasForumStore';

interface Props {
  message: ChatMessage;
  isOwnMessage: boolean;
  highlightQuery?: string;
  isActiveSearchMatch?: boolean;
  onReport: (message: ChatMessage) => void;
  onPressImage?: (message: ChatMessage) => void;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const MessageBubble: React.FC<Props> = ({
  message,
  isOwnMessage,
  highlightQuery,
  isActiveSearchMatch = false,
  onReport,
  onPressImage,
}) => {
  const { isDark, theme, colors } = useThemeStore();

  const initial = message.userName ? message.userName.charAt(0).toUpperCase() : 'U';

  // Burbujas con máximo contraste en ambos modos:
  // Dark: ajenas #FAF6E8 (texto #335C67), propias #FFF3B0 (texto #335C67) sobre fondo #335C67
  // Light: ajenas #FFF3B0 (texto #335C67), propias #335C67 (texto #FFFFFF) sobre fondo #FFFFFF
  const ownBubbleBg = isDark ? colors.cardHighlight : colors.borderStrong;
  const ownBubbleText = isDark ? colors.textPrimary : '#FFFFFF';
  const ownBubbleBorder = isDark ? colors.accent : colors.borderStrong;

  const textColor = isOwnMessage ? ownBubbleText : colors.textPrimary;

  const renderHighlightedContent = () => {
    if (!message.content) return null;
    const query = highlightQuery?.trim();
    if (!query) {
      return (
        <Typography variant="body" style={[styles.messageText, { color: textColor }]}>
          {message.content}
        </Typography>
      );
    }

    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = message.content.split(regex);

    return (
      <Typography variant="body" style={[styles.messageText, { color: textColor }]}>
        {parts.map((part, idx) => {
          const isMatch = part.toLowerCase() === query.toLowerCase();
          if (isMatch) {
            return (
              <Text
                key={idx}
                style={{
                  backgroundColor: colors.accent,
                  color: colors.onAccent,
                  borderRadius: 3,
                }}
              >
                {part}
              </Text>
            );
          }
          return <Text key={idx}>{part}</Text>;
        })}
      </Typography>
    );
  };

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
            {
              backgroundColor: colors.card,
              borderColor: colors.subcardBorder,
              borderWidth: theme.metrics.subcardBorderWidth,
            },
          ]}
        >
          <Typography variant="captionMedium" style={{ color: colors.textPrimary }}>
            {initial}
          </Typography>
        </View>
      )}

      <View style={styles.bubbleWrapper}>
        <View style={styles.headerRow}>
          <Typography variant="captionMedium" style={{ color: colors.onBackground }}>
            {isOwnMessage ? 'Tú' : message.userName}
          </Typography>

          <View
            style={[
              styles.provinceBadge,
              {
                backgroundColor: isDark ? 'rgba(255, 243, 176, 0.16)' : colors.pillBg,
              },
            ]}
          >
            <MapPin size={10} color={isDark ? colors.onBackgroundAccent : colors.textSecondary} />
            <Typography
              variant="caption"
              style={{
                fontSize: 11,
                color: isDark ? colors.onBackgroundAccent : colors.textSecondary,
              }}
            >
              {message.userProvince}
            </Typography>
          </View>

          <Typography variant="caption" color="onBackgroundSecondary" style={styles.timestamp}>
            {message.createdAt}
          </Typography>

          {!isOwnMessage && (
            <TouchableOpacity
              activeOpacity={0.6}
              style={styles.reportBtn}
              onPress={() => onReport(message)}
              accessibilityLabel="Reportar mensaje"
            >
              <Flag size={13} color={colors.onBackgroundSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isOwnMessage ? ownBubbleBg : colors.card,
              borderColor: isActiveSearchMatch
                ? colors.accent
                : isOwnMessage
                  ? ownBubbleBorder
                  : colors.subcardBorder,
              borderWidth: isActiveSearchMatch ? 2.5 : theme.metrics.subcardBorderWidth,
              borderRadius: theme.metrics.subcardRadius,
            },
            theme.shadows.subcard,
          ]}
        >
          {message.imageUrl ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => onPressImage?.(message)}
              style={styles.imageContainer}
              accessibilityLabel="Ver imagen a pantalla completa"
            >
              <Image
                source={{ uri: message.imageUrl }}
                style={styles.bubbleImage}
                resizeMode="cover"
              />
              <View style={styles.imageExpandPill}>
                <Maximize2 size={11} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : null}

          {renderHighlightedContent()}
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
    maxWidth: '84%',
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
    gap: spacing.xs + 2,
  },
  imageContainer: {
    width: 224,
    maxWidth: '100%',
    height: 164,
    borderRadius: spacing.borderRadiusMd - 2,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(51, 92, 103, 0.14)',
  },
  bubbleImage: {
    width: '100%',
    height: '100%',
  },
  imageExpandPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: spacing.borderRadiusFull,
    backgroundColor: 'rgba(18, 34, 40, 0.72)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
