import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Send,
  MapPin,
  Info,
  MessageSquare,
  AlertTriangle,
  Camera,
  Search,
  Images,
  ImagePlus,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/ScreenBackground';
import { Typography } from '@/shared/components/Typography';
import { useThemeStore } from '@/shared/store/useThemeStore';
import { getGlassStyle } from '@/shared/theme/themes';
import { spacing } from '@/shared/theme/spacing';
import { FONT_BODY_BOLD } from '@/shared/theme/typography';
import { getChatRoomDefinition } from '../data/chatTypes';
import { ChatMessage, useComarcasForumStore } from '../store/useComarcasForumStore';
import {
  CompressedChatImage,
  pickAndCompressChatImage,
} from '../services/imageCompressionService';
import { MessageBubble } from '../components/MessageBubble';
import { ReportMessageModal } from '../components/ReportMessageModal';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { ChatMediaGalleryModal } from '../components/ChatMediaGalleryModal';
import { RootStackParamList } from '@/app/navigation/types';

type ChatRouteProp = RouteProp<RootStackParamList, 'ChatConversation'>;

export const ChatConversationScreen: React.FC = () => {
  const { theme, colors } = useThemeStore();
  const navigation = useNavigation();
  const route = useRoute<ChatRouteProp>();

  const { comarcaId, comarcaName, provinceName, chatType } = route.params;

  const chatDef = getChatRoomDefinition(chatType);
  const defaultExplanation = chatDef.getDefaultWelcomeMessage(comarcaName);

  const scrollViewRef = useRef<ScrollView>(null);
  const messageOffsetsRef = useRef<Record<string, number>>({});

  const [inputText, setInputText] = useState('');
  const [pendingImage, setPendingImage] = useState<CompressedChatImage | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Estado del buscador de palabras en la sala
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [activeMatchIdx, setActiveMatchIdx] = useState(0);

  // Estado del panel de Archivos y Fotos + Lightbox
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [lightboxMessage, setLightboxMessage] = useState<ChatMessage | null>(null);

  const {
    loadMessagesForChat,
    subscribeToChat,
    pruneExpiredMessages,
    getMessagesForChat,
    getMediaMessagesForChat,
    sendMessage,
    isUploadingMedia,
    currentUser,
    reportingMessage,
    openReportModal,
    closeReportModal,
    submitReport,
  } = useComarcasForumStore();

  // Carga inicial + suscripción Supabase Realtime + purga periódica de expirados (2h)
  useEffect(() => {
    loadMessagesForChat(comarcaId, chatType);
    const unsubscribe = subscribeToChat(comarcaId, chatType);
    const expiryTimer = setInterval(() => {
      pruneExpiredMessages();
    }, 30_000);

    return () => {
      unsubscribe();
      clearInterval(expiryTimer);
    };
  }, [comarcaId, chatType, loadMessagesForChat, subscribeToChat, pruneExpiredMessages]);

  const messages = getMessagesForChat(comarcaId, chatType);
  const mediaMessages = getMediaMessagesForChat(comarcaId, chatType);

  // Coincidencias de búsqueda dentro de los mensajes activos (últimas 2h)
  const matchingMessageIds = useMemo(() => {
    const q = chatSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return messages
      .filter((m) => m.content.toLowerCase().includes(q))
      .map((m) => m.id);
  }, [messages, chatSearchQuery]);

  // Mantener el índice de coincidencia dentro de rango
  useEffect(() => {
    if (matchingMessageIds.length === 0) {
      setActiveMatchIdx(0);
    } else if (activeMatchIdx >= matchingMessageIds.length) {
      setActiveMatchIdx(matchingMessageIds.length - 1);
    }
  }, [matchingMessageIds.length, activeMatchIdx]);

  const activeMatchMessageId =
    matchingMessageIds.length > 0 ? matchingMessageIds[activeMatchIdx] : null;

  // Scroll automático suave al último mensaje cuando llega un nuevo mensaje (si no estamos buscando)
  useEffect(() => {
    if (isSearchOpen && chatSearchQuery.trim().length > 0) return;
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length, isSearchOpen, chatSearchQuery]);

  // Saltar suavemente al mensaje coincidente seleccionado en el buscador
  const scrollToMessageId = (messageId: string) => {
    const y = messageOffsetsRef.current[messageId];
    if (typeof y === 'number') {
      scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 24), animated: true });
    }
  };

  useEffect(() => {
    if (activeMatchMessageId) {
      scrollToMessageId(activeMatchMessageId);
    }
  }, [activeMatchMessageId]);

  const handleStepMatch = (direction: 'prev' | 'next') => {
    if (matchingMessageIds.length === 0) return;
    setActiveMatchIdx((prev) => {
      if (direction === 'prev') {
        return prev <= 0 ? matchingMessageIds.length - 1 : prev - 1;
      }
      return prev >= matchingMessageIds.length - 1 ? 0 : prev + 1;
    });
  };

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => {
      if (prev) {
        setChatSearchQuery('');
        setActiveMatchIdx(0);
      }
      return !prev;
    });
  };

  const handlePickImage = async () => {
    setMediaError(null);
    setIsCompressingImage(true);
    try {
      const { image, error } = await pickAndCompressChatImage();
      if (error) {
        setMediaError(error);
      } else if (image) {
        setPendingImage(image);
      }
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !pendingImage) return;
    if (isUploadingMedia || isCompressingImage) return;

    const imageToSend = pendingImage;
    setInputText('');
    setPendingImage(null);
    setMediaError(null);

    await sendMessage(comarcaId, provinceName, chatType, trimmed, imageToSend);
  };

  const getHeaderIcon = () => {
    switch (chatType) {
      case 'general':
        return <MessageSquare size={15} color={colors.headerSubtext} />;
      case 'incidents':
        return <AlertTriangle size={15} color={colors.accent} />;
      case 'landscapes':
        return <Camera size={15} color={colors.headerSubtext} />;
    }
  };

  const canSend =
    (inputText.trim().length > 0 || Boolean(pendingImage)) &&
    !isUploadingMedia &&
    !isCompressingImage;

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {/* Cabecera Superior */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.headerBg,
              borderBottomColor: colors.tabBorder,
              borderBottomWidth: theme.metrics.windowBorderWidth,
            },
            getGlassStyle(theme),
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.headerRoundBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
            ]}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver a los chats de la comarca"
          >
            <ArrowLeft size={19} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.badgeRow}>
              {getHeaderIcon()}
              <Typography
                variant="captionMedium"
                numberOfLines={1}
                style={{ color: colors.headerText, flexShrink: 1 }}
              >
                {chatDef.title}
              </Typography>
            </View>
            <Typography
              variant="caption"
              numberOfLines={1}
              style={{ color: colors.headerSubtext, fontSize: 11 }}
            >
              {comarcaName} · {provinceName}
            </Typography>
          </View>

          {/* Lupa Buscadora */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleToggleSearch}
            style={[
              styles.headerRoundBtn,
              {
                backgroundColor: isSearchOpen ? colors.accent : colors.card,
                borderColor: isSearchOpen ? 'rgba(84,11,14,0.18)' : colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
            ]}
            accessibilityLabel="Buscar palabras en este chat"
          >
            <Search
              size={17}
              color={isSearchOpen ? colors.onAccent : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Botón Archivos y Fotos */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsGalleryOpen(true)}
            style={[
              styles.filesBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.subcardBorder,
                borderWidth: theme.metrics.subcardBorderWidth,
              },
            ]}
            accessibilityLabel="Abrir apartado de archivos y fotos"
          >
            <Images size={15} color={colors.textPrimary} />
            <Typography variant="captionMedium" style={{ fontSize: 11, color: colors.textPrimary }}>
              Archivos
            </Typography>
            {mediaMessages.length > 0 && (
              <View style={[styles.filesCountBadge, { backgroundColor: colors.primary }]}>
                <Typography
                  variant="captionMedium"
                  style={{ fontSize: 9.5, color: colors.onPrimary, lineHeight: 11 }}
                >
                  {mediaMessages.length}
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Barra de Búsqueda Desplegable */}
        {isSearchOpen && (
          <View
            style={[
              styles.searchBarRow,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <View
              style={[
                styles.searchInputWrap,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.subcardBorder,
                },
              ]}
            >
              <Search size={14} color={colors.textSecondary} />
              <TextInput
                style={[
                  styles.searchInput,
                  { color: colors.textPrimary, fontFamily: FONT_BODY_BOLD },
                ]}
                placeholder="Buscar mensajes..."
                placeholderTextColor={colors.textMuted}
                value={chatSearchQuery}
                onChangeText={(val) => {
                  setChatSearchQuery(val);
                  setActiveMatchIdx(0);
                }}
                autoFocus={Platform.OS === 'web'}
              />
              {chatSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setChatSearchQuery('')}>
                  <X size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <Typography
              variant="captionMedium"
              color="secondary"
              style={styles.matchCounter}
            >
              {chatSearchQuery.trim().length === 0
                ? ''
                : matchingMessageIds.length > 0
                  ? `${activeMatchIdx + 1} de ${matchingMessageIds.length}`
                  : '0 de 0'}
            </Typography>

            <View style={styles.matchArrows}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={matchingMessageIds.length === 0}
                onPress={() => handleStepMatch('prev')}
                style={[
                  styles.arrowBtn,
                  {
                    backgroundColor: colors.pillBg,
                    opacity: matchingMessageIds.length === 0 ? 0.45 : 1,
                  },
                ]}
                accessibilityLabel="Coincidencia anterior"
              >
                <ChevronUp size={15} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={matchingMessageIds.length === 0}
                onPress={() => handleStepMatch('next')}
                style={[
                  styles.arrowBtn,
                  {
                    backgroundColor: colors.pillBg,
                    opacity: matchingMessageIds.length === 0 ? 0.45 : 1,
                  },
                ]}
                accessibilityLabel="Siguiente coincidencia"
              >
                <ChevronDown size={15} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Línea temática del canal */}
        <View
          style={[
            styles.defaultNoticeBox,
            {
              backgroundColor: colors.card,
              borderBottomColor: colors.divider,
            },
          ]}
        >
          <View style={[styles.infoIconCircle, { backgroundColor: colors.primaryMuted }]}>
            <Info size={13} color={colors.primary} />
          </View>
          <Typography
            variant="caption"
            style={[styles.defaultNoticeText, { color: colors.textSecondary }]}
          >
            {defaultExplanation}
          </Typography>
        </View>

        {/* Lista de Mensajes activos */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Typography
                variant="body"
                color="onBackgroundSecondary"
                style={{ textAlign: 'center' }}
              >
                Todavía no hay mensajes. Sé el primero en escribir o compartir una foto en {comarcaName}.
              </Typography>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                onLayout={(ev) => {
                  messageOffsetsRef.current[msg.id] = ev.nativeEvent.layout.y;
                }}
              >
                <MessageBubble
                  message={msg}
                  isOwnMessage={msg.userId === currentUser.id}
                  highlightQuery={isSearchOpen ? chatSearchQuery : undefined}
                  isActiveSearchMatch={msg.id === activeMatchMessageId}
                  onReport={(m) => openReportModal(m)}
                  onPressImage={(m) => setLightboxMessage(m)}
                />
              </View>
            ))
          )}
        </ScrollView>

        {/* Barra de envío con compresión de imagen */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.headerBg,
              borderTopColor: colors.tabBorder,
              borderTopWidth: theme.metrics.windowBorderWidth,
            },
            getGlassStyle(theme),
          ]}
        >
          {mediaError && (
            <View
              style={[
                styles.statusStrip,
                { backgroundColor: colors.primary },
              ]}
            >
              <Typography
                variant="captionMedium"
                style={{ flex: 1, color: colors.onPrimary, fontSize: 11.5 }}
              >
                {mediaError}
              </Typography>
              <TouchableOpacity onPress={() => setMediaError(null)}>
                <X size={14} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>
          )}

          {pendingImage && !isUploadingMedia && (
            <View
              style={[
                styles.pendingPreviewBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.subcardBorder,
                },
              ]}
            >
              <Image
                source={{ uri: pendingImage.dataUrl }}
                style={styles.pendingThumb}
                resizeMode="cover"
              />
              <Typography
                variant="captionMedium"
                numberOfLines={1}
                style={{ flex: 1, fontSize: 12.5 }}
              >
                Foto adjunta
              </Typography>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setPendingImage(null)}
                style={[styles.removePendingBtn, { backgroundColor: colors.pillBg }]}
                accessibilityLabel="Quitar foto adjunta"
              >
                <X size={15} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.authorBadgeRow}>
            <MapPin size={11} color={colors.headerSubtext} />
            <Typography variant="caption" style={{ fontSize: 11, color: colors.headerSubtext }}>
              Publicando desde {currentUser.province}
            </Typography>
          </View>

          <View style={styles.inputRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={isCompressingImage || isUploadingMedia}
              onPress={handlePickImage}
              style={[
                styles.attachBtn,
                {
                  backgroundColor: pendingImage ? colors.accent : colors.card,
                  borderColor: pendingImage ? 'rgba(84,11,14,0.18)' : colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                },
              ]}
              accessibilityLabel="Adjuntar imagen"
            >
              {isCompressingImage ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
              ) : (
                <ImagePlus
                  size={19}
                  color={pendingImage ? colors.onAccent : colors.textPrimary}
                />
              )}
            </TouchableOpacity>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                  color: colors.textPrimary,
                  fontFamily: FONT_BODY_BOLD,
                },
              ]}
              placeholder={
                pendingImage
                  ? 'Añade un comentario opcional...'
                  : `Escribe en ${chatDef.title.toLowerCase()}...`
              }
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={!canSend}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: canSend ? colors.primary : colors.pillBg,
                  borderColor: canSend ? colors.primaryDark : colors.subcardBorder,
                  borderWidth: theme.metrics.subcardBorderWidth,
                },
                canSend ? theme.shadows.pillActive : undefined,
              ]}
              onPress={handleSend}
              accessibilityLabel="Enviar mensaje"
            >
              {isUploadingMedia ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <Send size={18} color={canSend ? colors.onPrimary : colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Panel de Archivos y Fotos compartidos (últimas 2h) */}
      <ChatMediaGalleryModal
        visible={isGalleryOpen}
        roomTitle={`${chatDef.title} · ${comarcaName}`}
        mediaMessages={mediaMessages}
        onSelectImage={(msg) => {
          setIsGalleryOpen(false);
          setLightboxMessage(msg);
        }}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Lightbox a pantalla completa */}
      <ImageLightboxModal
        message={lightboxMessage}
        onClose={() => setLightboxMessage(null)}
      />

      {/* Modal de moderación */}
      <ReportMessageModal
        message={reportingMessage}
        onClose={closeReportModal}
        onSubmitReport={submitReport}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
  },
  headerRoundBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  filesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: spacing.borderRadiusFull,
  },
  filesCountBadge: {
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  searchInputWrap: {
    flex: 1,
    height: 36,
    borderRadius: spacing.borderRadiusFull,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  matchCounter: {
    fontSize: 11,
    minWidth: 42,
    textAlign: 'center',
  },
  matchArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ephemeralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  defaultNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  infoIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultNoticeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 15,
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
    gap: 6,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: spacing.borderRadiusMd,
  },
  pendingPreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xs + 2,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
  },
  pendingThumb: {
    width: 48,
    height: 48,
    borderRadius: spacing.borderRadiusSm,
  },
  removePendingBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
