import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, FileText, ClipboardList, Pill, Loader2, Save } from 'lucide-react';
import { useTwilioVideo } from '@/hooks/useTwilioVideo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const VideoCall = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  const patientName = searchParams.get('patientName') || 'Patient';
  const doctorName = searchParams.get('doctorName') || 'Doctor';
  const userRole = searchParams.get('role') as 'doctor' | 'patient' || 'doctor';
  const patientId = searchParams.get('patientId') || '';
  
  const displayName = userRole === 'doctor' ? patientName : doctorName;
  const userName = user?.email?.split('@')[0] || 'User';

  // Doctor notes state
  const [doctorNotes, setDoctorNotes] = useState('');
  const [medicines, setMedicines] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);

  const {
    connectToRoom,
    disconnectFromRoom,
    toggleMute,
    toggleVideo,
    isConnecting,
    isConnected,
    isMuted,
    isVideoOff,
    participants,
    localVideoRef,
    remoteVideoRef,
  } = useTwilioVideo({ appointmentId, userName, userRole });

  useEffect(() => {
    if (appointmentId) {
      connectToRoom();
      loadExistingNotes();
    }
  }, [appointmentId]);

  const loadExistingNotes = async () => {
    if (!appointmentId || !user) return;
    
    try {
      const { data, error } = await supabase
        .from('appointment_notes')
        .select('*')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setDoctorNotes(data.notes || '');
        setMedicines(data.medicines_prescribed || '');
        setFollowUpDate(data.follow_up_date || '');
      }
      setNotesLoaded(true);
    } catch (error: any) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async () => {
    if (!appointmentId || !user || userRole !== 'doctor') return;
    
    setIsSaving(true);
    try {
      // Get appointment details to find patient_id
      const { data: appointment, error: aptError } = await supabase
        .from('appointments')
        .select('patient_id, doctor_id')
        .eq('id', appointmentId)
        .single();

      if (aptError) throw aptError;

      // Check if notes already exist
      const { data: existing } = await supabase
        .from('appointment_notes')
        .select('id')
        .eq('appointment_id', appointmentId)
        .maybeSingle();

      const noteData = {
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        doctor_id: user.id,
        notes: doctorNotes,
        medicines_prescribed: medicines,
        follow_up_date: followUpDate || null,
      };

      let error;
      if (existing) {
        // Update existing notes
        ({ error } = await supabase
          .from('appointment_notes')
          .update(noteData)
          .eq('id', existing.id));
      } else {
        // Insert new notes
        ({ error } = await supabase
          .from('appointment_notes')
          .insert(noteData));
      }

      if (error) throw error;

      toast({
        title: 'Notes Saved',
        description: 'Consultation notes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEndCall = () => {
    disconnectFromRoom();
    navigate(userRole === 'doctor' ? '/doctor/view-appointments' : '/appointments');
  };

  return (
    <DashboardLayout title={`Video Call with ${displayName}`}>
      <div className="max-w-7xl">
        <Button 
          variant="ghost" 
          onClick={handleEndCall} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isConnecting && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Connecting to video call...</span>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Remote Video */}
            <Card className="shadow-medium overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20">
                <div 
                  ref={remoteVideoRef} 
                  className="h-full w-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
                >
                  {!isConnected || participants.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary text-white text-4xl font-bold mb-4">
                          {displayName[0]}
                        </div>
                        <p className="text-lg font-semibold">{displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {participants.length === 0 ? 'Waiting to join...' : ''}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
                
                {/* Local Video (Picture-in-Picture) */}
                <Card className="absolute bottom-4 right-4 w-48 aspect-video shadow-medium overflow-hidden">
                  <div 
                    ref={localVideoRef}
                    className="h-full w-full bg-gradient-to-br from-accent/20 to-primary/20 [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
                  >
                    {!isConnected && (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-sm font-medium">You</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </Card>

            {/* Controls */}
            <Card className="shadow-soft">
              <CardContent className="flex items-center justify-center gap-4 p-6">
                <Button
                  size="lg"
                  variant={isMuted ? 'destructive' : 'secondary'}
                  onClick={toggleMute}
                  disabled={!isConnected}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  size="lg"
                  variant={isVideoOff ? 'destructive' : 'secondary'}
                  onClick={toggleVideo}
                  disabled={!isConnected}
                  aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={handleEndCall}
                  aria-label="End call"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Consultation Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reports">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="reports">
                      <FileText className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="notes">
                      <ClipboardList className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="prescription">
                      <Pill className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reports" className="space-y-2">
                    <p className="text-sm font-medium mb-2">Medical Reports</p>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        Blood Test Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        ECG Report
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-2">Doctor's Notes</Label>
                      <Textarea
                        placeholder={userRole === 'doctor' ? "Write consultation notes here..." : "Doctor will add notes here..."}
                        rows={6}
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        disabled={userRole !== 'doctor'}
                        className="resize-none mt-2"
                      />
                    </div>
                    {userRole === 'doctor' && (
                      <Button 
                        onClick={saveNotes} 
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Notes
                          </>
                        )}
                      </Button>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="prescription" className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-2">Medicines Prescribed</Label>
                      <Textarea
                        placeholder={userRole === 'doctor' ? "List medicines and dosage..." : "Prescription will be shared after consultation"}
                        rows={4}
                        value={medicines}
                        onChange={(e) => setMedicines(e.target.value)}
                        disabled={userRole !== 'doctor'}
                        className="resize-none mt-2"
                      />
                    </div>
                    {userRole === 'doctor' && (
                      <>
                        <div>
                          <Label className="text-sm font-medium mb-2">Follow-up Date</Label>
                          <Input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <Button 
                          onClick={saveNotes} 
                          disabled={isSaving}
                          className="w-full"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Prescription
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoCall;
