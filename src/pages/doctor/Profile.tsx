import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Mail, Briefcase, GraduationCap, MapPin, Award, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    specialty: '',
    experience: 0,
    qualification: '',
    clinicAddress: '',
    about: '',
    achievements: '',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast({ title: 'Success', description: 'Profile updated successfully' });
  };

  const personalInfo = [
    { icon: User, label: 'Name', value: formData.name, field: 'name' },
    { icon: Mail, label: 'Email', value: formData.email, field: 'email' },
  ];

  const professionalInfo = [
    { icon: Briefcase, label: 'Specialty', value: formData.specialty, field: 'specialty' },
    { icon: GraduationCap, label: 'Qualification', value: formData.qualification, field: 'qualification' },
    { icon: Briefcase, label: 'Experience', value: `${formData.experience} years`, field: 'experience' },
  ];

  return (
    <DashboardLayout title="Doctor Profile">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate('/doctor/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Personal Information */}
          <Card className="md:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalInfo.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="space-y-2">
                    <Label htmlFor={detail.field} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {detail.label}
                    </Label>
                    <Input
                      id={detail.field}
                      value={formData[detail.field as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [detail.field]: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Profile Picture */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-primary text-white text-5xl font-bold">
                  {user?.user_metadata?.name?.split(' ')[0]?.[0] || 'D'}
                </div>
                {isEditing && (
                  <Button variant="outline" size="sm" className="w-full">Upload Photo</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Information */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Your medical credentials and expertise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {professionalInfo.map((detail) => {
                const Icon = detail.icon;
                return (
                  <div key={detail.label} className="space-y-2">
                    <Label htmlFor={detail.field} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {detail.label}
                    </Label>
                    <Input
                      id={detail.field}
                      type={detail.field === 'experience' ? 'number' : 'text'}
                      value={formData[detail.field as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [detail.field]: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Clinic Information */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
            <CardDescription>Your practice location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clinicAddress" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Clinic Address
              </Label>
              <Input
                id="clinicAddress"
                value={formData.clinicAddress}
                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* About & Achievements */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>Brief description of your expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                disabled={!isEditing}
                rows={6}
                placeholder="Describe your medical expertise and approach..."
              />
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
              <CardDescription>Your accomplishments and recognitions</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                disabled={!isEditing}
                rows={6}
                placeholder="Enter achievements separated by commas..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
