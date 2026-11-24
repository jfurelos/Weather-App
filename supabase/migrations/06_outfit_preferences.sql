-- ==============================================================================
-- Migración 06: Preferencias de vestimenta (`outfit_preferences`) en public.profiles
-- ==============================================================================

-- 1. Añadir columna JSONB `outfit_preferences` con valores por defecto seguros
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS outfit_preferences JSONB NOT NULL DEFAULT '{
    "thermalSensitivity": "neutral",
    "style": "casual"
  }'::jsonb;

-- 2. Restricción de integridad, valores permitidos y tamaño máximo anti-abuso
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_outfit_preferences_valid_chk'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_outfit_preferences_valid_chk
      CHECK (
        jsonb_typeof(outfit_preferences) = 'object'
        AND octet_length(outfit_preferences::text) <= 512
        AND (outfit_preferences->>'thermalSensitivity') IN ('cold_sensitive', 'neutral', 'heat_sensitive')
        AND (outfit_preferences->>'style') IN ('casual', 'streetwear', 'sporty', 'smart')
      );
  END IF;
END $$;

-- Nota RLS: La política existente en `public.profiles` ("Usuarios pueden actualizar su propio perfil",
-- USING / WITH CHECK auth.uid() = id) cubre la lectura y actualización segura de `outfit_preferences`.
