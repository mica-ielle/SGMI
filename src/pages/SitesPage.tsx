import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Phone, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { siteService } from '../services/siteService';
import { equipementService } from '../services/equipementService';
import type { Site, Equipement, RequetCreateSite, TypeEquipement } from '../types';

const typeEquipementLabels: Record<TypeEquipement, string> = {
  MOTOPOMPE: 'Motopompe',
  BORNE_DE_DISTRIBUTION: 'Borne de distribution',
  ARMOIRE_ELECTRIQUE: 'Armoire électrique',
  CITERNE: 'Citerne'
};

export const SitesPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // État du formulaire
  const [formData, setFormData] = useState<Site>({
    nom: '',
    ville: '',
    nom_contact: '',
    tel_contact: ''
  });

  const [selectedEquipements, setSelectedEquipements] = useState<number[]>([]);
  const [dateInstallation, setDateInstallation] = useState('');

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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSite) {
        // TODO: Implémentation de la mise à jour
        console.log('Mise à jour site:', formData);
      } else {
        const createData: RequetCreateSite = {
          site: formData,
          equipementIdList: selectedEquipements,
          dateInstall: dateInstallation
        };
        await siteService.create(createData);
      }
      
      await loadData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      try {
        await siteService.delete(id);
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openEditDialog = (site: Site) => {
    setEditingSite(site);
    setFormData(site);
    setSelectedEquipements(site.equipementInstalles?.map(eq => eq.equipement.id_equipement!) || []);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      ville: '',
      nom_contact: '',
      tel_contact: ''
    });
    setSelectedEquipements([]);
    setDateInstallation('');
    setEditingSite(null);
  };

  const toggleEquipement = (equipementId: number) => {
    setSelectedEquipements(prev => 
      prev.includes(equipementId) 
        ? prev.filter(id => id !== equipementId)
        : [...prev, equipementId]
    );
  };

  const filteredSites = sites.filter(site =>
    site.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.ville.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              </div>

              {!editingSite && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dateInstallation">Date d'installation</Label>
                    <Input
                      id="dateInstallation"
                      type="date"
                      value={dateInstallation}
                      onChange={(e) => setDateInstallation(e.target.value)}
                    />
                  </div>

                  {/* Sélection des équipements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Équipements à installer</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                      {equipements.map((equipement) => (
                        <div key={equipement.id_equipement} className="flex items-center space-x-3">
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
                            </div>
                            <Badge variant="secondary">
                              {typeEquipementLabels[equipement.type]}
                            </Badge>
                          </label>
                        </div>
                      ))}
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
                  </div>
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {site.ville}
                  </p>
                  
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
                                {typeEquipementLabels[installation.equipement.type]}
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
    </div>
  );
};