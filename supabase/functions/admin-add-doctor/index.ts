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

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Error checking admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, name, specialty, qualification, experience, clinicAddress } = await req.json();

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: 'Email and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating doctor account:', { email, name });

    // Create the doctor user with default password
    const { data: newUser, error: signUpError } = await supabaseClient.auth.admin.createUser({
      email,
      password: 'dr@123',
      email_confirm: true,
      user_metadata: {
        name,
        role: 'doctor'
      }
    });

    if (signUpError) {
      console.error('Error creating doctor:', signUpError);
      return new Response(
        JSON.stringify({ error: signUpError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Doctor user created:', newUser.user?.id);

    // Update doctor info with provided details
    if (specialty || qualification || experience !== undefined || clinicAddress) {
      const { error: updateError } = await supabaseClient
        .from('doctors_info')
        .update({
          specialty: specialty || '',
          qualification: qualification || '',
          experience: experience || 0,
          clinic_address: clinicAddress || ''
        })
        .eq('user_id', newUser.user?.id);

      if (updateError) {
        console.error('Error updating doctor info:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        doctor: {
          id: newUser.user?.id,
          email: newUser.user?.email,
          name
        },
        message: 'Doctor created successfully with default password: dr@123'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-add-doctor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});