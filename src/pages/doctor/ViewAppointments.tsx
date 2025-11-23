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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, User, FileText, Check, X, Pill, Stethoscope, Mail, Phone, Activity, TrendingUp, Download, ChevronDown } from 'lucide-react';
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
    setShowPatientHistory(true);

    try {
      // Fetch patient profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (profileError) throw profileError;

      // Fetch patient info
      const { data: info, error: infoError } = await supabase
        .from('patients_info')
        .select('*')
        .eq('user_id', patientId)
        .maybeSingle();

      // Fetch appointments with related data
      const { data: appointments, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user?.id)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (aptError) throw aptError;

      // Fetch symptoms records for this patient
      const { data: symptomsRecords, error: symptomsError } = await supabase
        .from('symptoms_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      // Fetch appointment notes
      const { data: notes, error: notesError } = await supabase
        .from('appointment_notes')
        .select('*')
        .eq('patient_id', patientId)
        .eq('doctor_id', user?.id)
        .order('created_at', { ascending: false });

      // Fetch health records
      const { data: records, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Combine data
      const history = appointments?.map(apt => {
        const symptomRecord = symptomsRecords?.find(sr => 
          new Date(sr.recorded_at).toDateString() === new Date(apt.created_at).toDateString()
        );
        const note = notes?.find(n => n.appointment_id === apt.id);

        return {
          ...apt,
          symptoms_report: symptomRecord?.additional_notes,
          medicines: note?.medicines_prescribed,
          doctor_notes: note?.notes,
          follow_up_date: note?.follow_up_date
        };
      }) || [];

      setPatientHistory(history);
      
      // Set patient data with all info
      setSelectedPatient({
        ...patientInfo,
        profile,
        patientInfo: info,
        healthRecords: records || [],
        totalAppointments: appointments?.length || 0,
        completedFollowUps: notes?.filter(n => n.follow_up_date && new Date(n.follow_up_date) < new Date()).length || 0
      });

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

      // Fetch prescriptions
      const { data: prescription, error: prescError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      setConsultationDetails({
        ...appointment,
        doctor_notes: note?.notes,
        medicines_prescribed: note?.medicines_prescribed,
        follow_up_date: note?.follow_up_date,
        prescription: prescription
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
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Patient History - {selectedPatient?.name}</DialogTitle>
              <DialogDescription>Complete medical history and appointments</DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[calc(90vh-120px)] pr-4">
              <div className="space-y-6">
                {historyLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <>
                    {/* Patient Overview */}
                    {selectedPatient?.profile && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Patient Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{selectedPatient.profile.name}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                                <Mail className="h-5 w-5 text-secondary" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-medium">{selectedPatient.profile.email}</p>
                              </div>
                            </div>

                            {selectedPatient.profile.phone && (
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                                  <Phone className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Phone</p>
                                  <p className="font-medium">{selectedPatient.profile.phone}</p>
                                </div>
                              </div>
                            )}

                            {selectedPatient.patientInfo?.age && (
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Age</p>
                                  <p className="font-medium">{selectedPatient.patientInfo.age} years</p>
                                </div>
                              </div>
                            )}

                            {selectedPatient.patientInfo?.blood_group && (
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                                  <Activity className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Blood Group</p>
                                  <p className="font-medium">{selectedPatient.patientInfo.blood_group}</p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                                <FileText className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Total Appointments</p>
                                <p className="font-medium">{selectedPatient.totalAppointments || 0}</p>
                              </div>
                            </div>
                          </div>

                          {selectedPatient.patientInfo?.address && (
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-sm text-muted-foreground mb-1">Address</p>
                              <p className="font-medium">{selectedPatient.patientInfo.address}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Health Records */}
                    {selectedPatient?.healthRecords && selectedPatient.healthRecords.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Health Records
                          </CardTitle>
                          <CardDescription>Documents uploaded by patient</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedPatient.healthRecords.map((record: any) => (
                              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                                <div className="flex-1">
                                  <p className="font-medium">{record.title}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {record.type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(record.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                {record.file_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(record.file_url, '_blank')}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Treatment Progress */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Treatment Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center p-4 bg-primary/5 rounded-lg">
                            <p className="text-3xl font-bold text-primary">{selectedPatient?.totalAppointments || 0}</p>
                            <p className="text-sm text-muted-foreground mt-1">Total Visits</p>
                          </div>
                          <div className="text-center p-4 bg-secondary/5 rounded-lg">
                            <p className="text-3xl font-bold text-secondary">{selectedPatient?.completedFollowUps || 0}</p>
                            <p className="text-sm text-muted-foreground mt-1">Follow-ups Completed</p>
                          </div>
                          <div className="text-center p-4 bg-accent/5 rounded-lg">
                            <p className="text-3xl font-bold text-accent">
                              {patientHistory.filter((a: any) => a.status === 'completed').length}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">Completed Consultations</p>
                          </div>
                        </div>

                        {patientHistory.length > 0 && (
                          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm text-foreground">
                              Patient has {(selectedPatient?.totalAppointments || 0) > 1 ? `completed ${selectedPatient?.totalAppointments} consultations` : 'started their treatment journey'}.
                              {patientHistory[0]?.follow_up_date && (
                                <> Next follow-up: <span className="font-medium">
                                  {new Date(patientHistory[0].follow_up_date).toLocaleDateString()}
                                </span></>
                              )}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Appointment Timeline */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Appointment Timeline</CardTitle>
                        <CardDescription>Complete medical history with all consultations</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {patientHistory.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No history found for this patient.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {patientHistory.map((appointment: any) => (
                              <Collapsible key={appointment.id}>
                                <Card className="border-l-4" style={{ borderLeftColor: `var(--${appointment.status === 'completed' ? 'primary' : appointment.status === 'confirmed' ? 'secondary' : 'muted'})` }}>
                                  <CollapsibleTrigger className="w-full">
                                    <CardHeader className="hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div className="text-left">
                                            <div className="flex items-center gap-2">
                                              <Calendar className="h-4 w-4 text-muted-foreground" />
                                              <span className="font-medium">{new Date(appointment.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Clock className="h-4 w-4 text-muted-foreground" />
                                              <span className="text-sm text-muted-foreground">{appointment.time}</span>
                                            </div>
                                          </div>
                                          <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
                                            {appointment.status}
                                          </Badge>
                                        </div>
                                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                      </div>
                                    </CardHeader>
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent>
                                    <CardContent className="space-y-4 pt-4 border-t">
                                      {appointment.symptoms && appointment.symptoms.length > 0 && (
                                        <div>
                                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Activity className="h-4 w-4" />
                                            Symptoms
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {appointment.symptoms.map((symptom: string, idx: number) => (
                                              <Badge key={idx} variant="outline">{symptom}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {appointment.notes && (
                                        <div>
                                          <p className="text-sm font-medium mb-2">Patient Notes</p>
                                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                            {appointment.notes}
                                          </p>
                                        </div>
                                      )}

                                      {appointment.symptoms_report && (
                                        <div>
                                          <p className="text-sm font-medium mb-2">Symptoms Report</p>
                                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                            {appointment.symptoms_report}
                                          </p>
                                        </div>
                                      )}

                                      {appointment.doctor_notes && (
                                        <div>
                                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Stethoscope className="h-4 w-4" />
                                            Doctor's Notes
                                          </p>
                                          <p className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
                                            {appointment.doctor_notes}
                                          </p>
                                        </div>
                                      )}

                                      {appointment.medicines && (
                                        <div>
                                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Pill className="h-4 w-4" />
                                            Medicines Prescribed
                                          </p>
                                          <p className="text-sm text-muted-foreground bg-secondary/5 p-3 rounded-lg">
                                            {appointment.medicines}
                                          </p>
                                        </div>
                                      )}

                                      {appointment.follow_up_date && (
                                        <div>
                                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Follow-up Date
                                          </p>
                                          <Badge variant="outline" className="text-sm">
                                            {new Date(appointment.follow_up_date).toLocaleDateString()}
                                          </Badge>
                                        </div>
                                      )}
                                    </CardContent>
                                  </CollapsibleContent>
                                </Card>
                              </Collapsible>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
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

                  {(consultationDetails.doctor_notes || consultationDetails.medicines_prescribed || consultationDetails.follow_up_date || consultationDetails.prescription) && (
                    <Card className="border-primary/20">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          Consultation Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {consultationDetails.prescription && (
                          <div className="rounded-lg bg-primary/5 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold">Prescription Available</h4>
                                  <p className="text-xs text-muted-foreground">
                                    Generated on {new Date(consultationDetails.prescription.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  const viewUrl = `https://qwsfjkaylxykyxaynsgq.supabase.co/functions/v1/view-prescription?id=${consultationDetails.prescription.id}`;
                                  window.open(viewUrl, '_blank');
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </div>
                        )}

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
