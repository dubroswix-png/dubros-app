-- Script SQL para agregar columnas de Identificación Tributaria (RUC, NIT, RFC, CUIT, etc.) y Dirección a la tabla profiles
-- Ejecuta este script en el Editor SQL de tu panel de Supabase:

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Confirmación visual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('tax_id', 'address');
