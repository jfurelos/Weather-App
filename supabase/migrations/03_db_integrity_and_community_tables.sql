-- ============================================================
-- Migración 03: Integridad de consultas, RLS explícito y tablas
-- para ubicaciones completas, noticias oficiales y foros por comarca
-- ============================================================

-- 1. Reforzar política UPDATE en profiles con WITH CHECK explícito
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Ampliar user_locations con provincia, umbrales, updated_at y restricción 1 ubicación por usuario
ALTER TABLE public.user_locations
  ADD COLUMN IF NOT EXISTS province TEXT NOT NULL DEFAULT 'Madrid',
  ADD COLUMN IF NOT EXISTS rain_threshold TEXT NOT NULL DEFAULT 'yellow',
  ADD COLUMN IF NOT EXISTS wind_threshold_kmh INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS heat_threshold_c INTEGER NOT NULL DEFAULT 36,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DELETE FROM public.user_locations a
USING public.user_locations b
WHERE a.user_id = b.user_id AND a.created_at < b.created_at;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_locations_user_id_unique'
      AND conrelid = 'public.user_locations'::regclass
  ) THEN
    ALTER TABLE public.user_locations
      ADD CONSTRAINT user_locations_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

DROP POLICY IF EXISTS "Usuarios gestionan sus propias ubicaciones" ON public.user_locations;
CREATE POLICY "Usuarios gestionan sus propias ubicaciones"
  ON public.user_locations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Actualizar trigger de registro para crear también la ubicación fija inicial del usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  user_full_name TEXT;
  user_province TEXT;
  user_avatar TEXT;
BEGIN
  base_username := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'usuario_' || substr(NEW.id::text, 1, 8)
  );
  base_username := lower(regexp_replace(base_username, '\s+', '_', 'g'));

  final_username := base_username;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id <> NEW.id) THEN
    final_username := base_username || '_' || substr(NEW.id::text, 1, 4);
  END IF;

  user_full_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    final_username
  );

  user_province := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'province'), ''),
    'Madrid'
  );

  user_avatar := NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), '');

  INSERT INTO public.profiles (id, username, full_name, avatar_url, province)
  VALUES (NEW.id, final_username, user_full_name, user_avatar, user_province)
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    province = COALESCE(NULLIF(EXCLUDED.province, ''), public.profiles.province),
    updated_at = NOW();

  INSERT INTO public.user_locations (
    user_id, name, province, latitude, longitude,
    notify_rain, notify_wind, notify_heat,
    sound_rain, sound_wind, sound_heat,
    rain_threshold, wind_threshold_kmh, heat_threshold_c
  )
  VALUES (
    NEW.id, user_province, user_province, 40.4168, -3.7038,
    true, true, false,
    'rain_drops', 'wind_gust', 'heat_pulse',
    'yellow', 50, 36
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Tabla official_news
CREATE TABLE IF NOT EXISTS public.official_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'Aviso',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.official_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Noticias oficiales visibles para todos" ON public.official_news;
CREATE POLICY "Noticias oficiales visibles para todos"
  ON public.official_news
  FOR SELECT
  USING (true);

-- 4. Tabla comarca_messages
CREATE TABLE IF NOT EXISTS public.comarca_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comarca_id TEXT NOT NULL,
  province_name TEXT NOT NULL,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('general', 'incidents', 'landscapes')),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_province TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comarca_messages_lookup
  ON public.comarca_messages (comarca_id, chat_type, created_at ASC);

ALTER TABLE public.comarca_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Mensajes de comarca visibles para todos" ON public.comarca_messages;
CREATE POLICY "Mensajes de comarca visibles para todos"
  ON public.comarca_messages
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuarios autenticados pueden escribir en comarca_messages" ON public.comarca_messages;
CREATE POLICY "Usuarios autenticados pueden escribir en comarca_messages"
  ON public.comarca_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuarios pueden borrar sus propios mensajes de comarca" ON public.comarca_messages;
CREATE POLICY "Usuarios pueden borrar sus propios mensajes de comarca"
  ON public.comarca_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Tabla comarca_reports
CREATE TABLE IF NOT EXISTS public.comarca_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_ref TEXT NOT NULL,
  comarca_id TEXT,
  chat_type TEXT,
  message_excerpt TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comarca_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden registrar reportes de comarca" ON public.comarca_reports;
CREATE POLICY "Usuarios pueden registrar reportes de comarca"
  ON public.comarca_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Usuarios pueden consultar sus propios reportes de comarca" ON public.comarca_reports;
CREATE POLICY "Usuarios pueden consultar sus propios reportes de comarca"
  ON public.comarca_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- 6. Tabla user_favorite_comarcas
CREATE TABLE IF NOT EXISTS public.user_favorite_comarcas (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comarca_id TEXT NOT NULL,
  province_id TEXT NOT NULL,
  province_name TEXT NOT NULL,
  comarca_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comarca_id)
);

ALTER TABLE public.user_favorite_comarcas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios gestionan sus comarcas favoritas" ON public.user_favorite_comarcas;
CREATE POLICY "Usuarios gestionan sus comarcas favoritas"
  ON public.user_favorite_comarcas
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
