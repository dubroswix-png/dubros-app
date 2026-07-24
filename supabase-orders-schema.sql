-- ========================================================
-- DUBROS: Tablas de Pedidos y Detalles para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ========================================================

-- Limpieza previa
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Service role full access on orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access on order items" ON public.order_items;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;

-- 1. Enum para estado del pedido
CREATE TYPE public.order_status AS ENUM ('Pendiente', 'En Proceso', 'Completada', 'Cancelada');

-- 2. Tabla de Pedidos (orders)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  company_name TEXT,
  phone TEXT,
  shipping_address TEXT,
  notes TEXT,
  status public.order_status DEFAULT 'Pendiente' NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  switch_order_number TEXT,
  switch_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Tabla de Ítems del Pedido (order_items)
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  reference TEXT NOT NULL,
  code TEXT NOT NULL,
  brand TEXT,
  material TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Habilitar Seguridad RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view order items"
  ON public.order_items FOR SELECT
  USING ( auth.role() = 'authenticated' );

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK ( auth.role() = 'authenticated' );
