-- ==============================================================================
-- Migración 08: Preferencias de Recordatorio Diario de Claudy (`notification_preferences`)
-- ==============================================================================

-- 1. Añadir columna JSONB `notification_preferences` a public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB NOT NULL DEFAULT '{
    "enabled": false,
    "morningTime": "07:30",
    "afternoonEnabled": false,
    "afternoonTime": "17:00",
    "includeTempAndOutfit": true
  }'::jsonb;

-- 2. Restricción de integridad, formato HH:MM válido y límite de tamaño anti-abuso
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_notification_preferences_valid_chk'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_notification_preferences_valid_chk
      CHECK (
        jsonb_typeof(notification_preferences) = 'object'
        AND octet_length(notification_preferences::text) <= 512
        AND jsonb_typeof(notification_preferences->'enabled') = 'boolean'
        AND jsonb_typeof(notification_preferences->'afternoonEnabled') = 'boolean'
        AND jsonb_typeof(notification_preferences->'includeTempAndOutfit') = 'boolean'
        AND (notification_preferences->>'morningTime') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        AND (notification_preferences->>'afternoonTime') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      );
  END IF;
END $$;

-- Nota RLS: La política existente en `public.profiles` ("Usuarios pueden actualizar su propio perfil",
-- USING / WITH CHECK auth.uid() = id) cubre la lectura y actualización segura de `notification_preferences`.
