import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface HealthDocumentUploadProps {
  onUploadComplete?: () => void;
}

export const HealthDocumentUpload = ({ onUploadComplete }: HealthDocumentUploadProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);

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
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
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
      const { error: dbError } = await supabase
        .from('health_records')
        .insert({
          patient_id: user.id,
          title,
          type: 'report',
          file_url: publicUrl
        });

      if (dbError) throw dbError;

      toast({ title: t('common.success'), description: t('healthDocument.success') });
      setTitle('');
      setFile(null);
      if (onUploadComplete) onUploadComplete();
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
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
          disabled={uploading || !file || !title}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('healthDocument.uploading')}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {t('healthDocument.uploadButton')}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
