import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, X, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ReportAnalysisDialog } from './ReportAnalysisDialog';

interface HealthDocumentUploadProps {
  onUploadComplete?: () => void;
}

export const HealthDocumentUpload = ({ onUploadComplete }: HealthDocumentUploadProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !title) {
      toast({ title: t('common.error'), description: t('healthDocument.error'), variant: 'destructive' });
      return;
    }

    setUploading(true);
    let recordId = '';
    
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('health-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('health-documents')
        .getPublicUrl(fileName);

      // Create health record entry
      const { data: recordData, error: dbError } = await supabase
        .from('health_records')
        .insert({
          patient_id: user.id,
          title,
          type: 'report',
          file_url: publicUrl
        })
        .select()
        .single();

      if (dbError) throw dbError;
      recordId = recordData.id;

      toast({ title: t('common.success'), description: t('healthDocument.success') });
      
      // Process the document with AI using Python backend
      setAnalyzing(true);
      
      try {
        console.log('=== Starting AI Analysis ===');
        console.log('File details:', {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date(file.lastModified).toISOString()
        });
        
        const backendUrl = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000';
        console.log('Backend URL:', backendUrl);
        
        const formData = new FormData();
        formData.append('file', file);
        console.log('FormData created with file');
        
        console.log('Sending POST request to:', `${backendUrl}/ocr`);
        const startTime = Date.now();
        
        const response = await fetch(`${backendUrl}/ocr`, {
          method: 'POST',
          body: formData
        });
        
        const endTime = Date.now();
        console.log('Response received in:', endTime - startTime, 'ms');
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error body:', errorText);
          console.error('Full response details:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            type: response.type
          });
          throw new Error(`Analysis failed: ${response.status} - ${errorText}`);
        }

        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        let analysisData;
        try {
          analysisData = JSON.parse(responseText);
          console.log('Parsed analysis data:', analysisData);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Response text that failed to parse:', responseText);
          throw new Error('Failed to parse response JSON');
        }

        if (analysisData?.analysis) {
          console.log('Analysis successful, updating database record:', recordId);
          // Update the record with analysis
          const { error: updateError } = await supabase
            .from('health_records')
            .update({ report: analysisData.analysis })
            .eq('id', recordId);
          
          if (updateError) {
            console.error('Database update error:', updateError);
          } else {
            console.log('Database updated successfully');
          }

          setAnalysis(analysisData.analysis);
          setShowAnalysis(true);
          console.log('=== Analysis Complete ===');
        } else {
          console.warn('No analysis data in response:', analysisData);
        }
      } catch (error) {
        console.error('=== Analysis Error ===');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('Full error object:', error);
        
        toast({ 
          title: t('common.warning') || 'Warning', 
          description: 'Document uploaded but analysis failed. Check console for details.',
          variant: 'destructive' 
        });
      }

      setTitle('');
      setFile(null);
      if (onUploadComplete) onUploadComplete();
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>{t('healthDocument.upload')}</CardTitle>
        <CardDescription>{t('healthDocument.uploadDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('healthDocument.title')}</Label>
          <Input
            id="title"
            placeholder={t('healthDocument.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">{t('healthDocument.selectFile')}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              className="flex-1"
            />
            {file && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={uploading || analyzing || !file || !title}
          className="w-full"
        >
          {uploading || analyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {analyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('healthDocument.analyzing') || 'Analyzing with AI...'}
                </>
              ) : (
                t('healthDocument.uploading')
              )}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t('healthDocument.uploadButton')}
            </>
          )}
        </Button>
      </CardContent>

      <ReportAnalysisDialog
        open={showAnalysis}
        onOpenChange={setShowAnalysis}
        analysis={analysis}
        title={title || 'Medical Report'}
      />
    </Card>
  );
};
