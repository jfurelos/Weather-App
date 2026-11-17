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
      userId: 'mock-user-snow',
      userName: 'Javier Montes',
      userProvince: 'Madrid',
      content: 'Temporal de nieve activo en Collado Villalba y Navacerrada: -2°C, nevando con fuerza y acumulando ya 15 cm.',
      createdAt: '18:12',
    },
    {
      id: 'msg-sg-2',
      comarcaId: 'mad-sierra-guadarrama',
      chatType: 'general',
      userId: 'u-102',
      userName: 'Alberto M.',
      userProvince: 'Madrid',
      content: 'En Cercedilla la cota ha bajado de los 900m y el viento del norte deja sensación de -7°C.',
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
      content: 'Uso obligatorio de cadenas en el Puerto de Navacerrada (M-601) y niebla heladora con visibilidad menor a 40m.',
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
      content: 'Estampa invernal increíble en La Pedriza con los pinares completamente cubiertos de nieve virgen.',
      createdAt: '18:05',
    },
  ],
  'val-valencia_general': [
    {
      id: 'msg-val-1',
      comarcaId: 'val-valencia',
      chatType: 'general',
      userId: 'mock-user-dana',
      userName: 'Marta Soler',
      userProvince: 'Valencia',
      content: 'Episodio de DANA entrando con mucha fuerza: 48 mm/h ahora mismo en Valencia centro y rachas de levante de 58 km/h.',
      createdAt: '18:15',
    },
    {
      id: 'msg-val-2',
      comarcaId: 'val-valencia',
      chatType: 'general',
      userId: 'u-205',
      userName: 'Pau Llopis',
      userProvince: 'Valencia',
      content: 'Tormenta estacionaria frente a la costa, truenos constantes y lluvia torrencial en los últimos 25 minutos.',
      createdAt: '18:22',
    },
  ],
  'val-valencia_incidents': [
    {
      id: 'msg-vali-1',
      comarcaId: 'val-valencia',
      chatType: 'incidents',
      userId: 'mock-user-dana',
      userName: 'Marta Soler',
      userProvince: 'Valencia',
      content: 'Paso inferior de Grandes Vías anegado por el agua. Mejor evitar zonas bajas y esperar a que amaine.',
      createdAt: '18:28',
    },
  ],
  'val-valencia_landscapes': [
    {
      id: 'msg-vall-1',
      comarcaId: 'val-valencia',
      chatType: 'landscapes',
      userId: 'u-206',
      userName: 'Nuria V.',
      userProvince: 'Valencia',
      content: 'Cortina de precipitación espectacular sobre la Albufera con rayos nube-mar cada pocos segundos.',
      createdAt: '18:18',
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
      content: 'En Torrent cielo muy cerrado, lluvia fuerte persistente y viento de levante aumentando de intensidad. 16°C.',
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
  'cor-coruna_general': [
    {
      id: 'msg-cor-1',
      comarcaId: 'cor-coruna',
      chatType: 'general',
      userId: 'mock-user-wind',
      userName: 'Iago Fernández',
      userProvince: 'A Coruña',
      content: 'Temporal atlántico muy duro en Riazor: rachas medidas de 86 km/h y chubascos horizontales con 13°C.',
      createdAt: '18:08',
    },
    {
      id: 'msg-cor-2',
      comarcaId: 'cor-coruna',
      chatType: 'general',
      userId: 'u-402',
      userName: 'Uxía P.',
      userProvince: 'A Coruña',
      content: 'Por Oleiros las ráfagas del oeste silban fortísimo y la mar de fondo supera los 6 metros.',
      createdAt: '18:21',
    },
  ],
  'cor-coruna_incidents': [
    {
      id: 'msg-cori-1',
      comarcaId: 'cor-coruna',
      chatType: 'incidents',
      userId: 'mock-user-wind',
      userName: 'Iago Fernández',
      userProvince: 'A Coruña',
      content: 'Paseo Marítimo cortado preventivamente por salto de olas y contenedores desplazados en la ronda.',
      createdAt: '18:25',
    },
  ],
  'sev-metropolitana_general': [
    {
      id: 'msg-sev-1',
      comarcaId: 'sev-metropolitana',
      chatType: 'general',
      userId: 'mock-user-heat',
      userName: 'Rocío Delgado',
      userProvince: 'Sevilla',
      content: 'Ola de calor extrema en Triana: 42°C a la sombra, humedad al 18% y aire muy seco del sur.',
      createdAt: '17:50',
    },
    {
      id: 'msg-sev-2',
      comarcaId: 'sev-metropolitana',
      chatType: 'general',
      userId: 'u-502',
      userName: 'Manolo R.',
      userProvince: 'Sevilla',
      content: 'En Dos Hermanas los termómetros siguen en 41°C y no se espera bajar de 26°C en toda la madrugada.',
      createdAt: '18:14',
    },
  ],
  'sev-metropolitana_incidents': [
    {
      id: 'msg-sevi-1',
      comarcaId: 'sev-metropolitana',
      chatType: 'incidents',
      userId: 'mock-user-heat',
      userName: 'Rocío Delgado',
      userProvince: 'Sevilla',
      content: 'Evitad deporte al aire libre y parques sin sombra hasta pasadas las 21:00; índice UV extremo.',
      createdAt: '18:02',
    },
  ],
  'bcn-barcelones_general': [
    {
      id: 'msg-bcn-1',
      comarcaId: 'bcn-barcelones',
      chatType: 'general',
      userId: 'mock-user-hail',
      userName: 'Laia Puig',
      userProvince: 'Barcelona',
      content: 'Tormenta eléctrica con granizo cayendo ahora mismo en Eixample y rachas convectivas de 65 km/h.',
      createdAt: '18:20',
    },
    {
      id: 'msg-bcn-2',
      comarcaId: 'bcn-barcelones',
      chatType: 'general',
      userId: 'u-301',
      userName: 'Marc V.',
      userProvince: 'Barcelona',
      content: 'En Badalona acaba de descargar piedra del tamaño de garbanzos durante 5 minutos, mucha actividad eléctrica.',
      createdAt: '18:26',
    },
  ],
  'bcn-barcelones_incidents': [
    {
      id: 'msg-bcni-1',
      comarcaId: 'bcn-barcelones',
      chatType: 'incidents',
      userId: 'mock-user-hail',
      userName: 'Laia Puig',
      userProvince: 'Barcelona',
      content: 'Retenciones en la Ronda Litoral por granizo acumulado y baja visibilidad. Precaución al conducir.',
      createdAt: '18:29',
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
  syncCurrentUser: (user: { id?: string; name: string; province: string }) => void;
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
