-- =============================================================================
-- MIGRACIÓN: Dimensiones Ópticas Internacionales (ISO 8624 Boxing System)
-- Dubros Eyewear - Calibre (Ojo), Puente Nasal, Varilla (Patilla)
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. Añadir columnas de medidas a la tabla de productos
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS bridge_size integer,
  ADD COLUMN IF NOT EXISTS temple_length integer,
  ADD COLUMN IF NOT EXISTS frame_size text;

-- 2. Índices de alta velocidad para filtros individuales y combinados
CREATE INDEX IF NOT EXISTS idx_products_eye_size ON public.products (eye_size);
CREATE INDEX IF NOT EXISTS idx_products_bridge_size ON public.products (bridge_size);
CREATE INDEX IF NOT EXISTS idx_products_temple_length ON public.products (temple_length);
CREATE INDEX IF NOT EXISTS idx_products_optical_boxing ON public.products (eye_size, bridge_size, temple_length);

-- 3. Comentario explicativo en la tabla
COMMENT ON COLUMN public.products.eye_size IS 'Calibre o ancho horizontal del ojo en mm (ej: 55)';
COMMENT ON COLUMN public.products.bridge_size IS 'Ancho del puente nasal en mm (ej: 18)';
COMMENT ON COLUMN public.products.temple_length IS 'Longitud de las varillas o patillas en mm (ej: 143)';
COMMENT ON COLUMN public.products.frame_size IS 'Notación óptica completa Boxing System ej: 55-18-143';
