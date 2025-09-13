import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Eye, Edit, Download, Trash2 } from 'lucide-react';

interface DetailCardProps {
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  badge?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    color?: string;
  };
  actions?: {
    view?: () => void;
    edit?: () => void;
    download?: () => void;
    delete?: () => void;
  };
  children: ReactNode;
  className?: string;
  gradient?: boolean;
}

export const DetailCard = ({ 
  title, 
  subtitle, 
  status, 
  badge,
  actions, 
  children, 
  className = "",
  gradient = false 
}: DetailCardProps) => {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${gradient ? 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200' : ''} ${className}`}>
      {gradient && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16"></div>
      )}
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {title}
              {badge && (
                <Badge 
                  variant={badge.variant}
                  className={badge.color ? `bg-${badge.color}-100 text-${badge.color}-700 border-${badge.color}-200` : ''}
                >
                  {badge.label}
                </Badge>
              )}
            </CardTitle>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
            {status && (
              <Badge variant={status.variant} className="mt-2">
                {status.label}
              </Badge>
            )}
          </div>
          
          {actions && (
            <div className="flex items-center gap-1 ml-4">
              {actions.view && (
                <Button variant="ghost" size="sm" onClick={actions.view}>
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {actions.edit && (
                <Button variant="ghost" size="sm" onClick={actions.edit}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {actions.download && (
                <Button variant="ghost" size="sm" onClick={actions.download}>
                  <Download className="w-4 h-4" />
                </Button>
              )}
              {actions.delete && (
                <Button variant="ghost" size="sm" onClick={actions.delete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        {children}
      </CardContent>
    </Card>
  );
};