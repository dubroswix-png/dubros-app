-- =========================================================================
-- SCRIPT DE MIGRACION Y ACTIVACION MASIVA DE USUARIOS (V2 CON RESOLUCION DE DUPLICADOS)
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Desactivar temporalmente los triggers para evitar conflicto con perfiles ya existentes
SET session_replication_role = 'replica';

DO $$
DECLARE
  v_user_id uuid;
BEGIN

  -- ----------------------------------------------------
  -- Usuario: devys1512@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'devys1512@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'devys1512@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'devys1512@hotmail.com',
    crypt('javier0001', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Javier Toapanta', 'company_name', 'Javier Toapanta'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('javier0001', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Javier Toapanta', 'company_name', 'Javier Toapanta'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'devys1512@hotmail.com', 'Javier Toapanta', 'Javier Toapanta', 'Óptica', 'EC', 'client', NULL, true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: enithyabeth@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'enithyabeth@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'enithyabeth@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'enithyabeth@gmail.com',
    crypt('yaneth001', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'yaneth', 'company_name', 'yaneth'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('yaneth001', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'yaneth', 'company_name', 'yaneth'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'enithyabeth@gmail.com', 'yaneth', 'yaneth', 'Óptica', 'PA', 'client', NULL, true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: jeimersabogal179@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'jeimersabogal179@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'jeimersabogal179@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'jeimersabogal179@gmail.com',
    crypt('jeimer2741', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JEIMER SABOGAL', 'company_name', 'JEIMER SABOGAL'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jeimer2741', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JEIMER SABOGAL', 'company_name', 'JEIMER SABOGAL'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'jeimersabogal179@gmail.com', 'JEIMER SABOGAL', 'JEIMER SABOGAL', 'Óptica', 'CO', 'client', '2741', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: mejorvision2024@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'mejorvision2024@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'mejorvision2024@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'mejorvision2024@gmail.com',
    crypt('ruth2304', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Ruth Esther Figueroa', 'company_name', 'Ruth Esther Figueroa'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ruth2304', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Ruth Esther Figueroa', 'company_name', 'Ruth Esther Figueroa'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'mejorvision2024@gmail.com', 'Ruth Esther Figueroa', 'Ruth Esther Figueroa', 'Óptica', 'PE', 'client', '2304', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: sorgoguz@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'sorgoguz@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'sorgoguz@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'sorgoguz@gmail.com',
    crypt('guz2680', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MELQUICEDEC GUZMAN', 'company_name', 'MELQUICEDEC GUZMAN'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('guz2680', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MELQUICEDEC GUZMAN', 'company_name', 'MELQUICEDEC GUZMAN'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'sorgoguz@gmail.com', 'MELQUICEDEC GUZMAN', 'MELQUICEDEC GUZMAN', 'Óptica', 'SV', 'client', '2680', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: odelgadillo@grupomunkel.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'odelgadillo@grupomunkel.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'odelgadillo@grupomunkel.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'odelgadillo@grupomunkel.com',
    crypt('olga489', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Munkel', 'company_name', 'Munkel'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('olga489', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Munkel', 'company_name', 'Munkel'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'odelgadillo@grupomunkel.com', 'Munkel', 'Munkel', 'Óptica', 'NI', 'client', '489', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: todogafas.gt@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'todogafas.gt@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'todogafas.gt@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'todogafas.gt@gmail.com',
    crypt('lopez2316', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'KATHERINE LOPEZ', 'company_name', 'KATHERINE LOPEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('lopez2316', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'KATHERINE LOPEZ', 'company_name', 'KATHERINE LOPEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'todogafas.gt@gmail.com', 'KATHERINE LOPEZ', 'KATHERINE LOPEZ', 'Óptica', 'GT', 'client', '2316', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opt.henry.canar@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opt.henry.canar@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opt.henry.canar@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opt.henry.canar@gmail.com',
    crypt('henry2478', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'HENRY CAÑAS', 'company_name', 'HENRY CAÑAS'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('henry2478', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'HENRY CAÑAS', 'company_name', 'HENRY CAÑAS'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opt.henry.canar@gmail.com', 'HENRY CAÑAS', 'HENRY CAÑAS', 'Óptica', 'EC', 'client', '2478', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: cbalbi@opticagiras.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'cbalbi@opticagiras.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'cbalbi@opticagiras.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'cbalbi@opticagiras.com',
    crypt('claudio2621', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Claudio Balbi', 'company_name', 'Claudio Balbi'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('claudio2621', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Claudio Balbi', 'company_name', 'Claudio Balbi'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'cbalbi@opticagiras.com', 'Claudio Balbi', 'Claudio Balbi', 'Óptica', 'PA', 'client', '2621', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: fernandotc1960@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'fernandotc1960@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'fernandotc1960@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'fernandotc1960@gmail.com',
    crypt('fernando1960', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'FERNANDO TARAZONA', 'company_name', 'FERNANDO TARAZONA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('fernando1960', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'FERNANDO TARAZONA', 'company_name', 'FERNANDO TARAZONA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'fernandotc1960@gmail.com', 'FERNANDO TARAZONA', 'FERNANDO TARAZONA', 'Óptica', 'VE', 'client', '0000', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: avelinoayos@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'avelinoayos@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'avelinoayos@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'avelinoayos@gmail.com',
    crypt('ayos0605', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'AVELINO AYOS', 'company_name', 'AVELINO AYOS'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ayos0605', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'AVELINO AYOS', 'company_name', 'AVELINO AYOS'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'avelinoayos@gmail.com', 'AVELINO AYOS', 'AVELINO AYOS', 'Óptica', 'VE', 'client', '0000', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: contabilidad@visioncentergroup.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'contabilidad@visioncentergroup.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'contabilidad@visioncentergroup.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'contabilidad@visioncentergroup.com',
    crypt('daynan800', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Daynan Jurado', 'company_name', 'Daynan Jurado'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('daynan800', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Daynan Jurado', 'company_name', 'Daynan Jurado'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'contabilidad@visioncentergroup.com', 'Daynan Jurado', 'Daynan Jurado', 'Óptica', 'PA', 'client', '800', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: jfavotto@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'jfavotto@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'jfavotto@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'jfavotto@hotmail.com',
    crypt('julio1795', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Julio Favotto', 'company_name', 'Julio Favotto'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('julio1795', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Julio Favotto', 'company_name', 'Julio Favotto'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'jfavotto@hotmail.com', 'Julio Favotto', 'Julio Favotto', 'Óptica', 'UY', 'client', '1795', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: joseesquivel2003@yahoo.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'joseesquivel2003@yahoo.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'joseesquivel2003@yahoo.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'joseesquivel2003@yahoo.com',
    crypt('jose1060', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Jose Ezquivel', 'company_name', 'Jose Ezquivel'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jose1060', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Jose Ezquivel', 'company_name', 'Jose Ezquivel'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'joseesquivel2003@yahoo.com', 'Jose Ezquivel', 'Jose Ezquivel', 'Óptica', 'SV', 'client', '1060', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: mariletlopez@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'mariletlopez@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'mariletlopez@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'mariletlopez@hotmail.com',
    crypt('otto2039', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Otto/Lis Mazadiego', 'company_name', 'Otto/Lis Mazadiego'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('otto2039', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Otto/Lis Mazadiego', 'company_name', 'Otto/Lis Mazadiego'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'mariletlopez@hotmail.com', 'Otto/Lis Mazadiego', 'Otto/Lis Mazadiego', 'Óptica', 'GT', 'client', '2039', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: serviciosopticosmelch@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'serviciosopticosmelch@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'serviciosopticosmelch@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'serviciosopticosmelch@gmail.com',
    crypt('dormes2718', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JOSE DORMES', 'company_name', 'JOSE DORMES'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('dormes2718', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JOSE DORMES', 'company_name', 'JOSE DORMES'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'serviciosopticosmelch@gmail.com', 'JOSE DORMES', 'JOSE DORMES', 'Óptica', 'NI', 'client', '2718', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticplanes@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticplanes@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticplanes@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticplanes@gmail.com',
    crypt('conrado2145', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CONRADO SHEWORD', 'company_name', 'CONRADO SHEWORD'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('conrado2145', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CONRADO SHEWORD', 'company_name', 'CONRADO SHEWORD'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticplanes@gmail.com', 'CONRADO SHEWORD', 'CONRADO SHEWORD', 'Óptica', 'DO', 'client', '2145', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: jairopoz1690@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'jairopoz1690@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'jairopoz1690@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'jairopoz1690@gmail.com',
    crypt('jairo2713', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JAIRO POZ', 'company_name', 'JAIRO POZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jairo2713', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JAIRO POZ', 'company_name', 'JAIRO POZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'jairopoz1690@gmail.com', 'JAIRO POZ', 'JAIRO POZ', 'Óptica', 'GT', 'client', '2713', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: salvavenezuela@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'salvavenezuela@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'salvavenezuela@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'salvavenezuela@gmail.com',
    crypt('salvatore1457', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Salvatore Amato', 'company_name', 'Salvatore Amato'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('salvatore1457', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Salvatore Amato', 'company_name', 'Salvatore Amato'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'salvavenezuela@gmail.com', 'Salvatore Amato', 'Salvatore Amato', 'Óptica', 'VE', 'client', '1457', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opolicentroparquelefevre@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opolicentroparquelefevre@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opolicentroparquelefevre@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opolicentroparquelefevre@gmail.com',
    crypt('policentro901', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Francisco Bonilla', 'company_name', 'Francisco Bonilla'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('policentro901', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Francisco Bonilla', 'company_name', 'Francisco Bonilla'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opolicentroparquelefevre@gmail.com', 'Francisco Bonilla', 'Francisco Bonilla', 'Óptica', 'PA', 'client', '901', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: moncada.mariana@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'moncada.mariana@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'moncada.mariana@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'moncada.mariana@gmail.com',
    crypt('Mariana1367', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Mariana Moncada', 'company_name', 'Mariana Moncada'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Mariana1367', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Mariana Moncada', 'company_name', 'Mariana Moncada'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'moncada.mariana@gmail.com', 'Mariana Moncada', 'Mariana Moncada', 'Óptica', 'VE', 'client', '1367', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: optica_optivisual@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'optica_optivisual@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'optica_optivisual@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'optica_optivisual@hotmail.com',
    crypt('francisco1610', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'FRANCISCO GONZALEZ', 'company_name', 'FRANCISCO GONZALEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('francisco1610', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'FRANCISCO GONZALEZ', 'company_name', 'FRANCISCO GONZALEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'optica_optivisual@hotmail.com', 'FRANCISCO GONZALEZ', 'FRANCISCO GONZALEZ', 'Óptica', 'PA', 'client', '1610', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: ventas@grupoes-optico.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'ventas@grupoes-optico.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'ventas@grupoes-optico.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'ventas@grupoes-optico.com',
    crypt('solano2734', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CARLOS SOLANO', 'company_name', 'CARLOS SOLANO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('solano2734', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CARLOS SOLANO', 'company_name', 'CARLOS SOLANO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'ventas@grupoes-optico.com', 'CARLOS SOLANO', 'CARLOS SOLANO', 'Óptica', 'CR', 'client', '2734', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: aliriogacia1966@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'aliriogacia1966@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'aliriogacia1966@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'aliriogacia1966@gmail.com',
    crypt('garcia2418', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ALIRIO GARCIA', 'company_name', 'ALIRIO GARCIA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('garcia2418', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ALIRIO GARCIA', 'company_name', 'ALIRIO GARCIA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'aliriogacia1966@gmail.com', 'ALIRIO GARCIA', 'ALIRIO GARCIA', 'Óptica', 'VE', 'client', '2418', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: hperez.quimcosta@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'hperez.quimcosta@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'hperez.quimcosta@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'hperez.quimcosta@gmail.com',
    crypt('perez02', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'HUMBERTO PEREZ', 'company_name', 'HUMBERTO PEREZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('perez02', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'HUMBERTO PEREZ', 'company_name', 'HUMBERTO PEREZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'hperez.quimcosta@gmail.com', 'HUMBERTO PEREZ', 'HUMBERTO PEREZ', 'Óptica', 'CO', 'client', '0002', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: aracely-garcia5@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'aracely-garcia5@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'aracely-garcia5@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'aracely-garcia5@hotmail.com',
    crypt('garcia1964', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ARACELY GARCIA', 'company_name', 'ARACELY GARCIA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('garcia1964', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ARACELY GARCIA', 'company_name', 'ARACELY GARCIA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'aracely-garcia5@hotmail.com', 'ARACELY GARCIA', 'ARACELY GARCIA', 'Óptica', 'SV', 'client', '1964', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: marcasyanteojossas@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'marcasyanteojossas@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'marcasyanteojossas@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'marcasyanteojossas@gmail.com',
    crypt('jose003', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Jose Vicente Jimenez', 'company_name', 'Jose Vicente Jimenez'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jose003', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Jose Vicente Jimenez', 'company_name', 'Jose Vicente Jimenez'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'marcasyanteojossas@gmail.com', 'Jose Vicente Jimenez', 'Jose Vicente Jimenez', 'Óptica', 'CO', 'client', '003', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: exielop@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'exielop@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'exielop@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'exielop@hotmail.com',
    crypt('lopez2341', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'EXIEL DAYANA LOPEZ', 'company_name', 'EXIEL DAYANA LOPEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('lopez2341', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'EXIEL DAYANA LOPEZ', 'company_name', 'EXIEL DAYANA LOPEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'exielop@hotmail.com', 'EXIEL DAYANA LOPEZ', 'EXIEL DAYANA LOPEZ', 'Óptica', 'NI', 'client', '2341', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: johnnyegonzalez86@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'johnnyegonzalez86@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'johnnyegonzalez86@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'johnnyegonzalez86@gmail.com',
    crypt('johnny1474', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JOHNNY GONZALES', 'company_name', 'JOHNNY GONZALES'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('johnny1474', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JOHNNY GONZALES', 'company_name', 'JOHNNY GONZALES'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'johnnyegonzalez86@gmail.com', 'JOHNNY GONZALES', 'JOHNNY GONZALES', 'Óptica', 'HN', 'client', '1474', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: griselcordero@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'griselcordero@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'griselcordero@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'griselcordero@hotmail.com',
    crypt('cordero1746', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'GRISELDA CORDERO', 'company_name', 'GRISELDA CORDERO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('cordero1746', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'GRISELDA CORDERO', 'company_name', 'GRISELDA CORDERO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'griselcordero@hotmail.com', 'GRISELDA CORDERO', 'GRISELDA CORDERO', 'Óptica', 'NI', 'client', '1746', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: ioni@homeofbrands.net
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'ioni@homeofbrands.net' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'ioni@homeofbrands.net' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'ioni@homeofbrands.net',
    crypt('bach123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JONATHAN BACH', 'company_name', 'JONATHAN BACH'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('bach123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JONATHAN BACH', 'company_name', 'JONATHAN BACH'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'ioni@homeofbrands.net', 'JONATHAN BACH', 'JONATHAN BACH', 'Óptica', 'PA', 'client', '2745', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: sebastianpaesani@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'sebastianpaesani@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'sebastianpaesani@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'sebastianpaesani@gmail.com',
    crypt('paesani123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'SEBASTIAN PAESANI', 'company_name', 'SEBASTIAN PAESANI'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('paesani123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'SEBASTIAN PAESANI', 'company_name', 'SEBASTIAN PAESANI'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'sebastianpaesani@gmail.com', 'SEBASTIAN PAESANI', 'SEBASTIAN PAESANI', 'Óptica', 'AR', 'client', '0004', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: varielmejia@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'varielmejia@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'varielmejia@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'varielmejia@gmail.com',
    crypt('mejia2672', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'VICTOR MEJIA', 'company_name', 'VICTOR MEJIA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('mejia2672', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'VICTOR MEJIA', 'company_name', 'VICTOR MEJIA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'varielmejia@gmail.com', 'VICTOR MEJIA', 'VICTOR MEJIA', 'Óptica', 'HN', 'client', '2672', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: neovision_2008@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'neovision_2008@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'neovision_2008@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'neovision_2008@hotmail.com',
    crypt('carreño2591', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JULIANA CARREÑO', 'company_name', 'JULIANA CARREÑO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('carreño2591', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JULIANA CARREÑO', 'company_name', 'JULIANA CARREÑO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'neovision_2008@hotmail.com', 'JULIANA CARREÑO', 'JULIANA CARREÑO', 'Óptica', 'CO', 'client', '2591', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: visiongloblal@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'visiongloblal@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'visiongloblal@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'visiongloblal@gmail.com',
    crypt('guevara2093', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JHAINI GUEVARA', 'company_name', 'JHAINI GUEVARA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('guevara2093', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JHAINI GUEVARA', 'company_name', 'JHAINI GUEVARA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'visiongloblal@gmail.com', 'JHAINI GUEVARA', 'JHAINI GUEVARA', 'Óptica', 'VE', 'client', '2093', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: ortega.lester@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'ortega.lester@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'ortega.lester@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'ortega.lester@hotmail.com',
    crypt('ortega2229', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'LESTER ORTEGA', 'company_name', 'LESTER ORTEGA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ortega2229', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'LESTER ORTEGA', 'company_name', 'LESTER ORTEGA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'ortega.lester@hotmail.com', 'LESTER ORTEGA', 'LESTER ORTEGA', 'Óptica', 'NI', 'client', '2229', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: juliocesar@opticaoviedo.net
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'juliocesar@opticaoviedo.net' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'juliocesar@opticaoviedo.net' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'juliocesar@opticaoviedo.net',
    crypt('julio1969', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JULIO OVIEDO', 'company_name', 'JULIO OVIEDO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('julio1969', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JULIO OVIEDO', 'company_name', 'JULIO OVIEDO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'juliocesar@opticaoviedo.net', 'JULIO OVIEDO', 'JULIO OVIEDO', 'Óptica', 'DO', 'client', '1969', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: zulivan72@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'zulivan72@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'zulivan72@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'zulivan72@gmail.com',
    crypt('zorrilla2714', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ZULIVAN ZORRILA', 'company_name', 'ZULIVAN ZORRILA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('zorrilla2714', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ZULIVAN ZORRILA', 'company_name', 'ZULIVAN ZORRILA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'zulivan72@gmail.com', 'ZULIVAN ZORRILA', 'ZULIVAN ZORRILA', 'Óptica', 'VE', 'client', '2714', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: cvmasopticacr@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'cvmasopticacr@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'cvmasopticacr@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'cvmasopticacr@gmail.com',
    crypt('katia2674', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'KATIAS VASQUEZ', 'company_name', 'KATIAS VASQUEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('katia2674', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'KATIAS VASQUEZ', 'company_name', 'KATIAS VASQUEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'cvmasopticacr@gmail.com', 'KATIAS VASQUEZ', 'KATIAS VASQUEZ', 'Óptica', 'CR', 'client', '2674', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: manuluna82@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'manuluna82@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'manuluna82@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'manuluna82@gmail.com',
    crypt('luna2482', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MANUEL LUNA', 'company_name', 'MANUEL LUNA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('luna2482', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MANUEL LUNA', 'company_name', 'MANUEL LUNA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'manuluna82@gmail.com', 'MANUEL LUNA', 'MANUEL LUNA', 'Óptica', 'VE', 'client', '2482', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: optinao@yahoo.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'optinao@yahoo.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'optinao@yahoo.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'optinao@yahoo.com',
    crypt('reyes0004', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ELCIE REYES', 'company_name', 'ELCIE REYES'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('reyes0004', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ELCIE REYES', 'company_name', 'ELCIE REYES'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'optinao@yahoo.com', 'ELCIE REYES', 'ELCIE REYES', 'Óptica', 'EC', 'client', '0004', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: sotozmy@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'sotozmy@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'sotozmy@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'sotozmy@gmail.com',
    crypt('sotozmy', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MARBELLA SOTO', 'company_name', 'MARBELLA SOTO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('sotozmy', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MARBELLA SOTO', 'company_name', 'MARBELLA SOTO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'sotozmy@gmail.com', 'MARBELLA SOTO', 'MARBELLA SOTO', 'Óptica', 'VE', 'client', '2357', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: exit.elsalvador@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'exit.elsalvador@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'exit.elsalvador@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'exit.elsalvador@gmail.com',
    crypt('juan436', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Juan Carlos Flamenco', 'company_name', 'Juan Carlos Flamenco'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('juan436', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Juan Carlos Flamenco', 'company_name', 'Juan Carlos Flamenco'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'exit.elsalvador@gmail.com', 'Juan Carlos Flamenco', 'Juan Carlos Flamenco', 'Óptica', 'SV', 'client', '436', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: oscareuclides@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'oscareuclides@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'oscareuclides@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'oscareuclides@hotmail.com',
    crypt('martinez765', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'OSCAR MARTINEZ', 'company_name', 'OSCAR MARTINEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('martinez765', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'OSCAR MARTINEZ', 'company_name', 'OSCAR MARTINEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'oscareuclides@hotmail.com', 'OSCAR MARTINEZ', 'OSCAR MARTINEZ', 'Óptica', 'NI', 'client', '765', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticaoptiverca@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticaoptiverca@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticaoptiverca@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticaoptiverca@gmail.com',
    crypt('perez2448', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JAVIER PEREZ', 'company_name', 'JAVIER PEREZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('perez2448', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JAVIER PEREZ', 'company_name', 'JAVIER PEREZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticaoptiverca@gmail.com', 'JAVIER PEREZ', 'JAVIER PEREZ', 'Óptica', 'VE', 'client', '2448', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: dclm.asistenciavisual@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'dclm.asistenciavisual@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'dclm.asistenciavisual@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'dclm.asistenciavisual@gmail.com',
    crypt('castillo2450', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MARCOS CASTILLO', 'company_name', 'MARCOS CASTILLO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('castillo2450', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MARCOS CASTILLO', 'company_name', 'MARCOS CASTILLO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'dclm.asistenciavisual@gmail.com', 'MARCOS CASTILLO', 'MARCOS CASTILLO', 'Óptica', 'VE', 'client', '2450', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticaquepos10@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticaquepos10@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticaquepos10@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticaquepos10@gmail.com',
    crypt('lorna2187', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'LORNA RODRIGUEZ', 'company_name', 'LORNA RODRIGUEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('lorna2187', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'LORNA RODRIGUEZ', 'company_name', 'LORNA RODRIGUEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticaquepos10@gmail.com', 'LORNA RODRIGUEZ', 'LORNA RODRIGUEZ', 'Óptica', 'CR', 'client', '2187', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: dikaoluciana@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'dikaoluciana@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'dikaoluciana@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'dikaoluciana@gmail.com',
    crypt('dicao0005', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'LUCIA DICAO', 'company_name', 'LUCIA DICAO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('dicao0005', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'LUCIA DICAO', 'company_name', 'LUCIA DICAO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'dikaoluciana@gmail.com', 'LUCIA DICAO', 'LUCIA DICAO', 'Óptica', 'EC', 'client', '0005', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: margotmonasterio@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'margotmonasterio@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'margotmonasterio@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'margotmonasterio@gmail.com',
    crypt('margot1667', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MARGOT MONASTERIO', 'company_name', 'MARGOT MONASTERIO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('margot1667', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MARGOT MONASTERIO', 'company_name', 'MARGOT MONASTERIO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'margotmonasterio@gmail.com', 'MARGOT MONASTERIO', 'MARGOT MONASTERIO', 'Óptica', 'VE', 'client', '1667', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: guidotoapant@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'guidotoapant@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'guidotoapant@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'guidotoapant@gmail.com',
    crypt('guido2361', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'GUIDO TOAPANTA', 'company_name', 'GUIDO TOAPANTA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('guido2361', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'GUIDO TOAPANTA', 'company_name', 'GUIDO TOAPANTA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'guidotoapant@gmail.com', 'GUIDO TOAPANTA', 'GUIDO TOAPANTA', 'Óptica', 'EC', 'client', '2361', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: ulises.arreaga@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'ulises.arreaga@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'ulises.arreaga@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'ulises.arreaga@gmail.com',
    crypt('ulises1924', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ULISES ARREAGA', 'company_name', 'ULISES ARREAGA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ulises1924', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ULISES ARREAGA', 'company_name', 'ULISES ARREAGA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'ulises.arreaga@gmail.com', 'ULISES ARREAGA', 'ULISES ARREAGA', 'Óptica', 'GT', 'client', '1924', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: miguelkl73@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'miguelkl73@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'miguelkl73@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'miguelkl73@gmail.com',
    crypt('mike25', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MIKE KOCHMAN', 'company_name', 'MIKE KOCHMAN'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('mike25', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MIKE KOCHMAN', 'company_name', 'MIKE KOCHMAN'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'miguelkl73@gmail.com', 'MIKE KOCHMAN', 'MIKE KOCHMAN', 'Óptica', 'VE', 'client', '25', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: contagjtrade@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'contagjtrade@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'contagjtrade@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'contagjtrade@gmail.com',
    crypt('jordi798', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Jordi Jardi', 'company_name', 'Jordi Jardi'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jordi798', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Jordi Jardi', 'company_name', 'Jordi Jardi'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'contagjtrade@gmail.com', 'Jordi Jardi', 'Jordi Jardi', 'Óptica', 'GT', 'client', '798', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: glenisalvaradom@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'glenisalvaradom@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'glenisalvaradom@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'glenisalvaradom@gmail.com',
    crypt('alvarado2419', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'GLENYS ALVARADO', 'company_name', 'GLENYS ALVARADO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('alvarado2419', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'GLENYS ALVARADO', 'company_name', 'GLENYS ALVARADO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'glenisalvaradom@gmail.com', 'GLENYS ALVARADO', 'GLENYS ALVARADO', 'Óptica', 'HN', 'client', '2419', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: rgamacu@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'rgamacu@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'rgamacu@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'rgamacu@hotmail.com',
    crypt('ruth2697', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'RUTH GAMARRA', 'company_name', 'RUTH GAMARRA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ruth2697', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'RUTH GAMARRA', 'company_name', 'RUTH GAMARRA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'rgamacu@hotmail.com', 'RUTH GAMARRA', 'RUTH GAMARRA', 'Óptica', 'PE', 'client', '2697', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: distvenecia@yahoo.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'distvenecia@yahoo.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'distvenecia@yahoo.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'distvenecia@yahoo.com',
    crypt('granado748', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CARLOS GRANADO', 'company_name', 'CARLOS GRANADO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('granado748', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CARLOS GRANADO', 'company_name', 'CARLOS GRANADO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'distvenecia@yahoo.com', 'CARLOS GRANADO', 'CARLOS GRANADO', 'Óptica', 'VE', 'client', '748', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: eguerrero.tladd@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'eguerrero.tladd@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'eguerrero.tladd@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'eguerrero.tladd@gmail.com',
    crypt('guerrero2695', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ENRIQUE GUERRERO', 'company_name', 'ENRIQUE GUERRERO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('guerrero2695', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ENRIQUE GUERRERO', 'company_name', 'ENRIQUE GUERRERO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'eguerrero.tladd@gmail.com', 'ENRIQUE GUERRERO', 'ENRIQUE GUERRERO', 'Óptica', 'SV', 'client', '2695', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: rodolfojimenezsaenz@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'rodolfojimenezsaenz@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'rodolfojimenezsaenz@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'rodolfojimenezsaenz@gmail.com',
    crypt('rodolfo2742', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'RODOLFO JIMENEZ', 'company_name', 'RODOLFO JIMENEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('rodolfo2742', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'RODOLFO JIMENEZ', 'company_name', 'RODOLFO JIMENEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'rodolfojimenezsaenz@gmail.com', 'RODOLFO JIMENEZ', 'RODOLFO JIMENEZ', 'Óptica', 'CR', 'client', '2742', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticavisionsantander@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticavisionsantander@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticavisionsantander@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticavisionsantander@hotmail.com',
    crypt('Nidia2696', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Nidia Ariza', 'company_name', 'Nidia Ariza'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Nidia2696', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Nidia Ariza', 'company_name', 'Nidia Ariza'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticavisionsantander@hotmail.com', 'Nidia Ariza', 'Nidia Ariza', 'Óptica', 'CO', 'client', '2696', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: jimca_82@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'jimca_82@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'jimca_82@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'jimca_82@hotmail.com',
    crypt('jimmy710', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Jimmy Campoverde', 'company_name', 'Jimmy Campoverde'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jimmy710', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Jimmy Campoverde', 'company_name', 'Jimmy Campoverde'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'jimca_82@hotmail.com', 'Jimmy Campoverde', 'Jimmy Campoverde', 'Óptica', 'EC', 'client', '710', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: fredy_p870@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'fredy_p870@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'fredy_p870@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'fredy_p870@hotmail.com',
    crypt('fredy2221', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Fredy Pereira', 'company_name', 'Fredy Pereira'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('fredy2221', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Fredy Pereira', 'company_name', 'Fredy Pereira'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'fredy_p870@hotmail.com', 'Fredy Pereira', 'Fredy Pereira', 'Óptica', 'EC', 'client', '2221', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: gerencia@grupocolors.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'gerencia@grupocolors.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'gerencia@grupocolors.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'gerencia@grupocolors.com',
    crypt('giovani1499', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Giovani Gomez', 'company_name', 'Giovani Gomez'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('giovani1499', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Giovani Gomez', 'company_name', 'Giovani Gomez'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'gerencia@grupocolors.com', 'Giovani Gomez', 'Giovani Gomez', 'Óptica', 'CO', 'client', '1499', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: dyrro1@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'dyrro1@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'dyrro1@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'dyrro1@hotmail.com',
    crypt('liliana2563', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Liliana Betancourt', 'company_name', 'Liliana Betancourt'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('liliana2563', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Liliana Betancourt', 'company_name', 'Liliana Betancourt'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'dyrro1@hotmail.com', 'Liliana Betancourt', 'Liliana Betancourt', 'Óptica', 'CO', 'client', '2563', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticaibarra@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticaibarra@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticaibarra@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticaibarra@hotmail.com',
    crypt('ibarra2126', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JENNESY IBARRA', 'company_name', 'JENNESY IBARRA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ibarra2126', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JENNESY IBARRA', 'company_name', 'JENNESY IBARRA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticaibarra@hotmail.com', 'JENNESY IBARRA', 'JENNESY IBARRA', 'Óptica', 'PA', 'client', '2126', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: suoptica1990@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'suoptica1990@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'suoptica1990@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'suoptica1990@hotmail.com',
    crypt('murillo2707', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ALEJANDRO MURILLO', 'company_name', 'ALEJANDRO MURILLO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('murillo2707', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ALEJANDRO MURILLO', 'company_name', 'ALEJANDRO MURILLO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'suoptica1990@hotmail.com', 'ALEJANDRO MURILLO', 'ALEJANDRO MURILLO', 'Óptica', 'EC', 'client', '2707', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: mariajardi@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'mariajardi@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'mariajardi@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'mariajardi@gmail.com',
    crypt('maria2274', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Maria Jardi', 'company_name', 'Maria Jardi'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('maria2274', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Maria Jardi', 'company_name', 'Maria Jardi'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'mariajardi@gmail.com', 'Maria Jardi', 'Maria Jardi', 'Óptica', 'GT', 'client', '2274', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: sandracontreras81@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'sandracontreras81@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'sandracontreras81@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'sandracontreras81@hotmail.com',
    crypt('sandra1884', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'sandra Contreras', 'company_name', 'sandra Contreras'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('sandra1884', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'sandra Contreras', 'company_name', 'sandra Contreras'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'sandracontreras81@hotmail.com', 'sandra Contreras', 'sandra Contreras', 'Óptica', 'CO', 'client', '1884', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: alibellpg23@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'alibellpg23@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'alibellpg23@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'alibellpg23@hotmail.com',
    crypt('pulido2255', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ALIBELL PULIDO', 'company_name', 'ALIBELL PULIDO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('pulido2255', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ALIBELL PULIDO', 'company_name', 'ALIBELL PULIDO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'alibellpg23@hotmail.com', 'ALIBELL PULIDO', 'ALIBELL PULIDO', 'Óptica', 'VE', 'client', '2255', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: lymoncadarodriguez@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'lymoncadarodriguez@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'lymoncadarodriguez@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'lymoncadarodriguez@gmail.com',
    crypt('moncada0006', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'LIDIA MONCADA', 'company_name', 'LIDIA MONCADA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('moncada0006', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'LIDIA MONCADA', 'company_name', 'LIDIA MONCADA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'lymoncadarodriguez@gmail.com', 'LIDIA MONCADA', 'LIDIA MONCADA', 'Óptica', 'NI', 'client', '0006', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: danieldelgadosjm@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'danieldelgadosjm@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'danieldelgadosjm@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'danieldelgadosjm@gmail.com',
    crypt('delgado0007', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'DANIEL DELGADO', 'company_name', 'DANIEL DELGADO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('delgado0007', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'DANIEL DELGADO', 'company_name', 'DANIEL DELGADO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'danieldelgadosjm@gmail.com', 'DANIEL DELGADO', 'DANIEL DELGADO', 'Óptica', 'CO', 'client', '0007', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: centro.ocular0501@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'centro.ocular0501@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'centro.ocular0501@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'centro.ocular0501@hotmail.com',
    crypt('alfaro2281', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'SHARON ALFARO', 'company_name', 'SHARON ALFARO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('alfaro2281', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'SHARON ALFARO', 'company_name', 'SHARON ALFARO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'centro.ocular0501@hotmail.com', 'SHARON ALFARO', 'SHARON ALFARO', 'Óptica', 'GT', 'client', '2281', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: jpulido1978@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'jpulido1978@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'jpulido1978@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'jpulido1978@gmail.com',
    crypt('juan0008', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Juan Pulido', 'company_name', 'Juan Pulido'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('juan0008', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Juan Pulido', 'company_name', 'Juan Pulido'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'jpulido1978@gmail.com', 'Juan Pulido', 'Juan Pulido', 'Óptica', 'CL', 'client', '0008', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: gerentegeneral.almanzar@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'gerentegeneral.almanzar@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'gerentegeneral.almanzar@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'gerentegeneral.almanzar@gmail.com',
    crypt('joga0008', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MARLIESE JOGA', 'company_name', 'MARLIESE JOGA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('joga0008', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MARLIESE JOGA', 'company_name', 'MARLIESE JOGA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'gerentegeneral.almanzar@gmail.com', 'MARLIESE JOGA', 'MARLIESE JOGA', 'Óptica', 'DO', 'client', '0008', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: villaroptica@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'villaroptica@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'villaroptica@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'villaroptica@gmail.com',
    crypt('villar0009', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'OPTICA VILLAR', 'company_name', 'OPTICA VILLAR'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('villar0009', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'OPTICA VILLAR', 'company_name', 'OPTICA VILLAR'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'villaroptica@gmail.com', 'OPTICA VILLAR', 'OPTICA VILLAR', 'Óptica', 'DO', 'client', '0009', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: clinicaopticadelahoz@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'clinicaopticadelahoz@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'clinicaopticadelahoz@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'clinicaopticadelahoz@gmail.com',
    crypt('Delahoz123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CLINICA OPT. DE LA HOZ', 'company_name', 'CLINICA OPT. DE LA HOZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Delahoz123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CLINICA OPT. DE LA HOZ', 'company_name', 'CLINICA OPT. DE LA HOZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'clinicaopticadelahoz@gmail.com', 'CLINICA OPT. DE LA HOZ', 'CLINICA OPT. DE LA HOZ', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: tecnogafas@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'tecnogafas@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'tecnogafas@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'tecnogafas@gmail.com',
    crypt('Tecno123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'TECNOGAFAS', 'company_name', 'TECNOGAFAS'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Tecno123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'TECNOGAFAS', 'company_name', 'TECNOGAFAS'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'tecnogafas@gmail.com', 'TECNOGAFAS', 'TECNOGAFAS', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: info@eyecarecanterpanama.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'info@eyecarecanterpanama.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'info@eyecarecanterpanama.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'info@eyecarecanterpanama.com',
    crypt('Eyecare123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'EYE CARE CENTER PANAMA S.A.', 'company_name', 'EYE CARE CENTER PANAMA S.A.'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Eyecare123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'EYE CARE CENTER PANAMA S.A.', 'company_name', 'EYE CARE CENTER PANAMA S.A.'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'info@eyecarecanterpanama.com', 'EYE CARE CENTER PANAMA S.A.', 'EYE CARE CENTER PANAMA S.A.', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: sandoval.olga@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'sandoval.olga@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'sandoval.olga@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'sandoval.olga@gmail.com',
    crypt('Totalvision123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'OPTICA TOTALVISION', 'company_name', 'OPTICA TOTALVISION'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Totalvision123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'OPTICA TOTALVISION', 'company_name', 'OPTICA TOTALVISION'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'sandoval.olga@gmail.com', 'OPTICA TOTALVISION', 'OPTICA TOTALVISION', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: visionpluspty@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'visionpluspty@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'visionpluspty@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'visionpluspty@gmail.com',
    crypt('Visionplus123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'SUKHDIPSINGH', 'company_name', 'SUKHDIPSINGH'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Visionplus123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'SUKHDIPSINGH', 'company_name', 'SUKHDIPSINGH'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'visionpluspty@gmail.com', 'SUKHDIPSINGH', 'SUKHDIPSINGH', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: astrithc27@outlook.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'astrithc27@outlook.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'astrithc27@outlook.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'astrithc27@outlook.com',
    crypt('Ojitos123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'OPTICA DRA. OJITOS', 'company_name', 'OPTICA DRA. OJITOS'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Ojitos123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'OPTICA DRA. OJITOS', 'company_name', 'OPTICA DRA. OJITOS'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'astrithc27@outlook.com', 'OPTICA DRA. OJITOS', 'OPTICA DRA. OJITOS', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: optica@clinicayee.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'optica@clinicayee.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'optica@clinicayee.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'optica@clinicayee.com',
    crypt('Medi123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MEDI OPTICS S.A.', 'company_name', 'MEDI OPTICS S.A.'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Medi123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MEDI OPTICS S.A.', 'company_name', 'MEDI OPTICS S.A.'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'optica@clinicayee.com', 'MEDI OPTICS S.A.', 'MEDI OPTICS S.A.', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: ojo.cliente@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'ojo.cliente@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'ojo.cliente@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'ojo.cliente@gmail.com',
    crypt('Ojo123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'OJO PANAMA', 'company_name', 'OJO PANAMA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Ojo123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'OJO PANAMA', 'company_name', 'OJO PANAMA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'ojo.cliente@gmail.com', 'OJO PANAMA', 'OJO PANAMA', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: thompson.jose@imperial.com.pa
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'thompson.jose@imperial.com.pa' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'thompson.jose@imperial.com.pa' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'thompson.jose@imperial.com.pa',
    crypt('Boyd123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CLINICA BOYD', 'company_name', 'CLINICA BOYD'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Boyd123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CLINICA BOYD', 'company_name', 'CLINICA BOYD'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'thompson.jose@imperial.com.pa', 'CLINICA BOYD', 'CLINICA BOYD', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticavistoso@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticavistoso@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticavistoso@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticavistoso@gmail.com',
    crypt('vistoso123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'HUMANOPTIC S.A.', 'company_name', 'HUMANOPTIC S.A.'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('vistoso123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'HUMANOPTIC S.A.', 'company_name', 'HUMANOPTIC S.A.'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticavistoso@gmail.com', 'HUMANOPTIC S.A.', 'HUMANOPTIC S.A.', 'Óptica', 'PA', 'client', '123', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: cliopt@clinicacliopt.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'cliopt@clinicacliopt.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'cliopt@clinicacliopt.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'cliopt@clinicacliopt.com',
    crypt('Cliopt2608', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CLINICA OPTICA CLIOPT', 'company_name', 'CLINICA OPTICA CLIOPT'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('Cliopt2608', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CLINICA OPTICA CLIOPT', 'company_name', 'CLINICA OPTICA CLIOPT'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'cliopt@clinicacliopt.com', 'CLINICA OPTICA CLIOPT', 'CLINICA OPTICA CLIOPT', 'Óptica', 'PA', 'client', '2608', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: desperategossip@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'desperategossip@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'desperategossip@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'desperategossip@gmail.com',
    crypt('marco0010', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MARCO MONTALVAN', 'company_name', 'MARCO MONTALVAN'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('marco0010', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MARCO MONTALVAN', 'company_name', 'MARCO MONTALVAN'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'desperategossip@gmail.com', 'MARCO MONTALVAN', 'MARCO MONTALVAN', 'Óptica', 'HN', 'client', '0010', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: carldavidbarrientos.31@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'carldavidbarrientos.31@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'carldavidbarrientos.31@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'carldavidbarrientos.31@gmail.com',
    crypt('carlos2759', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CARLOS BARRIENTOS/OPTICAS MATAMALA', 'company_name', 'CARLOS BARRIENTOS/OPTICAS MATAMALA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('carlos2759', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CARLOS BARRIENTOS/OPTICAS MATAMALA', 'company_name', 'CARLOS BARRIENTOS/OPTICAS MATAMALA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'carldavidbarrientos.31@gmail.com', 'CARLOS BARRIENTOS/OPTICAS MATAMALA', 'CARLOS BARRIENTOS/OPTICAS MATAMALA', 'Óptica', 'HN', 'client', '2759', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: mauricio_santos31@yahoo.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'mauricio_santos31@yahoo.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'mauricio_santos31@yahoo.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'mauricio_santos31@yahoo.com',
    crypt('mauricio2421', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MAURICIO SANTOS', 'company_name', 'MAURICIO SANTOS'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('mauricio2421', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MAURICIO SANTOS', 'company_name', 'MAURICIO SANTOS'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'mauricio_santos31@yahoo.com', 'MAURICIO SANTOS', 'MAURICIO SANTOS', 'Óptica', 'SV', 'client', '2421', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: solano07hum@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'solano07hum@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'solano07hum@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'solano07hum@gmail.com',
    crypt('solano2751', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'HUMBERTO SOLANO', 'company_name', 'HUMBERTO SOLANO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('solano2751', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'HUMBERTO SOLANO', 'company_name', 'HUMBERTO SOLANO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'solano07hum@gmail.com', 'HUMBERTO SOLANO', 'HUMBERTO SOLANO', 'Óptica', 'SV', 'client', '2751', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: consultaopticacenteno@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'consultaopticacenteno@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'consultaopticacenteno@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'consultaopticacenteno@hotmail.com',
    crypt('centeno1760', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'ORIANA', 'company_name', 'ORIANA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('centeno1760', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'ORIANA', 'company_name', 'ORIANA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'consultaopticacenteno@hotmail.com', 'ORIANA', 'ORIANA', 'Óptica', 'PA', 'client', '1760', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: stylos_opticos@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'stylos_opticos@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'stylos_opticos@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'stylos_opticos@hotmail.com',
    crypt('vanessa2168', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'VANESSA CORTES', 'company_name', 'VANESSA CORTES'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('vanessa2168', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'VANESSA CORTES', 'company_name', 'VANESSA CORTES'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'stylos_opticos@hotmail.com', 'VANESSA CORTES', 'VANESSA CORTES', 'Óptica', 'CR', 'client', '2168', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: saludvisual@cwpanama.net
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'saludvisual@cwpanama.net' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'saludvisual@cwpanama.net' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'saludvisual@cwpanama.net',
    crypt('palma0011', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'DOLLY PALMA', 'company_name', 'DOLLY PALMA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('palma0011', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'DOLLY PALMA', 'company_name', 'DOLLY PALMA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'saludvisual@cwpanama.net', 'DOLLY PALMA', 'DOLLY PALMA', 'Óptica', 'PA', 'client', '0011', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: sebastianmoradiaz.64@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'sebastianmoradiaz.64@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'sebastianmoradiaz.64@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'sebastianmoradiaz.64@gmail.com',
    crypt('sebastian2334', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Sebastian Mora', 'company_name', 'Sebastian Mora'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('sebastian2334', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Sebastian Mora', 'company_name', 'Sebastian Mora'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'sebastianmoradiaz.64@gmail.com', 'Sebastian Mora', 'Sebastian Mora', 'Óptica', 'CO', 'client', '2334', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: lourdes_visionintegral1970@yahoo.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'lourdes_visionintegral1970@yahoo.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'lourdes_visionintegral1970@yahoo.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'lourdes_visionintegral1970@yahoo.com',
    crypt('lourdes1920', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Lourdes Amato', 'company_name', 'Lourdes Amato'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('lourdes1920', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Lourdes Amato', 'company_name', 'Lourdes Amato'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'lourdes_visionintegral1970@yahoo.com', 'Lourdes Amato', 'Lourdes Amato', 'Óptica', 'SV', 'client', '1920', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: cosmolens3@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'cosmolens3@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'cosmolens3@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'cosmolens3@gmail.com',
    crypt('cesar792', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Cesar Gaycha', 'company_name', 'Cesar Gaycha'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('cesar792', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Cesar Gaycha', 'company_name', 'Cesar Gaycha'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'cosmolens3@gmail.com', 'Cesar Gaycha', 'Cesar Gaycha', 'Óptica', 'EC', 'client', '792', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: gerencia@clinicaocularcr.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'gerencia@clinicaocularcr.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'gerencia@clinicaocularcr.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'gerencia@clinicaocularcr.com',
    crypt('jorge888', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Jorge Sanchez', 'company_name', 'Jorge Sanchez'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jorge888', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Jorge Sanchez', 'company_name', 'Jorge Sanchez'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'gerencia@clinicaocularcr.com', 'Jorge Sanchez', 'Jorge Sanchez', 'Óptica', 'CR', 'client', '888', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: paginaweb@opticasdeluxe.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'paginaweb@opticasdeluxe.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'paginaweb@opticasdeluxe.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'paginaweb@opticasdeluxe.com',
    crypt('rocio123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Rocio casanueva', 'company_name', 'Rocio casanueva'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('rocio123', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Rocio casanueva', 'company_name', 'Rocio casanueva'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'paginaweb@opticasdeluxe.com', 'Rocio casanueva', 'Rocio casanueva', 'Óptica', 'GT', 'client', '0000', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: grupoopticovision2020@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'grupoopticovision2020@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'grupoopticovision2020@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'grupoopticovision2020@gmail.com',
    crypt('omaira1280', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Omaira Uzcategui', 'company_name', 'Omaira Uzcategui'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('omaira1280', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Omaira Uzcategui', 'company_name', 'Omaira Uzcategui'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'grupoopticovision2020@gmail.com', 'Omaira Uzcategui', 'Omaira Uzcategui', 'Óptica', 'VE', 'client', '1280', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: diazoptica9@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'diazoptica9@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'diazoptica9@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'diazoptica9@gmail.com',
    crypt('diaz0015', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CARLOS DIAZ', 'company_name', 'CARLOS DIAZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('diaz0015', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CARLOS DIAZ', 'company_name', 'CARLOS DIAZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'diazoptica9@gmail.com', 'CARLOS DIAZ', 'CARLOS DIAZ', 'Óptica', 'VE', 'client', '0000', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticaberlud@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticaberlud@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticaberlud@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticaberlud@hotmail.com',
    crypt('bladimir1274', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Bladimir Ontiveros', 'company_name', 'Bladimir Ontiveros'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('bladimir1274', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Bladimir Ontiveros', 'company_name', 'Bladimir Ontiveros'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticaberlud@hotmail.com', 'Bladimir Ontiveros', 'Bladimir Ontiveros', 'Óptica', 'VE', 'client', '1274', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticakors@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticakors@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticakors@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticakors@gmail.com',
    crypt('fernando0000', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Fernando Alvarez', 'company_name', 'Fernando Alvarez'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('fernando0000', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Fernando Alvarez', 'company_name', 'Fernando Alvarez'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticakors@gmail.com', 'Fernando Alvarez', 'Fernando Alvarez', 'Óptica', 'CO', 'client', '0000', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: luzoptical@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'luzoptical@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'luzoptical@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'luzoptical@gmail.com',
    crypt('omar1298', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Omar Enrique tercero', 'company_name', 'Omar Enrique tercero'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('omar1298', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Omar Enrique tercero', 'company_name', 'Omar Enrique tercero'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'luzoptical@gmail.com', 'Omar Enrique tercero', 'Omar Enrique tercero', 'Óptica', 'NI', 'client', '1298', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: gioreoptical@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'gioreoptical@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'gioreoptical@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'gioreoptical@gmail.com',
    crypt('claudia2560', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Claudia Gallo', 'company_name', 'Claudia Gallo'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('claudia2560', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Claudia Gallo', 'company_name', 'Claudia Gallo'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'gioreoptical@gmail.com', 'Claudia Gallo', 'Claudia Gallo', 'Óptica', 'EC', 'client', '2560', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: williamscuadroc@yahoo.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'williamscuadroc@yahoo.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'williamscuadroc@yahoo.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'williamscuadroc@yahoo.com',
    crypt('alberto1509', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Alberto Cuadros', 'company_name', 'Alberto Cuadros'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('alberto1509', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Alberto Cuadros', 'company_name', 'Alberto Cuadros'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'williamscuadroc@yahoo.com', 'Alberto Cuadros', 'Alberto Cuadros', 'Óptica', 'PE', 'client', '1509', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticasbethel@yahoo.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticasbethel@yahoo.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticasbethel@yahoo.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticasbethel@yahoo.com',
    crypt('kenny1480', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Kenny Ortiz', 'company_name', 'Kenny Ortiz'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('kenny1480', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Kenny Ortiz', 'company_name', 'Kenny Ortiz'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticasbethel@yahoo.com', 'Kenny Ortiz', 'Kenny Ortiz', 'Óptica', 'NI', 'client', '1480', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: veira2106@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'veira2106@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'veira2106@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'veira2106@hotmail.com',
    crypt('jusavi1928', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'VEIRA', 'company_name', 'VEIRA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('jusavi1928', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'VEIRA', 'company_name', 'VEIRA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'veira2106@hotmail.com', 'VEIRA', 'VEIRA', 'Óptica', 'PA', 'client', '1928', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: pedroceleopti@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'pedroceleopti@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'pedroceleopti@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'pedroceleopti@gmail.com',
    crypt('pedro0018', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'PEDRO CELESTINO RODRIGUEZ', 'company_name', 'PEDRO CELESTINO RODRIGUEZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('pedro0018', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'PEDRO CELESTINO RODRIGUEZ', 'company_name', 'PEDRO CELESTINO RODRIGUEZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'pedroceleopti@gmail.com', 'PEDRO CELESTINO RODRIGUEZ', 'PEDRO CELESTINO RODRIGUEZ', 'Óptica', 'US', 'client', '0018', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: lanita983@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'lanita983@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'lanita983@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'lanita983@gmail.com',
    crypt('ana1633', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'GIRALDO ANA MARIA', 'company_name', 'GIRALDO ANA MARIA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ana1633', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'GIRALDO ANA MARIA', 'company_name', 'GIRALDO ANA MARIA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'lanita983@gmail.com', 'GIRALDO ANA MARIA', 'GIRALDO ANA MARIA', 'Óptica', 'CR', 'client', '1633', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: ccharpentier1978@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'ccharpentier1978@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'ccharpentier1978@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'ccharpentier1978@gmail.com',
    crypt('christian1550', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'CHRISTIAN CHARPENTIER GAMBOA', 'company_name', 'CHRISTIAN CHARPENTIER GAMBOA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('christian1550', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'CHRISTIAN CHARPENTIER GAMBOA', 'company_name', 'CHRISTIAN CHARPENTIER GAMBOA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'ccharpentier1978@gmail.com', 'CHRISTIAN CHARPENTIER GAMBOA', 'CHRISTIAN CHARPENTIER GAMBOA', 'Óptica', 'CR', 'client', '1550', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: fatimacarolina_85@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'fatimacarolina_85@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'fatimacarolina_85@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'fatimacarolina_85@hotmail.com',
    crypt('fatima1970', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Fatima Gaitan', 'company_name', 'Fatima Gaitan'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('fatima1970', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Fatima Gaitan', 'company_name', 'Fatima Gaitan'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'fatimacarolina_85@hotmail.com', 'Fatima Gaitan', 'Fatima Gaitan', 'Óptica', 'NI', 'client', '1970', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: hdaguero@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'hdaguero@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'hdaguero@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'hdaguero@gmail.com',
    crypt('hector2153', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Hector Agüero', 'company_name', 'Hector Agüero'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('hector2153', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Hector Agüero', 'company_name', 'Hector Agüero'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'hdaguero@gmail.com', 'Hector Agüero', 'Hector Agüero', 'Óptica', 'UY', 'client', '2153', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: visioneimagen@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'visioneimagen@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'visioneimagen@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'visioneimagen@hotmail.com',
    crypt('carlos2140', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Carlos Mojica', 'company_name', 'Carlos Mojica'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('carlos2140', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Carlos Mojica', 'company_name', 'Carlos Mojica'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'visioneimagen@hotmail.com', 'Carlos Mojica', 'Carlos Mojica', 'Óptica', 'SV', 'client', '2140', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: johaaram72@yahoo.es
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'johaaram72@yahoo.es' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'johaaram72@yahoo.es' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'johaaram72@yahoo.es',
    crypt('ramirez2584', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JOHANNA RAMIREZ', 'company_name', 'JOHANNA RAMIREZ'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('ramirez2584', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JOHANNA RAMIREZ', 'company_name', 'JOHANNA RAMIREZ'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'johaaram72@yahoo.es', 'JOHANNA RAMIREZ', 'JOHANNA RAMIREZ', 'Óptica', 'NI', 'client', '2584', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: andressgiralt@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'andressgiralt@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'andressgiralt@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'andressgiralt@gmail.com',
    crypt('andres1917', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Andres Giraldo', 'company_name', 'Andres Giraldo'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('andres1917', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Andres Giraldo', 'company_name', 'Andres Giraldo'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'andressgiralt@gmail.com', 'Andres Giraldo', 'Andres Giraldo', 'Óptica', 'VE', 'client', '1917', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: multiopticascr@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'multiopticascr@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'multiopticascr@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'multiopticascr@gmail.com',
    crypt('miguel2110', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Miguel Cuervo', 'company_name', 'Miguel Cuervo'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('miguel2110', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Miguel Cuervo', 'company_name', 'Miguel Cuervo'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'multiopticascr@gmail.com', 'Miguel Cuervo', 'Miguel Cuervo', 'Óptica', 'CR', 'client', '2110', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: opticlinic.cr@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'opticlinic.cr@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'opticlinic.cr@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'opticlinic.cr@gmail.com',
    crypt('katherine2193', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Katherie Sevilla', 'company_name', 'Katherie Sevilla'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('katherine2193', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Katherie Sevilla', 'company_name', 'Katherie Sevilla'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'opticlinic.cr@gmail.com', 'Katherie Sevilla', 'Katherie Sevilla', 'Óptica', 'CR', 'client', '2193', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: multiprofcc@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'multiprofcc@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'multiprofcc@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'multiprofcc@hotmail.com',
    crypt('chacon2438', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'JAYRO CHACON', 'company_name', 'JAYRO CHACON'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('chacon2438', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'JAYRO CHACON', 'company_name', 'JAYRO CHACON'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'multiprofcc@hotmail.com', 'JAYRO CHACON', 'JAYRO CHACON', 'Óptica', 'SV', 'client', '2438', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: recepcion@opticalook.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'recepcion@opticalook.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'recepcion@opticalook.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'recepcion@opticalook.com',
    crypt('harold1822', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Harold Orozco', 'company_name', 'Harold Orozco'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('harold1822', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Harold Orozco', 'company_name', 'Harold Orozco'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'recepcion@opticalook.com', 'Harold Orozco', 'Harold Orozco', 'Óptica', 'CR', 'client', '1822', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: tanya_monge@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'tanya_monge@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'tanya_monge@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'tanya_monge@hotmail.com',
    crypt('tanya2059', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Tanya Monge', 'company_name', 'Tanya Monge'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('tanya2059', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Tanya Monge', 'company_name', 'Tanya Monge'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'tanya_monge@hotmail.com', 'Tanya Monge', 'Tanya Monge', 'Óptica', 'CR', 'client', '2059', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: yuditbelr@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'yuditbelr@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'yuditbelr@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'yuditbelr@gmail.com',
    crypt('aguila0020', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'YUDIBEL AGUILA', 'company_name', 'YUDIBEL AGUILA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('aguila0020', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'YUDIBEL AGUILA', 'company_name', 'YUDIBEL AGUILA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'yuditbelr@gmail.com', 'YUDIBEL AGUILA', 'YUDIBEL AGUILA', 'Óptica', 'US', 'client', '0020', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: marioparrado01@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'marioparrado01@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'marioparrado01@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'marioparrado01@gmail.com',
    crypt('parrado0021', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MARIO PARRADO', 'company_name', 'MARIO PARRADO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('parrado0021', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MARIO PARRADO', 'company_name', 'MARIO PARRADO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'marioparrado01@gmail.com', 'MARIO PARRADO', 'MARIO PARRADO', 'Óptica', 'CO', 'client', '0021', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: info@servilentesgt.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'info@servilentesgt.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'info@servilentesgt.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'info@servilentesgt.com',
    crypt('LauraOrrego', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Laura Orrego', 'company_name', 'Laura Orrego'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('LauraOrrego', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Laura Orrego', 'company_name', 'Laura Orrego'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'info@servilentesgt.com', 'Laura Orrego', 'Laura Orrego', 'Óptica', 'GT', 'client', NULL, true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: somarriba_mara09@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'somarriba_mara09@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'somarriba_mara09@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'somarriba_mara09@hotmail.com',
    crypt('somarriba0021', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'MARALING SOMARRIBA', 'company_name', 'MARALING SOMARRIBA'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('somarriba0021', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'MARALING SOMARRIBA', 'company_name', 'MARALING SOMARRIBA'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'somarriba_mara09@hotmail.com', 'MARALING SOMARRIBA', 'MARALING SOMARRIBA', 'Óptica', 'NI', 'client', '0021', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: corpovision_11@hotmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'corpovision_11@hotmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'corpovision_11@hotmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'corpovision_11@hotmail.com',
    crypt('fernando0022', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Fernando Hernandez', 'company_name', 'Fernando Hernandez'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('fernando0022', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Fernando Hernandez', 'company_name', 'Fernando Hernandez'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'corpovision_11@hotmail.com', 'Fernando Hernandez', 'Fernando Hernandez', 'Óptica', 'CO', 'client', '0022', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: edgararcea@gmail.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'edgararcea@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'edgararcea@gmail.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'edgararcea@gmail.com',
    crypt('edgar1392', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Edgar Arce', 'company_name', 'Edgar Arce'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('edgar1392', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Edgar Arce', 'company_name', 'Edgar Arce'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'edgararcea@gmail.com', 'Edgar Arce', 'Edgar Arce', 'Óptica', 'CR', 'client', '1392', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: samir.traverso@opticasantalucia.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'samir.traverso@opticasantalucia.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'samir.traverso@opticasantalucia.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'samir.traverso@opticasantalucia.com',
    crypt('traverso2197', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'SAMIR TRAVERSO', 'company_name', 'SAMIR TRAVERSO'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('traverso2197', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'SAMIR TRAVERSO', 'company_name', 'SAMIR TRAVERSO'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'samir.traverso@opticasantalucia.com', 'SAMIR TRAVERSO', 'SAMIR TRAVERSO', 'Óptica', 'PE', 'client', '2197', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

  -- ----------------------------------------------------
  -- Usuario: m.shoshan@kvr-partners.com
  -- ----------------------------------------------------
  -- 1. Obtener ID existente si ya esta en profiles o auth.users
  SELECT id INTO v_user_id FROM public.profiles WHERE lower(email) = 'm.shoshan@kvr-partners.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = 'm.shoshan@kvr-partners.com' LIMIT 1;
  END IF;
  
  -- Si es totalmente nuevo, generar nuevo UUID
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
  END IF;

  -- 2. Insertar o actualizar en auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'm.shoshan@kvr-partners.com',
    crypt('moshe0022', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', 'Moshe Shoshan', 'company_name', 'Moshe Shoshan'),
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = crypt('moshe0022', gen_salt('bf')),
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    raw_user_meta_data = jsonb_build_object('full_name', 'Moshe Shoshan', 'company_name', 'Moshe Shoshan'),
    updated_at = now();

  -- 3. Insertar o actualizar en public.profiles
  INSERT INTO public.profiles (
    id, email, full_name, company_name, business_type, country_code, role, erp_client_code, onboarding_completed
  ) VALUES (
    v_user_id, 'm.shoshan@kvr-partners.com', 'Moshe Shoshan', 'Moshe Shoshan', 'Óptica', 'PA', 'client', '0022', true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    country_code = EXCLUDED.country_code,
    erp_client_code = COALESCE(EXCLUDED.erp_client_code, public.profiles.erp_client_code),
    role = 'client',
    onboarding_completed = true;

END $$;

-- Reactivar los triggers del sistema
SET session_replication_role = 'origin';
