import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const prescriptionId = url.searchParams.get('id');

    if (!prescriptionId) {
      return new Response('Prescription ID is required', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get prescription details
    const { data: prescription, error: prescError } = await supabaseClient
      .from('prescriptions')
      .select('*')
      .eq('id', prescriptionId)
      .single();

    if (prescError || !prescription) {
      return new Response('Prescription not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // Extract file path from prescription URL
    const urlParts = prescription.prescription_url.split('/');
    const filePath = urlParts.slice(urlParts.indexOf('prescriptions') + 1).join('/');

    // Download the HTML file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('prescriptions')
      .download(filePath);

    if (downloadError || !fileData) {
      return new Response('Failed to load prescription', { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Convert blob to text
    const htmlContent = await fileData.text();

    // Return HTML with proper content type
    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'inline',
      },
    });

  } catch (error: any) {
    console.error('Error serving prescription:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'An error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
