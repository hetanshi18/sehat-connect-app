import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Star, Calendar, MessageSquare, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Consult = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Real-time subscription for slot changes
  useEffect(() => {
    if (!selectedDoctor) return;

    const channel = supabase
      .channel('time-slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_slots',
          filter: `doctor_id=eq.${selectedDoctor}`
        },
        () => {
          fetchTimeSlots(selectedDoctor);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors_info')
        .select(`
          user_id,
          specialty,
          experience,
          qualification,
          clinic_address,
          about,
          achievements,
          profiles!user_id (
            id,
            name,
            email,
            phone
          )
        `);

      if (error) throw error;
      setDoctors(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (doctorId: string) => {
    try {
      // Fetch all slots to show availability status
      const { data: slots, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day', { ascending: true });

      if (error) throw error;
      setTimeSlots(slots || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot || !user || !selectedDoctor) {
      toast({ title: 'Error', description: 'Please select a time slot', variant: 'destructive' });
      return;
    }

    // Validate that doctor exists and patient has a profile
    if (!user.id || !selectedDoctor) {
      toast({ title: 'Error', description: 'Invalid user or doctor information', variant: 'destructive' });
      return;
    }

    try {
      // Create appointment with pending status
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          doctor_id: selectedDoctor,
          slot_id: selectedSlot.id,
          date: selectedSlot.day,
          time: `${selectedSlot.start_time} - ${selectedSlot.end_time}`,
          status: 'pending'
        });

      if (appointmentError) throw appointmentError;

      // Mark slot as pending with patient_id
      const { error: slotError } = await supabase
        .from('time_slots')
        .update({ 
          status: 'pending',
          patient_id: user.id,
          is_available: false 
        })
        .eq('id', selectedSlot.id);

      if (slotError) throw slotError;

      toast({ title: 'Success', description: 'Booking request sent! Waiting for doctor approval.' });
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Book Doctor Consultation">
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {loading ? (
          <p className="text-center py-8">Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <p className="text-center py-8">No doctors available</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor.user_id} className="shadow-soft hover:shadow-medium transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-white text-2xl font-bold">
                      {doctor.profiles?.name?.[0] || 'D'}
                    </div>
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-semibold">4.8</span>
                    </div>
                  </div>
                  <CardTitle className="mt-3">{doctor.profiles?.name || 'Doctor'}</CardTitle>
                  <CardDescription>
                    <div className="space-y-1">
                      <p className="font-medium">{doctor.specialty} • {doctor.experience} years</p>
                      <p className="text-xs">{doctor.qualification}</p>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.about && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{doctor.about}</p>
                  )}
                  {doctor.clinic_address && (
                    <p className="text-xs text-muted-foreground">📍 {doctor.clinic_address}</p>
                  )}
                
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedDoctor(doctor.user_id);
                          setSelectedSlot(null);
                          fetchTimeSlots(doctor.user_id);
                        }}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book Appointment
                      </Button>
                    </DialogTrigger>
                    {selectedDoctor === doctor.user_id && (
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>{doctor.profiles?.name || 'Doctor'}</DialogTitle>
                          <DialogDescription>{doctor.specialty}</DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-3 font-semibold">Available Slots</h4>
                            {timeSlots.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-4 text-center">
                                No slots available
                              </p>
                            ) : (
                              <div className="grid gap-2 max-h-64 overflow-y-auto">
                                {timeSlots.map((slot) => {
                                  const isAvailable = slot.status === 'available';
                                  const isPendingForOther = slot.status === 'pending' && slot.patient_id !== user?.id;
                                  const isPendingForMe = slot.status === 'pending' && slot.patient_id === user?.id;
                                  const isBooked = slot.status === 'booked';
                                  
                                  return (
                                    <Button
                                      key={slot.id}
                                      variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                                      className={`justify-start w-full ${
                                        isPendingForOther || isBooked
                                          ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                                          : ''
                                      } ${isPendingForMe ? 'border-yellow-500 bg-yellow-50' : ''}`}
                                      onClick={() => isAvailable ? setSelectedSlot(slot) : null}
                                      disabled={isPendingForOther || isBooked}
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {slot.day} • {slot.start_time} - {slot.end_time}
                                      {isPendingForMe && <Badge className="ml-2 bg-yellow-500">Pending</Badge>}
                                      {isPendingForOther && <Badge className="ml-2" variant="secondary">Reserved</Badge>}
                                      {isBooked && <Badge className="ml-2" variant="secondary">Booked</Badge>}
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <Button 
                            onClick={handleBookSlot} 
                            className="w-full"
                            disabled={!selectedSlot}
                          >
                            Send Booking Request
                          </Button>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
              </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Consult;
