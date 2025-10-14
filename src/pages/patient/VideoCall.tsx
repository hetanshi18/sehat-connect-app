import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff, FileText, ClipboardList, Pill } from 'lucide-react';
import { mockDoctors } from '@/lib/mockData';

const VideoCall = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const doctor = mockDoctors.find(d => d.id === doctorId);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <DashboardLayout title={`Video Call with ${doctor?.name || 'Doctor'}`}>
      <div className="max-w-7xl">
        <Button variant="ghost" onClick={() => navigate('/consult')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Consultations
        </Button>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Remote Video */}
            <Card className="shadow-medium overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary text-white text-4xl font-bold mb-4">
                    {doctor?.name.split(' ')[1][0]}
                  </div>
                  <p className="text-lg font-semibold">{doctor?.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor?.specialty}</p>
                </div>
                
                {/* Local Video (Picture-in-Picture) */}
                <Card className="absolute bottom-4 right-4 w-48 aspect-video shadow-medium overflow-hidden">
                  <div className="h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <p className="text-sm font-medium">You</p>
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
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  size="lg"
                  variant={isVideoOff ? 'destructive' : 'secondary'}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  aria-label={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={() => navigate('/consult')}
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
                      <p className="text-sm font-medium mb-2">Doctor's Notes</p>
                      <Textarea
                        placeholder="Doctor will add notes here..."
                        rows={6}
                        disabled
                        className="resize-none"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="prescription" className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Prescription</p>
                      <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                        Prescription will be shared after consultation
                      </div>
                    </div>
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
