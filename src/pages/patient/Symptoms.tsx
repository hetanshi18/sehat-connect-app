import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, AlertCircle, FileText, Download } from 'lucide-react';
import { mockSymptoms } from '@/lib/mockData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Symptoms = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one symptom', variant: 'destructive' });
      return;
    }
    
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    const selectedSymptomNames = mockSymptoms.filter(s => selectedSymptoms.includes(s.id)).map(s => s.name);
    
    const reportData = `Reported Symptoms:\n${selectedSymptomNames.join('\n')}\n\n${additionalNotes ? `Additional Notes:\n${additionalNotes}` : ''}`;
    const reliefMeasures = `Based on your symptoms, we recommend:\n- Rest and stay hydrated\n- Monitor temperature if fever persists\n- Consult a doctor if symptoms worsen\n- Avoid self-medication without professional advice`;

    try {
      const { data, error } = await supabase
        .from('health_records')
        .insert({
          patient_id: user.id,
          type: 'symptom_report',
          title: `Symptom Report - ${new Date().toLocaleDateString()}`,
          report: reportData,
          relief_measures: reliefMeasures,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentReportId(data.id);
      setShowReport(true);
      toast({ title: 'Success', description: 'Symptoms recorded successfully' });
    } catch (error) {
      console.error('Error saving symptom report:', error);
      toast({ title: 'Error', description: 'Failed to save symptom report', variant: 'destructive' });
    }
  };

  const downloadCurrentReport = () => {
    const selectedSymptomNames = mockSymptoms.filter(s => selectedSymptoms.includes(s.id)).map(s => s.name);
    const reportContent = `
SYMPTOM ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()}

Reported Symptoms:
${selectedSymptomNames.map(name => `- ${name}`).join('\n')}

${additionalNotes ? `Additional Notes:\n${additionalNotes}\n` : ''}

Preliminary Advice:
Based on your symptoms, we recommend:
- Rest and stay hydrated
- Monitor temperature if fever persists
- Consult a doctor if symptoms worsen
- Avoid self-medication without professional advice
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `symptom-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showReport) {
    const selectedSymptomNames = mockSymptoms.filter(s => selectedSymptoms.includes(s.id)).map(s => s.name);
    
    return (
      <DashboardLayout title="Temporary Medication Report">
        <div className="max-w-2xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <Card className="shadow-medium">
            <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Symptom Analysis Report
              </CardTitle>
              <CardDescription className="text-white/80">
                Generated on {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-semibold mb-2">Reported Symptoms:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {selectedSymptomNames.map(name => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
              
              {additionalNotes && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Notes:</h3>
                  <p className="text-muted-foreground">{additionalNotes}</p>
                </div>
              )}
              
              <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
                <h3 className="font-semibold text-accent mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Preliminary Advice
                </h3>
                <p className="text-sm text-foreground">
                  Based on your symptoms, we recommend:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Rest and stay hydrated</li>
                    <li>Monitor temperature if fever persists</li>
                    <li>Consult a doctor if symptoms worsen</li>
                    <li>Avoid self-medication without professional advice</li>
                  </ul>
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={downloadCurrentReport} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <Button onClick={() => navigate('/consult')} className="flex-1">
                  Book Consultation
                </Button>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowReport(false);
                  setSelectedSymptoms([]);
                  setAdditionalNotes('');
                }} 
                className="w-full"
              >
                Record New Symptoms
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const symptomCategories = [...new Set(mockSymptoms.map(s => s.category))];

  return (
    <DashboardLayout title="Record Symptoms">
      <div className="max-w-3xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>What are you experiencing?</CardTitle>
            <CardDescription>Select all symptoms that apply and provide additional details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {symptomCategories.map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-sm text-primary">{category}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mockSymptoms.filter(s => s.category === category).map(symptom => (
                      <div key={symptom.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom.id}
                          checked={selectedSymptoms.includes(symptom.id)}
                          onCheckedChange={() => handleSymptomToggle(symptom.id)}
                        />
                        <Label
                          htmlFor={symptom.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {symptom.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe how long you've had these symptoms, severity, or any other relevant information..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg">
                Record Symptoms
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Symptoms;
