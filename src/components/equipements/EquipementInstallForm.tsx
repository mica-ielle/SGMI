import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { CalendarIcon, Settings, Package, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner@2.0.3';
import type { Site, Equipement, TypeEquipement } from '../../types';
import { equipementService } from '../../services/equipementService';
import { siteService } from '../../services/siteService';

interface EquipementInstallFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: Site;
  onSuccess: () => void;
}

interface EquipementGrouped {
  type: TypeEquipement;
  equipements: Equipement[];
  selected: boolean;
  installations: { [key: number]: Date };
}

export const EquipementInstallForm = ({ open, onOpenChange, site, onSuccess }: EquipementInstallFormProps) => {
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [groupedEquipements, setGroupedEquipements] = useState<EquipementGrouped[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadEquipements();
    }
  }, [open]);

  const loadEquipements = async () => {
    try {
      setLoading(true);
      const data = await equipementService.getAllEquipements();
      setEquipements(data);
      groupEquipements(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des équipements');
    } finally {
      setLoading(false);
    }
  };

  const groupEquipements = (equipements: Equipement[]) => {
    const grouped = equipements.reduce((acc, equipement) => {
      if (!acc[equipement.type]) {
        acc[equipement.type] = [];
      }
      acc[equipement.type].push(equipement);
      return acc;
    }, {} as { [key in TypeEquipement]: Equipement[] });

    const groupedArray = Object.entries(grouped).map(([type, equipements]) => ({
      type: type as TypeEquipement,
      equipements,
      selected: false,
      installations: {} as { [key: number]: Date }
    }));

    setGroupedEquipements(groupedArray);
  };

  const getTypeIcon = (type: TypeEquipement) => {
    switch (type) {
      case 'MOTOPOMPE': return '⚙️';
      case 'BORNE_DE_DISTRIBUTION': return '⛽';
      case 'ARMOIRE_ELECTRIQUE': return '🔌';
      case 'CITERNE': return '🛢️';
      default: return '📦';
    }
  };

  const getTypeColor = (type: TypeEquipement) => {
    switch (type) {
      case 'MOTOPOMPE': return 'blue';
      case 'BORNE_DE_DISTRIBUTION': return 'green';
      case 'ARMOIRE_ELECTRIQUE': return 'yellow';
      case 'CITERNE': return 'purple';
      default: return 'gray';
    }
  };

  const toggleEquipementSelection = (groupIndex: number, equipementId: number) => {
    setGroupedEquipements(prev => {
      const newGroups = [...prev];
      const group = newGroups[groupIndex];
      
      if (group.installations[equipementId]) {
        delete group.installations[equipementId];
      } else {
        group.installations[equipementId] = new Date();
      }
      
      return newGroups;
    });
  };

  const setInstallationDate = (groupIndex: number, equipementId: number, date: Date) => {
    setGroupedEquipements(prev => {
      const newGroups = [...prev];
      newGroups[groupIndex].installations[equipementId] = date;
      return newGroups;
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const installations = [];
      
      for (const group of groupedEquipements) {
        for (const [equipementId, date] of Object.entries(group.installations)) {
          installations.push({
            equipementId: parseInt(equipementId),
            dateInstallation: format(date, 'yyyy-MM-dd')
          });
        }
      }

      if (installations.length === 0) {
        toast.error('Veuillez sélectionner au moins un équipement à installer');
        return;
      }

      await siteService.installEquipements(site.id_site!, installations);
      toast.success(`${installations.length} équipement(s) installé(s) avec succès`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de l\'installation des équipements');
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCount = () => {
    return groupedEquipements.reduce((total, group) => 
      total + Object.keys(group.installations).length, 0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Installer des équipements
          </DialogTitle>
          <p className="text-muted-foreground">
            Site: <span className="font-medium">{site.nom}</span> - {site.ville}
          </p>
        </DialogHeader>

        <Separator />

        <ScrollArea className="flex-1 p-6 max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedEquipements.map((group, groupIndex) => (
                <div key={group.type} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(group.type)}</div>
                    <div>
                      <h3 className="font-medium">{group.type.replace('_', ' ')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.equipements.length} équipement(s) disponible(s)
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`bg-${getTypeColor(group.type)}-50 text-${getTypeColor(group.type)}-700 border-${getTypeColor(group.type)}-200`}
                    >
                      {Object.keys(group.installations).length} sélectionné(s)
                    </Badge>
                  </div>

                  <div className="grid gap-3 pl-4 border-l-2 border-gray-200">
                    {group.equipements.map((equipement) => {
                      const isSelected = !!group.installations[equipement.id_equipement!];
                      const installationDate = group.installations[equipement.id_equipement!];

                      return (
                        <div 
                          key={equipement.id_equipement} 
                          className={`p-4 rounded-lg border transition-all ${
                            isSelected 
                              ? 'border-purple-200 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => 
                                  toggleEquipementSelection(groupIndex, equipement.id_equipement!)
                                }
                              />
                              <div>
                                <div className="font-medium">{equipement.nom}</div>
                                <div className="text-sm text-muted-foreground">
                                  Réf: {equipement.reference}
                                </div>
                                {equipement.fournisseur && (
                                  <div className="text-sm text-muted-foreground">
                                    Fournisseur: {equipement.fournisseur}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">Date d'installation:</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      <CalendarIcon className="w-4 h-4 mr-2" />
                                      {installationDate ? 
                                        format(installationDate, 'dd/MM/yyyy', { locale: fr }) : 
                                        'Sélectionner'
                                      }
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={installationDate}
                                      onSelect={(date) => {
                                        if (date) {
                                          setInstallationDate(groupIndex, equipement.id_equipement!, date);
                                        }
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )}
                          </div>

                          {isSelected && equipement.taches && equipement.taches.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-sm font-medium text-gray-700 mb-2">
                                Tâches de maintenance associées:
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {equipement.taches.map((tache, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tache.nom} ({tache.type})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        <Separator />

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <Package className="w-4 h-4 inline mr-1" />
              {getSelectedCount()} équipement(s) sélectionné(s)
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={submitting || getSelectedCount() === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Installation...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Installer ({getSelectedCount()})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};