import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Clock } from 'lucide-react';
import { mockDoctors } from '@/lib/mockData';
import { TimeSlot } from '@/types';
import { toast } from '@/hooks/use-toast';

const ManageSlots = () => {
  const navigate = useNavigate();
  const doctor = mockDoctors[0]; // Current doctor
  
  const [slots, setSlots] = useState<TimeSlot[]>(doctor.availableSlots || []);
  const [newSlot, setNewSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const slot: TimeSlot = {
      id: `slot-${Date.now()}`,
      day: newSlot.day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isBooked: false,
    };

    setSlots([...slots, slot]);
    setNewSlot({ day: '', startTime: '', endTime: '' });
    toast({ title: 'Success', description: 'Slot added successfully' });
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId));
    toast({ title: 'Success', description: 'Slot removed' });
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <DashboardLayout title="Manage Availability Slots">
      <div className="max-w-5xl">
        <Button variant="ghost" onClick={() => navigate('/doctor/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Add New Slot */}
        <Card className="mb-6 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Time Slot
            </CardTitle>
            <CardDescription>Set your availability for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select value={newSlot.day} onValueChange={(value) => setNewSlot({ ...newSlot, day: value })}>
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleAddSlot} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slot
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Slots */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Your Availability Schedule
            </CardTitle>
            <CardDescription>Manage your weekly time slots</CardDescription>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No slots added yet. Add your first availability slot above.</p>
            ) : (
              <div className="space-y-6">
                {daysOfWeek.map(day => {
                  const daySlots = groupedSlots[day];
                  if (!daySlots) return null;
                  
                  return (
                    <div key={day}>
                      <h3 className="font-semibold mb-3 text-primary">{day}</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        {daySlots.map(slot => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{slot.startTime} - {slot.endTime}</p>
                                {slot.isBooked && slot.patientId && (
                                  <p className="text-xs text-muted-foreground">Booked</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {slot.isBooked ? (
                                <Badge variant="secondary">Booked</Badge>
                              ) : (
                                <Badge className="bg-secondary">Available</Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSlot(slot.id)}
                                disabled={slot.isBooked}
                                aria-label="Delete slot"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageSlots;
