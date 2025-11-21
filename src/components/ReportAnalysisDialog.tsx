import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ReportAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: string;
  title: string;
}

export const ReportAnalysisDialog = ({ open, onOpenChange, analysis, title }: ReportAnalysisDialogProps) => {
  const { t } = useLanguage();

  const handleDownload = () => {
    const blob = new Blob([analysis], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}-analysis.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {t('healthDocument.analysisDescription') || 'AI-powered analysis of your medical report'}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {analysis.split('\n').map((line, index) => {
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-primary">
                    {line.replace(/\*\*/g, '')}
                  </h3>
                );
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={index} className="ml-4 mb-1">
                    {line.substring(2)}
                  </li>
                );
              }
              if (line.trim() === '') {
                return <br key={index} />;
              }
              return <p key={index} className="mb-2">{line}</p>;
            })}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {t('common.download') || 'Download'}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {t('common.close') || 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
