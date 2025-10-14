import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, UserCircle, User } from 'lucide-react';
import { mockLogin, mockSignup, saveUser } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', name: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    
    const user = mockLogin(loginData.email, loginData.password, role);
    saveUser(user);
    toast({ title: 'Success', description: `Welcome back, ${user.name}!` });
    navigate(role === 'patient' ? '/dashboard' : '/doctor/dashboard');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.email || !signupData.password || !signupData.name) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    
    const user = mockSignup(signupData.email, signupData.password, signupData.name, role);
    saveUser(user);
    toast({ title: 'Success', description: `Account created for ${user.name}!` });
    navigate(role === 'patient' ? '/dashboard' : '/doctor/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-medium animate-fade-in">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary">
            <Stethoscope className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">Sehat Sathi</CardTitle>
          <CardDescription>Smart Telemedicine Kiosk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-2">
            <Button
              variant={role === 'patient' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setRole('patient')}
            >
              <UserCircle className="mr-2 h-4 w-4" />
              Patient
            </Button>
            <Button
              variant={role === 'doctor' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setRole('doctor')}
            >
              <User className="mr-2 h-4 w-4" />
              Doctor
            </Button>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In as {role === 'patient' ? 'Patient' : 'Doctor'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign Up as {role === 'patient' ? 'Patient' : 'Doctor'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
