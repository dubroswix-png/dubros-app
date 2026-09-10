-- =============================================================================
-- REPARAR TABLA ORDERS EN SUPABASE (Falta columna updated_at para el trigger)
-- =============================================================================
-- Instrucciones:
-- 1. Entra a tu consola de Supabase (https://supabase.com/dashboard)
-- 2. Ve a la sección "SQL Editor" en el menú lateral izquierdo.
-- 3. Pega este código y presiona "Run".
-- =============================================================================

-- 1. Agregar la columna updated_at que el trigger de base de datos requiere
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Inicializar los valores existentes
UPDATE public.orders 
SET updated_at = COALESCE(updated_at, created_at, now());

-- 3. Actualizar el pedido DB-2026-7769 que ya fue creado en Switch con el código 16-000003565
UPDATE public.orders
SET 
  switch_order_number = '16-000003565',
  erp_order_id = 3565,
  switch_synced = true,
  status = 'En Proceso',
  updated_at = now()
WHERE order_number = 'DB-2026-7769';
