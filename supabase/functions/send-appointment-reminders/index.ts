import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
const RECIPIENT_PHONE = '+918291142520'; // Hardcoded recipient

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendSMS(to: string, message: string) {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER!,
        Body: message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Twilio API error:', error);
    throw new Error(`Failed to send SMS: ${error}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== STARTING APPOINTMENT REMINDER CHECK ===');
    console.log('Current time:', new Date().toISOString());
    console.log('Twilio config:', {
      accountSid: TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET',
      authToken: TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET',
      phoneNumber: TWILIO_PHONE_NUMBER,
      recipientPhone: RECIPIENT_PHONE
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current time and time 6 hours from now
    const now = new Date();
    const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const sevenHoursLater = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    console.log('Time window:', {
      now: now.toISOString(),
      sixHoursLater: sixHoursLater.toISOString(),
      sevenHoursLater: sevenHoursLater.toISOString(),
      dateFilter: {
        gte: sixHoursLater.toISOString().split('T')[0],
        lte: sevenHoursLater.toISOString().split('T')[0]
      }
    });

    // Fetch appointments that are 6-7 hours from now and confirmed
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!patient_id(name, phone),
        doctor:profiles!doctor_id(name, phone)
      `)
      .eq('status', 'confirmed')
      .gte('date', sixHoursLater.toISOString().split('T')[0])
      .lte('date', sevenHoursLater.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }

    console.log(`Found ${appointments?.length || 0} confirmed appointments`);
    console.log('Appointments data:', JSON.stringify(appointments, null, 2));

    const remindersSent = [];

    for (const appointment of appointments || []) {
      console.log(`\n--- Processing appointment ${appointment.id} ---`);
      console.log('Appointment details:', {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        patient: appointment.patient,
        doctor: appointment.doctor
      });

      // Parse appointment date and time
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time.split(' - ')[0]}`);
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      console.log('Time calculation:', {
        appointmentDateTime: appointmentDateTime.toISOString(),
        timeDiffMs: timeDiff,
        hoursDiff: hoursDiff.toFixed(2),
        isInWindow: hoursDiff >= 6 && hoursDiff <= 7
      });

      // Check if appointment is between 6 and 7 hours from now
      if (hoursDiff >= 6 && hoursDiff <= 7) {
        console.log(`✓ Appointment is within reminder window, sending SMS...`);

        // Send SMS to patient (hardcoded number)
        const patientMessage = `Reminder: You have an appointment with Dr. ${appointment.doctor.name} on ${appointment.date} at ${appointment.time}. Please be on time!`;
        console.log('Patient message:', patientMessage);
        
        try {
          const smsResult = await sendSMS(RECIPIENT_PHONE, patientMessage);
          console.log('✓ Patient reminder sent successfully:', smsResult);
          remindersSent.push({
            appointmentId: appointment.id,
            type: 'patient',
            message: patientMessage,
            status: 'success'
          });
        } catch (error) {
          console.error('✗ Error sending patient SMS:', error);
          remindersSent.push({
            appointmentId: appointment.id,
            type: 'patient',
            message: patientMessage,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        }

        // Send SMS to doctor (hardcoded number)
        const doctorMessage = `Reminder: You have an appointment with ${appointment.patient.name} on ${appointment.date} at ${appointment.time}.`;
        console.log('Doctor message:', doctorMessage);
        
        try {
          const smsResult = await sendSMS(RECIPIENT_PHONE, doctorMessage);
          console.log('✓ Doctor reminder sent successfully:', smsResult);
          remindersSent.push({
            appointmentId: appointment.id,
            type: 'doctor',
            message: doctorMessage,
            status: 'success'
          });
        } catch (error) {
          console.error('✗ Error sending doctor SMS:', error);
          remindersSent.push({
            appointmentId: appointment.id,
            type: 'doctor',
            message: doctorMessage,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        }
      } else {
        console.log(`✗ Appointment not in window (${hoursDiff.toFixed(2)} hours away)`);
      }
    }

    console.log('\n=== REMINDER CHECK COMPLETE ===');
    console.log('Total reminders sent:', remindersSent.length);
    console.log('Summary:', JSON.stringify(remindersSent, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent: remindersSent.length,
        details: remindersSent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-appointment-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
