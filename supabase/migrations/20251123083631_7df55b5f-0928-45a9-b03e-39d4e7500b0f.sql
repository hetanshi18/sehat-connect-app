-- Allow public access to prescriptions bucket for uploading and viewing
-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Allow public uploads to prescriptions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to prescriptions bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to prescriptions" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated access to prescriptions" ON storage.objects;

-- Create permissive policies for prescriptions bucket
CREATE POLICY "Anyone can upload to prescriptions bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'prescriptions');

CREATE POLICY "Anyone can update prescriptions bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'prescriptions');

CREATE POLICY "Anyone can read from prescriptions bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'prescriptions');

CREATE POLICY "Anyone can delete from prescriptions bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'prescriptions');