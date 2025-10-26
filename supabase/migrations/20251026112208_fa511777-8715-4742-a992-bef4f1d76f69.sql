-- Drop existing foreign key constraints if they exist
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;

-- Re-add foreign key constraints with CASCADE delete
ALTER TABLE appointments
ADD CONSTRAINT appointments_patient_id_fkey
FOREIGN KEY (patient_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE appointments
ADD CONSTRAINT appointments_doctor_id_fkey
FOREIGN KEY (doctor_id)
REFERENCES profiles(id)
ON DELETE CASCADE;