-- Create storage bucket for health documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-documents', 'health-documents', false);

-- Allow patients to upload their own health documents
CREATE POLICY "Patients can upload own health documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'health-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow patients to view their own health documents
CREATE POLICY "Patients can view own health documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'health-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow doctors to view patient health documents for their appointments
CREATE POLICY "Doctors can view patient health documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'health-documents' 
  AND EXISTS (
    SELECT 1 FROM appointments
    WHERE appointments.patient_id::text = (storage.foldername(name))[1]
    AND appointments.doctor_id = auth.uid()
  )
);

-- Allow patients to delete their own health documents
CREATE POLICY "Patients can delete own health documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'health-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);