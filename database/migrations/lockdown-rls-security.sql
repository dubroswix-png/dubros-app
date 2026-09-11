-- =============================================================================
-- DUBROS OPTICS - MIGRACIÓN DE SEGURIDAD CRÍTICA (RLS LOCKDOWN)
-- Ejecutar en Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. ASEGURAR QUE LA FUNCIÓN HELPER DE ADMIN EXISTE Y ES SEGURA
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'gerente', 'manager')
  );
END;
$$;

-- 2. REVOCAR PERMISOS PELIGROSOS CONCEDIDOS PREVIAMENTE A ANON Y PUBLIC
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;

-- Conceder permisos base necesarios
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Permisos de lectura pública sólo en tablas del catálogo y contenido informativo
GRANT SELECT ON public.products, public.brands, public.categories, 
                public.collections, public.countries, public.promotions, 
                public.blog_posts TO anon, authenticated;

-- Permiso para registrar formularios de contacto (leads públicos)
GRANT INSERT ON public.contact_submissions TO anon, authenticated;

-- Permisos CRUD para usuarios autenticados (gobernados por RLS)
GRANT SELECT, INSERT, UPDATE ON public.orders, public.order_items, public.profiles TO authenticated;

-- 3. HABILITAR RLS OBLIGATORIO EN TODAS LAS TABLAS
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS PARA CATÁLOGO Y CONTENIDO (Lectura pública, Escritura sólo Admin)

-- Products
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Brands
DROP POLICY IF EXISTS "Public read brands" ON public.brands;
DROP POLICY IF EXISTS "Admin manage brands" ON public.brands;
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Admin manage brands" ON public.brands FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Collections
DROP POLICY IF EXISTS "Public read collections" ON public.collections;
DROP POLICY IF EXISTS "Admin manage collections" ON public.collections;
CREATE POLICY "Public read collections" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Admin manage collections" ON public.collections FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Countries & Promotions & Blog
DROP POLICY IF EXISTS "Public read countries" ON public.countries;
CREATE POLICY "Public read countries" ON public.countries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read promotions" ON public.promotions;
DROP POLICY IF EXISTS "Admin manage promotions" ON public.promotions;
CREATE POLICY "Public read promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Admin manage promotions" ON public.promotions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin manage blog_posts" ON public.blog_posts;
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admin manage blog_posts" ON public.blog_posts FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Contact Submissions
DROP POLICY IF EXISTS "Public insert contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admin view contact submissions" ON public.contact_submissions;
CREATE POLICY "Public insert contact submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin view contact submissions" ON public.contact_submissions FOR ALL USING (public.is_admin());

-- 5. POLÍTICAS CRÍTICAS DE USUARIOS Y PEDIDOS (Privacidad de Datos)

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles select" ON public.profiles;

CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admins update all"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admin manage orders" ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Users can view order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Admin manage order items" ON public.order_items;

CREATE POLICY "Users can view order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin manage order items"
  ON public.order_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. CONFIGURACIÓN DEL BUCKET PRIVADO DE STORAGE PARA RECETAS / DOCUMENTOS (PRESCRIPTIONS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  false,
  10485760, -- 10MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Políticas de RLS en storage.objects para 'prescriptions'
DROP POLICY IF EXISTS "Users can upload own prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Users view own prescriptions or admins all" ON storage.objects;
DROP POLICY IF EXISTS "Admin manage prescriptions" ON storage.objects;

-- Permite subir archivos organizados en carpetas con el user_id: {user_id}/{filename}
CREATE POLICY "Users can upload own prescriptions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prescriptions' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permite al usuario leer únicamente sus propios archivos o al administrador leer todos
CREATE POLICY "Users view own prescriptions or admins all"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'prescriptions' 
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- Permite borrar solo al usuario o admin
CREATE POLICY "Users delete own prescriptions or admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'prescriptions' 
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );
