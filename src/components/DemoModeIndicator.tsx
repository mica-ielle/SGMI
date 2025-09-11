import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { settingsService } from '../services/settingsService';

export const DemoModeIndicator = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'demo'>('checking');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const result = await settingsService.testConnection();
        setApiStatus(result.success ? 'connected' : 'demo');
      } catch {
        setApiStatus('demo');
      }
    };

    checkApiStatus();
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (apiStatus === 'checking') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {apiStatus === 'demo' ? (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 shadow-lg">
          <WifiOff className="w-3 h-3 mr-1" />
          Mode Démo - API non connectée
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 shadow-lg">
          <Wifi className="w-3 h-3 mr-1" />
          API Connectée
        </Badge>
      )}
    </div>
  );
};