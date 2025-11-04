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
    const { appointmentId, userName, userRole } = await req.json();

    if (!appointmentId || !userName || !userRole) {
      throw new Error('Missing required parameters');
    }

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY');
    const TWILIO_API_SECRET = Deno.env.get('TWILIO_API_SECRET');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY || !TWILIO_API_SECRET) {
      throw new Error('Twilio credentials not configured');
    }

    // Generate Twilio Video Access Token
    const roomName = `appointment_${appointmentId}`;
    const identity = `${userName}_${userRole}_${Date.now()}`;

    // Create JWT token for Twilio Video
    const jwt = await createTwilioToken({
      accountSid: TWILIO_ACCOUNT_SID,
      apiKey: TWILIO_API_KEY,
      apiSecret: TWILIO_API_SECRET,
      identity,
      roomName,
    });

    console.log('Video token created for:', { identity, roomName });

    return new Response(
      JSON.stringify({ 
        token: jwt, 
        roomName,
        identity 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error creating video room:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

interface TwilioTokenParams {
  accountSid: string;
  apiKey: string;
  apiSecret: string;
  identity: string;
  roomName: string;
}

async function createTwilioToken({ accountSid, apiKey, apiSecret, identity, roomName }: TwilioTokenParams) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // Token valid for 1 hour

  // JWT Header
  const header = {
    typ: 'JWT',
    alg: 'HS256',
    cty: 'twilio-fpa;v=1'
  };

  // JWT Payload
  const payload = {
    jti: `${apiKey}-${now}`,
    iss: apiKey,
    sub: accountSid,
    exp: exp,
    grants: {
      identity: identity,
      video: {
        room: roomName
      }
    }
  };

  // Encode to base64url
  const base64url = (str: string) => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Create signature using HMAC SHA256
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(apiSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64url(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${signatureInput}.${encodedSignature}`;
}
