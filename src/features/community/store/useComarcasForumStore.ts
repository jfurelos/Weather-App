import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/shared/api/supabaseClient';
import { Comarca } from '../data/provincesData';
import { ChatType } from '../data/chatTypes';
import { CompressedChatImage } from '../services/imageCompressionService';
import {
  buildComarcaRoomId,
  ChatMediaMetadata,
  fetchActiveRoomMessages,
  formatMessageHour,
  getActiveChatSessionUserId,
  insertRoomMessage,
  isMessageWithinTwoHours,
  RoomMessageRecord,
  subscribeToRoomMessages,
  uploadChatMediaImage,
} from '../services/chatRoomService';

const FAVORITES_STORAGE_KEY = '@clima_comunidad_favorite_comarcas_v2';
const REPORTED_STORAGE_KEY = '@clima_comunidad_reported_messages_v2';
export const MAX_FAVORITE_COMARCAS = 3;
export const MAX_CHAT_MESSAGE_LENGTH = 500;
const SEND_COOLDOWN_MS = 1000;
let lastSentAtMs = 0;

export type ChatMessage = RoomMessageRecord;
export type { ChatMediaMetadata };

function makeSampleMessage(
  id: string,
  comarcaId: string,
  chatType: ChatType,
  userId: string,
  userName: string,
  userProvince: string,
  content: string,
  minutesAgo: number
): ChatMessage {
  const createdAtIso = new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
  return {
    id,
    roomId: buildComarcaRoomId(comarcaId, chatType),
    comarcaId,
    chatType,
    userId,
    userName,
    userProvince,
    content,
    createdAt: formatMessageHour(createdAtIso),
    createdAtIso,
  };
}

function createInitialSampleMessages(): Record<string, ChatMessage[]> {
  return {
    [buildComarcaRoomId('mad-sierra-guadarrama', 'general')]: [
      makeSampleMessage(
        'sample-sg-1',
        'mad-sierra-guadarrama',
        'general',
        'mock-user-snow',
        'Javier Montes',
        'Madrid',
        'Temporal de nieve activo en Collado Villalba y Navacerrada: -2°C, nevando con fuerza y acumulando ya 15 cm.',
        42
      ),
      makeSampleMessage(
        'sample-sg-2',
        'mad-sierra-guadarrama',
        'general',
        'u-102',
        'Alberto M.',
        'Madrid',
        'En Cercedilla la cota ha bajado de los 900m y el viento del norte deja sensación de -7°C.',
        19
      ),
    ],
    [buildComarcaRoomId('mad-sierra-guadarrama', 'incidents')]: [
      makeSampleMessage(
        'sample-sgi-1',
        'mad-sierra-guadarrama',
        'incidents',
        'u-103',
        'Sergio R.',
        'Madrid',
        'Uso obligatorio de cadenas en el Puerto de Navacerrada (M-601) y niebla heladora con visibilidad menor a 40m.',
        28
      ),
    ],
    [buildComarcaRoomId('mad-sierra-guadarrama', 'landscapes')]: [
      makeSampleMessage(
        'sample-sgl-1',
        'mad-sierra-guadarrama',
        'landscapes',
        'u-104',
        'Paula Sierra',
        'Madrid',
        'Estampa invernal increíble en La Pedriza con los pinares completamente cubiertos de nieve virgen.',
        34
      ),
    ],
    [buildComarcaRoomId('val-valencia', 'general')]: [
      makeSampleMessage(
        'sample-val-1',
        'val-valencia',
        'general',
        'mock-user-dana',
        'Marta Soler',
        'Valencia',
        'Episodio de DANA entrando con mucha fuerza: 48 mm/h ahora mismo en Valencia centro y rachas de levante de 58 km/h.',
        38
      ),
      makeSampleMessage(
        'sample-val-2',
        'val-valencia',
        'general',
        'u-205',
        'Pau Llopis',
        'Valencia',
        'Tormenta estacionaria frente a la costa, truenos constantes y lluvia torrencial en los últimos 25 minutos.',
        16
      ),
    ],
    [buildComarcaRoomId('val-valencia', 'incidents')]: [
      makeSampleMessage(
        'sample-vali-1',
        'val-valencia',
        'incidents',
        'mock-user-dana',
        'Marta Soler',
        'Valencia',
        'Paso inferior de Grandes Vías anegado por el agua. Mejor evitar zonas bajas y esperar a que amaine.',
        22
      ),
    ],
    [buildComarcaRoomId('val-valencia', 'landscapes')]: [
      makeSampleMessage(
        'sample-vall-1',
        'val-valencia',
        'landscapes',
        'u-206',
        'Nuria V.',
        'Valencia',
        'Cortina de precipitación espectacular sobre la Albufera con rayos nube-mar cada pocos segundos.',
        31
      ),
    ],
    [buildComarcaRoomId('val-horta-sud', 'general')]: [
      makeSampleMessage(
        'sample-hs-1',
        'val-horta-sud',
        'general',
        'u-201',
        'Carlos M.',
        'Valencia',
        'En Torrent cielo muy cerrado, lluvia fuerte persistente y viento de levante aumentando de intensidad. 16°C.',
        25
      ),
    ],
    [buildComarcaRoomId('val-horta-sud', 'incidents')]: [
      makeSampleMessage(
        'sample-hsi-1',
        'val-horta-sud',
        'incidents',
        'u-202',
        'Vicente B.',
        'Valencia',
        'Balsas de agua en el paso subterráneo de Catarroja. Mejor evitar esa vía y tomar desvío por pista de Silla.',
        14
      ),
    ],
    [buildComarcaRoomId('cor-coruna', 'general')]: [
      makeSampleMessage(
        'sample-cor-1',
        'cor-coruna',
        'general',
        'mock-user-wind',
        'Iago Fernández',
        'A Coruña',
        'Temporal atlántico muy duro en Riazor: rachas medidas de 86 km/h y chubascos horizontales con 13°C.',
        36
      ),
      makeSampleMessage(
        'sample-cor-2',
        'cor-coruna',
        'general',
        'u-402',
        'Uxía P.',
        'A Coruña',
        'Por Oleiros las ráfagas del oeste silban fortísimo y la mar de fondo supera los 6 metros.',
        18
      ),
    ],
    [buildComarcaRoomId('cor-coruna', 'incidents')]: [
      makeSampleMessage(
        'sample-cori-1',
        'cor-coruna',
        'incidents',
        'mock-user-wind',
        'Iago Fernández',
        'A Coruña',
        'Paseo Marítimo cortado preventivamente por salto de olas y contenedores desplazados en la ronda.',
        12
      ),
    ],
    [buildComarcaRoomId('sev-metropolitana', 'general')]: [
      makeSampleMessage(
        'sample-sev-1',
        'sev-metropolitana',
        'general',
        'mock-user-heat',
        'Rocío Delgado',
        'Sevilla',
        'Ola de calor extrema en Triana: 42°C a la sombra, humedad al 18% y aire muy seco del sur.',
        45
      ),
      makeSampleMessage(
        'sample-sev-2',
        'sev-metropolitana',
        'general',
        'u-502',
        'Manolo R.',
        'Sevilla',
        'En Dos Hermanas los termómetros siguen en 41°C y no se espera bajar de 26°C en toda la madrugada.',
        20
      ),
    ],
    [buildComarcaRoomId('sev-metropolitana', 'incidents')]: [
      makeSampleMessage(
        'sample-sevi-1',
        'sev-metropolitana',
        'incidents',
        'mock-user-heat',
        'Rocío Delgado',
        'Sevilla',
        'Evitad deporte al aire libre y parques sin sombra hasta pasadas las 21:00; índice UV extremo.',
        27
      ),
    ],
    [buildComarcaRoomId('bcn-barcelones', 'general')]: [
      makeSampleMessage(
        'sample-bcn-1',
        'bcn-barcelones',
        'general',
        'mock-user-hail',
        'Laia Puig',
        'Barcelona',
        'Tormenta eléctrica con granizo cayendo ahora mismo en Eixample y rachas convectivas de 65 km/h.',
        24
      ),
      makeSampleMessage(
        'sample-bcn-2',
        'bcn-barcelones',
        'general',
        'u-301',
        'Marc V.',
        'Barcelona',
        'En Badalona acaba de descargar piedra del tamaño de garbanzos durante 5 minutos, mucha actividad eléctrica.',
        11
      ),
    ],
    [buildComarcaRoomId('bcn-barcelones', 'incidents')]: [
      makeSampleMessage(
        'sample-bcni-1',
        'bcn-barcelones',
        'incidents',
        'mock-user-hail',
        'Laia Puig',
        'Barcelona',
        'Retenciones en la Ronda Litoral por granizo acumulado y baja visibilidad. Precaución al conducir.',
        9
      ),
    ],
  };
}

function mergeIncomingMessage(list: ChatMessage[], incoming: ChatMessage): ChatMessage[] {
  // 1. Si ya existe por UUID exacto, actualizar sin duplicar
  if (list.some((m) => m.id === incoming.id)) {
    return list.map((m) => (m.id === incoming.id ? incoming : m));
  }

  // 2. Si coincide con un mensaje optimista reciente del mismo autor, sustituir en sitio
  const incomingTime = new Date(incoming.createdAtIso).getTime();
  const optimisticIndex = list.findIndex((m) => {
    if (!m.id.startsWith('temp-')) return false;
    const sameContent = m.content === incoming.content;
    const sameMedia =
      (m.mediaPath && incoming.mediaPath && m.mediaPath === incoming.mediaPath) ||
      (!m.imageUrl && !incoming.imageUrl) ||
      Boolean(m.imageUrl && incoming.imageUrl);
    const closeInTime = Math.abs(new Date(m.createdAtIso).getTime() - incomingTime) < 25_000;
    return sameContent && sameMedia && closeInTime;
  });

  if (optimisticIndex !== -1) {
    const next = [...list];
    next[optimisticIndex] = incoming;
    return next;
  }

  return [...list, incoming].filter((m) => isMessageWithinTwoHours(m.createdAtIso));
}

interface ComarcasForumState {
  selectedProvince: string;
  searchQuery: string;
  favoriteComarcas: Comarca[];
  favoriteLimitMessage: string | null;
  reportedMessageIds: string[];
  messagesByRoomId: Record<string, ChatMessage[]>;
  isUploadingMedia: boolean;
  reportingMessage: ChatMessage | null;
  currentUser: {
    id: string;
    name: string;
    province: string;
  };

  loadPersistedState: () => Promise<void>;
  syncCurrentUser: (user: { id?: string; name: string; province: string }) => void;
  setSelectedProvince: (provinceName: string) => void;
  setSearchQuery: (query: string) => void;
  toggleFavoriteComarca: (comarca: Comarca) => Promise<void>;
  clearFavoriteLimitMessage: () => void;
  isFavorite: (comarcaId: string) => boolean;
  loadMessagesForChat: (comarcaId: string, chatType: ChatType) => Promise<void>;
  subscribeToChat: (comarcaId: string, chatType: ChatType) => () => void;
  pruneExpiredMessages: () => void;
  getMessagesForChat: (comarcaId: string, chatType: ChatType) => ChatMessage[];
  getMediaMessagesForChat: (comarcaId: string, chatType: ChatType) => ChatMessage[];
  sendMessage: (
    comarcaId: string,
    provinceName: string,
    chatType: ChatType,
    content: string,
    compressedImage?: CompressedChatImage | null
  ) => Promise<void>;
  openReportModal: (message: ChatMessage) => void;
  closeReportModal: () => void;
  submitReport: (reason: string) => Promise<void>;
}

export const useComarcasForumStore = create<ComarcasForumState>((set, get) => ({
  selectedProvince: 'Madrid',
  searchQuery: '',
  favoriteComarcas: [
    {
      id: 'mad-sierra-guadarrama',
      provinceId: 'madrid',
      provinceName: 'Madrid',
      name: 'Sierra de Guadarrama',
      description: 'Collado Villalba, Navacerrada, Cercedilla, El Escorial y cumbres',
      activeCount: 34,
    },
  ],
  favoriteLimitMessage: null,
  reportedMessageIds: [],
  messagesByRoomId: createInitialSampleMessages(),
  isUploadingMedia: false,
  reportingMessage: null,
  currentUser: {
    id: 'usr-current',
    name: 'Tú',
    province: 'Madrid',
  },

  loadPersistedState: async () => {
    try {
      const [favStored, repStored] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_STORAGE_KEY),
        AsyncStorage.getItem(REPORTED_STORAGE_KEY),
      ]);

      const updates: Partial<ComarcasForumState> = {};
      if (favStored) {
        const parsed: Comarca[] = JSON.parse(favStored);
        updates.favoriteComarcas = parsed.slice(0, MAX_FAVORITE_COMARCAS);
      }
      if (repStored) {
        updates.reportedMessageIds = JSON.parse(repStored);
      }

      const sessionUid = await getActiveChatSessionUserId();
      if (sessionUid) {
        const [{ data: dbFavs, error: favErr }, { data: dbReps, error: repErr }] = await Promise.all([
          supabase
            .from('user_favorite_comarcas')
            .select('comarca_id, province_id, province_name, comarca_name, description')
            .eq('user_id', sessionUid)
            .order('created_at', { ascending: false })
            .limit(MAX_FAVORITE_COMARCAS),
          supabase
            .from('comarca_reports')
            .select('message_ref')
            .eq('reporter_id', sessionUid),
        ]);

        if (favErr) {
          console.warn('[useComarcasForumStore] Error leyendo user_favorite_comarcas:', favErr.message);
        } else if (dbFavs && dbFavs.length > 0) {
          updates.favoriteComarcas = dbFavs.map((row) => ({
            id: row.comarca_id,
            provinceId: row.province_id,
            provinceName: row.province_name,
            name: row.comarca_name,
            description: row.description || '',
            activeCount: 0,
          }));
        }

        if (repErr) {
          console.warn('[useComarcasForumStore] Error leyendo comarca_reports:', repErr.message);
        } else if (dbReps && dbReps.length > 0) {
          const merged = new Set<string>([
            ...(updates.reportedMessageIds ?? get().reportedMessageIds),
            ...dbReps.map((r) => r.message_ref),
          ]);
          updates.reportedMessageIds = Array.from(merged);
        }
      }

      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    } catch {
      // Ignorar fallo de lectura local
    }
  },

  syncCurrentUser: (user: { id?: string; name: string; province: string }) => {
    set((state) => ({
      currentUser: {
        id: user.id ?? state.currentUser.id,
        name: user.name.trim() || 'Tú',
        province: user.province,
      },
    }));
  },

  setSelectedProvince: (provinceName: string) => {
    set({ selectedProvince: provinceName, searchQuery: '', favoriteLimitMessage: null });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  clearFavoriteLimitMessage: () => {
    set({ favoriteLimitMessage: null });
  },

  toggleFavoriteComarca: async (comarca: Comarca) => {
    const { favoriteComarcas } = get();
    const exists = favoriteComarcas.some((c) => c.id === comarca.id);

    if (!exists && favoriteComarcas.length >= MAX_FAVORITE_COMARCAS) {
      set({
        favoriteLimitMessage: `Máximo ${MAX_FAVORITE_COMARCAS} comarcas favoritas. Quita una para añadir otra.`,
      });
      return;
    }

    const nextFavorites = exists
      ? favoriteComarcas.filter((c) => c.id !== comarca.id)
      : [comarca, ...favoriteComarcas];

    set({ favoriteComarcas: nextFavorites, favoriteLimitMessage: null });

    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
    } catch {
      // Ignorar error de guardado local
    }

    const sessionUid = await getActiveChatSessionUserId();
    if (sessionUid) {
      if (exists) {
        const { error } = await supabase
          .from('user_favorite_comarcas')
          .delete()
          .eq('user_id', sessionUid)
          .eq('comarca_id', comarca.id);
        if (error) {
          console.error('[useComarcasForumStore] Error eliminando favorita en Supabase:', error.message);
        }
      } else {
        const { error } = await supabase.from('user_favorite_comarcas').upsert(
          {
            user_id: sessionUid,
            comarca_id: comarca.id,
            province_id: comarca.provinceId,
            province_name: comarca.provinceName,
            comarca_name: comarca.name,
            description: comarca.description,
          },
          { onConflict: 'user_id,comarca_id' }
        );
        if (error) {
          console.error('[useComarcasForumStore] Error guardando favorita en Supabase:', error.message);
        }
      }
    }
  },

  isFavorite: (comarcaId: string) => {
    return get().favoriteComarcas.some((c) => c.id === comarcaId);
  },

  loadMessagesForChat: async (comarcaId: string, chatType: ChatType) => {
    const roomId = buildComarcaRoomId(comarcaId, chatType);
    try {
      const remoteMessages = await fetchActiveRoomMessages({ roomId, comarcaId, chatType });
      const existing = (get().messagesByRoomId[roomId] || []).filter((m) =>
        isMessageWithinTwoHours(m.createdAtIso)
      );

      if (remoteMessages.length === 0) {
        set((state) => ({
          messagesByRoomId: {
            ...state.messagesByRoomId,
            [roomId]: existing,
          },
        }));
        return;
      }

      const seenIds = new Set(remoteMessages.map((m) => m.id));
      const localSamples = existing.filter(
        (m) => !seenIds.has(m.id) && (m.id.startsWith('sample-') || m.id.startsWith('temp-'))
      );

      const merged = [...localSamples, ...remoteMessages]
        .filter((m) => isMessageWithinTwoHours(m.createdAtIso))
        .sort(
          (a, b) => new Date(a.createdAtIso).getTime() - new Date(b.createdAtIso).getTime()
        );

      set((state) => ({
        messagesByRoomId: {
          ...state.messagesByRoomId,
          [roomId]: merged,
        },
      }));
    } catch (err) {
      console.warn('[useComarcasForumStore] Excepción cargando mensajes de sala:', err);
    }
  },

  subscribeToChat: (comarcaId: string, chatType: ChatType) => {
    const roomId = buildComarcaRoomId(comarcaId, chatType);
    return subscribeToRoomMessages({
      roomId,
      comarcaId,
      chatType,
      onInsert: (incoming) => {
        set((state) => {
          const current = state.messagesByRoomId[roomId] || [];
          return {
            messagesByRoomId: {
              ...state.messagesByRoomId,
              [roomId]: mergeIncomingMessage(current, incoming),
            },
          };
        });
      },
      onDelete: (deletedId) => {
        set((state) => {
          const current = state.messagesByRoomId[roomId] || [];
          return {
            messagesByRoomId: {
              ...state.messagesByRoomId,
              [roomId]: current.filter((m) => m.id !== deletedId),
            },
          };
        });
      },
    });
  },

  pruneExpiredMessages: () => {
    set((state) => {
      const next: Record<string, ChatMessage[]> = {};
      let changed = false;
      Object.entries(state.messagesByRoomId).forEach(([roomId, list]) => {
        const active = list.filter((m) => isMessageWithinTwoHours(m.createdAtIso));
        if (active.length !== list.length) {
          changed = true;
        }
        next[roomId] = active;
      });
      return changed ? { messagesByRoomId: next } : state;
    });
  },

  getMessagesForChat: (comarcaId: string, chatType: ChatType) => {
    const roomId = buildComarcaRoomId(comarcaId, chatType);
    const raw = get().messagesByRoomId[roomId] || [];
    const reported = get().reportedMessageIds;
    return raw.filter(
      (m) => !reported.includes(m.id) && isMessageWithinTwoHours(m.createdAtIso)
    );
  },

  getMediaMessagesForChat: (comarcaId: string, chatType: ChatType) => {
    const active = get().getMessagesForChat(comarcaId, chatType);
    return active
      .filter((m) => Boolean(m.imageUrl))
      .slice()
      .reverse();
  },

  sendMessage: async (
    comarcaId: string,
    provinceName: string,
    chatType: ChatType,
    content: string,
    compressedImage?: CompressedChatImage | null
  ) => {
    const trimmed = content.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
    if (!trimmed && !compressedImage) return;

    const nowMs = Date.now();
    if (nowMs - lastSentAtMs < SEND_COOLDOWN_MS) return;
    lastSentAtMs = nowMs;

    const { currentUser } = get();
    const roomId = buildComarcaRoomId(comarcaId, chatType);

    let uploadedUrl: string | null = null;
    let uploadedPath: string | null = null;
    let mediaMetadata: ChatMediaMetadata | null = null;

    if (compressedImage) {
      set({ isUploadingMedia: true });
      try {
        const uploadResult = await uploadChatMediaImage({
          roomId,
          compressed: compressedImage,
        });
        uploadedUrl = uploadResult.imageUrl;
        uploadedPath = uploadResult.mediaPath;
        mediaMetadata = uploadResult.mediaMetadata;
      } finally {
        set({ isUploadingMedia: false });
      }
    }

    const createdAtIso = new Date().toISOString();
    const tempId = `temp-${Date.now()}`;

    const optimisticMsg: ChatMessage = {
      id: tempId,
      roomId,
      comarcaId,
      chatType,
      userId: currentUser.id,
      userName: currentUser.name,
      userProvince: currentUser.province,
      content: trimmed,
      createdAt: formatMessageHour(createdAtIso),
      createdAtIso,
      imageUrl: uploadedUrl,
      mediaPath: uploadedPath,
      mediaMetadata,
    };

    set((state) => ({
      messagesByRoomId: {
        ...state.messagesByRoomId,
        [roomId]: [
          ...(state.messagesByRoomId[roomId] || []).filter((m) =>
            isMessageWithinTwoHours(m.createdAtIso)
          ),
          optimisticMsg,
        ],
      },
    }));

    const sessionUid = await getActiveChatSessionUserId();
    if (sessionUid) {
      const persisted = await insertRoomMessage({
        roomId,
        comarcaId,
        provinceName,
        chatType,
        userId: sessionUid,
        userName: currentUser.name,
        userProvince: currentUser.province,
        content: trimmed,
        imageUrl: uploadedUrl,
        mediaPath: uploadedPath,
        mediaMetadata,
      });

      if (persisted) {
        set((state) => {
          const list = state.messagesByRoomId[roomId] || [];
          // Evitar duplicado si Realtime entregó ya el registro antes de que resolviera el insert
          const withoutTemp = list.filter((m) => m.id !== tempId);
          return {
            messagesByRoomId: {
              ...state.messagesByRoomId,
              [roomId]: mergeIncomingMessage(withoutTemp, persisted),
            },
          };
        });
      }
    }
  },

  openReportModal: (message: ChatMessage) => {
    set({ reportingMessage: message });
  },

  closeReportModal: () => {
    set({ reportingMessage: null });
  },

  submitReport: async (reason: string) => {
    const { reportingMessage, reportedMessageIds } = get();
    if (!reportingMessage) return;

    const messageId = reportingMessage.id;

    const sessionUid = await getActiveChatSessionUserId();
    if (sessionUid) {
      const { error } = await supabase.from('comarca_reports').upsert(
        {
          reporter_id: sessionUid,
          message_ref: messageId.slice(0, 120),
          comarca_id: reportingMessage.comarcaId.slice(0, 80),
          chat_type: reportingMessage.chatType,
          message_excerpt: (reportingMessage.content || '[Imagen compartida]').slice(0, 200),
          reason: reason.trim().slice(0, 200) || 'Otro',
          status: 'pending',
        },
        { onConflict: 'reporter_id,message_ref' }
      );

      if (error) {
        console.error('[useComarcasForumStore] Error insertando en comarca_reports:', error.message);
      }
    }

    const nextReported = [...reportedMessageIds, messageId];
    set({
      reportedMessageIds: nextReported,
      reportingMessage: null,
    });

    try {
      await AsyncStorage.setItem(REPORTED_STORAGE_KEY, JSON.stringify(nextReported));
    } catch {
      // Ignorar error de guardado local
    }
  },
}));
