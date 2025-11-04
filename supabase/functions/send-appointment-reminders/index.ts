import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');
const RECIPIENT_PHONE = '+918291142520'; // Hardcoded recipient

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendWhatsApp(to: string, message: string) {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  // Format phone numbers for WhatsApp (add whatsapp: prefix)
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const formattedFrom = TWILIO_PHONE_NUMBER!.startsWith('whatsapp:') 
    ? TWILIO_PHONE_NUMBER! 
    : `whatsapp:${TWILIO_PHONE_NUMBER!}`;
  
  console.log('Sending WhatsApp message:', {
    to: formattedTo,
    from: formattedFrom,
    messagePreview: message.substring(0, 50) + '...'
  });
  
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: formattedTo,
        From: formattedFrom,
        Body: message,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Twilio WhatsApp API error:', error);
    throw new Error(`Failed to send WhatsApp message: ${error}`);
  }

  const result = await response.json();
  console.log('WhatsApp message sent successfully:', result.sid);
  return result;
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

    // Check if specific appointment ID was provided (for immediate reminders)
    const body = req.method === 'POST' ? await req.json() : {};
    const specificAppointmentId = body.appointmentId;

    console.log('Request details:', {
      method: req.method,
      specificAppointmentId: specificAppointmentId || 'none - checking all appointments'
    });

    const now = new Date();
    let appointments;
    let error;

    if (specificAppointmentId) {
      // Fetch specific appointment for immediate reminder
      console.log('Fetching specific appointment:', specificAppointmentId);
      const result = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_fkey(name, phone),
          doctor:profiles!appointments_doctor_fkey(name, phone)
        `)
        .eq('id', specificAppointmentId)
        .eq('status', 'confirmed')
        .single();
      
      appointments = result.data ? [result.data] : [];
      error = result.error;
    } else {
      // Get current time and time 6 hours from now for scheduled check
      const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
      const sevenHoursLater = new Date(now.getTime() + 7 * 60 * 60 * 1000);

      console.log('Time window for scheduled check:', {
        now: now.toISOString(),
        sixHoursLater: sixHoursLater.toISOString(),
        sevenHoursLater: sevenHoursLater.toISOString()
      });

      // Fetch appointments that are 6-7 hours from now and confirmed
      const result = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_fkey(name, phone),
          doctor:profiles!appointments_doctor_fkey(name, phone)
        `)
        .eq('status', 'confirmed')
        .gte('date', sixHoursLater.toISOString().split('T')[0])
        .lte('date', sevenHoursLater.toISOString().split('T')[0]);
      
      appointments = result.data;
      error = result.error;
    }

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
        specificAppointmentId: specificAppointmentId || 'none'
      });

      // For immediate reminders (specificAppointmentId), send if within 6 hours
      // For scheduled checks, send if 6-7 hours away
      const shouldSend = specificAppointmentId 
        ? (hoursDiff <= 6 && hoursDiff > 0) 
        : (hoursDiff >= 6 && hoursDiff <= 7);

      if (shouldSend) {
        console.log(`✓ Appointment is within reminder window, sending WhatsApp message...`);

        // Send WhatsApp to patient (hardcoded number)
        const patientMessage = `🏥 *Appointment Reminder*\n\nYou have an appointment with Dr. ${appointment.doctor.name}\n📅 Date: ${appointment.date}\n⏰ Time: ${appointment.time}\n\nPlease be on time!`;
        console.log('Patient message:', patientMessage);
        
        try {
          const whatsappResult = await sendWhatsApp(RECIPIENT_PHONE, patientMessage);
          console.log('✓ Patient WhatsApp reminder sent successfully:', whatsappResult);
          remindersSent.push({
            appointmentId: appointment.id,
            type: 'patient',
            message: patientMessage,
            status: 'success'
          });
        } catch (error) {
          console.error('✗ Error sending patient WhatsApp:', error);
          remindersSent.push({
            appointmentId: appointment.id,
            type: 'patient',
            message: patientMessage,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error)
          });
        }

        // Send WhatsApp to doctor (hardcoded number)
        const doctorMessage = `🏥 *Appointment Reminder*\n\nYou have an appointment with ${appointment.patient.name}\n📅 Date: ${appointment.date}\n⏰ Time: ${appointment.time}`;
        console.log('Doctor message:', doctorMessage);
        
        try {
          const whatsappResult = await sendWhatsApp(RECIPIENT_PHONE, doctorMessage);
          console.log('✓ Doctor WhatsApp reminder sent successfully:', whatsappResult);
          remindersSent.push({
            appointmentId: appointment.id,
            type: 'doctor',
            message: doctorMessage,
            status: 'success'
          });
        } catch (error) {
          console.error('✗ Error sending doctor WhatsApp:', error);
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
