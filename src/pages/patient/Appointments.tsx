import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Appointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Record<string, any>>({});

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
          profiles!appointments_doctor_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);

      // Fetch notes and prescriptions for completed appointments
      if (data) {
        const completedIds = data.filter(apt => apt.status === 'completed').map(apt => apt.id);
        if (completedIds.length > 0) {
          const { data: notesData, error: notesError } = await supabase
            .from('appointment_notes')
            .select('*')
            .in('appointment_id', completedIds);

          if (!notesError && notesData) {
            const notesMap = notesData.reduce((acc, note) => {
              acc[note.appointment_id] = note;
              return acc;
            }, {} as Record<string, any>);
            setAppointmentNotes(notesMap);
          }

          // Fetch prescriptions
          const { data: prescData, error: prescError } = await supabase
            .from('prescriptions')
            .select('*')
            .in('appointment_id', completedIds);

          if (!prescError && prescData) {
            const prescMap = prescData.reduce((acc, presc) => {
              acc[presc.appointment_id] = presc;
              return acc;
            }, {} as Record<string, any>);
            setPrescriptions(prescMap);
          }
        }
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const [appointmentNotes, setAppointmentNotes] = useState<Record<string, any>>({});

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const rejectedAppointments = appointments.filter(apt => apt.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">{t('appointments.awaitingApproval')}</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">{t('appointments.appointmentConfirmed')}</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('appointments.rejected')}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title={t('appointments.title')}>
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('dashboard.backToDashboard')}
        </Button>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="pending">{t('appointments.pending')} ({pendingAppointments.length})</TabsTrigger>
            <TabsTrigger value="confirmed">{t('appointments.confirmed')} ({confirmedAppointments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedAppointments.length})</TabsTrigger>
            <TabsTrigger value="rejected">{t('appointments.rejected')} ({rejectedAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingAppointments.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {t('appointments.noPending')}
                  </CardContent>
                </Card>
              ) : (
                pendingAppointments.map((apt) => (
                  <Card key={apt.id} className="shadow-soft hover:shadow-medium transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-white text-lg font-bold">
                            <Stethoscope className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Dr. {apt.profiles?.name || 'Doctor'}</CardTitle>
                            <CardDescription>
                              <p>{apt.profiles?.email}</p>
                              {apt.profiles?.phone && <p className="text-xs">📞 {apt.profiles?.phone}</p>}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
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
                      <p className="text-sm text-muted-foreground">
                        Request sent — Awaiting doctor approval
                      </p>
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
                    {t('appointments.noConfirmed')}
                  </CardContent>
                </Card>
              ) : (
                confirmedAppointments.map((apt) => (
                  <Card key={apt.id} className="shadow-soft hover:shadow-medium transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-white text-lg font-bold">
                            <Stethoscope className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Dr. {apt.profiles?.name || 'Doctor'}</CardTitle>
                            <CardDescription>
                              <p>{apt.profiles?.email}</p>
                              {apt.profiles?.phone && <p className="text-xs">📞 {apt.profiles?.phone}</p>}
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
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
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/video-call?appointmentId=${apt.id}&patientName=${user?.email?.split('@')[0] || 'Patient'}&doctorName=${apt.profiles?.name || 'Doctor'}&role=patient`)}
                      >
                        Join Consultation
                      </Button>
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
                    No completed appointments yet.
                  </CardContent>
                </Card>
              ) : (
                completedAppointments.map((apt) => {
                  const notes = appointmentNotes[apt.id];
                  const prescription = prescriptions[apt.id];
                  return (
                    <Card key={apt.id} className="shadow-soft hover:shadow-medium transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary text-white text-lg font-bold">
                              <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Dr. {apt.profiles?.name || 'Doctor'}</CardTitle>
                              <CardDescription>
                                <p>{apt.profiles?.email}</p>
                                {apt.profiles?.phone && <p className="text-xs">📞 {apt.profiles?.phone}</p>}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(apt.status)}
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
                        
                        {prescription && (
                          <div className="mt-4 border-t pt-4">
                            <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold">Prescription Available</h4>
                                  <p className="text-xs text-muted-foreground">
                                    Generated on {new Date(prescription.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => window.open(prescription.prescription_url, '_blank')}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {notes && (
                          <div className="mt-4 space-y-3 border-t pt-4">
                            {notes.notes && (
                              <div className="rounded-lg bg-muted/50 p-3">
                                <h4 className="text-sm font-semibold mb-2">Doctor's Notes:</h4>
                                <p className="text-sm whitespace-pre-wrap">{notes.notes}</p>
                              </div>
                            )}
                            
                            {notes.medicines_prescribed && (
                              <div className="rounded-lg bg-muted/50 p-3">
                                <h4 className="text-sm font-semibold mb-2">Prescribed Medicines:</h4>
                                <p className="text-sm whitespace-pre-wrap">{notes.medicines_prescribed}</p>
                              </div>
                            )}
                            
                            {notes.follow_up_date && (
                              <div className="rounded-lg bg-muted/50 p-3">
                                <h4 className="text-sm font-semibold mb-2">Follow-up Date:</h4>
                                <p className="text-sm">{new Date(notes.follow_up_date).toLocaleDateString()}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="space-y-4">
              {rejectedAppointments.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {t('appointments.noRejected')}
                  </CardContent>
                </Card>
              ) : (
                rejectedAppointments.map((apt) => (
                  <Card key={apt.id} className="shadow-soft">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground text-lg font-bold">
                            <Stethoscope className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Dr. {apt.profiles?.name || 'Doctor'}</CardTitle>
                            <CardDescription>
                              <p>{apt.profiles?.email}</p>
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(apt.status)}
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
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/consult')}
                      >
                        Book Another Appointment
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
