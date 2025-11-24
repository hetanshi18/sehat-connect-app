import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown, Eye } from 'lucide-react';
import { downloadPrescriptionAsPDF } from '@/lib/pdfUtils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PrescriptionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionId: string;
  patientName: string;
}

export default function PrescriptionViewDialog({ 
  open, 
  onOpenChange, 
  prescriptionId,
  patientName 
}: PrescriptionViewDialogProps) {
  const handleViewPrescription = async () => {
    try {
      const { data: rxData } = await supabase
        .from('prescriptions')
        .select('prescription_url')
        .eq('id', prescriptionId)
        .single();
      
      if (rxData?.prescription_url) {
        const response = await fetch(rxData.prescription_url);
        const htmlContent = await response.text();
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(htmlContent);
          newWindow.document.close();
        }
      }
    } catch (error: any) {
      console.error('Error viewing prescription:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prescription',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async () => {
    try {
      await downloadPrescriptionAsPDF(prescriptionId, patientName);
      toast({ title: 'Success', description: 'Prescription downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to download prescription', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>E-Prescription</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            View or download your prescription document
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleViewPrescription} className="w-full">
              <Eye className="mr-2 h-4 w-4" />
              View Prescription
            </Button>
            <Button onClick={handleDownload} variant="outline" className="w-full">
              <FileDown className="mr-2 h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
