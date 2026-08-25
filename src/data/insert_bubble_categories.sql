-- Migration: Insert all official Bubble categories
INSERT INTO public.categories (id, name, slug)
VALUES
  (gen_random_uuid(), 'Aros opticos', 'aros-opticos'),
  (gen_random_uuid(), 'Sol', 'sol'),
  (gen_random_uuid(), 'Seguridad industrial', 'seguridad-industrial'),
  (gen_random_uuid(), 'Estuche', 'estuche'),
  (gen_random_uuid(), 'Tornillo', 'tornillo'),
  (gen_random_uuid(), 'Narigueras', 'narigueras'),
  (gen_random_uuid(), 'Cordones', 'cordones'),
  (gen_random_uuid(), 'Limpieza', 'limpieza'),
  (gen_random_uuid(), 'Espejos', 'espejos'),
  (gen_random_uuid(), 'Exhibidores', 'exhibidores'),
  (gen_random_uuid(), 'Lectura', 'lectura'),
  (gen_random_uuid(), 'Clips', 'clips'),
  (gen_random_uuid(), 'Guias', 'guias')
ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug;
