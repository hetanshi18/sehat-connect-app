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
      const fileType = ['pdf'].includes(fileExt || '') ? 'pdf' : 'image';
      
      try {
        // Read file as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1]; // Remove data:image/png;base64, prefix
            resolve(base64Data);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        
        const fileData = await base64Promise;
        
        // Call Python backend directly
        const backendUrl = import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/process-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_data: fileData,
            file_type: fileType
          })
        });

        if (!response.ok) {
          throw new Error('Analysis failed');
        }

        const analysisData = await response.json();

        if (analysisData?.analysis) {
          // Update the record with analysis
          await supabase
            .from('health_records')
            .update({ report: analysisData.analysis })
            .eq('id', recordId);

          setAnalysis(analysisData.analysis);
          setShowAnalysis(true);
        }
      } catch (error) {
        console.error('Analysis error:', error);
        toast({ 
          title: t('common.warning') || 'Warning', 
          description: 'Document uploaded but analysis failed. You can try again later.',
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
