import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/shared/api/supabaseClient';
import { Comarca } from '../data/provincesData';
import { ChatType } from '../data/chatTypes';

const FAVORITES_STORAGE_KEY = '@clima_comunidad_favorite_comarcas_v2';
const REPORTED_STORAGE_KEY = '@clima_comunidad_reported_messages_v2';
export const MAX_FAVORITE_COMARCAS = 3;

export interface ChatMessage {
  id: string;
  comarcaId: string;
  chatType: ChatType;
  userId: string;
  userName: string;
  userProvince: string;
  content: string;
  createdAt: string;
}

const SAMPLE_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'mad-sierra-guadarrama_general': [
    {
      id: 'msg-sg-1',
      comarcaId: 'mad-sierra-guadarrama',
      chatType: 'general',
      userId: 'u-101',
      userName: 'Lucía G.',
      userProvince: 'Madrid',
      content: 'En Navacerrada pueblo ahora mismo 9°C y nubosidad compacta. Bastante fresco para salir sin chaqueta.',
      createdAt: '18:12',
    },
    {
      id: 'msg-sg-2',
      comarcaId: 'mad-sierra-guadarrama',
      chatType: 'general',
      userId: 'u-102',
      userName: 'Alberto M.',
      userProvince: 'Madrid',
      content: 'Por Collado Villalba chispeando suavemente desde hace unos 15 minutos, nada fuerte por ahora.',
      createdAt: '18:24',
    },
  ],
  'mad-sierra-guadarrama_incidents': [
    {
      id: 'msg-sgi-1',
      comarcaId: 'mad-sierra-guadarrama',
      chatType: 'incidents',
      userId: 'u-103',
      userName: 'Sergio R.',
      userProvince: 'Madrid',
      content: 'Mucha niebla densa subiendo el Puerto de Navacerrada (M-601), visibilidad reducida a menos de 50 metros. Precaución.',
      createdAt: '17:55',
    },
  ],
  'mad-sierra-guadarrama_landscapes': [
    {
      id: 'msg-sgl-1',
      comarcaId: 'mad-sierra-guadarrama',
      chatType: 'landscapes',
      userId: 'u-104',
      userName: 'Paula Sierra',
      userProvince: 'Madrid',
      content: 'Se acaban de formar unas nubes lenticulares espectaculares sobre La Pedriza con el sol de tarde.',
      createdAt: '18:05',
    },
  ],
  'val-horta-sud_general': [
    {
      id: 'msg-hs-1',
      comarcaId: 'val-horta-sud',
      chatType: 'general',
      userId: 'u-201',
      userName: 'Carlos M.',
      userProvince: 'Valencia',
      content: 'En Torrent cielo muy cerrado y viento de levante aumentando de intensidad. 17°C.',
      createdAt: '18:10',
    },
  ],
  'val-horta-sud_incidents': [
    {
      id: 'msg-hsi-1',
      comarcaId: 'val-horta-sud',
      chatType: 'incidents',
      userId: 'u-202',
      userName: 'Vicente B.',
      userProvince: 'Valencia',
      content: 'Balsas de agua en el paso subterráneo de Catarroja. Mejor evitar esa vía y tomar desvío por pista de Silla.',
      createdAt: '18:30',
    },
  ],
  'bcn-barcelones_general': [
    {
      id: 'msg-bcn-1',
      comarcaId: 'bcn-barcelones',
      chatType: 'general',
      userId: 'u-301',
      userName: 'Marc V.',
      userProvince: 'Barcelona',
      content: 'Humedad muy alta en el litoral de Badalona y mar algo revuelto. Nubes bajas entrando desde el este.',
      createdAt: '18:20',
    },
  ],
};

interface ComarcasForumState {
  selectedProvince: string;
  searchQuery: string;
  favoriteComarcas: Comarca[];
  favoriteLimitMessage: string | null;
  reportedMessageIds: string[];
  messagesByChatKey: Record<string, ChatMessage[]>;
  reportingMessage: ChatMessage | null;
  currentUser: {
    id: string;
    name: string;
    province: string;
  };

  loadPersistedState: () => Promise<void>;
  setSelectedProvince: (provinceName: string) => void;
  setSearchQuery: (query: string) => void;
  toggleFavoriteComarca: (comarca: Comarca) => Promise<void>;
  clearFavoriteLimitMessage: () => void;
  isFavorite: (comarcaId: string) => boolean;
  getMessagesForChat: (comarcaId: string, chatType: ChatType) => ChatMessage[];
  sendMessage: (comarcaId: string, chatType: ChatType, content: string) => Promise<void>;
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
  messagesByChatKey: SAMPLE_CHAT_MESSAGES,
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
      if (Object.keys(updates).length > 0) {
        set(updates);
      }
    } catch {
      // Ignorar fallo de lectura local
    }
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
      // Ignorar error de guardado
    }
  },

  isFavorite: (comarcaId: string) => {
    return get().favoriteComarcas.some((c) => c.id === comarcaId);
  },

  getMessagesForChat: (comarcaId: string, chatType: ChatType) => {
    const key = `${comarcaId}_${chatType}`;
    const raw = get().messagesByChatKey[key] || [];
    const reported = get().reportedMessageIds;
    return raw.filter((m) => !reported.includes(m.id));
  },

  sendMessage: async (comarcaId: string, chatType: ChatType, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const { currentUser, messagesByChatKey } = get();
    const key = `${comarcaId}_${chatType}`;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      comarcaId,
      chatType,
      userId: currentUser.id,
      userName: currentUser.name,
      userProvince: currentUser.province,
      content: trimmed,
      createdAt: timeFormatted,
    };

    const existing = messagesByChatKey[key] || [];
    set({
      messagesByChatKey: {
        ...messagesByChatKey,
        [key]: [...existing, newMsg],
      },
    });
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

    try {
      await supabase.from('reports').insert([
        {
          message_id: messageId,
          reason,
          status: 'pending',
        },
      ]);
    } catch {
      // Tolerar offline / modo demo
    }

    const nextReported = [...reportedMessageIds, messageId];
    set({
      reportedMessageIds: nextReported,
      reportingMessage: null,
    });

    try {
      await AsyncStorage.setItem(REPORTED_STORAGE_KEY, JSON.stringify(nextReported));
    } catch {
      // Ignorar error de guardado
    }
  },
}));
