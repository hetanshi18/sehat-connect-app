import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Calendar, ClipboardList, TrendingUp, Stethoscope, FileText, Clock, User } from 'lucide-react';
import { mockAppointments } from '@/lib/mockData';
import { useLanguage } from '@/contexts/LanguageContext';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const upcomingAppointment = mockAppointments.find(apt => apt.status === 'scheduled');
  const totalConsultations = mockAppointments.length;

  const menuItems = [
    { title: t('dashboard.myAppointments'), description: t('dashboard.viewScheduled'), icon: Calendar, path: '/appointments', color: 'bg-gradient-primary' },
    { title: t('dashboard.bookConsultation'), description: t('dashboard.scheduleDoctor'), icon: Stethoscope, path: '/consult', color: 'bg-gradient-secondary' },
    { title: t('dashboard.recordSymptoms'), description: t('dashboard.logSymptoms'), icon: ClipboardList, path: '/symptoms', color: 'bg-gradient-warm' },
    { title: t('dashboard.healthTrends'), description: t('dashboard.viewAnalytics'), icon: TrendingUp, path: '/trends', color: 'bg-primary' },
    { title: t('dashboard.myProfile'), description: t('dashboard.viewEditProfile'), icon: User, path: '/profile', color: 'bg-accent' },
  ];

  return (
    <DashboardLayout role="patient" title={t('dashboard.patientTitle')}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.totalConsultations')}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalConsultations}</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.lifetimeAppointments')}</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.nextAppointment')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {upcomingAppointment ? (
                <>
                  <div className="text-2xl font-bold text-secondary">{upcomingAppointment.date}</div>
                  <p className="text-xs text-muted-foreground">{upcomingAppointment.time} - {upcomingAppointment.doctorName}</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">{t('dashboard.noUpcoming')}</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.recentActivity')}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">2 days ago</div>
              <p className="text-xs text-muted-foreground">{t('dashboard.lastConsultation')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu */}
        <div>
          <h3 className="mb-4 text-xl font-semibold text-foreground">{t('dashboard.quickActions')}</h3>
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
                      Get Started →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest health interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{apt.doctorName}</p>
                      <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                    </div>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                    apt.status === 'completed' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'
                  }`}>
                    {apt.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
