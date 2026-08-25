-- =============================================================================
-- PERMISOS DE LECTURA PÚBLICA PARA CATÁLOGO, MARCAS Y BLOG EN SUPABASE
-- Ejecutar este archivo en el SQL Editor de Supabase
-- =============================================================================

-- 1. Habilitar RLS y permitir lectura pública de Productos
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

-- 2. Habilitar RLS y permitir lectura pública de Marcas
ALTER TABLE IF EXISTS public.brands ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read brands" ON public.brands;
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);

-- 3. Habilitar RLS y permitir lectura pública de Categorías
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

-- 4. Habilitar RLS y permitir lectura pública de Colecciones
ALTER TABLE IF EXISTS public.collections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read collections" ON public.collections;
CREATE POLICY "Public read collections" ON public.collections FOR SELECT USING (true);

-- 5. Habilitar RLS y permitir lectura pública de Países
ALTER TABLE IF EXISTS public.countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read countries" ON public.countries;
CREATE POLICY "Public read countries" ON public.countries FOR SELECT USING (true);

-- 6. Habilitar RLS y permitir lectura pública de Artículos de Blog
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read blog_posts" ON public.blog_posts;
CREATE POLICY "Public read blog_posts" ON public.blog_posts FOR SELECT USING (true);

-- 7. Habilitar RLS y permitir lectura pública de Promociones
ALTER TABLE IF EXISTS public.promotions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read promotions" ON public.promotions;
CREATE POLICY "Public read promotions" ON public.promotions FOR SELECT USING (true);

-- 8. Permitir a los visitantes insertar formularios de contacto (Leads)
ALTER TABLE IF EXISTS public.contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public insert contact submissions" ON public.contact_submissions;
CREATE POLICY "Public insert contact submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin view contact submissions" ON public.contact_submissions;
CREATE POLICY "Admin view contact submissions" ON public.contact_submissions FOR SELECT USING (true);
