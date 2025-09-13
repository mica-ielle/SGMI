import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { EnhancedForm, FormSection } from '../ui/enhanced-form';
import { CalendarIcon, User, MapPin, Clock, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import type { TachePlanifie, TypeTachePlanifie, StatutTache, Site } from '../../types';
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

export const TachePlanifieeForm = ({ open, onOpenChange, onSuccess, initialData }: TachePlanifieeFormProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<TachePlanifie>({
    nom: '',
    statut: 'PLANIFIEE',
    type: 'VISITE',
    datePrevu: format(new Date(), 'yyyy-MM-dd')
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (open) {
      loadSites();
      if (initialData) {
        setFormData(initialData);
        setSelectedDate(new Date(initialData.datePrevu));
      } else {
        resetForm();
      }
    }
  }, [open, initialData]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await siteService.getAllSites();
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
      datePrevu: format(new Date(), 'yyyy-MM-dd')
    });
    setSelectedDate(new Date());
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ ...prev, datePrevu: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      if (!formData.nom.trim()) {
        toast.error('Le nom de la tâche est obligatoire');
        return;
      }

      if (!formData.site?.id_site) {
        toast.error('Veuillez sélectionner un site');
        return;
      }

      const dataToSubmit = {
        tachePlanifie: formData,
        siteId: formData.site.id_site
      };

      if (initialData?.id_tachePlanifie) {
        await planningService.updateTachePlanifie(initialData.id_tachePlanifie, dataToSubmit);
        toast.success('Tâche mise à jour avec succès');
      } else {
        await planningService.createTachePlanifie(dataToSubmit);
        toast.success('Tâche créée avec succès');
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la tâche');
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



    const handleDate = (date: Date | undefined) => {
    if (date) {
      
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
                  disabled={submitting || !formData.nom.trim()}
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

                <div>
                  <Label htmlFor="statut">Statut *</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={(value) => handleFieldChange('statut', value as StatutTache)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statutTacheLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              key === 'PLANIFIEE' ? 'bg-blue-500' :
                              key === 'REALISEE' ? 'bg-green-500' :
                              key === 'ANNULEE' ? 'bg-red-500' : 'bg-orange-500'
                            }`} />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="site">Site *</Label>
                  <Select
                    value={formData.site?.id_site?.toString()}
                    onValueChange={(value) => {
                      const site = sites.find(s => s.id_site === parseInt(value));
                      handleFieldChange('site', site);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id_site} value={site.id_site!.toString()}>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {site.nom} - {site.ville}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date prévue *</Label>
                  
                    <Input
                      type="date"
                      value={selectedDate || format(new Date(), 'yyyy-MM-dd')}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  
                </div>
                
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

                {formData.statut === 'REALISEE' && (
                  <div>
                    <Label htmlFor="dernierIntervention">Date de dernière intervention</Label>
                    <Input
                      id="dernierIntervention"
                      type="date"
                      value={formData.dernierIntervention || ''}
                      onChange={(e) => handleFieldChange('dernierIntervention', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </FormSection>

            {/* Aperçu de la tâche */}
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">{getTypeIcon(formData.type)}</span>
                <div>
                  <h4 className="font-medium">{formData.nom || 'Nouvelle tâche'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.site ? `${formData.site.nom} - ${formData.site.ville}` : 'Aucun site sélectionné'}
                  </p>
                </div>
                <Badge className={getStatutColor(formData.statut)}>
                  {statutTacheLabels[formData.statut]}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Prévue le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                </div>
                {formData.responsable && (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" />
                    Responsable: {formData.responsable}
                  </div>
                )}
              </div>
            </div>
          </EnhancedForm>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};