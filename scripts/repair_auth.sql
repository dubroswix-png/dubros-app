-- =============================================================================
-- REPARAR PERMISOS DE AUTENTICACION DE SUPABASE (GOTRUE)
-- =============================================================================

-- 1. Asegurar search_path y permisos del administrador de autenticacion
GRANT ALL ON SCHEMA auth TO supabase_auth_admin, postgres, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA auth TO supabase_auth_admin, postgres, service_role;

-- 2. Permisos en public
GRANT USAGE ON SCHEMA public TO supabase_auth_admin, postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin, postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin, postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO supabase_auth_admin, postgres, anon, authenticated, service_role;

-- 3. Asegurar que las funciones de auth y triggers tengan search_path seguro
ALTER ROLE supabase_auth_admin SET search_path TO auth, public;

-- 4. Notificar a PostgREST y GoTrue para recargar esquema
NOTIFY pgrst, ''reload schema'';
