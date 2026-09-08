-- ==========================================================================
-- AJUSTES DE SCHEMA PARA INTEGRACIÓN ERP — Bloques 3, 4 y 5
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ==========================================================================

-- -------------------------------------------------------
-- BLOQUE 3: Crear Lead en CRM desde /contacto
-- Agregar campo para guardar el ID del lead creado en el ERP
-- -------------------------------------------------------
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS erp_lead_id INTEGER DEFAULT NULL;

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS erp_synced BOOLEAN DEFAULT false;

-- -------------------------------------------------------
-- BLOQUE 4: Validar Cliente B2B contra ERP
-- Agregar campos para vincular el perfil con el cliente del ERP
-- -------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS erp_client_id INTEGER DEFAULT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS erp_client_code TEXT DEFAULT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS erp_vendor_id INTEGER DEFAULT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tax_id TEXT DEFAULT NULL;

-- -------------------------------------------------------
-- BLOQUE 5: Crear Pedido en ERP + Link SwitchPay
-- La tabla orders YA tiene switch_order_number y switch_synced
-- Solo agregamos el campo para la URL de pago de SwitchPay
-- -------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS erp_order_id TEXT DEFAULT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_url TEXT DEFAULT NULL;

-- -------------------------------------------------------
-- BLOQUE 2 & 5: ID de artículo ERP en productos
-- -------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS erp_article_id INTEGER DEFAULT NULL;

-- -------------------------------------------------------

-- VERIFICACIÓN: Listar columnas nuevas
-- -------------------------------------------------------
-- Puedes verificar ejecutando:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name LIKE 'erp_%';
