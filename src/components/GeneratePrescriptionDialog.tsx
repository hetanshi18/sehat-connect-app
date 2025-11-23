import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, FileText, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface GeneratePrescriptionDialogProps {
  appointmentId: string;
  onSuccess?: () => void;
}

export const GeneratePrescriptionDialog = ({ appointmentId, onSuccess }: GeneratePrescriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleGenerate = async () => {
    // Validate
    if (!diagnosis.trim()) {
      toast({ title: 'Error', description: 'Please enter a diagnosis', variant: 'destructive' });
      return;
    }

    const validMedicines = medicines.filter(m => m.name.trim());
    if (validMedicines.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one medicine', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prescription', {
        body: {
          appointmentId,
          diagnosis,
          medicines: validMedicines,
        },
      });

      if (error) throw error;

      setGeneratedUrl(data.downloadUrl);
      toast({
        title: 'Success',
        description: 'Prescription generated successfully!',
      });
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error generating prescription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate prescription',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDiagnosis('');
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setGeneratedUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) handleClose();
    }}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          Generate Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Prescription</DialogTitle>
          <DialogDescription>
            Create a valid medical prescription with your e-signature
          </DialogDescription>
        </DialogHeader>

        {generatedUrl ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Prescription Generated Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  The prescription has been created and is ready for download
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => window.open(generatedUrl, '_blank')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Prescription
                  </Button>
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Textarea
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter patient's diagnosis..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Medicines *</Label>
                <Button size="sm" variant="outline" onClick={addMedicine} type="button">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </Button>
              </div>

              {medicines.map((medicine, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  {medicines.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => removeMedicine(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Medicine Name *</Label>
                      <Input
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                        placeholder="e.g., Paracetamol 500mg"
                      />
                    </div>
                    <div>
                      <Label>Dosage *</Label>
                      <Input
                        value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                        placeholder="e.g., 1 tablet"
                      />
                    </div>
                    <div>
                      <Label>Frequency *</Label>
                      <Input
                        value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                        placeholder="e.g., 3 times a day"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Duration *</Label>
                      <Input
                        value={medicine.duration}
                        onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                        placeholder="e.g., 5 days"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Prescription
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};