import { useState } from 'react';
import { DetailView } from '../DetailView';
import { InfoGrid, InfoItem } from '../ui/info-grid';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Settings, 
  Calendar, 
  Package, 
  MapPin, 
  Clock, 
  User, 
  FileText,
  Wrench,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Equipement } from '../../types';

interface EquipementDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipement: Equipement | null;
  onEdit?: () => void;
  onGenerateReport?: () => void;
}

export const EquipementDetailView = ({ 
  open, 
  onOpenChange, 
  equipement, 
  onEdit,
  onGenerateReport 
}: EquipementDetailViewProps) => {
  if (!equipement) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MOTOPOMPE': return '⚙️';
      case 'BORNE_DE_DISTRIBUTION': return '⛽';
      case 'ARMOIRE_ELECTRIQUE': return '🔌';
      case 'CITERNE': return '🛢️';
      default: return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MOTOPOMPE': return 'blue';
      case 'BORNE_DE_DISTRIBUTION': return 'green';
      case 'ARMOIRE_ELECTRIQUE': return 'yellow';
      case 'CITERNE': return 'purple';
      default: return 'gray';
    }
  };

  const getFrequenceLabel = (tache: any) => {
    if (tache.frequence.frequenceStandard) {
      return tache.frequence.frequenceStandard.toLowerCase().replace('_', ' ');
    }
    if (tache.frequence.valeurPersonnalisee) {
      return `Tous les ${tache.frequence.valeurPersonnalisee} ${tache.frequence.unitePersonnalisee?.toLowerCase()}`;
    }
    return 'Non définie';
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'VISITE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ENTRETIEN': return 'bg-green-100 text-green-700 border-green-200';
      case 'PREVENTIF': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DetailView
      open={open}
      onOpenChange={onOpenChange}
      title={equipement.nom}
      subtitle={`${equipement.type.replace('_', ' ')} • Réf: ${equipement.reference}`}
      status={{
        label: equipement.type.replace('_', ' '),
        variant: 'outline',
        color: getTypeColor(equipement.type)
      }}
      /* actions={{
        edit: onEdit,
        download: onGenerateReport,
        print: () => window.print()
      }} */
    >
      <div className="space-y-6">
        {/* Informations générales */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            Informations générales
          </h3>
          <InfoGrid columns={3}>
            <InfoItem
              label="Type d'équipement"
              value={
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(equipement.type)}</span>
                  {equipement.type.replace('_', ' ')}
                </div>
              }
              icon={<Package className="w-4 h-4" />}
              highlight
            />
            <InfoItem
              label="Référence"
              value={equipement.reference}
              icon={<FileText className="w-4 h-4" />}
            />
            <InfoItem
              label="Fournisseur"
              value={equipement.fournisseur || 'Non renseigné'}
              icon={<User className="w-4 h-4" />}
            />
          </InfoGrid>
        </div>

        <Separator />

        {/* Tâches de maintenance */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5" />
            Tâches de maintenance ({equipement.taches?.length || 0})
          </h3>
          
          {equipement.taches && equipement.taches.length > 0 ? (
            <div className="space-y-3">
              {equipement.taches.map((tache, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{tache.nom}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Type de tâche: <span className="font-medium">{tache.type}</span>
                      </p>
                    </div>
                    <Badge className={getTaskTypeColor(tache.type)}>
                      {tache.type}
                    </Badge>
                  </div>
                  
                  <InfoGrid columns={2}>
                    <InfoItem
                      label="Fréquence"
                      value={getFrequenceLabel(tache)}
                      icon={<Clock className="w-4 h-4" />}
                    />
                    <InfoItem
                      label="Heures d'utilisation"
                      value={
                        tache.frequence.heuresTotales 
                          ? `${tache.frequence.heuresTotales}h (${tache.frequence.heuresMoyennesParJour}h/jour)` 
                          : 'Non applicable'
                      }
                      icon={<Clock className="w-4 h-4" />}
                    />
                  </InfoGrid>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>Aucune tâche de maintenance définie</p>
              <p className="text-sm">Ajoutez des tâches pour planifier la maintenance</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Pièces recommandées */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5" />
            Pièces recommandées ({equipement.pieces?.length || 0})
          </h3>
          
          {equipement.pieces && equipement.pieces.length > 0 ? (
            <div className="grid gap-3">
              {equipement.pieces.map((piece, index) => (
                <div key={index} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{piece.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        Réf: {piece.reference}
                      </div>
                    </div>
                    <Badge variant="outline">
                      Stock recommandé
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2" />
              <p>Aucune pièce recommandée</p>
              <p className="text-sm">Ajoutez des pièces pour optimiser la maintenance</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions rapides */}
        {/* <div>
          <h3 className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            Actions rapides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3">
              <div className="text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm">Planifier maintenance</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-3">
              <div className="text-center">
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm">Créer intervention</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-3">
              <div className="text-center">
                <Package className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm">Gérer stock</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto py-3">
              <div className="text-center">
                <MapPin className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm">Voir installations</div>
              </div>
            </Button>
          </div>
        </div> */}
      </div>
    </DetailView>
  );
};