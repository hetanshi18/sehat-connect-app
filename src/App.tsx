import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PatientDashboard from "./pages/patient/Dashboard";
import DoctorDashboard from "./pages/doctor/Dashboard";
import Symptoms from "./pages/patient/Symptoms";
import Consult from "./pages/patient/Consult";
import Appointments from "./pages/patient/Appointments";
import Chat from "./pages/patient/Chat";
import VideoCall from "./pages/patient/VideoCall";
import PatientProfile from "./pages/patient/Profile";
import Trends from "./pages/patient/Trends";
import DoctorProfile from "./pages/doctor/Profile";
import ManageSlots from "./pages/doctor/ManageSlots";
import ViewAppointments from "./pages/doctor/ViewAppointments";
import PatientHistory from "./pages/doctor/PatientHistory";
import AdminDashboard from "./pages/admin/Dashboard";
import AddDoctor from "./pages/admin/AddDoctor";
import ViewDoctors from "./pages/admin/ViewDoctors";
import ViewPatients from "./pages/admin/ViewPatients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Patient Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/symptoms" element={
              <ProtectedRoute requiredRole="patient">
                <Symptoms />
              </ProtectedRoute>
            } />
            <Route path="/consult" element={
              <ProtectedRoute requiredRole="patient">
                <Consult />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute requiredRole="patient">
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/consult/chat" element={
              <ProtectedRoute requiredRole="patient">
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/consult/call" element={
              <ProtectedRoute requiredRole="patient">
                <VideoCall />
              </ProtectedRoute>
            } />
            <Route path="/video-call" element={
              <ProtectedRoute>
                <VideoCall />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="patient">
                <PatientProfile />
              </ProtectedRoute>
            } />
            <Route path="/trends" element={
              <ProtectedRoute requiredRole="patient">
                <Trends />
              </ProtectedRoute>
            } />
            
            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/doctor/profile" element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorProfile />
              </ProtectedRoute>
            } />
            <Route path="/doctor/manage-slots" element={
              <ProtectedRoute requiredRole="doctor">
                <ManageSlots />
              </ProtectedRoute>
            } />
            <Route path="/doctor/view-appointments" element={
              <ProtectedRoute requiredRole="doctor">
                <ViewAppointments />
              </ProtectedRoute>
            } />
            <Route path="/doctor/patient-history" element={
              <ProtectedRoute requiredRole="doctor">
                <PatientHistory />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/add-doctor" element={
              <ProtectedRoute requiredRole="admin">
                <AddDoctor />
              </ProtectedRoute>
            } />
            <Route path="/admin/doctors" element={
              <ProtectedRoute requiredRole="admin">
                <ViewDoctors />
              </ProtectedRoute>
            } />
            <Route path="/admin/patients" element={
              <ProtectedRoute requiredRole="admin">
                <ViewPatients />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
