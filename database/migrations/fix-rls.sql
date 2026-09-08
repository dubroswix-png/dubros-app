-- ========================================================
-- FIX PARA RLS DE PERFILES (Evita Recursión Infinita)
-- Ejecutar en el SQL Editor de Supabase
-- ========================================================

-- 1. Crear función segura (SECURITY DEFINER) para verificar si es admin sin disparar RLS de nuevo
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Eliminar las políticas anteriores que causaban la recursión (loop infinito)
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;

-- 3. Crear las nuevas políticas usando la función segura
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR public.is_admin()
  );

CREATE POLICY "Users can update own profile or admins update all"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR public.is_admin()
  );
