import { ReactNode } from 'react';

interface InfoItemProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  highlight?: boolean;
}

export const InfoItem = ({ label, value, icon, highlight }: InfoItemProps) => (
  <div className={`p-3 rounded-lg ${highlight ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
    <div className="font-medium text-gray-900">{value}</div>
  </div>
);

interface InfoGridProps {
  children: ReactNode;
  columns?: number;
  className?: string;
}

export const InfoGrid = ({ children, columns = 2, className = "" }: InfoGridProps) => (
  <div 
    className={`grid gap-3 ${columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} ${className}`}
  >
    {children}
  </div>
);