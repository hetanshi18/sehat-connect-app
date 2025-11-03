-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule the appointment reminder function to run every hour
SELECT cron.schedule(
  'appointment-reminders-every-hour',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://qwsfjkaylxykyxaynsgq.supabase.co/functions/v1/send-appointment-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3c2Zqa2F5bHh5a3l4YXluc2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTMwNTEsImV4cCI6MjA3NTg2OTA1MX0.Hnkdx0hLF-E6eNUjIqNTZdONgraryCqMJhlRToyV308"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
