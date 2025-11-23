import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Creating admin account...');

    // Create the admin user
    const { data: newUser, error: signUpError } = await supabaseClient.auth.admin.createUser({
      email: 'admin@gmail.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        name: 'Admin',
        role: 'admin'
      }
    });

    if (signUpError) {
      // Check if user already exists
      if (signUpError.message.includes('already registered')) {
        return new Response(
          JSON.stringify({ 
            message: 'Admin account already exists',
            email: 'admin@gmail.com'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw signUpError;
    }

    console.log('Admin user created:', newUser.user?.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin account created successfully',
        email: 'admin@gmail.com',
        password: '123456',
        note: 'Please change the password after first login'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in setup-admin function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});