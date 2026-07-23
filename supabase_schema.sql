-- ==========================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS DUBROS - SUPABASE (14 TABLAS)
-- ==========================================================================

-- 1. TABLA DE PAÍSES (LATAM)
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  dial_code TEXT NOT NULL,
  flag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABLA DE PERFILES DE USUARIOS (EXTENSIÓN DE AUTH.USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  business_type TEXT, -- 'distribuidor_optico', 'cadena_opticas', 'optica_independiente', 'consultorio'
  country_code TEXT REFERENCES public.countries(code),
  whatsapp TEXT,
  role TEXT DEFAULT 'client', -- 'client', 'admin', 'super_admin'
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABLA DE MARCAS (172 MARCAS)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RESTRICCIONES GEOGRÁFICAS DE MARCAS POR PAÍS
CREATE TABLE IF NOT EXISTS public.brand_country_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  country_code TEXT REFERENCES public.countries(code) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  UNIQUE(brand_id, country_code)
);

-- 5. CATEGORÍAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. COLECCIONES DE DISEÑO
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. TABLA DE PRODUCTOS (14,466 REGISTROS)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  eye_size INTEGER,
  brand_id UUID REFERENCES public.brands(id),
  category_id UUID REFERENCES public.categories(id),
  collection_id UUID REFERENCES public.collections(id),
  material TEXT, -- 'Titanio', 'Acetato', 'Metal', 'TR90', 'Combinado'
  gender TEXT,   -- 'Hombre', 'Mujer', 'Unisex'
  sale_type TEXT DEFAULT 'PIEZA',
  quantity INTEGER DEFAULT 0,
  flex BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  large_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PRODUCTOS FAVORITOS DE USUARIO
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- 9. PEDIDOS DE CLIENTES
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  total_pieces INTEGER NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'Pendiente', -- 'Pendiente', 'Sincronizado', 'Enviado', 'Completado'
  switch_order_number TEXT,
  switch_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. ÍTEMS DEL PEDIDO
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  item_subtotal NUMERIC(10,2) NOT NULL
);

-- 11. PROMOCIONES
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  promo_type TEXT NOT NULL, -- 'fixed_amount', 'percentage'
  value NUMERIC(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. CAMPAÑAS EMAIL MARKETING
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  content HTML,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. MENSAJES DE CONTACTO (LEADS)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  country_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  message TEXT NOT NULL,
  account_created BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. SEED INICIAL DE PAÍSES LATAM
INSERT INTO public.countries (code, name, dial_code, flag) VALUES
('PA', 'Panamá', '+507', '🇵🇦'),
('CO', 'Colombia', '+57', '🇨🇴'),
('EC', 'Ecuador', '+593', '🇪🇨'),
('CR', 'Costa Rica', '+506', '🇨🇷'),
('GT', 'Guatemala', '+502', '🇬🇹'),
('HN', 'Honduras', '+504', '🇭🇳'),
('VE', 'Venezuela', '+58', '🇻🇪'),
('MX', 'México', '+52', '🇲🇽'),
('PE', 'Perú', '+51', '🇵🇪'),
('CL', 'Chile', '+56', '🇨🇱'),
('DO', 'República Dominicana', '+1', '🇩🇴'),
('SV', 'El Salvador', '+503', '🇸🇻')
ON CONFLICT (code) DO NOTHING;
