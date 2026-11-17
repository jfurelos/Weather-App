-- Migración 02: Política INSERT en profiles, trigger automático en auth.users y backfill

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Usuarios pueden crear su propio perfil'
  ) THEN
    CREATE POLICY "Usuarios pueden crear su propio perfil"
      ON public.profiles
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
