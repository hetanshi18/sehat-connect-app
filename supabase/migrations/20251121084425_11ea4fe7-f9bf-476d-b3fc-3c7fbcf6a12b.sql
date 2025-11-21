-- Allow patients to update their own health records (needed for AI analysis)
CREATE POLICY "Patients can update own health records"
ON public.health_records
FOR UPDATE
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);