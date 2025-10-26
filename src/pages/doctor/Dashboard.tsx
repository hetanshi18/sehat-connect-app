import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, User, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all appointments for this doctor
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles!appointments_patient_id_fkey (
            name,
            phone
          )
        `)
        .eq('doctor_id', user.id);

      if (error) throw error;

      const pending = appointments?.filter(apt => apt.status === 'pending').length || 0;
      const confirmed = appointments?.filter(apt => apt.status === 'confirmed').length || 0;
      const uniquePatients = new Set(appointments?.map(apt => apt.patient_id)).size;
      const upcoming = appointments?.filter(apt => apt.status === 'pending' || apt.status === 'confirmed').slice(0, 5) || [];

      setPendingCount(pending);
      setConfirmedCount(confirmed);
      setTotalPatients(uniquePatients);
      setUpcomingAppointments(upcoming);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const menuItems = [
    { title: "Pending Requests", description: `${pendingCount} waiting for approval`, icon: Calendar, path: '/doctor/view-appointments', color: 'bg-gradient-primary', count: pendingCount },
    { title: 'Patient Records', description: 'View patient histories', icon: Users, path: '/doctor/patient-records', color: 'bg-gradient-secondary', count: totalPatients },
    { title: 'Manage Slots', description: 'Set your availability', icon: Clock, path: '/doctor/manage-slots', color: 'bg-gradient-warm', count: null },
    { title: 'My Profile', description: 'Update professional details', icon: User, path: '/doctor/profile', color: 'bg-primary', count: null },
  ];

  return (
    <DashboardLayout title="Doctor Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{totalPatients}</div>
              <p className="text-xs text-muted-foreground">Unique patients</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{confirmedCount}</div>
              <p className="text-xs text-muted-foreground">Approved appointments</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-foreground">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.path}
                  className="group cursor-pointer shadow-soft transition-all hover:shadow-medium hover:-translate-y-1"
                  onClick={() => navigate(item.path)}
                >
                  <CardHeader>
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${item.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full group-hover:bg-muted">
                      View →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.profiles?.name || 'Patient'}</p>
                      <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                      <p className="text-xs text-muted-foreground">
                        Status: <span className={apt.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}>
                          {apt.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate('/doctor/view-appointments')}>View Details</Button>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No upcoming appointments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
