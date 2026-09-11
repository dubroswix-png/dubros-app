-- =============================================================================
-- MIGRACIÓN: Normalización de Atributos de Catálogo (Dubros Eyewear)
-- Ejecutar en: Supabase Dashboard -> SQL Editor
-- =============================================================================
-- 1. Normaliza 'sale_type':
--    En el ERP Switch-Soft, la unidad '1' corresponde a venta por 'DOCENA'.
--    Los artículos con unidad 'PIEZA' se mantienen como 'PIEZA'.
-- =============================================================================

UPDATE public.products
SET sale_type = 'DOCENA',
    updated_at = now()
WHERE sale_type = '1';

-- =============================================================================
-- 2. Corrección Inteligente de Géneros (gender)
-- =============================================================================

-- A. Niños / Infantil
UPDATE public.products
SET gender = 'Niños',
    updated_at = now()
WHERE reference ILIKE 'S%PC%'
   OR reference ILIKE 'SK%'
   OR description ILIKE '%KIDS%'
   OR description ILIKE '%NIÑO%'
   OR description ILIKE '%NIÑA%'
   OR description ILIKE '%INFANTIL%'
   OR brand_id IN (
     SELECT id FROM public.brands 
     WHERE name ILIKE '%SMARTKIDS%' 
        OR name ILIKE '%VISION KIDS%' 
        OR name ILIKE '%FLEXXILON%'
   );

-- B. Dama / Mujer
UPDATE public.products
SET gender = 'Mujer',
    updated_at = now()
WHERE description ILIKE '%DAMA%'
   OR description ILIKE '%MUJER%'
   OR description ILIKE '%LADY%'
   OR description ILIKE '%FEMENIN%'
   OR brand_id IN (
     SELECT id FROM public.brands 
     WHERE name ILIKE '%ROMANA%' 
        OR name ILIKE '%KIAMIL%' 
        OR name ILIKE '%VELVETT%'
   );

-- C. Caballero / Hombre
UPDATE public.products
SET gender = 'Hombre',
    updated_at = now()
WHERE description ILIKE '%CABALLERO%'
   OR description ILIKE '%HOMBRE%'
   OR description ILIKE '%MASCULIN%'
   OR description ILIKE '% MEN %';

-- D. Limpiar nulos residuales
UPDATE public.products
SET gender = 'Unisex',
    updated_at = now()
WHERE gender IS NULL OR gender = '';

-- =============================================================================
-- 3. Verificación de Resultados
-- =============================================================================
-- SELECT sale_type, count(*) FROM public.products GROUP BY sale_type;
-- SELECT gender, count(*) FROM public.products GROUP BY gender;
-- SELECT count(*) FILTER (WHERE eye_size IS NOT NULL) AS con_talla, count(*) FILTER (WHERE eye_size IS NULL) AS sin_talla FROM public.products;
