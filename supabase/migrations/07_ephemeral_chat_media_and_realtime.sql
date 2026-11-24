-- ==============================================================================
-- Migración 07: Chat efímero (2 horas), Realtime, room_id, media y bucket chat-media
-- ==============================================================================

-- 1. Ampliar public.comarca_messages con room_id desacoplado e imágenes/metadatos
ALTER TABLE public.comarca_messages
  ADD COLUMN IF NOT EXISTS room_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS media_path TEXT,
  ADD COLUMN IF NOT EXISTS media_metadata JSONB;

-- Backfill de room_id para mensajes existentes
UPDATE public.comarca_messages
SET room_id = comarca_id || ':' || chat_type
WHERE room_id = '';

-- Índices para consultas rápidas por sala y purga eficiente por antigüedad
CREATE INDEX IF NOT EXISTS idx_comarca_messages_room_created
  ON public.comarca_messages (room_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_comarca_messages_created_at
  ON public.comarca_messages (created_at ASC);

-- Trigger ligero para rellenar room_id automáticamente si no se envía explícito
CREATE OR REPLACE FUNCTION public.set_comarca_message_room_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.room_id IS NULL OR btrim(NEW.room_id) = '' THEN
    NEW.room_id := NEW.comarca_id || ':' || NEW.chat_type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_comarca_message_room_id ON public.comarca_messages;
CREATE TRIGGER tr_set_comarca_message_room_id
  BEFORE INSERT ON public.comarca_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_comarca_message_room_id();

-- Permitir mensajes con solo imagen (caption opcional) manteniendo límite anti-spam de 500 chars
ALTER TABLE public.comarca_messages
  DROP CONSTRAINT IF EXISTS comarca_messages_content_len_chk;

ALTER TABLE public.comarca_messages
  ADD CONSTRAINT comarca_messages_content_len_chk
  CHECK (
    (char_length(btrim(content)) BETWEEN 1 AND 500)
    OR (image_url IS NOT NULL AND char_length(btrim(content)) <= 500)
  );

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comarca_messages_media_chk') THEN
    ALTER TABLE public.comarca_messages
      ADD CONSTRAINT comarca_messages_media_chk
      CHECK (
        (image_url IS NULL OR char_length(image_url) <= 2048)
        AND (media_path IS NULL OR char_length(media_path) <= 512)
        AND (
          media_metadata IS NULL
          OR (jsonb_typeof(media_metadata) = 'object' AND octet_length(media_metadata::text) <= 1024)
        )
      );
  END IF;
END $$;

-- 2. Visibilidad estricta de 2 horas en RLS (SELECT)
DROP POLICY IF EXISTS "Mensajes de comarca visibles para todos" ON public.comarca_messages;
DROP POLICY IF EXISTS "Mensajes de comarca visibles para usuarios autenticados" ON public.comarca_messages;

CREATE POLICY "Mensajes de comarca visibles solo ultimas 2 horas"
  ON public.comarca_messages
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND created_at >= NOW() - INTERVAL '2 hours'
  );

-- También aplicar el filtro estricto de 2h en public.messages si existe
DO $$
BEGIN
  IF to_regclass('public.messages') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Mensajes visibles para todos" ON public.messages';
    EXECUTE 'DROP POLICY IF EXISTS "Mensajes visibles solo ultimas 2 horas" ON public.messages';
    EXECUTE '
      CREATE POLICY "Mensajes visibles solo ultimas 2 horas"
        ON public.messages
        FOR SELECT
        USING (
          auth.role() = ''authenticated''
          AND created_at >= NOW() - INTERVAL ''2 hours''
        )
    ';
  END IF;
END $$;

-- 3. Habilitar Supabase Realtime para public.comarca_messages
ALTER TABLE public.comarca_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'comarca_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comarca_messages;
  END IF;
END $$;

-- 4. Bucket dedicado `chat-media` en Supabase Storage (límite 512 KB por archivo, Free Tier friendly)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  true,
  524288,
  ARRAY['image/webp', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas RLS de Storage para `chat-media` (lectura filtrada a 2h, escritura solo en carpeta propia)
DROP POLICY IF EXISTS "chat_media_select_2h" ON storage.objects;
CREATE POLICY "chat_media_select_2h"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'chat-media'
    AND created_at >= NOW() - INTERVAL '2 hours'
  );

DROP POLICY IF EXISTS "chat_media_insert_own" ON storage.objects;
CREATE POLICY "chat_media_insert_own"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-media'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "chat_media_delete_own" ON storage.objects;
CREATE POLICY "chat_media_delete_own"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'chat-media'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Función de borrado físico automático de mensajes e imágenes > 2 horas
CREATE OR REPLACE FUNCTION public.purge_expired_chat_messages()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Limpiar metadatos de archivos expirados en bucket chat-media (tolerante a políticas de Storage)
  BEGIN
    DELETE FROM storage.objects
    WHERE bucket_id = 'chat-media'
      AND created_at < NOW() - INTERVAL '2 hours';
  EXCEPTION
    WHEN OTHERS THEN
      -- Si Storage bloquea el borrado directo en esta instancia, continuar con la purga de filas
      NULL;
  END;

  DELETE FROM public.comarca_messages
  WHERE created_at < NOW() - INTERVAL '2 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF to_regclass('public.messages') IS NOT NULL THEN
    DELETE FROM public.messages
    WHERE created_at < NOW() - INTERVAL '2 hours';
  END IF;

  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_chat_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_chat_messages() TO service_role;

-- 6. Trigger ligero de respaldo (ejecuta limpieza automática si pg_cron no está activado aún)
CREATE OR REPLACE FUNCTION public.tr_fn_purge_expired_chat_messages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  PERFORM public.purge_expired_chat_messages();
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS tr_purge_expired_chat_messages ON public.comarca_messages;
CREATE TRIGGER tr_purge_expired_chat_messages
  AFTER INSERT ON public.comarca_messages
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.tr_fn_purge_expired_chat_messages();

-- 7. Programación con pg_cron cada 15 minutos (si la extensión está habilitada en Supabase)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'purge-expired-chat-messages-2h';

    PERFORM cron.schedule(
      'purge-expired-chat-messages-2h',
      '*/15 * * * *',
      $cron$SELECT public.purge_expired_chat_messages();$cron$
    );
  END IF;
END $$;
