import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar, FileText, Stethoscope, User, Pill, CalendarClock } from 'lucide-react';

interface PatientRecord {
  patient_id: string;
  patient_name: string;
  patient_email: string;
  symptoms: string[];
  health_records: any[];
  appointments: any[];
}

export default function PatientRecords() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    notes: '',
    medicines_prescribed: '',
    follow_up_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchPatientRecords();
    }
  }, [user]);

  const fetchPatientRecords = async () => {
    try {
      setLoading(true);

      // Get all completed appointments for this doctor
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles(id, name, email)
        `)
        .eq('doctor_id', user?.id)
        .eq('status', 'completed')
        .order('date', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Group by patient
      const patientMap = new Map<string, PatientRecord>();

      for (const apt of appointments || []) {
        const patientId = apt.patient_id;
        
        if (!patientMap.has(patientId)) {
          // Fetch patient symptoms
          const { data: symptoms } = await supabase
            .from('symptoms_records')
            .select('*')
            .eq('patient_id', patientId)
            .order('recorded_at', { ascending: false });

          // Fetch patient health records
          const { data: healthRecords } = await supabase
            .from('health_records')
            .select('*')
            .eq('patient_id', patientId)
            .order('created_at', { ascending: false });

          // Fetch appointment notes
          const { data: notes } = await supabase
            .from('appointment_notes')
            .select('*')
            .eq('patient_id', patientId)
            .eq('doctor_id', user?.id)
            .order('created_at', { ascending: false });

          patientMap.set(patientId, {
            patient_id: patientId,
            patient_name: (apt.patient as any)?.name || 'Unknown',
            patient_email: (apt.patient as any)?.email || '',
            symptoms: (symptoms as any) || [],
            health_records: healthRecords || [],
            appointments: []
          });
        }

        // Add appointment with notes
        const { data: aptNotes } = await supabase
          .from('appointment_notes')
          .select('*')
          .eq('appointment_id', apt.id);

        patientMap.get(patientId)?.appointments.push({
          ...apt,
          notes: aptNotes || []
        });
      }

      setPatients(Array.from(patientMap.values()));
    } catch (error) {
      console.error('Error fetching patient records:', error);
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedAppointment || !noteForm.notes.trim()) {
      toast.error('Please fill in the notes');
      return;
    }

    try {
      const { error } = await supabase
        .from('appointment_notes')
        .insert({
          appointment_id: selectedAppointment.id,
          doctor_id: user?.id,
          patient_id: selectedAppointment.patient_id,
          notes: noteForm.notes,
          medicines_prescribed: noteForm.medicines_prescribed,
          follow_up_date: noteForm.follow_up_date || null
        });

      if (error) throw error;

      toast.success('Appointment notes added successfully');
      setNoteDialogOpen(false);
      setNoteForm({ notes: '', medicines_prescribed: '', follow_up_date: '' });
      fetchPatientRecords();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add appointment notes');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Patient Records">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patient Records">
      <div className="space-y-6">
        {patients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No patient records found</p>
            </CardContent>
          </Card>
        ) : (
          patients.map((patient) => (
            <Card key={patient.patient_id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>{patient.patient_name}</CardTitle>
                      <CardDescription>{patient.patient_email}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {/* Symptoms */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Stethoscope className="h-4 w-4" />
                    Recorded Symptoms
                  </h3>
                  {patient.symptoms.length > 0 ? (
                    <div className="space-y-2">
                      {patient.symptoms.map((symptom: any) => (
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
                    <p className="text-sm text-muted-foreground">No symptoms recorded</p>
                  )}
                </div>

                <Separator />

                {/* Health Records */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4" />
                    Health Records & Reports
                  </h3>
                  {patient.health_records.length > 0 ? (
                    <div className="space-y-2">
                      {patient.health_records.map((record: any) => (
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
                </div>

                <Separator />

                {/* Appointments */}
                <div>
                  <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4" />
                    Appointment History
                  </h3>
                  <div className="space-y-4">
                    {patient.appointments.map((appointment: any) => (
                      <div key={appointment.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{appointment.date} at {appointment.time}</p>
                            <Badge className="mt-1">{appointment.status}</Badge>
                          </div>
                          <Dialog open={noteDialogOpen && selectedAppointment?.id === appointment.id} onOpenChange={(open) => {
                            setNoteDialogOpen(open);
                            if (open) setSelectedAppointment(appointment);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                + Add Notes
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Appointment Notes</DialogTitle>
                                <DialogDescription>
                                  Add consultation notes, prescriptions, and follow-up details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div>
                                  <Label htmlFor="notes">Consultation Notes *</Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Observations, diagnosis, treatment plan..."
                                    value={noteForm.notes}
                                    onChange={(e) => setNoteForm({ ...noteForm, notes: e.target.value })}
                                    className="mt-2"
                                    rows={4}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="medicines">Medicines Prescribed</Label>
                                  <Textarea
                                    id="medicines"
                                    placeholder="List of medicines, dosage, and instructions..."
                                    value={noteForm.medicines_prescribed}
                                    onChange={(e) => setNoteForm({ ...noteForm, medicines_prescribed: e.target.value })}
                                    className="mt-2"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="follow_up">Follow-up Date</Label>
                                  <Input
                                    id="follow_up"
                                    type="date"
                                    value={noteForm.follow_up_date}
                                    onChange={(e) => setNoteForm({ ...noteForm, follow_up_date: e.target.value })}
                                    className="mt-2"
                                  />
                                </div>
                                <Button onClick={handleAddNote} className="w-full">
                                  Save Notes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>

                        {/* Display existing notes */}
                        {appointment.notes && appointment.notes.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {appointment.notes.map((note: any) => (
                              <div key={note.id} className="bg-muted/30 p-3 rounded-lg">
                                <div className="flex items-start gap-2 mb-2">
                                  <FileText className="h-4 w-4 mt-0.5 text-primary" />
                                  <div className="flex-1">
                                    <p className="text-sm">{note.notes}</p>
                                  </div>
                                </div>
                                {note.medicines_prescribed && (
                                  <div className="flex items-start gap-2 mt-2">
                                    <Pill className="h-4 w-4 mt-0.5 text-primary" />
                                    <p className="text-sm">{note.medicines_prescribed}</p>
                                  </div>
                                )}
                                {note.follow_up_date && (
                                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <CalendarClock className="h-4 w-4" />
                                    Follow-up: {new Date(note.follow_up_date).toLocaleDateString()}
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  Added {new Date(note.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
