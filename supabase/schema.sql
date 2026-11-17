-- ==============================================================================
-- SCHEMA INICIAL PARA SUPABASE (POSTGRESQL + POSTGIS)
-- Proyecto: Clima & Comunidad España (MVP Móvil)
-- ==============================================================================

-- 1. Habilitar extensión PostGIS para geolocalización y proximidad
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- 2. Tabla de perfiles de usuario vinculada a auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  province TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles públicos visibles para todos"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. Ubicaciones fijas para alertas personalizadas
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  geom extensions.GEOGRAPHY(Point, 4326),
  notify_rain BOOLEAN DEFAULT TRUE,
  notify_wind BOOLEAN DEFAULT TRUE,
  notify_heat BOOLEAN DEFAULT TRUE,
  sound_rain TEXT DEFAULT 'rain_alert.wav',
  sound_wind TEXT DEFAULT 'wind_alert.wav',
  sound_heat TEXT DEFAULT 'heat_alert.wav',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para calcular automáticamente la columna geométrica PostGIS
CREATE OR REPLACE FUNCTION public.set_user_location_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom = extensions.ST_SetSRID(extensions.ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::extensions.GEOGRAPHY;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_set_user_location_geom
BEFORE INSERT OR UPDATE ON public.user_locations
FOR EACH ROW EXECUTE FUNCTION public.set_user_location_geom();

-- RLS en user_locations (solo el dueño puede ver y gestionar sus ubicaciones)
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gestionan sus propias ubicaciones"
  ON public.user_locations FOR ALL
  USING (auth.uid() = user_id);

-- 4. Categorías fijas de foros (creadas solo por administradores)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorías visibles para todos"
  ON public.categories FOR SELECT
  USING (is_active = true);

-- 5. Canales / Hilos de debate por categoría
CREATE TABLE IF NOT EXISTS public.forums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  province_code TEXT, -- Código de provincia si aplica (ej. '28' para Madrid, '08' para Barcelona)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Foros visibles para todos"
  ON public.forums FOR SELECT
  USING (true);

-- 6. Mensajes en tiempo real
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id UUID REFERENCES public.forums(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mensajes visibles para todos"
  ON public.messages FOR SELECT
  USING (true);

CREATE POLICY "Usuarios autenticados pueden publicar mensajes"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Reportes de moderación comunitaria
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden registrar reportes"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 8. Inserción de Categorías fijas iniciales
INSERT INTO public.categories (name, slug, description, icon, order_index) VALUES
  ('Avisos y Temporales', 'avisos-temporales', 'Seguimiento de tormentas, DANA, ciclogénesis y avisos oficiales', 'alert-triangle', 1),
  ('Previsión General', 'prevision-general', 'Debates sobre modelos meteorológicos y predicción a medio plazo', 'cloud-sun', 2),
  ('Nieve y Montaña', 'nieve-montana', 'Estado de puertos, espesores de nieve y condiciones en cordilleras', 'snowflake', 3),
  ('Fotografía y Caza-Tormentas', 'fotografia-cazatormentas', 'Capturas de rayos, atardeceres y fenómenos meteorológicos', 'camera', 4),
  ('Consultas Locales', 'consultas-locales', 'Preguntas sobre el tiempo en pueblos, ciudades y comarcas', 'map-pin', 5)
ON CONFLICT (slug) DO NOTHING;
