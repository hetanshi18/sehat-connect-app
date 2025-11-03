import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, User, FileText, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const ViewAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Check if appointment is within 6 hours and send immediate reminder
      if (appointment) {
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const now = new Date();
        const hoursDiff = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff <= 6 && hoursDiff > 0) {
          // Send immediate reminder
          supabase.functions.invoke('send-appointment-reminders').catch(err => {
            console.error('Failed to send immediate reminder:', err);
          });
        }
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
                        <Button className="flex-1">Start Consultation</Button>
                        <Button variant="outline" className="flex-1">View Patient History</Button>
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

                      <Button variant="outline" className="w-full">
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
      </div>
    </DashboardLayout>
  );
};

export default ViewAppointments;
