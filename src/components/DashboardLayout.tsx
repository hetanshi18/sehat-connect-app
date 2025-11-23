import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'patient' | 'doctor' | 'admin' | 'pharmacist';
  title?: string;
}

const DashboardLayout = ({ children, role: userRole, title }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-soft">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sehat Sathi</h1>
              <p className="text-xs text-muted-foreground">
                {userRole === 'patient' ? 'Patient Portal' : userRole === 'doctor' ? 'Doctor Portal' : userRole === 'pharmacist' ? 'Pharmacist Portal' : 'Admin Portal'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {userRole === 'patient' && <LanguageSwitcher />}
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.user_metadata?.name || user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        {title && <h2 className="mb-6 text-3xl font-bold text-foreground">{title}</h2>}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
