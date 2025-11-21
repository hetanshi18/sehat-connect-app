import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileType } = await req.json();
    
    if (!fileUrl || !fileType) {
      return new Response(
        JSON.stringify({ error: 'fileUrl and fileType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing medical report:', { fileUrl, fileType });

    // Download the file from Supabase storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract bucket and path from URL
    const urlParts = fileUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      throw new Error('Invalid file URL');
    }
    const [bucket, ...pathParts] = urlParts[1].split('/');
    const filePath = pathParts.join('/');

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert file to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call Python backend
    const PYTHON_BACKEND_URL = Deno.env.get('PYTHON_BACKEND_URL') || 'http://localhost:8000';
    const response = await fetch(`${PYTHON_BACKEND_URL}/process-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_data: base64Data,
        file_type: fileType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Python backend error:', errorText);
      throw new Error(`Backend processing failed: ${errorText}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    console.log('Processing successful');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing report:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
