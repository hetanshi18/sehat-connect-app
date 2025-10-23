-- Update the handle_new_user function to automatically create doctors_info entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  
  -- Determine role from metadata or default to patient
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'::app_role);
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If doctor, also create doctors_info entry
  IF user_role = 'doctor' THEN
    INSERT INTO public.doctors_info (user_id, experience, qualification, clinic_address, about, achievements)
    VALUES (NEW.id, 0, '', '', '', '{}')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Backfill missing doctors_info entries for existing doctors
INSERT INTO public.doctors_info (user_id, experience, qualification, clinic_address, about, achievements)
SELECT ur.user_id, 0, '', '', '', '{}'
FROM public.user_roles ur
WHERE ur.role = 'doctor'
  AND NOT EXISTS (
    SELECT 1 FROM public.doctors_info di WHERE di.user_id = ur.user_id
  )
ON CONFLICT (user_id) DO NOTHING;