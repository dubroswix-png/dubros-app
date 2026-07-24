-- ========================================================
-- SCRIPT DE MIGRACIÓN SUPABASE: Usuarios, Roles y Perfiles
-- ========================================================

-- 1. Crear tipo de dato (Enum) para los Roles
CREATE TYPE public.user_role AS ENUM ('admin', 'client', 'pending');

-- 2. Crear tabla de Perfiles (Profiles) que extiende la tabla auth.users de Supabase
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role public.user_role DEFAULT 'pending'::public.user_role NOT NULL,
  name TEXT,
  phone TEXT,
  country TEXT,
  company_name TEXT,
  business_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Seguridad a Nivel de Filas (Row Level Security - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad (RLS Policies)

-- Un usuario puede leer su propio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Un usuario puede actualizar su propio perfil (útil para el onboarding)
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Los administradores pueden leer todos los perfiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Los administradores pueden actualizar cualquier perfil (para aprobar cuentas 'pending' a 'client')
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. Trigger (Disparador) para crear automáticamente un perfil cuando alguien se registra
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Dubroswix siempre nace como admin
  IF NEW.email = 'dubroswix@gmail.com' THEN
    INSERT INTO public.profiles (id, email, role, name)
    VALUES (NEW.id, NEW.email, 'admin', 'Super Admin');
  -- Todos los demás nacen como pending
  ELSE
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'pending');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enlazar el Trigger a auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
