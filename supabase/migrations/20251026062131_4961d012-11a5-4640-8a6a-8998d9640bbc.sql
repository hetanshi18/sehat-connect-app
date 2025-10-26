-- Add is_available column to time_slots
ALTER TABLE time_slots 
ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true;

-- Set is_available = false for all currently booked slots
UPDATE time_slots 
SET is_available = false 
WHERE is_booked = true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_time_slots_doctor_available 
ON time_slots(doctor_id, is_available) 
WHERE is_available = true;