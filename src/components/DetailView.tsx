import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { X, Edit, Download, Share, FileText } from 'lucide-react';

interface DetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  };
  actions?: {
    edit?: () => void;
    download?: () => void;
    share?: () => void;
    print?: () => void;
  };
  children: ReactNode;
}

export const DetailView = ({ 
  open, 
  onOpenChange, 
  title, 
  subtitle, 
  status, 
  actions, 
  children 
}: DetailViewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl flex items-center gap-3">
                {title}
                {status && (
                  <Badge 
                    variant={status.variant}
                    className={status.color ? `bg-${status.color}-100 text-${status.color}-700 border-${status.color}-200` : ''}
                  >
                    {status.label}
                  </Badge>
                )}
              </DialogTitle>
              {subtitle && (
                <p className="text-muted-foreground mt-2">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {actions?.print && (
                <Button variant="ghost" size="sm" onClick={actions.print}>
                  <FileText className="w-4 h-4" />
                </Button>
              )}
              {actions?.share && (
                <Button variant="ghost" size="sm" onClick={actions.share}>
                  <Share className="w-4 h-4" />
                </Button>
              )}
              {actions?.download && (
                <Button variant="ghost" size="sm" onClick={actions.download}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {actions?.edit && (
                <Button variant="ghost" size="sm" onClick={actions.edit}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <Separator className="flex-shrink-0" />
        
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};