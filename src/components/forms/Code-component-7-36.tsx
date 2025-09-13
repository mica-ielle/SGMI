import { useState } from 'react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Card, CardContent } from '../ui/card';
import { Clock, Settings, Calendar, Timer } from 'lucide-react';
import type { Frequence, FrequenceStandard, UniteFrequence } from '../../types';

interface FrequenceSelectorProps {
  value: Frequence;
  onChange: (frequence: Frequence) => void;
  label?: string;
  error?: string;
}

const FREQUENCES_STANDARD = [
  { value: 'MENSUELLE', label: 'Mensuelle', description: 'Tous les mois' },
  { value: 'BIMENSUELLE', label: 'Bimensuelle', description: 'Tous les 2 mois' },
  { value: 'TRIMESTRIELLE', label: 'Trimestrielle', description: 'Tous les 3 mois' },
  { value: 'SEMESTRIELLE', label: 'Semestrielle', description: 'Tous les 6 mois' },
  { value: 'ANNUELLE', label: 'Annuelle', description: 'Tous les ans' },
  { value: 'CINQ_ANS', label: 'Quinquennale', description: 'Tous les 5 ans' },
  { value: 'DIX_ANS', label: 'Décennale', description: 'Tous les 10 ans' }
];

const UNITES_FREQUENCE = [
  { value: 'JOURS', label: 'Jour(s)', icon: '📅' },
  { value: 'SEMAINES', label: 'Semaine(s)', icon: '🗓️' },
  { value: 'MOIS', label: 'Mois', icon: '🗓️' },
  { value: 'ANNEES', label: 'Année(s)', icon: '📆' },
  { value: 'HEURES_UTILISATION', label: 'Heures d\'utilisation', icon: '⏱️' }
];

export const FrequenceSelector = ({ value, onChange, label = "Fréquence", error }: FrequenceSelectorProps) => {
  const [mode, setMode] = useState<'standard' | 'personnalisee' | 'heures'>(
    value.frequenceStandard ? 'standard' : 
    value.valeurPersonnalisee ? 'personnalisee' : 
    value.heuresTotales ? 'heures' : 'standard'
  );

  const handleModeChange = (newMode: string) => {
    setMode(newMode as 'standard' | 'personnalisee' | 'heures');
    
    // Reset values when changing mode
    const newFrequence: Frequence = {};
    onChange(newFrequence);
  };

  const handleStandardChange = (frequenceStandard: FrequenceStandard) => {
    onChange({
      frequenceStandard,
      valeurPersonnalisee: undefined,
      unitePersonnalisee: undefined,
      heuresTotales: undefined,
      heuresMoyennesParJour: undefined
    });
  };

  const handlePersonnaliseeChange = (field: string, newValue: any) => {
    onChange({
      ...value,
      frequenceStandard: undefined,
      [field]: newValue
    });
  };

  const handleHeuresChange = (field: string, newValue: number) => {
    onChange({
      ...value,
      frequenceStandard: undefined,
      valeurPersonnalisee: undefined,
      unitePersonnalisee: undefined,
      [field]: newValue
    });
  };

  const getFrequencePreview = () => {
    if (value.frequenceStandard) {
      const freq = FREQUENCES_STANDARD.find(f => f.value === value.frequenceStandard);
      return freq?.description || '';
    }
    if (value.valeurPersonnalisee && value.unitePersonnalisee) {
      const unite = UNITES_FREQUENCE.find(u => u.value === value.unitePersonnalisee);
      return `Tous les ${value.valeurPersonnalisee} ${unite?.label.toLowerCase()}`;
    }
    if (value.heuresTotales) {
      return `Toutes les ${value.heuresTotales} heures d'utilisation`;
    }
    return 'Non définie';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <Label className="font-medium">{label}</Label>
      </div>

      {/* Mode selector */}
      <RadioGroup value={mode} onValueChange={handleModeChange} className="grid grid-cols-3 gap-3">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="standard" id="standard" />
          <Label htmlFor="standard" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Standard
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="personnalisee" id="personnalisee" />
          <Label htmlFor="personnalisee" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Personnalisée
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="heures" id="heures" />
          <Label htmlFor="heures" className="cursor-pointer">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Par heures
            </div>
          </Label>
        </div>
      </RadioGroup>

      {/* Configuration based on mode */}
      <Card>
        <CardContent className="p-4">
          {mode === 'standard' && (
            <div className="space-y-3">
              <Label>Fréquence prédéfinie</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {FREQUENCES_STANDARD.map((freq) => (
                  <div
                    key={freq.value}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      value.frequenceStandard === freq.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleStandardChange(freq.value as FrequenceStandard)}
                  >
                    <div className="font-medium text-sm">{freq.label}</div>
                    <div className="text-xs text-muted-foreground">{freq.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === 'personnalisee' && (
            <div className="space-y-4">
              <Label>Configuration personnalisée</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Valeur</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 15"
                    value={value.valeurPersonnalisee || ''}
                    onChange={(e) => handlePersonnaliseeChange('valeurPersonnalisee', parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Unité</Label>
                  <Select
                    value={value.unitePersonnalisee}
                    onValueChange={(val) => handlePersonnaliseeChange('unitePersonnalisee', val as UniteFrequence)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITES_FREQUENCE.map((unite) => (
                        <SelectItem key={unite.value} value={unite.value}>
                          <div className="flex items-center gap-2">
                            <span>{unite.icon}</span>
                            {unite.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {mode === 'heures' && (
            <div className="space-y-4">
              <Label>Basé sur les heures d'utilisation</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Heures totales</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 100"
                    value={value.heuresTotales || ''}
                    onChange={(e) => handleHeuresChange('heuresTotales', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Heures moy./jour</Label>
                  <Input
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Ex: 8"
                    value={value.heuresMoyennesParJour || ''}
                    onChange={(e) => handleHeuresChange('heuresMoyennesParJour', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                ℹ️ La maintenance sera déclenchée toutes les {value.heuresTotales || 0} heures d'utilisation
                {value.heuresMoyennesParJour && value.heuresTotales && (
                  <span> (environ tous les {Math.round(value.heuresTotales / value.heuresMoyennesParJour)} jours)</span>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Aperçu</Badge>
              <span className="text-sm font-medium">{getFrequencePreview()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};