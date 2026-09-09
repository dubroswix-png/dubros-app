-- ==============================================================================
-- MIGRATION: Add 'manager' (Gerente) role to public.user_role enum
-- ==============================================================================
-- Run this query in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Add 'manager' value to user_role enum if it does not already exist
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'manager';

-- 2. Update existing manager accounts to have the native 'manager' role in profiles
UPDATE public.profiles
SET role = 'manager'
WHERE lower(email) IN (
  'yorgelis.t7@hotmail.com',
  'ventas@dubros.com',
  'ventasfrancisco@dubros.com'
);

-- 3. Confirm the update
SELECT id, email, full_name, role, erp_client_code
FROM public.profiles
WHERE lower(email) IN (
  'yorgelis.t7@hotmail.com',
  'ventas@dubros.com',
  'ventasfrancisco@dubros.com',
  'dubroswix@gmail.com'
);
