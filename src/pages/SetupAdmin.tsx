import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, CheckCircle } from 'lucide-react';

export default function SetupAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        method: 'POST',
      });

      if (error) throw error;

      setSuccess(true);
      toast.success(data.message || 'Admin account created successfully!');
    } catch (error: any) {
      console.error('Error setting up admin:', error);
      toast.error(error.message || 'Failed to setup admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Admin Setup</CardTitle>
          <CardDescription>
            Create the admin account for your healthcare platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!success ? (
            <>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>This will create an admin account with:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Email: <strong className="text-foreground">admin@gmail.com</strong></li>
                  <li>Password: <strong className="text-foreground">123456</strong></li>
                </ul>
                <p className="mt-4 text-xs text-amber-600 dark:text-amber-500">
                  ⚠️ Please change the password after first login for security
                </p>
              </div>

              <Button 
                onClick={handleSetup} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Setting up...' : 'Create Admin Account'}
              </Button>

              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Back to Login
              </Button>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-500" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Admin Account Created!</h3>
                <p className="text-sm text-muted-foreground">
                  You can now login with the admin credentials
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">admin@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <span className="font-medium">123456</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}