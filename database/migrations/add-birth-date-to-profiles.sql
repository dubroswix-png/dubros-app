-- Agregar columna birth_date para registrar el cumpleaños del cliente
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Confirmación
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'birth_date';
