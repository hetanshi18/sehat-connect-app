import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Phone, Mail, Droplet, MapPin, FileText, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { mockHealthRecords } from '@/lib/mockData';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const profileDetails = [
    { icon: User, label: 'Name', value: user?.user_metadata?.name || 'N/A' },
    { icon: Mail, label: 'Email', value: user?.email || 'N/A' },
    { icon: Phone, label: 'Phone', value: user?.user_metadata?.phone || 'Not provided' },
    { icon: Droplet, label: 'Blood Group', value: 'Not provided' },
    { icon: MapPin, label: 'Address', value: 'Not provided' },
  ];

  const reports = mockHealthRecords.filter(r => r.type === 'report');
  const prescriptions = mockHealthRecords.filter(r => r.type === 'prescription');

  return (
    <DashboardLayout title="Patient Profile">
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Info */}
          <Card className="md:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic health profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileDetails.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">{detail.label}</p>
                      <p className="font-medium">{detail.value}</p>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" className="w-full">Edit Profile</Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Age</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">N/A</p>
                <p className="text-sm text-muted-foreground">years old</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-secondary">{mockHealthRecords.length}</p>
                <p className="text-sm text-muted-foreground">health documents</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medical Reports */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle>Medical Reports</CardTitle>
            <CardDescription>Your test results and medical documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <FileText className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Download report">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
            <CardDescription>Prescriptions from your doctors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <FileText className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{prescription.title}</p>
                      <p className="text-sm text-muted-foreground">{prescription.date}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Download prescription">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
