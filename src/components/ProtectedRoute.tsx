import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor' | 'admin' | 'pharmacist';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    let redirectPath = '/auth';
    if (role === 'patient') redirectPath = '/dashboard';
    else if (role === 'doctor') redirectPath = '/doctor/dashboard';
    else if (role === 'pharmacist') redirectPath = '/pharmacist/dashboard';
    else if (role === 'admin') redirectPath = '/admin/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
