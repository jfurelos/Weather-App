import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/shared/api/supabaseClient';
import { ChatType } from '../data/chatTypes';
import { CompressedChatImage } from './imageCompressionService';

export const CHAT_MESSAGE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas estrictas (MVP)
export const CHAT_MEDIA_BUCKET = 'chat-media';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ChatMediaMetadata {
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes?: number;
  mimeType: string;
  fileName: string;
}

export interface RoomMessageRecord {
  id: string;
  roomId: string;
  comarcaId: string;
  chatType: ChatType;
  userId: string;
  userName: string;
  userProvince: string;
  content: string;
  createdAt: string; // HH:MM formateado para UI
  createdAtIso: string; // ISO real para expiración 2h y orden
  imageUrl?: string | null;
  mediaPath?: string | null;
  mediaMetadata?: ChatMediaMetadata | null;
}

/**
 * Construye un room_id desacoplado para salas comarcales (y compatible con futuras salas privadas dm:*).
 */
export function buildComarcaRoomId(comarcaId: string, chatType: ChatType): string {
  return `${comarcaId}:${chatType}`;
}

export function getTwoHoursAgoIso(): string {
  return new Date(Date.now() - CHAT_MESSAGE_TTL_MS).toISOString();
}

export function isMessageWithinTwoHours(createdAtIso: string): boolean {
  const ts = new Date(createdAtIso).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < CHAT_MESSAGE_TTL_MS;
}

export function formatMessageHour(isoOrText: string): string {
  const parsed = new Date(isoOrText);
  if (Number.isNaN(parsed.getTime())) return isoOrText;
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapDbRowToMessage(row: any): RoomMessageRecord {
  const comarcaId = String(row.comarca_id || '');
  const chatType = (row.chat_type || 'general') as ChatType;
  const roomId =
    typeof row.room_id === 'string' && row.room_id.trim().length > 0
      ? row.room_id
      : buildComarcaRoomId(comarcaId, chatType);
  const createdAtIso =
    typeof row.created_at === 'string' ? row.created_at : new Date().toISOString();

  return {
    id: String(row.id),
    roomId,
    comarcaId,
    chatType,
    userId: String(row.user_id || ''),
    userName: String(row.user_name || 'Usuario'),
    userProvince: String(row.user_province || 'España'),
    content: typeof row.content === 'string' ? row.content : '',
    createdAt: formatMessageHour(createdAtIso),
    createdAtIso,
    imageUrl: typeof row.image_url === 'string' ? row.image_url : null,
    mediaPath: typeof row.media_path === 'string' ? row.media_path : null,
    mediaMetadata:
      row.media_metadata && typeof row.media_metadata === 'object'
        ? (row.media_metadata as ChatMediaMetadata)
        : null,
  };
}

export async function getActiveChatSessionUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) return null;
    const uid = data.session.user.id;
    return UUID_REGEX.test(uid) ? uid : null;
  } catch {
    return null;
  }
}

/**
 * Carga mensajes activos de las últimas 2 horas para una sala desacoplada por room_id.
 */
export async function fetchActiveRoomMessages(params: {
  roomId: string;
  comarcaId: string;
  chatType: ChatType;
}): Promise<RoomMessageRecord[]> {
  const { comarcaId, chatType } = params;
  const cutoffIso = getTwoHoursAgoIso();

  // Intentar consulta completa con columnas de migración 07 (room_id, image_url, media_metadata)
  const fullResult = await supabase
    .from('comarca_messages')
    .select(
      'id, room_id, comarca_id, chat_type, user_id, user_name, user_province, content, image_url, media_path, media_metadata, created_at'
    )
    .eq('comarca_id', comarcaId)
    .eq('chat_type', chatType)
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: true })
    .limit(120);

  if (!fullResult.error && fullResult.data) {
    return fullResult.data
      .map(mapDbRowToMessage)
      .filter((m) => isMessageWithinTwoHours(m.createdAtIso));
  }

  // Fallback limpio si la migración 07 aún no se aplicó en Supabase
  const baseResult = await supabase
    .from('comarca_messages')
    .select('id, comarca_id, chat_type, user_id, user_name, user_province, content, created_at')
    .eq('comarca_id', comarcaId)
    .eq('chat_type', chatType)
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: true })
    .limit(120);

  if (baseResult.error || !baseResult.data) {
    if (baseResult.error) {
      console.warn('[chatRoomService] Error leyendo comarca_messages:', baseResult.error.message);
    }
    return [];
  }

  return baseResult.data
    .map(mapDbRowToMessage)
    .filter((m) => isMessageWithinTwoHours(m.createdAtIso));
}

/**
 * Sube una imagen ya comprimida al bucket `chat-media` en Supabase Storage.
 * Si el usuario está en modo demo/mock o el bucket aún no existe, mantiene un fallback web seguro.
 */
export async function uploadChatMediaImage(params: {
  roomId: string;
  compressed: CompressedChatImage;
}): Promise<{
  imageUrl: string;
  mediaPath: string | null;
  mediaMetadata: ChatMediaMetadata;
  uploadedToStorage: boolean;
}> {
  const { roomId, compressed } = params;
  const mediaMetadata: ChatMediaMetadata = {
    width: compressed.width,
    height: compressed.height,
    sizeBytes: compressed.sizeBytes,
    originalSizeBytes: compressed.originalSizeBytes,
    mimeType: compressed.mimeType,
    fileName: compressed.fileName,
  };

  const sessionUid = await getActiveChatSessionUserId();
  if (!sessionUid || !compressed.blob) {
    return {
      imageUrl: compressed.dataUrl,
      mediaPath: null,
      mediaMetadata,
      uploadedToStorage: false,
    };
  }

  const safeRoomSlug = roomId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  const objectPath = `${sessionUid}/${safeRoomSlug}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}.${compressed.extension}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(CHAT_MEDIA_BUCKET)
      .upload(objectPath, compressed.blob, {
        contentType: compressed.mimeType,
        cacheControl: '7200',
        upsert: false,
      });

    if (uploadError) {
      console.warn(
        '[chatRoomService] Storage chat-media no disponible (¿migración 07 pendiente?), usando fallback local:',
        uploadError.message
      );
      return {
        imageUrl: compressed.dataUrl,
        mediaPath: null,
        mediaMetadata,
        uploadedToStorage: false,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(CHAT_MEDIA_BUCKET)
      .getPublicUrl(objectPath);

    return {
      imageUrl: publicUrlData.publicUrl,
      mediaPath: objectPath,
      mediaMetadata,
      uploadedToStorage: true,
    };
  } catch (err) {
    console.warn('[chatRoomService] Excepción subiendo a chat-media:', err);
    return {
      imageUrl: compressed.dataUrl,
      mediaPath: null,
      mediaMetadata,
      uploadedToStorage: false,
    };
  }
}

/**
 * Envía un mensaje (texto y/o imagen comprimida) a una sala en Supabase.
 */
export async function insertRoomMessage(params: {
  roomId: string;
  comarcaId: string;
  provinceName: string;
  chatType: ChatType;
  userId: string;
  userName: string;
  userProvince: string;
  content: string;
  imageUrl?: string | null;
  mediaPath?: string | null;
  mediaMetadata?: ChatMediaMetadata | null;
}): Promise<RoomMessageRecord | null> {
  const {
    roomId,
    comarcaId,
    provinceName,
    chatType,
    userId,
    userName,
    userProvince,
    content,
    imageUrl,
    mediaPath,
    mediaMetadata,
  } = params;

  const fullInsert = await supabase
    .from('comarca_messages')
    .insert({
      room_id: roomId,
      comarca_id: comarcaId,
      province_name: provinceName,
      chat_type: chatType,
      user_id: userId,
      user_name: userName,
      user_province: userProvince,
      content,
      image_url: imageUrl ?? null,
      media_path: mediaPath ?? null,
      media_metadata: mediaMetadata ?? null,
    })
    .select(
      'id, room_id, comarca_id, chat_type, user_id, user_name, user_province, content, image_url, media_path, media_metadata, created_at'
    )
    .single();

  if (!fullInsert.error && fullInsert.data) {
    return mapDbRowToMessage(fullInsert.data);
  }

  // Fallback si las columnas de migración 07 aún no existen en BBDD
  if (content.trim().length > 0) {
    const baseInsert = await supabase
      .from('comarca_messages')
      .insert({
        comarca_id: comarcaId,
        province_name: provinceName,
        chat_type: chatType,
        user_id: userId,
        user_name: userName,
        user_province: userProvince,
        content,
      })
      .select('id, comarca_id, chat_type, user_id, user_name, user_province, content, created_at')
      .single();

    if (!baseInsert.error && baseInsert.data) {
      const mapped = mapDbRowToMessage(baseInsert.data);
      return {
        ...mapped,
        imageUrl: imageUrl ?? null,
        mediaPath: mediaPath ?? null,
        mediaMetadata: mediaMetadata ?? null,
      };
    }

    if (baseInsert.error) {
      console.error('[chatRoomService] Error insertando en comarca_messages:', baseInsert.error.message);
    }
  } else if (fullInsert.error) {
    console.error('[chatRoomService] Error insertando imagen en comarca_messages:', fullInsert.error.message);
  }

  return null;
}

/**
 * Suscripción en tiempo real a una sala desacoplada por room_id vía Supabase Realtime.
 */
export function subscribeToRoomMessages(params: {
  roomId: string;
  comarcaId: string;
  chatType: ChatType;
  onInsert: (message: RoomMessageRecord) => void;
  onDelete: (messageId: string) => void;
}): () => void {
  const { roomId, comarcaId, chatType, onInsert, onDelete } = params;
  const channelName = `chat-room:${roomId}:${Date.now()}`;

  const channel: RealtimeChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comarca_messages',
        filter: `comarca_id=eq.${comarcaId}`,
      },
      (payload) => {
        const row = payload.new as any;
        if (!row) return;
        const matchesRoom =
          (typeof row.room_id === 'string' && row.room_id === roomId) ||
          (row.comarca_id === comarcaId && row.chat_type === chatType);
        if (!matchesRoom) return;

        const mapped = mapDbRowToMessage(row);
        if (isMessageWithinTwoHours(mapped.createdAtIso)) {
          onInsert(mapped);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'comarca_messages',
      },
      (payload) => {
        const oldRow = payload.old as any;
        if (oldRow?.id) {
          onDelete(String(oldRow.id));
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
