import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Separator } from './separator';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const FormSection = ({ title, description, children, icon }: FormSectionProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-4 pl-6 border-l-2 border-purple-100">
      {children}
    </div>
  </div>
);

interface EnhancedFormProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
}

export const EnhancedForm = ({ title, subtitle, children, actions, loading }: EnhancedFormProps) => (
  <Card className="max-w-4xl mx-auto">
    <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
      <CardTitle className="text-xl">{title}</CardTitle>
      {subtitle && (
        <p className="text-muted-foreground">{subtitle}</p>
      )}
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        children
      )}
      {actions && (
        <>
          <Separator />
          <div className="flex justify-end gap-3">
            {actions}
          </div>
        </>
      )}
    </CardContent>
  </Card>
);