import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/auth";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/patient/Dashboard";
import DoctorDashboard from "./pages/doctor/Dashboard";
import Symptoms from "./pages/patient/Symptoms";
import Consult from "./pages/patient/Consult";
import Chat from "./pages/patient/Chat";
import VideoCall from "./pages/patient/VideoCall";
import PatientProfile from "./pages/patient/Profile";
import Trends from "./pages/patient/Trends";
import DoctorProfile from "./pages/doctor/Profile";
import ManageSlots from "./pages/doctor/ManageSlots";
import ViewAppointments from "./pages/doctor/ViewAppointments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole?: 'patient' | 'doctor' }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'patient' ? '/dashboard' : '/doctor/dashboard'} replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const user = getCurrentUser();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={user ? <Navigate to={user.role === 'patient' ? '/dashboard' : '/doctor/dashboard'} replace /> : <Auth />} />
            
            {/* Patient Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/symptoms" element={<ProtectedRoute allowedRole="patient"><Symptoms /></ProtectedRoute>} />
            <Route path="/consult" element={<ProtectedRoute allowedRole="patient"><Consult /></ProtectedRoute>} />
            <Route path="/consult/chat/:doctorId" element={<ProtectedRoute allowedRole="patient"><Chat /></ProtectedRoute>} />
            <Route path="/consult/call/:doctorId" element={<ProtectedRoute allowedRole="patient"><VideoCall /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRole="patient"><PatientProfile /></ProtectedRoute>} />
            <Route path="/trends" element={<ProtectedRoute allowedRole="patient"><Trends /></ProtectedRoute>} />
            
            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/profile" element={<ProtectedRoute allowedRole="doctor"><DoctorProfile /></ProtectedRoute>} />
            <Route path="/doctor/slots" element={<ProtectedRoute allowedRole="doctor"><ManageSlots /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRole="doctor"><ViewAppointments /></ProtectedRoute>} />
            
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
