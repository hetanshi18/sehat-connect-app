-- Add registration number and signature URL to doctors_info table
ALTER TABLE public.doctors_info
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- Add prescription storage
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id),
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  prescription_url TEXT NOT NULL,
  diagnosis TEXT,
  medicines JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  prescription_date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Policies for prescriptions
CREATE POLICY "Doctors can insert prescriptions for their appointments"
ON public.prescriptions FOR INSERT
WITH CHECK (
  auth.uid() = doctor_id AND
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id = prescriptions.appointment_id
    AND appointments.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view their prescriptions"
ON public.prescriptions FOR SELECT
USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their prescriptions"
ON public.prescriptions FOR SELECT
USING (auth.uid() = patient_id);

-- Update storage bucket for prescriptions if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for prescriptions
CREATE POLICY "Doctors can upload prescriptions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prescriptions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Doctors can view prescription files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'prescriptions' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Patients can view their prescription files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'prescriptions' AND
  EXISTS (
    SELECT 1 FROM prescriptions
    WHERE prescriptions.patient_id = auth.uid()
    AND prescriptions.prescription_url LIKE '%' || storage.objects.name || '%'
  )
);

-- Storage policies for doctor signatures
CREATE POLICY "Doctors can upload their signatures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'health-documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  name LIKE '%/signature/%'
);

CREATE POLICY "Doctors can update their signatures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'health-documents' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  name LIKE '%/signature/%'
);

CREATE POLICY "Anyone can view doctor signatures"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'health-documents' AND
  name LIKE '%/signature/%'
);