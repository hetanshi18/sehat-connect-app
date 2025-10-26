import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Calendar, ClipboardList, TrendingUp, Stethoscope, FileText, Clock, User, Mail, Phone, Download } from 'lucide-react';
import { mockAppointments } from '@/lib/mockData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [symptomReports, setSymptomReports] = useState<any[]>([]);

  const upcomingAppointment = mockAppointments.find(apt => apt.status === 'scheduled');
  const totalConsultations = mockAppointments.length;

  useEffect(() => {
    if (user) {
      fetchPatientInfo();
      fetchSymptomReports();
    }
  }, [user]);

  const fetchPatientInfo = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('patients_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setPatientInfo(data);
    } catch (error) {
      console.error('Error fetching patient info:', error);
    }
  };

  const fetchSymptomReports = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', user.id)
        .eq('type', 'symptom_report')
        .order('created_at', { ascending: false });
      setSymptomReports(data || []);
    } catch (error) {
      console.error('Error fetching symptom reports:', error);
    }
  };

  const downloadReport = (report: any) => {
    const reportContent = `
SYMPTOM ANALYSIS REPORT
Generated: ${new Date(report.created_at).toLocaleDateString()}

${report.title}

${report.report || ''}

${report.relief_measures ? `Relief Measures:\n${report.relief_measures}` : ''}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `symptom-report-${new Date(report.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const menuItems = [
    { title: 'My Appointments', description: 'View your scheduled appointments', icon: Calendar, path: '/appointments', color: 'bg-gradient-primary' },
    { title: 'Book Consultation', description: 'Schedule a doctor appointment', icon: Stethoscope, path: '/consult', color: 'bg-gradient-secondary' },
    { title: 'Record Symptoms', description: 'Log your current symptoms', icon: ClipboardList, path: '/symptoms', color: 'bg-gradient-warm' },
    { title: 'Health Trends', description: 'View your health analytics', icon: TrendingUp, path: '/trends', color: 'bg-primary' },
  ];

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="space-y-6">
        {/* Profile Summary */}
        <Card className="shadow-soft bg-gradient-primary text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Name</p>
                  <p className="font-medium">{user?.user_metadata?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Email</p>
                  <p className="font-medium">{user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 opacity-80" />
                <div>
                  <p className="text-sm opacity-80">Phone</p>
                  <p className="font-medium">{user?.user_metadata?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
              onClick={() => navigate('/profile')}
            >
              View Full Profile
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalConsultations}</div>
              <p className="text-xs text-muted-foreground">Lifetime appointments</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {upcomingAppointment ? (
                <>
                  <div className="text-2xl font-bold text-secondary">{upcomingAppointment.date}</div>
                  <p className="text-xs text-muted-foreground">{upcomingAppointment.time} - {upcomingAppointment.doctorName}</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No upcoming appointments</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">2 days ago</div>
              <p className="text-xs text-muted-foreground">Last consultation</p>
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
                      Get Started →
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* View Past Reports */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Past Symptom Reports</CardTitle>
            <CardDescription>Your previously generated symptom analysis reports</CardDescription>
          </CardHeader>
          <CardContent>
            {symptomReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No symptom reports yet</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/symptoms')}
                  className="mt-2"
                >
                  Record your first symptoms
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {symptomReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => downloadReport(report)}
                      aria-label="Download report"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {symptomReports.length > 5 && (
                  <Button 
                    variant="link" 
                    onClick={() => navigate('/symptoms')}
                    className="w-full"
                  >
                    View all reports
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
