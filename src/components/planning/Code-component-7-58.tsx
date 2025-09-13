import { DetailView } from '../DetailView';
import { InfoGrid, InfoItem } from '../ui/info-grid';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { TachePlanifie, StatutTache, TypeTachePlanifie } from '../../types';

interface TachePlanifieeDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tache: TachePlanifie | null;
  onEdit?: () => void;
  onMarkCompleted?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
}

export const TachePlanifieeDetailView = ({ 
  open, 
  onOpenChange, 
  tache, 
  onEdit,
  onMarkCompleted,
  onCancel,
  onReschedule
}: TachePlanifieeDetailViewProps) => {
  if (!tache) return null;

  const getStatutIcon = (statut: StatutTache) => {
    switch (statut) {
      case 'PLANIFIEE': return <Clock className="w-4 h-4" />;
      case 'REALISEE': return <CheckCircle className="w-4 h-4" />;
      case 'ANNULEE': return <XCircle className="w-4 h-4" />;
      case 'REPORTEE': return <RotateCcw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatutColor = (statut: StatutTache) => {
    switch (statut) {
      case 'PLANIFIEE': return 'blue';
      case 'REALISEE': return 'green';
      case 'ANNULEE': return 'red';
      case 'REPORTEE': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: TypeTachePlanifie) => {
    switch (type) {
      case 'VISITE': return '👁️';
      case 'ENTRETIEN': return '🔧';
      case 'PREVENTIF': return '🛡️';
      default: return '📋';
    }
  };

  const getTypeColor = (type: TypeTachePlanifie) => {
    switch (type) {
      case 'VISITE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ENTRETIEN': return 'bg-green-100 text-green-700 border-green-200';
      case 'PREVENTIF': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatutLabel = (statut: StatutTache) => {
    switch (statut) {
      case 'PLANIFIEE': return 'Planifiée';
      case 'REALISEE': return 'Réalisée';
      case 'ANNULEE': return 'Annulée';
      case 'REPORTEE': return 'Reportée';
      default: return statut;
    }
  };

  const getTypeLabel = (type: TypeTachePlanifie) => {
    switch (type) {
      case 'VISITE': return 'Visite';
      case 'ENTRETIEN': return 'Entretien';
      case 'PREVENTIF': return 'Préventif';
      default: return type;
    }
  };

  const isOverdue = () => {
    if (tache.statut !== 'PLANIFIEE') return false;
    const today = new Date();
    const plannedDate = new Date(tache.datePrevu);
    return plannedDate < today;
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const plannedDate = new Date(tache.datePrevu);
    const diffTime = plannedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DetailView
      open={open}
      onOpenChange={onOpenChange}
      title={tache.nom}
      subtitle={`${getTypeLabel(tache.type)} • ${tache.site ? `${tache.site.nom} - ${tache.site.ville}` : 'Site non défini'}`}
      status={{
        label: getStatutLabel(tache.statut),
        variant: 'outline',
        color: getStatutColor(tache.statut)
      }}
      actions={{
        edit: onEdit,
        print: () => window.print()
      }}
    >
      <div className="space-y-6">
        {/* Alertes */}
        {isOverdue() && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-800">Tâche en retard</h4>
                <p className="text-sm text-red-600">
                  Cette tâche devait être réalisée il y a {Math.abs(getDaysUntilDue())} jour(s).
                </p>
              </div>
            </div>
          </div>
        )}

        {tache.statut === 'PLANIFIEE' && getDaysUntilDue() <= 3 && getDaysUntilDue() > 0 && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800">Tâche à venir</h4>
                <p className="text-sm text-orange-600">
                  Cette tâche doit être réalisée dans {getDaysUntilDue()} jour(s).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informations générales */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            Informations générales
          </h3>
          <InfoGrid columns={3}>
            <InfoItem
              label="Type de tâche"
              value={
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(tache.type)}</span>
                  <Badge className={getTypeColor(tache.type)}>
                    {getTypeLabel(tache.type)}
                  </Badge>
                </div>
              }
              icon={<FileText className="w-4 h-4" />}
              highlight
            />
            <InfoItem
              label="Statut"
              value={
                <div className="flex items-center gap-2">
                  {getStatutIcon(tache.statut)}
                  {getStatutLabel(tache.statut)}
                </div>
              }
              icon={getStatutIcon(tache.statut)}
            />
            <InfoItem
              label="Date prévue"
              value={format(new Date(tache.datePrevu), 'dd MMMM yyyy', { locale: fr })}
              icon={<Calendar className="w-4 h-4" />}
            />
          </InfoGrid>
        </div>

        <Separator />

        {/* Informations site */}
        {tache.site && (
          <div>
            <h3 className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" />
              Localisation
            </h3>
            <InfoGrid columns={2}>
              <InfoItem
                label="Site"
                value={tache.site.nom}
                icon={<MapPin className="w-4 h-4" />}
                highlight
              />
              <InfoItem
                label="Ville"
                value={tache.site.ville}
                icon={<MapPin className="w-4 h-4" />}
              />
              {tache.site.nom_contact && (
                <InfoItem
                  label="Contact sur site"
                  value={tache.site.nom_contact}
                  icon={<User className="w-4 h-4" />}
                />
              )}
              {tache.site.tel_contact && (
                <InfoItem
                  label="Téléphone"
                  value={tache.site.tel_contact}
                  icon={<User className="w-4 h-4" />}
                />
              )}
            </InfoGrid>
          </div>
        )}

        <Separator />

        {/* Informations responsable */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" />
            Responsabilité
          </h3>
          <InfoGrid columns={2}>
            <InfoItem
              label="Responsable assigné"
              value={tache.responsable || 'Non assigné'}
              icon={<User className="w-4 h-4" />}
            />
            {tache.dernierIntervention && (
              <InfoItem
                label="Dernière intervention"
                value={format(new Date(tache.dernierIntervention), 'dd MMMM yyyy', { locale: fr })}
                icon={<Clock className="w-4 h-4" />}
              />
            )}
          </InfoGrid>
        </div>

        <Separator />

        {/* Actions rapides */}
        <div>
          <h3 className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            Actions rapides
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tache.statut === 'PLANIFIEE' && onMarkCompleted && (
              <Button 
                variant="outline" 
                className="h-auto py-3 border-green-200 hover:bg-green-50"
                onClick={onMarkCompleted}
              >
                <div className="text-center">
                  <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <div className="text-sm">Marquer terminée</div>
                </div>
              </Button>
            )}
            
            {tache.statut === 'PLANIFIEE' && onReschedule && (
              <Button 
                variant="outline" 
                className="h-auto py-3 border-orange-200 hover:bg-orange-50"
                onClick={onReschedule}
              >
                <div className="text-center">
                  <RotateCcw className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <div className="text-sm">Reporter</div>
                </div>
              </Button>
            )}
            
            {tache.statut === 'PLANIFIEE' && onCancel && (
              <Button 
                variant="outline" 
                className="h-auto py-3 border-red-200 hover:bg-red-50"
                onClick={onCancel}
              >
                <div className="text-center">
                  <XCircle className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <div className="text-sm">Annuler</div>
                </div>
              </Button>
            )}
            
            <Button variant="outline" className="h-auto py-3">
              <div className="text-center">
                <FileText className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm">Créer rapport</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Équipements du site */}
        {tache.site?.equipementInstalles && tache.site.equipementInstalles.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" />
                Équipements sur site ({tache.site.equipementInstalles.length})
              </h3>
              <div className="grid gap-3">
                {tache.site.equipementInstalles.slice(0, 5).map((equipementInstalle, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{equipementInstalle.equipement.nom}</div>
                        <div className="text-sm text-muted-foreground">
                          {equipementInstalle.equipement.type.replace('_', ' ')} • Réf: {equipementInstalle.equipement.reference}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Installé le {format(new Date(equipementInstalle.date_installation), 'dd/MM/yyyy', { locale: fr })}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {equipementInstalle.equipement.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
                {tache.site.equipementInstalles.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{tache.site.equipementInstalles.length - 5} autres équipements
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DetailView>
  );
};