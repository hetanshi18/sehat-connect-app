-- Add report and relief_measures columns to health_records table
ALTER TABLE public.health_records
ADD COLUMN IF NOT EXISTS report text,
ADD COLUMN IF NOT EXISTS relief_measures text;

-- Create appointment_notes table
CREATE TABLE IF NOT EXISTS public.appointment_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL,
  doctor_id uuid NOT NULL,
  patient_id uuid NOT NULL,
  notes text,
  medicines_prescribed text,
  follow_up_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on appointment_notes
ALTER TABLE public.appointment_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointment_notes
CREATE POLICY "Doctors can view notes for their appointments"
ON public.appointment_notes
FOR SELECT
USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view their appointment notes"
ON public.appointment_notes
FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can insert notes for their appointments"
ON public.appointment_notes
FOR INSERT
WITH CHECK (
  auth.uid() = doctor_id AND
  EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.id = appointment_id
    AND appointments.doctor_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their appointment notes"
ON public.appointment_notes
FOR UPDATE
USING (auth.uid() = doctor_id);

-- Add trigger for updated_at
CREATE TRIGGER update_appointment_notes_updated_at
BEFORE UPDATE ON public.appointment_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();