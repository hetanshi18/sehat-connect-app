import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrescriptionRequest {
  appointmentId: string;
  diagnosis: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { appointmentId, diagnosis, medicines }: PrescriptionRequest = await req.json();

    // Get appointment details with patient and doctor info
    const { data: appointment, error: aptError } = await supabaseClient
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_fkey(id, name, email, phone),
        doctor:profiles!appointments_doctor_fkey(id, name, email, phone)
      `)
      .eq('id', appointmentId)
      .single();

    if (aptError) throw aptError;

    // Get doctor's additional info
    const { data: doctorInfo, error: docError } = await supabaseClient
      .from('doctors_info')
      .select('*')
      .eq('user_id', appointment.doctor_id)
      .single();

    if (docError) throw docError;

    // Get patient's additional info
    const { data: patientInfo } = await supabaseClient
      .from('patients_info')
      .select('*')
      .eq('user_id', appointment.patient_id)
      .maybeSingle();

    // Generate HTML for prescription
    const prescriptionDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Arial', sans-serif;
            max-width: 700px;
            margin: 0 auto;
            padding: 40px 30px;
            line-height: 1.6;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .header h1 {
            color: #2563eb;
            margin: 0 0 15px 0;
            font-size: 26px;
            word-wrap: break-word;
          }
          .doctor-info {
            margin-top: 15px;
          }
          .doctor-info p {
            margin: 8px 0;
            color: #4b5563;
            font-size: 14px;
            line-height: 1.5;
          }
          .patient-section, .prescription-section {
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .info-row {
            display: flex;
            margin: 8px 0;
          }
          .info-label {
            font-weight: 600;
            width: 150px;
            color: #4b5563;
          }
          .info-value {
            color: #1f2937;
          }
          .medicines-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .medicines-table th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          .medicines-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          .medicines-table tr:hover {
            background: #f3f4f6;
          }
          .signature-section {
            margin-top: 60px;
            text-align: right;
            page-break-inside: avoid;
          }
          .signature-image {
            max-width: 200px;
            height: auto;
            margin-bottom: 10px;
            display: block;
            margin-left: auto;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          .rx-symbol {
            font-size: 48px;
            color: #2563eb;
            font-weight: bold;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Dr. ${appointment.doctor.name}</h1>
          <div class="doctor-info">
            ${doctorInfo.qualification ? `<p><strong>${doctorInfo.qualification}</strong></p>` : ''}
            ${doctorInfo.specialty ? `<p>${doctorInfo.specialty}</p>` : ''}
            ${doctorInfo.registration_number ? `<p>Reg. No: ${doctorInfo.registration_number}</p>` : ''}
            ${doctorInfo.clinic_address ? `<p>${doctorInfo.clinic_address}</p>` : ''}
            ${appointment.doctor.phone ? `<p>Phone: ${appointment.doctor.phone}</p>` : ''}
          </div>
        </div>

        <div class="patient-section">
          <div class="section-title">Patient Information</div>
          <div class="info-row">
            <div class="info-label">Name:</div>
            <div class="info-value">${appointment.patient.name}</div>
          </div>
          ${patientInfo?.age ? `
          <div class="info-row">
            <div class="info-label">Age:</div>
            <div class="info-value">${patientInfo.age} years</div>
          </div>
          ` : ''}
          ${patientInfo?.blood_group ? `
          <div class="info-row">
            <div class="info-label">Blood Group:</div>
            <div class="info-value">${patientInfo.blood_group}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-label">Date:</div>
            <div class="info-value">${prescriptionDate}</div>
          </div>
          ${appointment.symptoms && appointment.symptoms.length > 0 ? `
          <div class="info-row">
            <div class="info-label">Symptoms:</div>
            <div class="info-value">${appointment.symptoms.join(', ')}</div>
          </div>
          ` : ''}
        </div>

        ${diagnosis ? `
        <div class="prescription-section">
          <div class="section-title">Diagnosis</div>
          <p style="color: #1f2937; margin: 10px 0;">${diagnosis}</p>
        </div>
        ` : ''}

        <div class="prescription-section">
          <div class="rx-symbol">℞</div>
          <div class="section-title">Prescribed Medicines</div>
          <table class="medicines-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${medicines.map(med => `
                <tr>
                  <td><strong>${med.name}</strong></td>
                  <td>${med.dosage}</td>
                  <td>${med.frequency}</td>
                  <td>${med.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="signature-section">
          ${doctorInfo.signature_url ? `
            <img src="${doctorInfo.signature_url}?t=${Date.now()}" alt="Doctor's Signature" class="signature-image" crossorigin="anonymous" style="display: block; margin-left: auto;" />
          ` : `
            <div style="height: 60px; margin-bottom: 10px;"></div>
          `}
          <div style="border-top: 2px solid #1f2937; width: 200px; margin-left: auto;"></div>
          <p style="margin: 10px 0 0 0; font-weight: 600;">Dr. ${appointment.doctor.name}</p>
          ${doctorInfo.registration_number ? `<p style="margin: 5px 0; font-size: 14px;">Reg. No: ${doctorInfo.registration_number}</p>` : ''}
        </div>

        <div class="footer">
          <p>This is a digitally generated prescription.</p>
          <p>Please consult your doctor before starting any medication.</p>
        </div>
      </body>
      </html>
    `;

    // Convert HTML to PDF using a third-party service or return HTML
    // For now, we'll create the prescription record with HTML content
    const fileName = `prescription_${appointmentId}_${Date.now()}.html`;
    const filePath = `${appointment.doctor_id}/${fileName}`;

    // Upload HTML as file to storage
    const { error: uploadError } = await supabaseClient.storage
      .from('prescriptions')
      .upload(filePath, new Blob([html], { type: 'text/html' }), {
        contentType: 'text/html',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('prescriptions')
      .getPublicUrl(filePath);

    // Generate view URL through edge function
    const viewUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/view-prescription?id=PLACEHOLDER`;

    // Store prescription record
    const { data: prescription, error: prescError } = await supabaseClient
      .from('prescriptions')
      .insert({
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        prescription_url: urlData.publicUrl,
        diagnosis: diagnosis,
        medicines: medicines,
      })
      .select()
      .single();

    if (prescError) throw prescError;

    // Update the view URL with actual prescription ID
    const actualViewUrl = viewUrl.replace('PLACEHOLDER', prescription.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        prescription,
        downloadUrl: actualViewUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error generating prescription:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'An error occurred' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});