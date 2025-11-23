import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCog, Calendar, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    completedAppointments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total patients
        const { count: patientCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'patient');

        // Get total doctors
        const { count: doctorCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'doctor');

        // Get total appointments
        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true });

        // Get completed appointments
        const { count: completedCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        setStats({
          totalPatients: patientCount || 0,
          totalDoctors: doctorCount || 0,
          totalAppointments: appointmentCount || 0,
          completedAppointments: completedCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your healthcare platform</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDoctors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedAppointments}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Appointment Completion Rate</span>
                <span className="text-sm font-medium">
                  {stats.totalAppointments > 0
                    ? `${Math.round((stats.completedAppointments / stats.totalAppointments) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Doctor-to-Patient Ratio</span>
                <span className="text-sm font-medium">
                  {stats.totalPatients > 0
                    ? `1:${Math.round(stats.totalPatients / Math.max(stats.totalDoctors, 1))}`
                    : '0:0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}