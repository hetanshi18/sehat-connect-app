-- Update the handle_new_user function to support admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
  )
  ON CONFLICT (id) DO UPDATE 
  SET email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, profiles.name);
  
  -- Determine role from metadata or default to patient
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'::app_role);
  
  -- Insert role
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
$$;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Create admin access policies for profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create admin access policies for doctors_info
CREATE POLICY "Admins can view all doctors info"
ON public.doctors_info
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert doctors info"
ON public.doctors_info
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all doctors info"
ON public.doctors_info
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create admin access policies for patients_info
CREATE POLICY "Admins can view all patients info"
ON public.patients_info
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create admin access policies for appointments
CREATE POLICY "Admins can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));