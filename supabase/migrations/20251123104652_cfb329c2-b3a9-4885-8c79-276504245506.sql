-- Add prescription_file_path to pharmacy_orders for uploaded prescriptions
ALTER TABLE pharmacy_orders
ADD COLUMN prescription_file_path TEXT;

COMMENT ON COLUMN pharmacy_orders.prescription_file_path IS 'Storage path for uploaded prescription files';
COMMENT ON COLUMN pharmacy_orders.prescription_id IS 'Reference to doctor-generated prescriptions from prescriptions table';