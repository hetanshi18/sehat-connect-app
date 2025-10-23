-- Add foreign key constraints to appointments table linking to profiles
ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_patient
FOREIGN KEY (patient_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_doctor
FOREIGN KEY (doctor_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;