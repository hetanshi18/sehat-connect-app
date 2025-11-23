import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function AddDoctor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    specialty: '',
    qualification: '',
    experience: '',
    clinicAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('admin-add-doctor', {
        body: {
          email: formData.email,
          name: formData.name,
          specialty: formData.specialty,
          qualification: formData.qualification,
          experience: parseInt(formData.experience) || 0,
          clinicAddress: formData.clinicAddress,
        },
      });

      if (error) throw error;

      toast.success(data.message || 'Doctor added successfully!');
      navigate('/admin/doctors');
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      toast.error(error.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/doctors')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Doctor</h1>
            <p className="text-muted-foreground mt-2">Create a new doctor account with default credentials</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>
              The doctor will be created with email as login and default password: <strong>dr@123</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="e.g., Cardiology, Dermatology"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g., MBBS, MD"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Clinic Address</Label>
                <Textarea
                  id="clinicAddress"
                  value={formData.clinicAddress}
                  onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Doctor Account'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/doctors')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}