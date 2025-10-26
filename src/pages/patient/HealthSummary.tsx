import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, Stethoscope, User, Pill, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

interface DoctorRecord {
  doctor_id: string;
  doctor_name: string;
  doctor_specialty: string;
  appointments: any[];
}

export default function HealthSummary() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHealthSummary();
    }
  }, [user]);

  const fetchHealthSummary = async () => {
    try {
      setLoading(true);

      // Fetch patient's symptoms
      const { data: symptomsData } = await supabase
        .from('symptoms_records')
        .select('*')
        .eq('patient_id', user?.id)
        .order('recorded_at', { ascending: false });

      setSymptoms(symptomsData || []);

      // Fetch patient's health records
      const { data: recordsData } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });

      setHealthRecords(recordsData || []);

      // Fetch appointments with doctor details
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:profiles(id, name)
        `)
        .eq('patient_id', user?.id)
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Group by doctor
      const doctorMap = new Map<string, DoctorRecord>();

      for (const apt of appointments || []) {
        const doctorId = apt.doctor_id;
        
        if (!doctorMap.has(doctorId)) {
          // Fetch doctor specialty
          const { data: doctorInfo } = await supabase
            .from('doctors_info')
            .select('specialty')
            .eq('user_id', doctorId)
            .single();

          doctorMap.set(doctorId, {
            doctor_id: doctorId,
            doctor_name: (apt.doctor as any)?.name || 'Unknown Doctor',
            doctor_specialty: doctorInfo?.specialty || 'General',
            appointments: []
          });
        }

        // Fetch appointment notes for this appointment
        const { data: notes } = await supabase
          .from('appointment_notes')
          .select('*')
          .eq('appointment_id', apt.id)
          .order('created_at', { ascending: false });

        doctorMap.get(doctorId)?.appointments.push({
          ...apt,
          notes: notes || []
        });
      }

      setDoctors(Array.from(doctorMap.values()));
    } catch (error) {
      console.error('Error fetching health summary:', error);
      toast.error('Failed to load health summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Health Summary">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Health Summary">
      <div className="space-y-6">
        {/* Overall Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              My Symptoms
            </CardTitle>
            <CardDescription>All recorded symptoms and health concerns</CardDescription>
          </CardHeader>
          <CardContent>
            {symptoms.length > 0 ? (
              <div className="space-y-3">
                {symptoms.map((symptom) => (
                  <div key={symptom.id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {symptom.symptoms?.map((s: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                    {symptom.additional_notes && (
                      <p className="text-sm text-muted-foreground">{symptom.additional_notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(symptom.recorded_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No symptoms recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Overall Health Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Health Records
            </CardTitle>
            <CardDescription>Medical reports and documents</CardDescription>
          </CardHeader>
          <CardContent>
            {healthRecords.length > 0 ? (
              <div className="space-y-3">
                {healthRecords.map((record) => (
                  <div key={record.id} className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{record.title}</p>
                      <Badge variant="outline">{record.type}</Badge>
                    </div>
                    {record.report && (
                      <p className="text-sm mb-2">{record.report}</p>
                    )}
                    {record.relief_measures && (
                      <div className="text-sm">
                        <span className="font-medium">Relief Measures: </span>
                        {record.relief_measures}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No health records available</p>
            )}
          </CardContent>
        </Card>

        {/* Doctor Records */}
        {doctors.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">My Doctors</h2>
            {doctors.map((doctor) => (
              <Card key={doctor.doctor_id}>
                <CardHeader className="bg-muted/50">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>{doctor.doctor_name}</CardTitle>
                      <CardDescription>{doctor.doctor_specialty}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4" />
                    Consultation History
                  </h3>
                  <div className="space-y-4">
                    {doctor.appointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appointment.date} at {appointment.time}</p>
                            <Badge className="mt-1">{appointment.status}</Badge>
                          </div>
                        </div>

                        {appointment.notes && appointment.notes.length > 0 && (
                          <div className="space-y-2 mt-4 bg-muted/30 p-4 rounded-lg">
                            <h4 className="font-medium text-sm mb-3">Consultation Notes</h4>
                            {appointment.notes.map((note: any) => (
                              <div key={note.id} className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <FileText className="h-4 w-4 mt-0.5 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-sm">{note.notes}</p>
                                  </div>
                                </div>
                                {note.medicines_prescribed && (
                                  <div className="flex items-start gap-2">
                                    <Pill className="h-4 w-4 mt-0.5 text-primary" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">Prescribed Medicines:</p>
                                      <p className="text-sm">{note.medicines_prescribed}</p>
                                    </div>
                                  </div>
                                )}
                                {note.follow_up_date && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <CalendarClock className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Next Follow-up:</span>
                                    <span>{new Date(note.follow_up_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <Separator className="my-2" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {doctors.length === 0 && symptoms.length === 0 && healthRecords.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No health records found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your health summary will appear here after consultations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
