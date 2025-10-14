-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor');

-- Create profiles table for basic user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create patients_info table for patient-specific data
CREATE TABLE public.patients_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  age INTEGER,
  blood_group TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create doctors_info table for doctor-specific data
CREATE TABLE public.doctors_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialty TEXT NOT NULL,
  experience INTEGER NOT NULL DEFAULT 0,
  qualification TEXT NOT NULL,
  clinic_address TEXT,
  about TEXT,
  achievements TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create time_slots table for doctor availability
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  symptoms TEXT[],
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create symptoms_records table
CREATE TABLE public.symptoms_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symptoms TEXT[] NOT NULL,
  additional_notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create health_records table
CREATE TABLE public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('report', 'prescription')),
  title TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  
  -- Set role from metadata or default to patient
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'::app_role)
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_patients_info_updated_at BEFORE UPDATE ON public.patients_info
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_doctors_info_updated_at BEFORE UPDATE ON public.doctors_info
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for patients_info
CREATE POLICY "Patients can view own info" ON public.patients_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Patients can insert own info" ON public.patients_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update own info" ON public.patients_info
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view patient info for their appointments" ON public.patients_info
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = patients_info.user_id
        AND appointments.doctor_id = auth.uid()
    )
  );

-- RLS Policies for doctors_info
CREATE POLICY "Everyone can view doctors info" ON public.doctors_info
  FOR SELECT USING (true);

CREATE POLICY "Doctors can insert own info" ON public.doctors_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update own info" ON public.doctors_info
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for time_slots
CREATE POLICY "Everyone can view available slots" ON public.time_slots
  FOR SELECT USING (true);

CREATE POLICY "Doctors can insert own slots" ON public.time_slots
  FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update own slots" ON public.time_slots
  FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete own slots" ON public.time_slots
  FOR DELETE USING (auth.uid() = doctor_id);

-- RLS Policies for appointments
CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can update their appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = doctor_id);

-- RLS Policies for symptoms_records
CREATE POLICY "Patients can view own symptoms" ON public.symptoms_records
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own symptoms" ON public.symptoms_records
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient symptoms for their appointments" ON public.symptoms_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = symptoms_records.patient_id
        AND appointments.doctor_id = auth.uid()
    )
  );

-- RLS Policies for health_records
CREATE POLICY "Patients can view own health records" ON public.health_records
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own health records" ON public.health_records
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient health records for their appointments" ON public.health_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.patient_id = health_records.patient_id
        AND appointments.doctor_id = auth.uid()
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their appointments" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = messages.appointment_id
        AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages for their appointments" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.appointments
      WHERE appointments.id = appointment_id
        AND (appointments.patient_id = auth.uid() OR appointments.doctor_id = auth.uid())
    )
  );