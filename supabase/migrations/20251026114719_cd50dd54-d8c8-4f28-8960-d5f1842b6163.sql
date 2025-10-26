-- Add status column to time_slots to track pending/available/booked states
ALTER TABLE public.time_slots 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'available' 
  CHECK (status IN ('available', 'pending', 'booked'));

-- Update existing slots based on current state
UPDATE public.time_slots 
SET status = CASE
  WHEN is_booked = true OR (is_available = false AND patient_id IS NOT NULL) THEN 'booked'
  WHEN is_available = false AND patient_id IS NULL THEN 'pending'
  ELSE 'available'
END;

-- Add realtime support for time_slots table
ALTER TABLE public.time_slots REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_slots;