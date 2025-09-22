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
import { toast } from 'sonner';
import type { Site, Equipement, TypeEquipement, TypeInstallation } from '../../types';
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

// Configuration des équipements par type d'installation (même que dans SitesPage)
const installationEquipements = {
  CARBURATION: {
    equipements: ['CITERNE', 'MOTOPOMPE', 'BORNE_DE_DISTRIBUTION', 'ARMOIRE_ELECTRIQUE'],
    obligatoires: ['CITERNE', 'MOTOPOMPE', 'BORNE_DE_DISTRIBUTION'],
    optionnels: ['ARMOIRE_ELECTRIQUE']
  },
  VAPORISATION_SIMPLE: {
    equipements: ['CITERNE', 'VAPORISATEUR', 'ARMOIRE_ELECTRIQUE'],
    obligatoires: ['CITERNE', 'VAPORISATEUR'],
    optionnels: ['ARMOIRE_ELECTRIQUE']
  },
  VAPORISATION_ELECTRIQUE: {
    equipements: ['CITERNE', 'VAPORISATEUR', 'REGULATEUR', 'ARMOIRE_ELECTRIQUE'],
    obligatoires: ['CITERNE', 'VAPORISATEUR', 'REGULATEUR'],
    optionnels: ['ARMOIRE_ELECTRIQUE']
  },
  AUTRE: {
    equipements: 'ALL',
    obligatoires: [],
    optionnels: 'ALL'
  }
};

const typeEquipementLabels: Record<TypeEquipement, string> = {
  MOTOPOMPE: 'Motopompe',
  BORNE_DE_DISTRIBUTION: 'Borne de distribution',
  ARMOIRE_ELECTRIQUE: 'Armoire électrique',
  CITERNE: 'Citerne',
  VAPORISATEUR: 'Vaporisateur',
  REGULATEUR: 'Régulateur'
};

const typeInstallationLabels: Record<TypeInstallation, string> = {
  CARBURATION: 'Carburation',
  VAPORISATION_SIMPLE: 'Vaporisation simple',
  VAPORISATION_ELECTRIQUE: 'Vaporisation électrique',
  AUTRE: 'Autre'
};

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
      
      // Filtrer les équipements selon le type d'installation du site
      const filteredEquipements = getEquipementsForSiteType(data, site.type as TypeInstallation);
      
      setEquipements(filteredEquipements);
      groupEquipements(filteredEquipements);
    } catch (error) {
      toast.error('Erreur lors du chargement des équipements');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les équipements selon le type d'installation du site
  const getEquipementsForSiteType = (allEquipements: Equipement[], installationType: TypeInstallation): Equipement[] => {
    const config = installationEquipements[installationType];
    
    if (config.equipements === 'ALL') {
      return allEquipements;
    }
    
    return allEquipements.filter(eq => config.equipements.includes(eq.type));
  };

  const groupEquipements = (equipements: Equipement[]) => {
    const grouped = equipements.reduce((acc, equipement) => {
      if (!acc[equipement.type as TypeEquipement]) {
        acc[equipement.type as TypeEquipement] = [];
      }
      acc[equipement.type as TypeEquipement].push(equipement);
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
      case 'VAPORISATEUR': return '💨';
      case 'REGULATEUR': return '🎛️';
      default: return '📦';
    }
  };

  const getTypeColor = (type: TypeEquipement) => {
    switch (type) {
      case 'MOTOPOMPE': return 'blue';
      case 'BORNE_DE_DISTRIBUTION': return 'green';
      case 'ARMOIRE_ELECTRIQUE': return 'yellow';
      case 'CITERNE': return 'purple';
      case 'VAPORISATEUR': return 'cyan';
      case 'REGULATEUR': return 'orange';
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

  const getInstallationConfig = () => {
    return installationEquipements[site.type as TypeInstallation];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <ScrollArea className="flex-1 p-6 max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Installer des équipements
          </DialogTitle>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Site: <span className="font-medium">{site.nom}</span> - {site.ville}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {typeInstallationLabels[site.type as TypeInstallation]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Informations sur le type d'installation */}
        <div className="px-6 py-4 bg-blue-50 border-b">
          <h4 className="font-medium text-blue-900 mb-2">
            Équipements disponibles pour cette installation
          </h4>
          {(() => {
            const config = getInstallationConfig();
            return (
              <div className="text-sm text-blue-800 space-y-1">
                {config.equipements === 'ALL' ? (
                  <p>
                    <span className="font-medium">Tous les équipements de la base de données sont disponibles pour ce type d'installation.</span>
                  </p>
                ) : (
                  <p>
                    <span className="font-medium">Équipements autorisés:</span>{' '}
                    {config.equipements.map(type => typeEquipementLabels[type as TypeEquipement]).join(', ')}
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        <ScrollArea className="flex-1 p-6 max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedEquipements.map((group, groupIndex) => {
                return (
                  <div key={group.type} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getTypeIcon(group.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{typeEquipementLabels[group.type]}</h3>
                        </div>
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
                                  {equipement.fabricant && (
                                    <div className="text-sm text-muted-foreground">
                                      Fabricant: {equipement.fabricant}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isSelected && (
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm">Date d'installation:</Label>
                                  <input
                                    type="date"
                                    id={`installation-date-${equipement.id_equipement}`}
                                    className="border rounded px-2 py-1 text-sm"
                                    value={installationDate ? format(installationDate, 'yyyy-MM-dd') : ''}
                                    onChange={(e) => {
                                      const selectedDate = e.target.value ? new Date(e.target.value) : null;
                                      if (selectedDate) {
                                        setInstallationDate(groupIndex, equipement.id_equipement!, selectedDate);
                                      }
                                    }}
                                  />
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
                );
              })}

              {groupedEquipements.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Aucun équipement disponible
                  </h3>
                  <p className="text-gray-500">
                    Aucun équipement n'est autorisé pour ce type d'installation.
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

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