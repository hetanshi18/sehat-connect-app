import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Mail, Phone, Calendar, Clock, FileText, Activity, ChevronDown, TrendingUp, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface PatientInfo {
  age?: number;
  blood_group?: string;
  address?: string;
}

interface AppointmentHistory {
  id: string;
  date: string;
  time: string;
  status: string;
  symptoms: string[];
  notes?: string;
  symptoms_report?: string;
  relief_measures?: string;
  medicines?: string;
  doctor_notes?: string;
  follow_up_date?: string;
}

interface HealthRecord {
  id: string;
  title: string;
  type: string;
  file_url?: string;
  created_at: string;
}

const PatientHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [patientProfile, setPatientProfile] = useState<Patient | null>(null);
  const [appointmentHistory, setAppointmentHistory] = useState<AppointmentHistory[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [completedFollowUps, setCompletedFollowUps] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientHistory();
    }
  }, [selectedPatientId]);

  const fetchPatients = async () => {
    if (!user) return;

    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          status,
          profiles!appointments_patient_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('doctor_id', user.id)
        .in('status', ['confirmed', 'completed']);

      if (error) throw error;

      // Get unique patients from confirmed/completed appointments
      const uniquePatients = appointments?.reduce((acc: Patient[], apt: any) => {
        if (!acc.find(p => p.id === apt.patient_id) && apt.profiles) {
          acc.push({
            id: apt.patient_id,
            name: apt.profiles.name || apt.profiles.email.split('@')[0],
            email: apt.profiles.email,
            phone: apt.profiles.phone || ''
          });
        }
        return acc;
      }, []) || [];

      setPatients(uniquePatients);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const fetchPatientHistory = async () => {
    if (!user || !selectedPatientId) return;

    setLoading(true);
    try {
      // Fetch patient profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedPatientId)
        .single();

      if (profileError) throw profileError;
      setPatientProfile(profile);

      // Fetch patient info
      const { data: info, error: infoError } = await supabase
        .from('patients_info')
        .select('*')
        .eq('user_id', selectedPatientId)
        .maybeSingle();

      setPatientInfo(info);

      // Fetch appointments with related data
      const { data: appointments, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .eq('patient_id', selectedPatientId)
        .order('created_at', { ascending: false });

      if (aptError) throw aptError;

      // Fetch symptoms records for this patient
      const { data: symptomsRecords, error: symptomsError } = await supabase
        .from('symptoms_records')
        .select('*')
        .eq('patient_id', selectedPatientId)
        .order('recorded_at', { ascending: false });

      // Fetch appointment notes
      const { data: notes, error: notesError } = await supabase
        .from('appointment_notes')
        .select('*')
        .eq('patient_id', selectedPatientId)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch health records
      const { data: records, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .eq('patient_id', selectedPatientId)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;
      setHealthRecords(records || []);

      // Combine data
      const history: AppointmentHistory[] = appointments?.map(apt => {
        const symptomRecord = symptomsRecords?.find(sr => 
          new Date(sr.recorded_at).toDateString() === new Date(apt.created_at).toDateString()
        );
        const note = notes?.find(n => n.appointment_id === apt.id);

        return {
          id: apt.id,
          date: apt.date,
          time: apt.time,
          status: apt.status,
          symptoms: apt.symptoms || symptomRecord?.symptoms || [],
          notes: apt.notes,
          symptoms_report: symptomRecord?.additional_notes,
          relief_measures: (symptomsRecords?.find(sr => sr.patient_id === selectedPatientId) as any)?.relief_measures,
          medicines: note?.medicines_prescribed,
          doctor_notes: note?.notes,
          follow_up_date: note?.follow_up_date
        };
      }) || [];

      setAppointmentHistory(history);
      setTotalAppointments(appointments?.length || 0);
      
      // Count completed follow-ups
      const followUps = notes?.filter(n => n.follow_up_date && new Date(n.follow_up_date) < new Date()).length || 0;
      setCompletedFollowUps(followUps);

    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'confirmed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <DashboardLayout title="Patient History">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/doctor/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Patient Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
            <CardDescription>Choose a patient to view their complete medical history</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} - {patient.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {!loading && selectedPatientId && patientProfile && (
          <>
            {/* Patient Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Patient Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{patientProfile.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                      <Mail className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{patientProfile.email}</p>
                    </div>
                  </div>

                  {patientProfile.phone && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <Phone className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{patientProfile.phone}</p>
                      </div>
                    </div>
                  )}

                  {patientInfo?.age && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{patientInfo.age} years</p>
                      </div>
                    </div>
                  )}

                  {patientInfo?.blood_group && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                        <Activity className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Blood Group</p>
                        <p className="font-medium">{patientInfo.blood_group}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <FileText className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Appointments</p>
                      <p className="font-medium">{totalAppointments}</p>
                    </div>
                  </div>
                </div>

                {patientInfo?.address && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="font-medium">{patientInfo.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Records */}
            {healthRecords.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Health Records
                  </CardTitle>
                  <CardDescription>Documents uploaded by patient</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthRecords.map(record => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium">{record.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {record.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(record.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {record.file_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(record.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Treatment Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Treatment Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{totalAppointments}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Visits</p>
                  </div>
                  <div className="text-center p-4 bg-secondary/5 rounded-lg">
                    <p className="text-3xl font-bold text-secondary">{completedFollowUps}</p>
                    <p className="text-sm text-muted-foreground mt-1">Follow-ups Completed</p>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <p className="text-3xl font-bold text-accent">
                      {appointmentHistory.filter(a => a.status === 'completed').length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Completed Consultations</p>
                  </div>
                </div>

                {appointmentHistory.length > 0 && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-foreground">
                      Patient has {totalAppointments > 1 ? `completed ${totalAppointments} consultations` : 'started their treatment journey'}.
                      {appointmentHistory[0]?.follow_up_date && (
                        <> Next follow-up: <span className="font-medium">
                          {new Date(appointmentHistory[0].follow_up_date).toLocaleDateString()}
                        </span></>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Appointment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Timeline</CardTitle>
                <CardDescription>Complete medical history with all consultations</CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No history found for this patient.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {appointmentHistory.map((appointment, index) => (
                      <Collapsible key={appointment.id}>
                        <Card className="border-l-4" style={{ borderLeftColor: `var(--${appointment.status === 'completed' ? 'primary' : appointment.status === 'confirmed' ? 'secondary' : 'muted'})` }}>
                          <CollapsibleTrigger className="w-full">
                            <CardHeader className="hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-left">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-semibold">{appointment.date}</span>
                                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                                      <span className="text-sm text-muted-foreground">{appointment.time}</span>
                                    </div>
                                    <Badge variant={appointment.status === 'completed' ? 'default' : appointment.status === 'confirmed' ? 'secondary' : 'outline'}>
                                      {appointment.status}
                                    </Badge>
                                  </div>
                                </div>
                                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform" />
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-4">
                              <Separator />
                              
                              {appointment.symptoms && appointment.symptoms.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Symptoms Reported
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {appointment.symptoms.map((symptom, i) => (
                                      <Badge key={i} variant="outline">{symptom}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {appointment.symptoms_report && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Patient Notes</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                    {appointment.symptoms_report}
                                  </p>
                                </div>
                              )}

                              {appointment.relief_measures && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Relief Measures</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                                    {appointment.relief_measures}
                                  </p>
                                </div>
                              )}

                              {appointment.medicines && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Medicines Prescribed
                                  </h4>
                                  <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                                    {appointment.medicines}
                                  </p>
                                </div>
                              )}

                              {appointment.doctor_notes && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Doctor's Notes</h4>
                                  <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded">
                                    {appointment.doctor_notes}
                                  </p>
                                </div>
                              )}

                              {appointment.follow_up_date && (
                                <div>
                                  <h4 className="font-semibold text-sm mb-2">Follow-up Date</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(appointment.follow_up_date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!loading && !selectedPatientId && (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">
                Please select a patient to view their history
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientHistory;
