-- Drop old conflicting triggers and functions with CASCADE
DROP TRIGGER IF EXISTS add_doctor_info_trigger ON public.profiles;
DROP TRIGGER IF EXISTS create_doctor_info_trigger ON public.profiles;
DROP TRIGGER IF EXISTS create_doctor_info_after_update_trigger ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_insert ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.add_doctor_info() CASCADE;
DROP FUNCTION IF EXISTS public.create_doctor_info_entry() CASCADE;
DROP FUNCTION IF EXISTS public.create_doctor_info_after_update() CASCADE;

-- Ensure all existing users in auth.users have matching profiles
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'User'),
  COALESCE((SELECT role FROM user_roles WHERE user_id = au.id LIMIT 1)::text, 'patient')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Add NOT NULL constraints to appointments table
ALTER TABLE public.appointments 
  ALTER COLUMN patient_id SET NOT NULL,
  ALTER COLUMN doctor_id SET NOT NULL;

-- Create a function to validate appointment data
CREATE OR REPLACE FUNCTION public.validate_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure patient_id is not NULL and exists in profiles
  IF NEW.patient_id IS NULL THEN
    RAISE EXCEPTION 'patient_id cannot be NULL';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.patient_id) THEN
    RAISE EXCEPTION 'patient_id must reference a valid user profile';
  END IF;
  
  -- Ensure doctor_id is not NULL and exists in profiles
  IF NEW.doctor_id IS NULL THEN
    RAISE EXCEPTION 'doctor_id cannot be NULL';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.doctor_id) THEN
    RAISE EXCEPTION 'doctor_id must reference a valid user profile';
  END IF;
  
  -- Ensure doctor actually has doctor role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.doctor_id AND role = 'doctor'
  ) THEN
    RAISE EXCEPTION 'doctor_id must reference a user with doctor role';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to validate appointments on insert and update
DROP TRIGGER IF EXISTS validate_appointment_trigger ON public.appointments;
CREATE TRIGGER validate_appointment_trigger
  BEFORE INSERT OR UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_appointment();

-- Update the handle_new_user function to ensure profiles are always created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role;
BEGIN
  -- Insert profile (will not fail if already exists due to ON CONFLICT)
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, profiles.name);
  
  -- Determine role from metadata or default to patient
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'::app_role);
  
  -- Insert role (will not fail if already exists due to ON CONFLICT)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- If doctor, also create doctors_info entry
  IF user_role = 'doctor' THEN
    INSERT INTO public.doctors_info (user_id, experience, qualification, clinic_address, about, achievements)
    VALUES (NEW.id, 0, '', '', '', '{}')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;