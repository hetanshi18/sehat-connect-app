-- Make prescriptions bucket public so doctors and patients can view prescriptions
UPDATE storage.buckets 
SET public = true 
WHERE id = 'prescriptions';