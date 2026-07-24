-- ========================================================
-- DUBROS: Trigger para auto-crear perfil al registrarse
-- Ejecutar DESPUES del script supabase-schema.sql
-- ========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'dubroswix@gmail.com' THEN
    INSERT INTO public.profiles (id, email, role, name)
    VALUES (NEW.id, NEW.email, 'admin', 'Super Admin');
  ELSE
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'pending');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
