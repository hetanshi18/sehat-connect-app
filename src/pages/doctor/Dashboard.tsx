import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, User, FileText } from 'lucide-react';
import { mockAppointments } from '@/lib/mockData';

const DoctorDashboard = () => {
  const navigate = useNavigate();

  const todaysAppointments = mockAppointments.filter(apt => apt.status === 'scheduled').length;
  const totalPatients = new Set(mockAppointments.map(apt => apt.patientId)).size;

  const menuItems = [
    { title: "Today's Appointments", description: `${todaysAppointments} scheduled today`, icon: Calendar, path: '/doctor/view-appointments', color: 'bg-gradient-primary', count: todaysAppointments },
    { title: 'Patient Records', description: 'View patient histories', icon: Users, path: '/doctor/view-appointments', color: 'bg-gradient-secondary', count: totalPatients },
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
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{todaysAppointments}</div>
              <p className="text-xs text-muted-foreground">Scheduled consultations</p>
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
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">0</div>
              <p className="text-xs text-muted-foreground">Consultations done</p>
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
              {mockAppointments.filter(apt => apt.status === 'scheduled').map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                      {apt.symptoms && (
                        <p className="text-xs text-muted-foreground">Symptoms: {apt.symptoms.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => navigate('/doctor/view-appointments')}>View Details</Button>
                </div>
              ))}
              {mockAppointments.filter(apt => apt.status === 'scheduled').length === 0 && (
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
