-- =========================================================================
-- PASO 4: ESQUEMA COMPLETO DE PEDIDOS Y ORDENES B2B PARA SUPABASE
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID,
  customer_email TEXT,
  customer_name TEXT,
  company_name TEXT,
  phone TEXT,
  shipping_address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Pendiente',
  total_items INTEGER DEFAULT 1,
  subtotal NUMERIC(10, 2) DEFAULT 0,
  switch_order_number TEXT,
  switch_synced BOOLEAN DEFAULT false,
  payment_url TEXT,
  erp_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar todas las columnas en la tabla orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pendiente';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 1;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS switch_order_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS switch_synced BOOLEAN DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS erp_order_id TEXT;

-- Crear tabla de ítems de pedido
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  reference TEXT,
  code TEXT,
  brand TEXT,
  material TEXT,
  unit_price NUMERIC(10, 2) DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  total_price NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar todas las columnas en la tabla order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS total_price NUMERIC(10, 2) DEFAULT 0;

-- Políticas de Seguridad (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public update orders" ON public.orders;
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
CREATE POLICY "Public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
