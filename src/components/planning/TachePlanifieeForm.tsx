import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { EnhancedForm, FormSection } from '../ui/enhanced-form';
import { CalendarIcon, User, MapPin, Clock, Save, AlertTriangle, Plus, X } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, addYears, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { FrequenceSelector } from '../forms/FrequenceSelector';
import type { TachePlanifie, TypeTachePlanifie, StatutTache, Site, Planifier, Frequence } from '../../types';
import { siteService } from '../../services/siteService';
import { planningService } from '../../services/planningService';

interface TachePlanifieeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialData?: TachePlanifie;
}

const statutTacheLabels: Record<StatutTache, string> = {
  PLANIFIEE: 'Planifiée',
  REALISEE: 'Réalisée',
  ANNULEE: 'Annulée',
  REPORTEE: 'Reportée'
};

const typeTacheLabels: Record<TypeTachePlanifie, string> = {
  VISITE: 'Visite',
  ENTRETIEN: 'Entretien',
  PREVENTIF: 'Préventif'
};

// Fonction pour calculer la prochaine date de maintenance
const calculerProchaineMaintenance = (dateDerniereIntervention: string, frequence: Frequence): string => {
  if (!dateDerniereIntervention || !frequence) return '';
  
  try {
    const dateBase = parseISO(dateDerniereIntervention);
    
    if (frequence.frequenceStandard) {
      switch (frequence.frequenceStandard) {
        case 'QUOTIDIENNE':
          return format(addDays(dateBase, 1), 'yyyy-MM-dd');
        case 'HEBDOMADAIRE':
          return format(addWeeks(dateBase, 1), 'yyyy-MM-dd');
        case 'MENSUELLE':
          return format(addMonths(dateBase, 1), 'yyyy-MM-dd');
        case 'BIMENSUELLE':
          return format(addMonths(dateBase, 2), 'yyyy-MM-dd');
        case 'TRIMESTRIELLE':
          return format(addMonths(dateBase, 3), 'yyyy-MM-dd');
        case 'SEMESTRIELLE':
          return format(addMonths(dateBase, 6), 'yyyy-MM-dd');
        case 'ANNUELLE':
          return format(addYears(dateBase, 1), 'yyyy-MM-dd');
        case 'CINQ_ANS':
          return format(addYears(dateBase, 5), 'yyyy-MM-dd');
        case 'DIX_ANS':
          return format(addYears(dateBase, 10), 'yyyy-MM-dd');
        default:
          return '';
      }
    }
    
    if (frequence.valeurPersonnalisee && frequence.unitePersonnalisee) {
      const valeur = frequence.valeurPersonnalisee;
      switch (frequence.unitePersonnalisee) {
        case 'JOURS':
          return format(addDays(dateBase, valeur), 'yyyy-MM-dd');
        case 'SEMAINES':
          return format(addWeeks(dateBase, valeur), 'yyyy-MM-dd');
        case 'MOIS':
          return format(addMonths(dateBase, valeur), 'yyyy-MM-dd');
        case 'ANNEES':
          return format(addYears(dateBase, valeur), 'yyyy-MM-dd');
        default:
          return '';
      }
    }
    
    if (frequence.heuresTotales) {
      // Pour les heures, on estime une moyenne de 8h par jour
      const jours = Math.ceil(frequence.heuresTotales / 8);
      return format(addDays(dateBase, jours), 'yyyy-MM-dd');
    }
    
    return '';
  } catch (error) {
    console.error('Erreur lors du calcul de la prochaine maintenance:', error);
    return '';
  }
};

export const TachePlanifieeForm = ({ open, onOpenChange, onSuccess, initialData }: TachePlanifieeFormProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TachePlanifie>({
    nom: '',
    statut: 'PLANIFIEE',
    type: 'VISITE',
    frequence: {},
    planifiers: [],
    dernierIntervention: []
  });

  const [selectedPlanifiers, setSelectedPlanifiers] = useState<Planifier[]>([]);

  // Calculer la prochaine date pour l'aperçu général
  const prochaineDate = selectedPlanifiers.length > 0 
    ? calculerProchaineMaintenance(selectedPlanifiers[0].datePlanifie, formData.frequence || {})
    : '';

  useEffect(() => {
    if (open) {
      loadSites();
      if (initialData) {
        setFormData({
          ...initialData,
          planifiers: initialData.planifiers || [],
          dernierIntervention: initialData.dernierIntervention || []
        });
        
        // Construire la liste des planifiers sélectionnés
        const planifiersWithDates = (initialData.planifiers || []).map((planifier) => ({
          ...planifier,
          datePlanifie: planifier.datePlanifie || format(new Date(), 'yyyy-MM-dd')
        }));
        setSelectedPlanifiers(planifiersWithDates);
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await siteService.getAll();
      setSites(data);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
      toast.error('Erreur lors du chargement des sites');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      statut: 'PLANIFIEE',
      type: 'VISITE',
      frequence: {},
      planifiers: [],
      dernierIntervention: []
    });
    setSelectedPlanifiers([]);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrequenceChange = (frequence: Frequence) => {
    setFormData(prev => ({ ...prev, frequence }));
  };

  const handleSiteSelection = (siteId: number, checked: boolean) => {
    const dateNow = new Date();
    const dateDefaut = format(dateNow, 'yyyy-MM-dd');
    
    if (checked) {
      // Ajouter le site
      const site = sites.find(s => s.id_site === siteId);
      if (site) {
        const newPlanifier: Planifier = {
          site,
          datePlanifie: dateDefaut
        };

        setSelectedPlanifiers(prev => [...prev, newPlanifier]);
      }
    } else {
      // Retirer le site
      setSelectedPlanifiers(prev => prev.filter(p => p.site.id_site !== siteId));
    }
  };

  const handleDateChange = (siteId: number, date: string) => {
    setSelectedPlanifiers(prev => 
      prev.map(p => 
        p.site.id_site === siteId 
          ? { ...p, datePlanifie: date }
          : p
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (!formData.nom.trim()) {
        toast.error('Le nom de la tâche est obligatoire');
        return;
      }

      if (!selectedPlanifiers.length) {
        toast.error('Veuillez sélectionner au moins un site');
        return;
      }

      if (!formData.frequence || (!formData.frequence.frequenceStandard && !formData.frequence.valeurPersonnalisee && !formData.frequence.heuresTotales)) {
        toast.error('Veuillez définir une fréquence');
        return;
      }

      // Calculer la date prévue si elle n'existe pas
      const datePrevu = formData.datePrevu || calculerProchaineMaintenance(
        selectedPlanifiers[0]?.datePlanifie || format(new Date(), 'yyyy-MM-dd'), 
        formData.frequence || {}
      );

      // Prendre la première date comme dernière intervention
      const firstPlanifierDate = selectedPlanifiers[0]?.datePlanifie || format(new Date(), 'yyyy-MM-dd');

      // ✅ CORRECTION : Structurer les données selon le format attendu par le back-end Java
      const dataToSubmit = {
        tachePlanifie: {
          // Données de base de la tâche
          nom: formData.nom.trim(),
          responsable: formData.responsable || null,
          statut: formData.statut,
          type: formData.type,
          // ✅ Correction : dernierIntervention doit être une date simple, pas un tableau
          dernierIntervention: firstPlanifierDate,
          // ✅ Correction : frequence doit être null ou un objet avec id, le back-end la créera
          frequence: formData.frequence,
          datePrevu: datePrevu || null
        },
        // ✅ Correction : Simplifier la structure des planifiers
        planifiers: selectedPlanifiers.map(p => ({
          site: {
            id_site: p.site.id_site,
            nom: p.site.nom,
            ville: p.site.ville,
            type: p.site.type,
            nom_contact: p.site.nom_contact || null,
            tel_contact: p.site.tel_contact || null,
            dateCreation: p.site.dateCreation || null
          },
          datePlanifie: p.datePlanifie,
          // Pas besoin d'inclure tachePlanifie ici car il sera assigné côté serveur
        }))
      };

      // ✅ Logging pour debug
      console.log('=== Données envoyées au serveur ===');
      console.log('Objet complet:', dataToSubmit);
      console.log('tachePlanifie:', dataToSubmit.tachePlanifie);
      console.log('planifiers:', dataToSubmit.planifiers);
      console.log('Fréquence originale du formulaire:', formData.frequence);
      console.log('JSON final:', JSON.stringify(dataToSubmit, null, 2));

      if (initialData?.id_tachePlanifie) {
        // Pour la mise à jour, utiliser l'endpoint PUT /taches/{id}
        await planningService.updateTachePlanifie(initialData.id_tachePlanifie, dataToSubmit);
        toast.success('Tâche mise à jour avec succès');
      } else {
      
        await planningService.createTachePlanifie(dataToSubmit);
        toast.success('Tâche créée avec succès');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('=== Erreur lors de la sauvegarde ===');
      console.error('Erreur complète:', error);
      if (error instanceof Error) {
        console.error('Message d\'erreur:', error.message);
        console.error('Stack trace:', error.stack);
      }
      toast.error(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutColor = (statut: StatutTache) => {
    switch (statut) {
      case 'PLANIFIEE': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'REALISEE': return 'bg-green-100 text-green-700 border-green-200';
      case 'ANNULEE': return 'bg-red-100 text-red-700 border-red-200';
      case 'REPORTEE': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {initialData ? 'Modifier la tâche planifiée' : 'Nouvelle tâche planifiée'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6 max-h-[70vh]">
          <EnhancedForm
            title=""
            loading={loading}
            actions={
              <>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting || !formData.nom.trim() || !selectedPlanifiers.length}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {initialData ? 'Mettre à jour' : 'Créer la tâche'}
                    </>
                  )}
                </Button>
              </>
            }
          >
            <FormSection 
              title="Informations générales" 
              description="Détails de base de la tâche planifiée"
              icon={<Clock className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nom">Nom de la tâche *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => handleFieldChange('nom', e.target.value)}
                    placeholder="Ex: Inspection mensuelle des équipements"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type de tâche *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleFieldChange('type', value as TypeTachePlanifie)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeTacheLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{getTypeIcon(key as TypeTachePlanifie)}</span>
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Statut fixé à PLANIFIEE - suppression du champ de sélection */}
                <div>
                  <Label>Statut</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-medium">Planifiée</span>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection 
              title="Fréquence de la tâche" 
              description="Définissez à quelle fréquence cette tâche doit être répétée"
              icon={<Clock className="w-4 h-4" />}
            >
              <FrequenceSelector
                value={formData.frequence || {}}
                onChange={handleFrequenceChange}
                label="Fréquence de répétition"
              />
            </FormSection>

            <FormSection 
              title="Sites concernés et planning" 
              description="Sélectionnez les sites et définissez les dates de maintenance"
              icon={<MapPin className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <Label>Sites disponibles *</Label>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                  {sites.map((site) => {
                    const selectedPlanifier = selectedPlanifiers.find(p => p.site.id_site === site.id_site);
                    const isSelected = !!selectedPlanifier;
                    const datePlanifie = selectedPlanifier?.datePlanifie || format(new Date(), 'yyyy-MM-dd');
                    const prochaineDate = calculerProchaineMaintenance(datePlanifie, formData.frequence || {});
                    
                    return (
                      <div key={site.id_site} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSiteSelection(site.id_site!, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{site.nom}</span>
                            </div>
                            <p className="text-sm text-gray-600">{site.ville}</p>
                            
                            {isSelected && (
                              <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-sm">Date de dernière intervention</Label>
                                    <Input
                                      type="date"
                                      value={datePlanifie}
                                      onChange={(e) => handleDateChange(site.id_site!, e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  {prochaineDate && (
                                    <div>
                                      <Label className="text-sm">Prochaine maintenance prévue</Label>
                                      <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                        <div className="flex items-center gap-2">
                                          <CalendarIcon className="w-4 h-4 text-blue-600" />
                                          <span className="text-sm font-medium text-blue-700">
                                            {format(parseISO(prochaineDate), 'dd/MM/yyyy', { locale: fr })}                                        
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {!prochaineDate && formData.frequence && Object.keys(formData.frequence).length > 0 && (
                                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                                      <span className="text-sm text-orange-700">
                                        Impossible de calculer la prochaine maintenance
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {selectedPlanifiers.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Aucun site sélectionné</p>
                    <p className="text-sm text-gray-400">Sélectionnez au moins un site pour cette tâche</p>
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection 
              title="Détails complémentaires" 
              description="Informations additionnelles sur la tâche"
              icon={<User className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="responsable">Responsable assigné</Label>
                  <Input
                    id="responsable"
                    value={formData.responsable || ''}
                    onChange={(e) => handleFieldChange('responsable', e.target.value)}
                    placeholder="Nom du responsable ou équipe"
                  />
                </div>
              </div>
            </FormSection>

            {/* Aperçu de la tâche */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{getTypeIcon(formData.type)}</span>
                <div>
                  <h4 className="font-medium">{formData.nom || 'Nouvelle tâche'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlanifiers.length > 0 ? 
                      `${selectedPlanifiers.length} site(s) sélectionné(s)` : 
                      'Aucun site sélectionné'
                    }
                  </p>
                </div>
                <Badge className={getStatutColor(formData.statut)}>
                  {statutTacheLabels[formData.statut]}
                </Badge>
              </div>
              
              {selectedPlanifiers.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Sites avec dates individuelles :</h5>
                  <div className="space-y-2">
                    {selectedPlanifiers.map((planifier) => {
                      const prochaineDate = calculerProchaineMaintenance(planifier.datePlanifie, formData.frequence || {});
                      
                      return (
                        <div key={planifier.site.id_site} className="p-3 bg-white rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="text-xs mb-1 bg-blue-50 text-blue-700 border-blue-200">
                                📍 {planifier.site.nom} - {planifier.site.ville}
                              </Badge>
                              {planifier.site.nom_contact && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Contact: {planifier.site.nom_contact}
                                  {planifier.site.tel_contact && ` - ${planifier.site.tel_contact}`}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">Dernière intervention</div>
                              <div className="text-sm font-medium">
                                {format(new Date(planifier.datePlanifie), 'dd/MM/yyyy', { locale: fr })}
                              </div>
                              {prochaineDate && (
                                <>
                                  <div className="text-xs text-blue-600 mt-1">Prochaine maintenance</div>
                                  <div className="text-sm font-medium text-blue-700">
                                    {format(parseISO(prochaineDate), 'dd/MM/yyyy', { locale: fr })}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </EnhancedForm>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};