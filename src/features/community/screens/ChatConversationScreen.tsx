import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Send, MapPin, Info, Sparkles, MessageSquare, AlertTriangle, Camera } from 'lucide-react-native';
import { Typography } from '@/shared/components/Typography';
import { Badge } from '@/shared/components/Badge';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { spacing } from '@/shared/theme/spacing';
import { getChatRoomDefinition, ChatType } from '../data/chatTypes';
import { useComarcasForumStore, ChatMessage } from '../store/useComarcasForumStore';
import { MessageBubble } from '../components/MessageBubble';
import { ReportMessageModal } from '../components/ReportMessageModal';
import { RootStackParamList } from '@/app/navigation/types';

type ChatRouteProp = RouteProp<RootStackParamList, 'ChatConversation'>;

export const ChatConversationScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const navigation = useNavigation();
  const route = useRoute<ChatRouteProp>();

  const { comarcaId, comarcaName, provinceName, chatType } = route.params;

  const chatDef = getChatRoomDefinition(chatType);
  const defaultExplanation = chatDef.getDefaultWelcomeMessage(comarcaName);

  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');

  const {
    getMessagesForChat,
    sendMessage,
    currentUser,
    reportingMessage,
    openReportModal,
    closeReportModal,
    submitReport,
  } = useComarcasForumStore();

  const messages = getMessagesForChat(comarcaId, chatType);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    setInputText('');
    await sendMessage(comarcaId, chatType, trimmed);
  };

  const getHeaderIcon = () => {
    switch (chatType) {
      case 'general':
        return <MessageSquare size={16} color={colors.primary} />;
      case 'incidents':
        return <AlertTriangle size={16} color={colors.warning} />;
      case 'landscapes':
        return <Camera size={16} color={colors.rain} />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Cabecera Superior */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver a los chats de la comarca"
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.badgeRow}>
              {getHeaderIcon()}
              <Typography variant="captionMedium" style={{ fontWeight: '700', color: colors.textPrimary }}>
                {chatDef.title}
              </Typography>
              <Typography variant="caption" color="secondary">
                • {comarcaName}
              </Typography>
            </View>
            <Typography variant="caption" color="secondary">
              Provincia de {provinceName}
            </Typography>
          </View>
        </View>

        {/* Mensaje predeterminado de explicación del chat (1 línea) */}
        <View
          style={[
            styles.defaultNoticeBox,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <View style={[styles.infoIconCircle, { backgroundColor: colors.primaryMuted }]}>
            <Info size={14} color={colors.primary} />
          </View>
          <Typography
            variant="captionMedium"
            style={[styles.defaultNoticeText, { color: colors.textPrimary }]}
          >
            {defaultExplanation}
          </Typography>
        </View>

        {/* Lista de Mensajes del chat */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typography variant="body" color="secondary" style={{ textAlign: 'center' }}>
                No hay observaciones previas. Sé el primero en escribir en este chat de {comarcaName}.
              </Typography>
            </View>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.userId === currentUser.id}
                onReport={(m) => openReportModal(m)}
              />
            ))
          )}
        </ScrollView>

        {/* Barra de envío */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <View style={styles.authorBadgeRow}>
            <MapPin size={11} color={colors.textSecondary} />
            <Typography variant="caption" color="secondary" style={{ fontSize: 11 }}>
              Publicando desde {currentUser.province}
            </Typography>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                },
              ]}
              placeholder={`Escribe en ${chatDef.title.toLowerCase()}...`}
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={!inputText.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputText.trim() ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleSend}
              accessibilityLabel="Enviar mensaje"
            >
              <Send
                size={18}
                color={inputText.trim() ? '#FFFFFF' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de moderación */}
      <ReportMessageModal
        message={reportingMessage}
        onClose={closeReportModal}
        onSubmitReport={submitReport}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  defaultNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  infoIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  messagesList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  inputBar: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs + 2,
    paddingBottom: spacing.md,
    gap: 4,
  },
  authorBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
