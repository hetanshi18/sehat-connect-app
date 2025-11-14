import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Clock, User, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Appointments = () => {
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
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const rejectedAppointments = appointments.filter(apt => apt.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Awaiting Doctor Approval</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Appointment Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingAppointments.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({confirmedAppointments.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedAppointments.length})</TabsTrigger>
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

          <TabsContent value="rejected" className="mt-6">
            <div className="space-y-4">
              {rejectedAppointments.length === 0 ? (
                <Card className="shadow-soft">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No rejected appointments
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
