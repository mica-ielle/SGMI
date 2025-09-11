import { useState, useEffect } from 'react';
import { 
  Settings, 
  TestTube, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Save
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { settingsService } from '../services/settingsService';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ConnectionStatus {
  status: 'testing' | 'success' | 'error' | 'idle';
  message: string;
  responseTime?: number;
}

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [settings, setSettings] = useState(settingsService.getSettings());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Cliquez sur "Tester" pour vérifier la connexion'
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (open) {
      setSettings(settingsService.getSettings());
      setHasChanges(false);
    }
  }, [open]);

  const handleSettingChange = (key: string, value: any) => {
    const keys = key.split('.');
    const newSettings = { ...settings };
    
    if (keys.length === 2) {
      (newSettings as any)[keys[0]][keys[1]] = value;
    } else {
      (newSettings as any)[key] = value;
    }
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    try {
      settingsService.saveSettings(settings);
      setHasChanges(false);
      toast.success('Paramètres sauvegardés');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleTestConnection = async () => {
    setConnectionStatus({ status: 'testing', message: 'Test en cours...' });
    
    try {
      const result = await settingsService.testConnection();
      
      setConnectionStatus({
        status: result.success ? 'success' : 'error',
        message: result.message,
        responseTime: result.responseTime
      });

      if (result.success) {
        toast.success(`Connexion réussie (${result.responseTime}ms)`);
      } else {
        toast.error(`Échec: ${result.message}`);
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Erreur lors du test'
      });
      toast.error('Erreur lors du test de connexion');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'testing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'testing': return 'bg-blue-50 border-blue-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuration API
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="api-url">URL de base</Label>
              <Input
                id="api-url"
                value={settings.api.baseUrl}
                onChange={(e) => handleSettingChange('api.baseUrl', e.target.value)}
                placeholder="http://localhost"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-port">Port</Label>
              <Input
                id="api-port"
                type="number"
                value={settings.api.port}
                onChange={(e) => handleSettingChange('api.port', parseInt(e.target.value))}
                placeholder="8421"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>URL complète:</strong> {settings.api.baseUrl}:{settings.api.port}
          </div>

          {/* Statut de connexion */}
          <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className="font-medium text-sm">Statut de connexion</span>
              </div>
              {connectionStatus.responseTime && (
                <Badge variant="outline" className="text-xs">{connectionStatus.responseTime}ms</Badge>
              )}
            </div>
            <p className="text-sm">{connectionStatus.message}</p>
          </div>

          <Button 
            onClick={handleTestConnection} 
            disabled={connectionStatus.status === 'testing'}
            className="w-full"
            variant="outline"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {connectionStatus.status === 'testing' ? 'Test en cours...' : 'Tester la connexion'}
          </Button>

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </Button>
          </div>

          <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
            <strong>Note :</strong> Vous devez avoir votre serveur Spring Boot en marche sur le port configuré pour que la connexion fonctionne.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};