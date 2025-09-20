import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { 
  Calendar as CalendarIcon, 
  User, 
  Settings, 
  MapPin, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';
import { planningService } from '../../services/planningService';
import { siteService } from '../../services/siteService';
import type { RequetGetPlanning, Site } from '../../types';

interface AffectationTacheAutoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceAuto: RequetGetPlanning | null;
  onSuccess: () => void;
}

interface AffectationData {
  responsable: string;
  dateIntervention: Date | null;
  siteId: number | null;
  notes: string;
  priorite: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE';
}

export const AffectationTacheAutoForm = ({ 
  open, 
  onOpenChange, 
  maintenanceAuto, 
  onSuccess 
}: AffectationTacheAutoFormProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [affectation, setAffectation] = useState<AffectationData>({
    responsable: '',
    dateIntervention: null,
    siteId: null,
    notes: '',
    priorite: 'NORMALE'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && maintenanceAuto) {
      loadSites();
      // Pré-remplir avec la date prévue de la maintenance
      setAffectation(prev => ({
        ...prev,
        dateIntervention: new Date(maintenanceAuto.occurenceMainteance.datePrevue)
      }));
    }
  }, [open, maintenanceAuto]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const sitesData = await siteService.getAll();
      
      // Filtrer les sites qui ont l'équipement concerné
      const sitesAvecEquipement = sitesData.filter(site => 
        site.equipementInstalles?.some(ei => 
          ei.equipement.id_equipement === maintenanceAuto?.equipement.id_equipement
        )
      );
      
      setSites(sitesAvecEquipement);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
      toast.error('Erreur lors du chargement des sites');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!maintenanceAuto || !affectation.siteId || !affectation.dateIntervention) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!affectation.responsable.trim()) {
      toast.error('Veuillez indiquer un responsable');
      return;
    }

    try {
      setSubmitting(true);

      // Créer une tâche planifiée à partir de la maintenance automatique
      const tacheData = {
        tachePlanifie: {
          nom: `Maintenance ${maintenanceAuto.equipement.nom} - ${maintenanceAuto.occurenceMainteance.statut}`,
          type: 'PREVENTIF' as const,
          statut: 'PLANIFIEE' as const,
          datePrevu: format(affectation.dateIntervention, 'yyyy-MM-dd'),
          responsable: affectation.responsable,
          frequence: {
            frequenceStandard: 'MENSUELLE' // Valeur par défaut, peut être ajustée
          },
          notes: affectation.notes
        },
        planifiers: [{
          site: sites.find(s => s.id_site === affectation.siteId)!,
          datePlanifie: format(affectation.dateIntervention, 'yyyy-MM-dd')
        }],
      };

      await planningService.createTachePlanifie(tacheData);

      // Marquer la maintenance automatique comme affectée
      await planningService.marquerMaintenanceAffectee(
        maintenanceAuto.occurenceMainteance.id_occurenceMainteance!
      );

      toast.success('Tâche affectée avec succès');
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      toast.error('Erreur lors de l\'affectation de la tâche');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAffectation({
      responsable: '',
      dateIntervention: null,
      siteId: null,
      notes: '',
      priorite: 'NORMALE'
    });
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'URGENTE': return 'bg-red-100 text-red-800 border-red-200';
      case 'HAUTE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMALE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BASSE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeEquipementLabel = (type: string) => {
    return type.replace('_', ' ').toLowerCase();
  };

  if (!maintenanceAuto) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Affecter une maintenance automatique
          </DialogTitle>
        </DialogHeader>
<ScrollArea className="flex-1 p-6 max-h-[70vh]">
        <div className="space-y-6">
          {/* Informations sur la maintenance automatique */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Maintenance à affecter
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{maintenanceAuto.equipement.nom}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Référence: {maintenanceAuto.equipement.reference}
                      </div>
                      <div className="text-sm text-gray-600">
                        Type: {getTypeEquipementLabel(maintenanceAuto.equipement.type)}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {getTypeEquipementLabel(maintenanceAuto.equipement.type)}
                    </Badge>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Date prévue</div>
                        <div className="text-sm">
                          {format(new Date(maintenanceAuto.occurenceMainteance.datePrevue), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Statut</div>
                        <Badge variant="outline" className="text-xs">
                          {maintenanceAuto.occurenceMainteance.statut}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Tâches associées */}
                  {maintenanceAuto.tacheList && maintenanceAuto.tacheList.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Tâches à effectuer ({maintenanceAuto.tacheList.length})
                      </div>
                      <div className="space-y-1">
                        {maintenanceAuto.tacheList.map((tache, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium">{tache.nom}</div>
                            <div className="text-xs text-gray-600">{tache.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sélection du site */}
          <div>
            <Label htmlFor="site">Site d'intervention *</Label>
            {loading ? (
              <div className="p-3 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                Chargement des sites...
              </div>
            ) : (
              <Select
                value={affectation.siteId?.toString() || ''}
                onValueChange={(value) => setAffectation(prev => ({ ...prev, siteId: parseInt(value) }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Sélectionnez un site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.length === 0 ? (
                    <div className="p-3 text-center text-gray-500">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <p>Aucun site avec cet équipement trouvé</p>
                    </div>
                  ) : (
                    sites.map((site) => (
                      <SelectItem key={site.id_site} value={site.id_site!.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{site.nom}</div>
                            <div className="text-sm text-gray-600">{site.ville}</div>
                          </div>
                          <MapPin className="w-4 h-4 text-gray-400 ml-2" />
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Responsable */}
          <div>
            <Label htmlFor="responsable">Responsable de l'intervention *</Label>
            <Input
              id="responsable"
              value={affectation.responsable}
              onChange={(e) => setAffectation(prev => ({ ...prev, responsable: e.target.value }))}
              placeholder="Nom du technicien ou équipe responsable"
              className="mt-2"
            />
          </div>

          {/* Date d'intervention */}
          <div>
            <Label>Date d'intervention prévue *</Label>
              <input
    type="date"
    id="date-intervention"
    className="w-full border rounded px-2 py-1 mt-1 text-sm"
    value={affectation.dateIntervention
      ? format(affectation.dateIntervention, 'yyyy-MM-dd')
      : ''}
    min={format(new Date(), 'yyyy-MM-dd')} // désactive les dates passées
    onChange={(e) => {
      const date = e.target.value ? new Date(e.target.value) : null;
      setAffectation((prev) => ({
        ...prev,
        dateIntervention: date,
      }));
    }}
  />

          </div>

          {/* Priorité */}
         {/*  <div>
            <Label htmlFor="priorite">Priorité de l'intervention</Label>
            <Select
              value={affectation.priorite}
              onValueChange={(value: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE') => 
                setAffectation(prev => ({ ...prev, priorite: value }))
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BASSE">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    Basse
                  </div>
                </SelectItem>
                <SelectItem value="NORMALE">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    Normale
                  </div>
                </SelectItem>
                <SelectItem value="HAUTE">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    Haute
                  </div>
                </SelectItem>
                <SelectItem value="URGENTE">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    Urgente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes d'intervention</Label>
            <Textarea
              id="notes"
              value={affectation.notes}
              onChange={(e) => setAffectation(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Instructions particulières, points d'attention, etc."
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Résumé de l'affectation */}
          {affectation.siteId && affectation.responsable && affectation.dateIntervention && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Résumé de l'affectation</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div><strong>Site:</strong> {sites.find(s => s.id_site === affectation.siteId)?.nom}</div>
                  <div><strong>Responsable:</strong> {affectation.responsable}</div>
                  <div><strong>Date:</strong> {format(affectation.dateIntervention, 'dd MMMM yyyy', { locale: fr })}</div>
                  
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!affectation.siteId || !affectation.responsable || !affectation.dateIntervention || submitting}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Affectation...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Affecter la tâche
                </>
              )}
            </Button>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};