-- ==============================================================================
-- Migración 04: Endurecimiento de seguridad, RLS y límites anti-abuso
-- ==============================================================================

-- 1. Corregir avisos de seguridad en funciones PostgreSQL (Advisors 0011, 0028, 0029)
ALTER FUNCTION public.set_user_location_geom()
  SET search_path = public, extensions;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 2. Restringir lectura de chats comunitarios solo a usuarios autenticados
DROP POLICY IF EXISTS "Mensajes de comarca visibles para todos" ON public.comarca_messages;
CREATE POLICY "Mensajes de comarca visibles para usuarios autenticados"
  ON public.comarca_messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 3. Límites de tamaño y validación de rangos (anti-spam / anti-colapso)

-- 3.1 profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_len_chk') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_username_len_chk CHECK (char_length(btrim(username)) BETWEEN 1 AND 40);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_full_name_len_chk') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_full_name_len_chk CHECK (char_length(btrim(full_name)) BETWEEN 1 AND 80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_province_len_chk') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_province_len_chk CHECK (char_length(btrim(province)) BETWEEN 1 AND 60);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_avatar_url_len_chk') THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_avatar_url_len_chk CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 150000);
  END IF;
END $$;

-- 3.2 user_locations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_locations_coords_chk') THEN
    ALTER TABLE public.user_locations
      ADD CONSTRAINT user_locations_coords_chk
      CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_locations_name_len_chk') THEN
    ALTER TABLE public.user_locations
      ADD CONSTRAINT user_locations_name_len_chk
      CHECK (char_length(btrim(name)) BETWEEN 1 AND 100 AND char_length(btrim(province)) BETWEEN 1 AND 60);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_locations_thresholds_chk') THEN
    ALTER TABLE public.user_locations
      ADD CONSTRAINT user_locations_thresholds_chk
      CHECK (
        rain_threshold IN ('yellow', 'orange', 'red')
        AND wind_threshold_kmh IN (50, 70, 90)
        AND heat_threshold_c IN (34, 36, 40)
      );
  END IF;
END $$;

-- 3.3 comarca_messages y messages
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comarca_messages_content_len_chk') THEN
    ALTER TABLE public.comarca_messages
      ADD CONSTRAINT comarca_messages_content_len_chk
      CHECK (char_length(btrim(content)) BETWEEN 1 AND 500);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comarca_messages_meta_len_chk') THEN
    ALTER TABLE public.comarca_messages
      ADD CONSTRAINT comarca_messages_meta_len_chk
      CHECK (
        char_length(btrim(comarca_id)) BETWEEN 1 AND 80
        AND char_length(btrim(province_name)) BETWEEN 1 AND 60
        AND char_length(btrim(user_name)) BETWEEN 1 AND 80
        AND char_length(btrim(user_province)) BETWEEN 1 AND 60
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_content_len_chk') THEN
    ALTER TABLE public.messages
      ADD CONSTRAINT messages_content_len_chk
      CHECK (char_length(btrim(content)) BETWEEN 1 AND 500);
  END IF;
END $$;

-- 3.4 comarca_reports y reports (anti-spam de reportes duplicados)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comarca_reports_len_chk') THEN
    ALTER TABLE public.comarca_reports
      ADD CONSTRAINT comarca_reports_len_chk
      CHECK (
        char_length(btrim(reason)) BETWEEN 1 AND 200
        AND char_length(btrim(message_ref)) BETWEEN 1 AND 120
        AND (message_excerpt IS NULL OR char_length(message_excerpt) <= 220)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comarca_reports_unique_per_user') THEN
    ALTER TABLE public.comarca_reports
      ADD CONSTRAINT comarca_reports_unique_per_user UNIQUE (reporter_id, message_ref);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'reports_reason_len_chk') THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT reports_reason_len_chk
      CHECK (char_length(btrim(reason)) BETWEEN 1 AND 200);
  END IF;
END $$;

-- 4. Límite real en BBDD de máximo 3 comarcas favoritas por usuario
CREATE OR REPLACE FUNCTION public.enforce_max_favorite_comarcas()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.user_favorite_comarcas WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Máximo 3 comarcas favoritas por usuario';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_enforce_max_favorite_comarcas ON public.user_favorite_comarcas;
CREATE TRIGGER tr_enforce_max_favorite_comarcas
  BEFORE INSERT ON public.user_favorite_comarcas
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_favorite_comarcas();
