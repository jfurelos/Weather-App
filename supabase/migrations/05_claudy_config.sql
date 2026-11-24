-- ==============================================================================
-- Migración 05: Personalización de la mascota "Claudy" en public.profiles
-- ==============================================================================

-- 1. Añadir columna JSONB `claudy_config` con valores por defecto seguros
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS claudy_config JSONB NOT NULL DEFAULT '{
    "name": "Claudy",
    "expression": "happy",
    "glassesStyle": "auto",
    "headwearStyle": "auto",
    "scarfStyle": "auto",
    "umbrellaStyle": "auto",
    "detailTone": "honey"
  }'::jsonb;

-- 2. Restricción de integridad y tamaño máximo anti-abuso (objeto JSON válido <= 2 KB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_claudy_config_valid_chk'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_claudy_config_valid_chk
      CHECK (
        jsonb_typeof(claudy_config) = 'object'
        AND octet_length(claudy_config::text) <= 2048
      );
  END IF;
END $$;

-- Nota RLS: La política existente en `public.profiles` ("Usuarios pueden actualizar su propio perfil",
-- USING / WITH CHECK auth.uid() = id) permite automáticamente que cada usuario autenticado
-- lea y actualice su propia columna `claudy_config`.
