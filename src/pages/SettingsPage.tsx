import { useState, useEffect } from 'react';
import { 
  Save, 
  TestTube, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RotateCcw,
  Settings as SettingsIcon,
  Monitor,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner@2.0.3';
import { settingsService } from '../services/settingsService';

interface ConnectionStatus {
  status: 'testing' | 'success' | 'error' | 'idle';
  message: string;
  responseTime?: number;
}

export const SettingsPage = () => {
  const [settings, setSettings] = useState(settingsService.getSettings());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'idle',
    message: 'Cliquez sur "Tester la connexion" pour vérifier'
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSettingChange = (key: string, value: any) => {
    const keys = key.split('.');
    const newSettings = { ...settings };
    
    if (keys.length === 2) {
      (newSettings as any)[keys[0]][keys[1]] = value;
    } else {
      (newSettings as any)[key] = value;
    }
    
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    try {
      settingsService.saveSettings(settings);
      setHasUnsavedChanges(false);
      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres');
      console.error('Erreur sauvegarde:', error);
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
        toast.error(`Échec de la connexion: ${result.message}`);
      }
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Erreur lors du test de connexion'
      });
      toast.error('Erreur lors du test de connexion');
    }
  };

  const handleResetSettings = () => {
    const defaultSettings = settingsService.resetToDefaults();
    setSettings(defaultSettings);
    setHasUnsavedChanges(false);
    setConnectionStatus({
      status: 'idle',
      message: 'Cliquez sur "Tester la connexion" pour vérifier'
    });
    toast.success('Paramètres réinitialisés aux valeurs par défaut');
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
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold">Paramètres</h1>
            <p className="text-gray-600">Configuration de l'application CAMGAZ-TECH</p>
          </div>
        </div>
        
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Modifications non sauvegardées
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration API */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Configuration API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="api-timeout">Timeout (ms)</Label>
              <Input
                id="api-timeout"
                type="number"
                value={settings.api.timeout}
                onChange={(e) => handleSettingChange('api.timeout', parseInt(e.target.value))}
                placeholder="10000"
              />
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>URL complète:</strong> {settings.api.baseUrl}:{settings.api.port}
            </div>

            <Separator />

            {/* Statut de connexion */}
            <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className="font-medium">Statut de connexion</span>
                </div>
                {connectionStatus.responseTime && (
                  <Badge variant="outline">{connectionStatus.responseTime}ms</Badge>
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
          </CardContent>
        </Card>

        {/* Préférences Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Préférences Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Thème</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value) => handleSettingChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="w-4 h-4 mr-2" />
                      Clair
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="w-4 h-4 mr-2" />
                      Sombre
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Système
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Langue</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value) => handleSettingChange('language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Notifications</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Alertes de stock</Label>
                  <p className="text-sm text-gray-600">Notifications pour les stocks critiques</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Rappels de maintenance</Label>
                  <p className="text-sm text-gray-600">Notifications pour les maintenances à venir</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle>Informations système</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label>Version de l'application</Label>
              <p className="text-gray-600">1.0.0</p>
            </div>
            <div>
              <Label>Dernière sauvegarde</Label>
              <p className="text-gray-600">
                {localStorage.getItem('camgaz_settings') ? 'Configuré' : 'Paramètres par défaut'}
              </p>
            </div>
            <div>
              <Label>Navigateur</Label>
              <p className="text-gray-600">{navigator.userAgent.split(' ')[0]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <Button 
          variant="outline" 
          onClick={handleResetSettings}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>

        <Button 
          onClick={handleSaveSettings}
          disabled={!hasUnsavedChanges}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
};