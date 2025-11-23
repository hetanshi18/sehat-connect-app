import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Pill, StickyNote, CalendarCheck } from 'lucide-react';

interface ConsultationNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: {
    date: string;
    time: string;
    doctorName: string;
  };
  notes: {
    notes?: string;
    medicines_prescribed?: string;
    follow_up_date?: string;
  } | null;
}

export const ConsultationNotesDialog = ({ open, onOpenChange, appointment, notes }: ConsultationNotesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Consultation Notes</DialogTitle>
          <DialogDescription>
            Review your consultation details and prescription
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground">Appointment Details</h3>
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="font-normal">
                  <Calendar className="h-3 w-3 mr-1" />
                  {appointment.date}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  <Clock className="h-3 w-3 mr-1" />
                  {appointment.time}
                </Badge>
              </div>
              <p className="text-sm">
                <span className="font-medium">Doctor:</span> Dr. {appointment.doctorName}
              </p>
            </div>
          </div>

          {/* Doctor's Notes */}
          {notes?.notes ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Doctor's Notes</h3>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="text-sm whitespace-pre-wrap">{notes.notes}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
              <StickyNote className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No consultation notes available</p>
            </div>
          )}

          {/* Prescribed Medicines */}
          {notes?.medicines_prescribed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold">Prescribed Medicines</h3>
              </div>
              <div className="rounded-lg border bg-secondary/5 p-4">
                <p className="text-sm whitespace-pre-wrap">{notes.medicines_prescribed}</p>
              </div>
            </div>
          ) : null}

          {/* Follow-up Date */}
          {notes?.follow_up_date ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Follow-up Date</h3>
              </div>
              <div className="rounded-lg border bg-accent/5 p-4">
                <p className="text-sm font-medium">
                  {new Date(notes.follow_up_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ) : null}

          {!notes?.notes && !notes?.medicines_prescribed && !notes?.follow_up_date && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No notes or prescription available for this consultation.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
