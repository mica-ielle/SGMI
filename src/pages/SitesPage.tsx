import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, User, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { EquipementInstallForm } from '../components/equipements/EquipementInstallForm';
import { siteService } from '../services/siteService';
import { equipementService } from '../services/equipementService';
import { toast } from '../utils/toast';
import type { Site, Equipement, RequetCreateSite, TypeEquipement, TypeInstallation } from '../types';

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

// Configuration des équipements par type d'installation
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

export const SitesPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedSiteForInstall, setSelectedSiteForInstall] = useState<Site | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // État du formulaire
  const [formData, setFormData] = useState<Site>({
    nom: '',
    ville: '',
    nom_contact: '',
    tel_contact: '',
    type: 'CARBURATION',
    dateCreation: format(new Date(), 'yyyy-MM-dd')
  });

  const [selectedEquipements, setSelectedEquipements] = useState<number[]>([]);
  const [equipementsDatesInstallation, setEquipementsDatesInstallation] = useState<{ [key: number]: string }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sitesData, equipementsData] = await Promise.all([
        siteService.getAll(),
        equipementService.getAll()
      ]);
      setSites(sitesData);
      setEquipements(equipementsData);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les équipements selon le type d'installation
  const getEquipementsForInstallationType = (installationType: TypeInstallation): Equipement[] => {
    const config = installationEquipements[installationType];
    
    if (config.equipements === 'ALL') {
      return equipements;
    }
    
    return equipements.filter(eq => config.equipements.includes(eq.type));
  };

  // Valider que les équipements obligatoires sont sélectionnés
  const validateRequiredEquipements = (installationType: TypeInstallation, selectedEquipements: number[]): string[] => {
    const config = installationEquipements[installationType];
    const errors: string[] = [];
    
    if (config.obligatoires.length === 0) {
      return errors; // Aucun équipement obligatoire pour le type "AUTRE"
    }
    
    const selectedTypes = selectedEquipements
      .map(id => equipements.find(eq => eq.id_equipement === id)?.type)
      .filter(Boolean);
    
    config.obligatoires.forEach(requiredType => {
      if (!selectedTypes.includes(requiredType)) {
        errors.push(`Au moins un équipement de type "${typeEquipementLabels[requiredType as TypeEquipement]}" est obligatoire pour ce type d'installation.`);
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des équipements obligatoires
    if (!editingSite) {
      const errors = validateRequiredEquipements(formData.type as TypeInstallation, selectedEquipements);
      setValidationErrors(errors);
      
      if (errors.length > 0) {
        toast.error('Veuillez sélectionner tous les équipements obligatoires');
        return;
      }
    }
    
    try {
      if (editingSite) {
        // TODO: Implémentation de la mise à jour
        console.log('Mise à jour site:', formData);
        toast.success('Site mis à jour avec succès');
      } else {
        const createData: RequetCreateSite = {
          site: formData,
          equipementIdList: selectedEquipements,
          dateInstall: formData.dateCreation, // Date par défaut (non utilisée)
          dateMap: equipementsDatesInstallation
        };
        await siteService.create(createData);
        toast.success('Site créé avec succès');
      }
      
      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      try {
        await siteService.delete(id);
        await loadData();
        toast.success('Site supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openEditDialog = (site: Site) => {
    setEditingSite(site);
    setFormData(site);
    setSelectedEquipements(site.equipementInstalles?.map(eq => eq.equipement.id_equipement!) || []);
    setIsDialogOpen(true);
  };

  const handleInstallSuccess = () => {
    loadData();
    toast.success('Opération réalisée avec succès');
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      ville: '',
      nom_contact: '',
      tel_contact: '',
      type: 'CARBURATION',
      dateCreation: format(new Date(), 'yyyy-MM-dd')
    });
    setSelectedEquipements([]);
    setEquipementsDatesInstallation({});
    setValidationErrors([]);
    setEditingSite(null);
  };

  const toggleEquipement = (equipementId: number) => {
    setSelectedEquipements(prev => {
      const newSelection = prev.includes(equipementId) 
        ? prev.filter(id => id !== equipementId)
        : [...prev, equipementId];
      
      // Si on désélectionne un équipement, supprimer sa date d'installation
      if (!newSelection.includes(equipementId)) {
        setEquipementsDatesInstallation(prevDates => {
          const { [equipementId]: removed, ...rest } = prevDates;
          return rest;
        });
      } else {
        // Ajouter la date actuelle par défaut
        setEquipementsDatesInstallation(prevDates => ({
          ...prevDates,
          [equipementId]: format(new Date(), 'yyyy-MM-dd')
        }));
      }
      
      // Revalider les équipements obligatoires
      const errors = validateRequiredEquipements(formData.type as TypeInstallation, newSelection);
      setValidationErrors(errors);
      
      return newSelection;
    });
  };

  const updateEquipementDate = (equipementId: number, date: string) => {
    setEquipementsDatesInstallation(prev => ({
      ...prev,
      [equipementId]: date
    }));
  };

  const handleTypeInstallationChange = (newType: string) => {
    setFormData(prev => ({ ...prev, type: newType }));
    
    // Réinitialiser la sélection d'équipements pour le nouveau type
    setSelectedEquipements([]);
    setEquipementsDatesInstallation({});
    setValidationErrors([]);
  };

  const filteredSites = sites.filter(site =>
    site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir les équipements disponibles pour le type d'installation sélectionné
  const availableEquipements = getEquipementsForInstallationType(formData.type as TypeInstallation);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Rechercher un site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau site
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSite ? 'Modifier le site' : 'Nouveau site'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom du site *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    value={formData.ville}
                    onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'installation *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={handleTypeInstallationChange}
                    disabled={!!editingSite}
                  >
                    <SelectTrigger className={editingSite ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}>
                      <SelectValue placeholder="Sélectionner le type d'installation" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeInstallationLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingSite && (
                    <p className="text-sm text-gray-500">
                      Le type d'installation ne peut pas être modifié après la création du site.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nom_contact">Nom du contact</Label>
                  <Input
                    id="nom_contact"
                    value={formData.nom_contact || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nom_contact: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tel_contact">Téléphone du contact</Label>
                  <Input
                    id="tel_contact"
                    value={formData.tel_contact || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tel_contact: e.target.value }))}
                  />
                </div>
                
                {/* Date de création - modifiable seulement à la création */}
                <div className="space-y-2">
                  <Label htmlFor="dateCreation">Date de création *</Label>
                  <Input
                    id="dateCreation"
                    type="date"
                    value={formData.dateCreation || format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateCreation: e.target.value }))}
                    disabled={!!editingSite}
                    className={editingSite ? 'bg-gray-100 cursor-not-allowed' : ''}
                    required
                  />
                  {editingSite && (
                    <p className="text-sm text-gray-500">
                      La date de création ne peut pas être modifiée après la création du site.
                    </p>
                  )}
                </div>
              </div>

              {!editingSite && (
                <>
                  {/* Informations sur le type d'installation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Équipements pour l'installation "{typeInstallationLabels[formData.type as TypeInstallation]}"
                    </h4>
                    {(() => {
                      const config = installationEquipements[formData.type as TypeInstallation];
                      return (
                        <div className="text-sm text-blue-800 space-y-1">
                          {config.obligatoires.length > 0 && (
                            <p>
                              <span className="font-medium">Obligatoires:</span>{' '}
                              {config.obligatoires.map(type => typeEquipementLabels[type as TypeEquipement]).join(', ')}
                            </p>
                          )}
                          {config.optionnels !== 'ALL' && config.optionnels.length > 0 && (
                            <p>
                              <span className="font-medium">Optionnels:</span>{' '}
                              {config.optionnels.map(type => typeEquipementLabels[type as TypeEquipement]).join(', ')}
                            </p>
                          )}
                          {config.equipements === 'ALL' && (
                            <p>
                              <span className="font-medium">Tous les équipements sont disponibles et optionnels.</span>
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Erreurs de validation */}
                  {validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-2">Équipements obligatoires manquants:</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sélection des équipements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Équipements à installer</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto border rounded-lg p-4">
                      {availableEquipements.map((equipement) => {
                        const config = installationEquipements[formData.type as TypeInstallation];
                        const isRequired = config.obligatoires.includes(equipement.type);
                        
                        return (
                          <div key={equipement.id_equipement} className="space-y-3 p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                id={`eq-${equipement.id_equipement}`}
                                checked={selectedEquipements.includes(equipement.id_equipement!)}
                                onChange={() => toggleEquipement(equipement.id_equipement!)}
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <label 
                                htmlFor={`eq-${equipement.id_equipement}`}
                                className="flex-1 flex items-center justify-between cursor-pointer"
                              >
                                <div>
                                  <span className="font-medium">{equipement.nom}</span>
                                  <span className="text-gray-500 ml-2">({equipement.reference})</span>
                                  {isRequired && (
                                    <span className="text-red-600 ml-2 text-sm">*</span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="secondary">
                                    {typeEquipementLabels[equipement.type as TypeEquipement]}
                                  </Badge>
                                  {isRequired && (
                                    <Badge variant="destructive" className="text-xs">
                                      Obligatoire
                                    </Badge>
                                  )}
                                </div>
                              </label>
                            </div>
                            
                            {/* Date d'installation spécifique à cet équipement */}
                            {selectedEquipements.includes(equipement.id_equipement!) && (
                              <div className="ml-7 space-y-2">
                                <Label htmlFor={`date-${equipement.id_equipement}`} className="text-sm">
                                  Date d'installation de cet équipement
                                </Label>
                                <Input
                                  id={`date-${equipement.id_equipement}`}
                                  type="date"
                                  value={equipementsDatesInstallation[equipement.id_equipement!] || format(new Date(), 'yyyy-MM-dd')}
                                  onChange={(e) => updateEquipementDate(equipement.id_equipement!, e.target.value)}
                                  className="bg-white"
                                  required
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {availableEquipements.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <p>Aucun équipement disponible pour ce type d'installation</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  {editingSite ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des sites */}
      <div className="grid gap-6">
        {filteredSites.map((site) => (
          <Card key={site.id_site} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                      {site.nom}
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {typeInstallationLabels[site.type as TypeInstallation]}
                    </Badge>
                  </div>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {site.ville}
                  </p>
                  
                  {site.dateCreation && (
                    <p className="text-sm text-gray-500">
                      Créé le: {new Date(site.dateCreation).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  
                  {site.nom_contact && (
                    <p className="text-sm text-gray-500 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Contact: {site.nom_contact}
                      {site.tel_contact && (
                        <span className="ml-2 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {site.tel_contact}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSiteForInstall(site);
                      setIsInstallDialogOpen(true);
                    }}
                    className="text-purple-600 hover:text-purple-700"
                    title="Gérer les équipements"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(site)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(site.id_site!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Équipements installés */}
              {site.equipementInstalles && site.equipementInstalles.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">
                    Équipements installés ({site.equipementInstalles.length})
                  </h4>
                  <div className="space-y-3">
                    {site.equipementInstalles.map((installation, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{installation.equipement.nom}</span>
                              <Badge variant="secondary">
                                {typeEquipementLabels[installation.equipement.type as TypeEquipement]}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Réf: {installation.equipement.reference}
                            </p>
                            {installation.date_installation && (
                              <p className="text-sm text-gray-500 mt-1">
                                Installé le: {new Date(installation.date_installation).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(!site.equipementInstalles || site.equipementInstalles.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun équipement installé sur ce site</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredSites.length === 0 && (
          <Card className="p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Aucun site trouvé
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par créer votre premier site.'}
            </p>
          </Card>
        )}
      </div>

      {/* Equipment Installation Dialog */}
      {selectedSiteForInstall && (
        <EquipementInstallForm
          open={isInstallDialogOpen}
          onOpenChange={setIsInstallDialogOpen}
          site={selectedSiteForInstall}
          onSuccess={handleInstallSuccess}
        />
      )}
    </div>
  );
};