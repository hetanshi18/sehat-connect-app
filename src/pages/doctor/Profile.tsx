import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Mail, Briefcase, GraduationCap, MapPin, Award, Edit, Upload, FileSignature, IdCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: 0,
    qualification: '',
    clinicAddress: '',
    about: '',
    achievements: '',
    registrationNumber: '',
    signatureUrl: '',
  });
  const [uploadingSignature, setUploadingSignature] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDoctorInfo();
    }
  }, [user]);

  const fetchDoctorInfo = async () => {
    if (!user) return;

    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch doctor info
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors_info')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (doctorError && doctorError.code !== 'PGRST116') throw doctorError;
      
      setFormData({
        name: profileData?.name || '',
        email: profileData?.email || '',
        phone: profileData?.phone || '',
        specialty: doctorData?.specialty || '',
        experience: doctorData?.experience || 0,
        qualification: doctorData?.qualification || '',
        clinicAddress: doctorData?.clinic_address || '',
        about: doctorData?.about || '',
        achievements: doctorData?.achievements?.join(', ') || '',
        registrationNumber: doctorData?.registration_number || '',
        signatureUrl: doctorData?.signature_url || '',
      });
    } catch (error: any) {
      console.error('Error fetching doctor info:', error);
      toast({ title: 'Error', description: 'Failed to load profile data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Update or insert doctor info
      const achievementsArray = formData.achievements
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const { error: doctorError } = await supabase
        .from('doctors_info')
        .upsert({
          user_id: user.id,
          specialty: formData.specialty,
          experience: Number(formData.experience),
          qualification: formData.qualification,
          clinic_address: formData.clinicAddress,
          about: formData.about,
          achievements: achievementsArray.length > 0 ? achievementsArray : null,
          registration_number: formData.registrationNumber,
          signature_url: formData.signatureUrl,
        }, {
          onConflict: 'user_id'
        });

      if (doctorError) {
        console.error('Doctor info update error:', doctorError);
        throw doctorError;
      }

      setIsEditing(false);
      toast({ title: 'Success', description: 'Profile updated successfully' });
      
      // Refresh data
      await fetchDoctorInfo();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update profile', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Error', description: 'File size should be less than 2MB', variant: 'destructive' });
      return;
    }

    setUploadingSignature(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `signatures/${user.id}-signature-${Date.now()}.${fileExt}`;

      // Delete old signature if exists
      if (formData.signatureUrl) {
        try {
          const oldPath = formData.signatureUrl.split('/').slice(-1)[0];
          if (oldPath.includes('signature')) {
            await supabase.storage.from('prescriptions').remove([`signatures/${oldPath}`]);
          }
        } catch (err) {
          console.log('Error removing old signature:', err);
        }
      }

      // Upload new signature to public prescriptions bucket
      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);

      setFormData({ ...formData, signatureUrl: urlData.publicUrl });
      toast({ title: 'Success', description: 'Signature uploaded successfully. Remember to save your profile!' });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to upload signature', variant: 'destructive' });
    } finally {
      setUploadingSignature(false);
    }
  };

  const personalInfo = [
    { icon: User, label: 'Name', value: formData.name, field: 'name' },
    { icon: Mail, label: 'Email', value: formData.email, field: 'email' },
    { icon: User, label: 'Phone', value: formData.phone, field: 'phone' },
  ];

  const professionalInfo = [
    { icon: Briefcase, label: 'Specialty', value: formData.specialty, field: 'specialty' },
    { icon: GraduationCap, label: 'Qualification', value: formData.qualification, field: 'qualification' },
    { icon: Briefcase, label: 'Experience', value: `${formData.experience} years`, field: 'experience' },
  ];

  return (
    <DashboardLayout role="doctor" title="Doctor Profile">
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => navigate('/doctor/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
          >
            <Edit className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
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
                      disabled={!isEditing || detail.field === 'email'}
                      className={detail.field === 'email' ? 'bg-muted' : ''}
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

        {/* Registration & Signature */}
        <Card className="mt-6 shadow-soft">
          <CardHeader>
            <CardTitle>Medical Registration & Signature</CardTitle>
            <CardDescription>Required for generating valid prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber" className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-muted-foreground" />
                  Medical Registration Number
                </Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter your registration number"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileSignature className="h-4 w-4 text-muted-foreground" />
                E-Signature
              </Label>
              <div className="flex items-center gap-4">
                {formData.signatureUrl ? (
                  <div className="flex items-center gap-4">
                    <img 
                      src={formData.signatureUrl} 
                      alt="Doctor's signature" 
                      className="h-20 border rounded p-2 bg-background"
                    />
                    {isEditing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('signature-upload')?.click()}
                        disabled={uploadingSignature}
                      >
                        {uploadingSignature ? (
                          <>Uploading...</>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Change Signature
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('signature-upload')?.click()}
                    disabled={!isEditing || uploadingSignature}
                  >
                    {uploadingSignature ? (
                      <>Uploading...</>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Signature
                      </>
                    )}
                  </Button>
                )}
                <input
                  id="signature-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSignatureUpload}
                  disabled={!isEditing}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a clear image of your signature (PNG, JPG, max 2MB)
              </p>
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
