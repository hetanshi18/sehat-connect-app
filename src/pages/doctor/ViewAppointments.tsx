import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Calendar, Clock, User, FileText, Check, X, Pill, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const ViewAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [showConsultationDetails, setShowConsultationDetails] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [consultationDetails, setConsultationDetails] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string, slotId: string, patientId: string) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    try {
      // Get appointment details to check timing
      const appointment = appointments.find(apt => apt.id === appointmentId);
      
      const { error: aptError } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId)
        .eq('doctor_id', user.id);

      if (aptError) throw aptError;

      const { error: slotError } = await supabase
        .from('time_slots')
        .update({ 
          status: 'booked',
          is_available: false, 
          is_booked: true,
          patient_id: patientId 
        })
        .eq('id', slotId);

      if (slotError) throw slotError;

      // Send WhatsApp notification immediately upon approval
      console.log('Sending WhatsApp notification for approved appointment:', appointmentId);
      try {
        const { data, error } = await supabase.functions.invoke('send-appointment-reminders', {
          body: { appointmentId }
        });
        
        if (error) {
          console.error('Failed to send WhatsApp notification:', error);
        } else {
          console.log('WhatsApp notification sent successfully:', data);
        }
      } catch (err) {
        console.error('Error invoking WhatsApp notification:', err);
      }

      toast({ title: 'Success', description: 'Appointment confirmed successfully!' });
      fetchAppointments();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleReject = async (appointmentId: string, slotId: string) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    try {
      // Update appointment status to rejected
      const { error: aptError } = await supabase
        .from('appointments')
        .update({ status: 'rejected' })
        .eq('id', appointmentId)
        .eq('doctor_id', user.id);

      if (aptError) throw aptError;

      // Free up the slot - make it available again
      const { error: slotError } = await supabase
        .from('time_slots')
        .update({ 
          status: 'available',
          is_available: true, 
          is_booked: false,
          patient_id: null 
        })
        .eq('id', slotId);

      if (slotError) throw slotError;

      toast({ title: 'Success', description: 'Appointment rejected. Slot is now available again.' });
      fetchAppointments();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const fetchPatientHistory = async (patientId: string, patientInfo: any) => {
    setHistoryLoading(true);
    setSelectedPatient(patientInfo);
    setShowPatientHistory(true);

    try {
      // Fetch all appointments for this patient
      const { data: appointments, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user?.id)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (aptError) throw aptError;

      // Fetch appointment notes
      const { data: notes, error: notesError } = await supabase
        .from('appointment_notes')
        .select('*')
        .eq('patient_id', patientId)
        .eq('doctor_id', user?.id);

      if (notesError) throw notesError;

      // Fetch health records
      const { data: healthRecords, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      // Combine appointment data with notes
      const history = appointments?.map(apt => {
        const note = notes?.find(n => n.appointment_id === apt.id);
        return {
          ...apt,
          doctor_notes: note?.notes,
          medicines_prescribed: note?.medicines_prescribed,
          follow_up_date: note?.follow_up_date
        };
      }) || [];

      setPatientHistory(history);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchConsultationDetails = async (appointmentId: string, patientInfo: any) => {
    setHistoryLoading(true);
    setSelectedPatient(patientInfo);
    setShowConsultationDetails(true);

    try {
      // Fetch appointment details
      const { data: appointment, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (aptError) throw aptError;

      // Fetch appointment notes
      const { data: note, error: noteError } = await supabase
        .from('appointment_notes')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      setConsultationDetails({
        ...appointment,
        doctor_notes: note?.notes,
        medicines_prescribed: note?.medicines_prescribed,
        follow_up_date: note?.follow_up_date
      });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  return (
    <DashboardLayout title="View Appointments">
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/doctor/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedAppointments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingAppointments.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No pending appointments
                  </CardContent>
                </Card>
              ) : (
                pendingAppointments.map((apt) => (
                  <Card key={apt.id} className="shadow-soft hover:shadow-medium transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-white text-lg font-bold">
                            {apt.profiles?.name?.[0] || 'P'}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{apt.profiles?.name || 'Patient'}</CardTitle>
                            <CardDescription>
                              <p>{apt.profiles?.email}</p>
                              {apt.profiles?.phone && <p className="text-xs">📞 {apt.profiles?.phone}</p>}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Date:</span>
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Time:</span>
                          <span>{apt.time}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => handleApprove(apt.id, apt.slot_id, apt.patient_id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => handleReject(apt.id, apt.slot_id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="confirmed" className="mt-6">
            <div className="space-y-4">
              {confirmedAppointments.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No confirmed appointments
                  </CardContent>
                </Card>
              ) : (
                confirmedAppointments.map((apt) => (
                  <Card key={apt.id} className="shadow-soft hover:shadow-medium transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-white text-lg font-bold">
                            {apt.profiles?.name?.[0] || 'P'}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{apt.profiles?.name || 'Patient'}</CardTitle>
                            <CardDescription>
                              <p>{apt.profiles?.email}</p>
                              {apt.profiles?.phone && <p className="text-xs">📞 {apt.profiles?.phone}</p>}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-green-500">Confirmed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Date:</span>
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Time:</span>
                          <span>{apt.time}</span>
                        </div>
                      </div>

                      {apt.symptoms && apt.symptoms.length > 0 && (
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm font-medium mb-2">Reported Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {apt.symptoms.map((symptom) => (
                              <Badge key={symptom} variant="secondary">{symptom}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {apt.notes && (
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm font-medium mb-2">Patient Notes:</p>
                          <p className="text-sm text-muted-foreground">{apt.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1"
                          onClick={() => navigate(`/video-call?appointmentId=${apt.id}&patientName=${apt.profiles?.name || 'Patient'}&doctorName=${user?.email?.split('@')[0] || 'Doctor'}&role=doctor`)}
                        >
                          Start Consultation
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => fetchPatientHistory(apt.patient_id, apt.profiles)}
                        >
                          View Patient History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {completedAppointments.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No completed appointments
                  </CardContent>
                </Card>
              ) : (
                completedAppointments.map((apt) => (
                  <Card key={apt.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-secondary text-white text-lg font-bold">
                            {apt.profiles?.name?.[0] || 'P'}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{apt.profiles?.name || 'Patient'}</CardTitle>
                            <CardDescription>
                              <p>{apt.profiles?.email}</p>
                              {apt.profiles?.phone && <p className="text-xs">📞 {apt.profiles?.phone}</p>}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-secondary">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Date:</span>
                          <span>{apt.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Time:</span>
                          <span>{apt.time}</span>
                        </div>
                      </div>

                      {apt.symptoms && apt.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {apt.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="outline">{symptom}</Badge>
                          ))}
                        </div>
                      )}

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => fetchConsultationDetails(apt.id, apt.profiles)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Consultation Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Patient History Dialog */}
        <Dialog open={showPatientHistory} onOpenChange={setShowPatientHistory}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Patient History - {selectedPatient?.name}</DialogTitle>
              <DialogDescription>
                Complete medical history and appointment records
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              {historyLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : patientHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No history found</div>
              ) : (
                <div className="space-y-4">
                  {patientHistory.map((apt) => (
                    <Card key={apt.id} className="border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {apt.date} at {apt.time}
                          </CardTitle>
                          <Badge className={apt.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
                            {apt.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {apt.symptoms && apt.symptoms.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Symptoms:</p>
                            <div className="flex flex-wrap gap-2">
                              {apt.symptoms.map((symptom: string, idx: number) => (
                                <Badge key={idx} variant="secondary">{symptom}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {apt.notes && (
                          <div>
                            <p className="text-sm font-medium mb-1">Patient Notes:</p>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                              {apt.notes}
                            </p>
                          </div>
                        )}

                        {apt.doctor_notes && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium mb-1 flex items-center gap-2">
                                <Stethoscope className="h-4 w-4" />
                                Doctor's Notes:
                              </p>
                              <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-md">
                                {apt.doctor_notes}
                              </p>
                            </div>
                          </>
                        )}

                        {apt.medicines_prescribed && (
                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <Pill className="h-4 w-4" />
                              Medicines Prescribed:
                            </p>
                            <p className="text-sm text-muted-foreground bg-secondary/5 p-3 rounded-md">
                              {apt.medicines_prescribed}
                            </p>
                          </div>
                        )}

                        {apt.follow_up_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Follow-up Date:</span>
                            <span>{new Date(apt.follow_up_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Consultation Details Dialog */}
        <Dialog open={showConsultationDetails} onOpenChange={setShowConsultationDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Consultation Details</DialogTitle>
              <DialogDescription>
                {selectedPatient?.name} - {consultationDetails?.date}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              {historyLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : consultationDetails ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Appointment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Date:</span>
                          <span>{consultationDetails.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Time:</span>
                          <span>{consultationDetails.time}</span>
                        </div>
                      </div>

                      {consultationDetails.symptoms && consultationDetails.symptoms.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {consultationDetails.symptoms.map((symptom: string, idx: number) => (
                              <Badge key={idx} variant="secondary">{symptom}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {consultationDetails.notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">Patient Notes:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                            {consultationDetails.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {(consultationDetails.doctor_notes || consultationDetails.medicines_prescribed || consultationDetails.follow_up_date) && (
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Consultation Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {consultationDetails.doctor_notes && (
                          <div>
                            <p className="text-sm font-medium mb-1">Doctor's Notes:</p>
                            <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-md">
                              {consultationDetails.doctor_notes}
                            </p>
                          </div>
                        )}

                        {consultationDetails.medicines_prescribed && (
                          <div>
                            <p className="text-sm font-medium mb-1 flex items-center gap-2">
                              <Pill className="h-4 w-4" />
                              Medicines Prescribed:
                            </p>
                            <p className="text-sm text-muted-foreground bg-secondary/5 p-3 rounded-md">
                              {consultationDetails.medicines_prescribed}
                            </p>
                          </div>
                        )}

                        {consultationDetails.follow_up_date && (
                          <div className="flex items-center gap-2 text-sm bg-accent/5 p-3 rounded-md">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Follow-up Date:</span>
                            <span>{new Date(consultationDetails.follow_up_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No details found</div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ViewAppointments;
