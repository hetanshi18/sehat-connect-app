import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Star, Calendar, MessageSquare, Video } from 'lucide-react';
import { mockDoctors } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';

const Consult = () => {
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooked, setIsBooked] = useState(false);

  const handleBookSlot = () => {
    if (!selectedSlot) {
      toast({ title: 'Error', description: 'Please select a time slot', variant: 'destructive' });
      return;
    }
    setIsBooked(true);
    toast({ title: 'Success', description: 'Appointment booked successfully!' });
  };

  return (
    <DashboardLayout title="Book Doctor Consultation">
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockDoctors.map((doctor) => (
            <Card key={doctor.id} className="shadow-soft hover:shadow-medium transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-white text-2xl font-bold">
                    {doctor.name.split(' ')[1][0]}
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-semibold">4.8</span>
                  </div>
                </div>
                <CardTitle className="mt-3">{doctor.name}</CardTitle>
                <CardDescription>{doctor.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-medium">{doctor.experience} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Qualification</span>
                  <span className="font-medium">{doctor.qualification}</span>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedDoctor(doctor.id);
                        setSelectedSlot(null);
                        setIsBooked(false);
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  {selectedDoctor === doctor.id && (
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>{doctor.name}</DialogTitle>
                        <DialogDescription>{doctor.specialty}</DialogDescription>
                      </DialogHeader>
                      
                      {!isBooked ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-3 font-semibold">Available Slots</h4>
                            <div className="grid gap-2">
                              {doctor.availableSlots?.map((slot) => (
                                <Button
                                  key={slot.id}
                                  variant={selectedSlot === slot.id ? 'default' : 'outline'}
                                  className="justify-start"
                                  onClick={() => setSelectedSlot(slot.id)}
                                  disabled={slot.isBooked}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {slot.day} • {slot.startTime} - {slot.endTime}
                                  {slot.isBooked && (
                                    <Badge variant="secondary" className="ml-auto">Booked</Badge>
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                          <Button onClick={handleBookSlot} className="w-full">
                            Confirm Booking
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-lg bg-secondary/10 p-4 text-center">
                            <p className="font-semibold text-secondary">Appointment Confirmed!</p>
                            <p className="text-sm text-muted-foreground mt-1">You can now connect with your doctor</p>
                          </div>
                          <div className="grid gap-2">
                            <Button
                              onClick={() => navigate(`/consult/chat/${doctor.id}`)}
                              className="w-full"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Join Chat
                            </Button>
                            <Button
                              onClick={() => navigate(`/consult/call/${doctor.id}`)}
                              variant="secondary"
                              className="w-full"
                            >
                              <Video className="mr-2 h-4 w-4" />
                              Join Video Call
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  )}
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Consult;
