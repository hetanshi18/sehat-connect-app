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
import { HealthDocumentUpload } from '@/components/HealthDocumentUpload';
import { useLanguage } from '@/contexts/LanguageContext';

const Symptoms = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backendResults, setBackendResults] = useState<any>(null);

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
      toast({ title: t('common.error'), description: t('symptoms.selectOne'), variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const selectedSymptomNames = mockSymptoms
        .filter(s => selectedSymptoms.includes(s.id))
        .map(s => s.name);
      
      const symptomText = selectedSymptomNames.join(', ') + (additionalNotes ? `. ${additionalNotes}` : '');

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: symptomText }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction from backend');
      }

      const data = await response.json();
      setBackendResults(data);
      setShowReport(true);
      toast({ title: t('common.success'), description: t('symptoms.analysisComplete') });
    } catch (error) {
      console.error('Error:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to connect to backend. Make sure the Flask server is running on port 8000.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const selectedSymptomNames = mockSymptoms.filter(s => selectedSymptoms.includes(s.id)).map(s => s.name);
    const reportContent = `
SYMPTOM ANALYSIS REPORT
Generated on ${new Date().toLocaleDateString()}

REPORTED SYMPTOMS:
${selectedSymptomNames.map(name => `• ${name}`).join('\n')}

${additionalNotes ? `ADDITIONAL NOTES:\n${additionalNotes}\n\n` : ''}
PRELIMINARY ADVICE:
Based on your symptoms, we recommend:
• Rest and stay hydrated
• Monitor temperature if fever persists
• Consult a doctor if symptoms worsen
• Avoid self-medication without professional advice

This is a preliminary report. Please consult with a healthcare professional for proper diagnosis and treatment.
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
    toast({ title: 'Success', description: 'Report downloaded successfully' });
  };

  if (showReport) {
    const selectedSymptomNames = mockSymptoms.filter(s => selectedSymptoms.includes(s.id)).map(s => s.name);
    
    return (
      <DashboardLayout title={t('symptoms.reportTitle')}>
        <div className="max-w-2xl">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('dashboard.backToDashboard')}
          </Button>
          
          <Card className="shadow-medium">
            <CardHeader className="bg-gradient-primary text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('symptoms.reportTitle')}
              </CardTitle>
              <CardDescription className="text-white/80">
                Generated on {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-semibold mb-2">{t('symptoms.reportedSymptoms')}:</h3>
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

              {backendResults?.medicines?.length > 0 && (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border-l-4 border-green-600">
                  <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-900 dark:text-green-100">
                    💊 Recommended Medicines
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {backendResults.medicines.map((med: string, idx: number) => (
                      <li key={idx} className="text-green-800 dark:text-green-200">• {med}</li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-700 dark:text-green-300 font-semibold">
                      ⚠️ DISCLAIMER: Medicines are for symptom relief only. Not a cure. We are not liable—consult a doctor.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
                <h3 className="font-semibold text-accent mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Important Notice
                </h3>
                <p className="text-sm text-foreground">
                  <ul className="list-disc list-inside space-y-1">
                    <li>This is a preliminary AI-based analysis</li>
                    <li>Always consult a healthcare professional for proper diagnosis</li>
                    <li>Do not self-medicate without professional advice</li>
                    <li>Seek immediate medical attention if symptoms worsen</li>
                  </ul>
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button onClick={handleDownloadReport} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                <div className="flex gap-3">
                  <Button onClick={() => navigate('/consult')} className="flex-1">
                    Book Consultation
                  </Button>
                  <Button variant="outline" onClick={() => setShowReport(false)} className="flex-1">
                    Record New Symptoms
                  </Button>
                </div>
              </div>
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
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze Symptoms'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <HealthDocumentUpload />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Symptoms;
